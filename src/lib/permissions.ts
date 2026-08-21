import { prisma } from '@/lib/db'
import { SUBSCRIPTION_PLANS, type PlanId } from '@/lib/subscriptionPlans'

// Free users (BUYER/OWNER, no active subscription) can post this many
// active listings — freemium model standard in BD marketplaces
export const FREE_LISTING_LIMIT = 3

export interface UserQuota {
  maxListings: number
  currentCount: number
  remaining: number
  hasActiveSubscription: boolean
  plan: string | null
}

/**
 * Resolve how many listings a user may have.
 * Counts property listings + vehicles together against one quota.
 */
export async function getUserQuota(userId: string): Promise<UserQuota> {
  const subscription = await prisma.subscription.findUnique({
    where: { userId },
  })

  const isActive =
    !!subscription?.isActive && subscription.endDate > new Date()

  const plan = isActive
    ? SUBSCRIPTION_PLANS[subscription.plan as PlanId]
    : null

  const maxListings = plan ? plan.maxListings : FREE_LISTING_LIMIT

  const [listingCount, vehicleCount] = await Promise.all([
    prisma.listing.count({
      where: { ownerId: userId, status: { in: ['PENDING', 'ACTIVE'] } },
    }),
    prisma.vehicle.count({
      where: { ownerId: userId, status: { in: ['PENDING', 'ACTIVE'] } },
    }),
  ])

  const currentCount = listingCount + vehicleCount

  return {
    maxListings,
    currentCount,
    remaining: Math.max(0, maxListings - currentCount),
    hasActiveSubscription: isActive,
    plan: subscription?.plan ?? null,
  }
}

export async function canPostListing(userId: string): Promise<{
  allowed: boolean
  quota: UserQuota
}> {
  const quota = await getUserQuota(userId)
  return { allowed: quota.remaining > 0, quota }
}
