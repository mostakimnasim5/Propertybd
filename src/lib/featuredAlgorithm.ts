import { prisma } from '@/lib/db'

const MAX_FEATURED_SLOTS = 3 // প্রতি পেজে সর্বোচ্চ ৩টা featured

export interface FeaturedContext {
  districtId?: number    // কোন জেলায় search হচ্ছে
  type?: string          // FLAT, HOUSE, LAND etc.
  purpose?: string       // SALE বা RENT
  limit?: number         // কতটা দরকার (default 3)
}

export interface RankedFeatured {
  featuredId: string
  listingId: string
  rankScore: number
  listing: any
}

/**
 * মূল Algorithm:
 * 1. Active featured listings filter করো (budget আছে, expired না)
 * 2. Search context দিয়ে সঠিক competitors বের করো
 * 3. RankScore = bidPerDay × relevanceScore × recencyBonus
 * 4. Weighted random selection (Google Ads-এর মতো)
 * 5. সর্বোচ্চ MAX_FEATURED_SLOTS টা return করো
 */
export async function getRotatedFeaturedListings(
  ctx: FeaturedContext
): Promise<RankedFeatured[]> {
  const limit = Math.min(ctx.limit || MAX_FEATURED_SLOTS, MAX_FEATURED_SLOTS)

  // Step 1: Active candidates বের করো
  const candidates = await prisma.featuredListing.findMany({
    where: {
      status: 'ACTIVE',
      OR: [
        { endDate: null },
        { endDate: { gt: new Date() } },
      ],
      // Context-based targeting
      AND: [
        {
          OR: [
            { targetDistrictId: null },
            ...(ctx.districtId ? [{ targetDistrictId: ctx.districtId }] : []),
          ],
        },
        {
          OR: [
            { targetType: null },
            ...(ctx.type ? [{ targetType: ctx.type }] : []),
          ],
        },
        {
          OR: [
            { targetPurpose: null },
            ...(ctx.purpose ? [{ targetPurpose: ctx.purpose }] : []),
          ],
        },
      ],
    },
    include: {
      listing: {
        include: {
          images: { where: { isPrimary: true }, take: 1 },
          district: { select: { name: true, nameBn: true } },
          owner: { select: { name: true, nidVerified: true } },
        },
      },
    },
  })

  // Filter out exhausted budgets in memory (Prisma can't compare two fields directly)
  const activeCandidates = candidates.filter(f =>
    Number(f.budgetSpent) < Number(f.totalBudget)
  )

  if (activeCandidates.length === 0) return []

  // Step 2: RankScore calculate করো
  const ranked = activeCandidates.map(f => {
    const bid = Number(f.bidPerDay)
    const relevance = f.relevanceScore || 0.5
    const ctr = f.ctr || 0

    // Recency bonus: নতুন listing একটু বেশি সুযোগ পাবে
    const ageInDays = (Date.now() - f.startDate.getTime()) / (1000 * 60 * 60 * 24)
    const recencyBonus = Math.max(0.5, 1 - ageInDays / 30)

    // Budget utilization: বেশি খরচ করলে সুযোগ কমবে না
    const spent = Number(f.budgetSpent)
    const total = Number(f.totalBudget)
    const budgetHealth = total > 0 ? Math.min(1, 1 - (spent / total) * 0.3) : 1

    // Final rank score
    // bid × quality × recency × budget health
    const rankScore = bid * (0.5 + relevance * 0.5) * recencyBonus * budgetHealth

    // CTR bonus: যার listing বেশি click পাচ্ছে তাকে reward
    const ctrBonus = ctr > 0.05 ? 1.2 : ctr > 0.02 ? 1.1 : 1.0

    return {
      featuredId: f.id,
      listingId: f.listingId,
      rankScore: rankScore * ctrBonus,
      listing: f.listing,
      raw: f,
    }
  })

  // Step 3: Weighted random selection (impression sharing)
  // সবাই rank অনুযায়ী chance পাবে — highest bid সবসময় #1 না
  const selected = weightedRandomSelect(ranked, limit)

  // Step 4: Impression log করো (background, non-blocking)
  logImpressions(
    selected.map(s => ({ featuredId: s.featuredId, listingId: s.listingId })),
    ctx.districtId
  ).catch(console.error)

  return selected
}

/**
 * Weighted Random Selection
 * Score যত বেশি, select হওয়ার probability তত বেশি
 * কিন্তু কম score-এরও chance আছে (rotation এর জন্য)
 */
function weightedRandomSelect<T extends { rankScore: number }>(
  items: T[],
  count: number
): T[] {
  if (items.length <= count) return items

  const selected: T[] = []
  const pool = [...items]

  while (selected.length < count && pool.length > 0) {
    const totalScore = pool.reduce((sum, item) => sum + Math.max(item.rankScore, 0.01), 0)
    let random = Math.random() * totalScore

    for (let i = 0; i < pool.length; i++) {
      random -= Math.max(pool[i].rankScore, 0.01)
      if (random <= 0) {
        selected.push(pool[i])
        pool.splice(i, 1)
        break
      }
    }
  }

  return selected
}

/**
 * Impression log — async, background
 */
async function logImpressions(
  featuredItems: { featuredId: string; listingId: string }[],
  districtId?: number
) {
  if (featuredItems.length === 0) return

  await prisma.impressionLog.createMany({
    data: featuredItems.map(item => ({
      listingId: item.listingId,
      featuredId: item.featuredId,
      source: 'SEARCH',
      isClick: false,
      districtId: districtId || null,
    })),
  })

  await prisma.featuredListing.updateMany({
    where: { id: { in: featuredItems.map(i => i.featuredId) } },
    data: { impressions: { increment: 1 } },
  })
}

/**
 * Click log করো এবং CTR update করো
 */
export async function logFeaturedClick(
  featuredId: string,
  listingId: string,
  districtId?: number
) {
  await Promise.all([
    prisma.impressionLog.create({
      data: {
        listingId,
        featuredId,
        source: 'SEARCH',
        isClick: true,
        districtId: districtId || null,
      },
    }),
    prisma.featuredListing.update({
      where: { id: featuredId },
      data: { clicks: { increment: 1 } },
    }),
  ])

  // CTR recalculate করো
  const featured = await prisma.featuredListing.findUnique({
    where: { id: featuredId },
    select: { impressions: true, clicks: true },
  })

  if (featured && featured.impressions > 0) {
    const newCtr = featured.clicks / featured.impressions

    // Relevance score update: CTR + listing quality
    // ভালো CTR মানে ভালো relevance
    const newRelevance = Math.min(1, 0.3 + newCtr * 10)

    await prisma.featuredListing.update({
      where: { id: featuredId },
      data: {
        ctr: newCtr,
        relevanceScore: newRelevance,
      },
    })
  }
}

/**
 * Daily budget deduction — cron job call করবে
 * প্রতিদিন রাত ১২টায় active featured listings-এর bid deduct করো
 */
export async function deductDailyBudgets() {
  const activeListings = await prisma.featuredListing.findMany({
    where: { status: 'ACTIVE' },
  })

  for (const f of activeListings) {
    const newSpent = Number(f.budgetSpent) + Number(f.bidPerDay)
    const total = Number(f.totalBudget)

    if (newSpent >= total) {
      // Budget শেষ
      await prisma.featuredListing.update({
        where: { id: f.id },
        data: {
          budgetSpent: total,
          status: 'BUDGET_DONE',
        },
      })
    } else {
      await prisma.featuredListing.update({
        where: { id: f.id },
        data: { budgetSpent: newSpent },
      })
    }
  }

  return activeListings.length
}
