import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { getAuthUser } from '@/lib/auth'
import { successResponse, errorResponse, unauthorizedResponse } from '@/lib/api'

export async function GET(req: NextRequest) {
  try {
    const authUser = await getAuthUser()
    if (!authUser) return unauthorizedResponse()

    const { searchParams } = new URL(req.url)
    const featuredId = searchParams.get('featuredId')

    if (!featuredId) {
      // All boosts summary
      const boosts = await prisma.featuredListing.findMany({
        where: { ownerId: authUser.userId },
        select: {
          id: true, status: true,
          impressions: true, clicks: true, ctr: true,
          bidPerDay: true, totalBudget: true, budgetSpent: true,
          listing: { select: { title: true } },
        },
      })

      const summary = {
        totalImpressions: boosts.reduce((s, b) => s + b.impressions, 0),
        totalClicks: boosts.reduce((s, b) => s + b.clicks, 0),
        totalSpent: boosts.reduce((s, b) => s + Number(b.budgetSpent), 0),
        avgCtr: boosts.length > 0
          ? boosts.reduce((s, b) => s + b.ctr, 0) / boosts.length
          : 0,
        activeBoosts: boosts.filter(b => b.status === 'ACTIVE').length,
        boosts,
      }

      return successResponse({ summary })
    }

    // Single boost detail
    const featured = await prisma.featuredListing.findFirst({
      where: { id: featuredId, ownerId: authUser.userId },
      include: {
        listing: { select: { title: true, price: true } },
      },
    })

    if (!featured) return errorResponse('Boost পাওয়া যায়নি')

    // Last 7 days impression log
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const recentLogs = await prisma.impressionLog.findMany({
      where: {
        featuredId,
        createdAt: { gte: sevenDaysAgo },
      },
      orderBy: { createdAt: 'asc' },
    })

    // Group by day
    const dailyStats: Record<string, { views: number; clicks: number }> = {}
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const key = date.toISOString().split('T')[0]
      dailyStats[key] = { views: 0, clicks: 0 }
    }

    recentLogs.forEach(log => {
      const key = log.createdAt.toISOString().split('T')[0]
      if (dailyStats[key]) {
        if (log.isClick) dailyStats[key].clicks++
        else dailyStats[key].views++
      }
    })

    return successResponse({
      featured,
      dailyStats: Object.entries(dailyStats).map(([date, stats]) => ({
        date, ...stats,
      })),
      budgetRemaining: Number(featured.totalBudget) - Number(featured.budgetSpent),
      estimatedDaysLeft: featured.status === 'ACTIVE'
        ? Math.floor(
            (Number(featured.totalBudget) - Number(featured.budgetSpent)) /
            Number(featured.bidPerDay)
          )
        : 0,
    })
  } catch (error) {
    console.error('Boost stats error:', error)
    return errorResponse('সার্ভার সমস্যা', 500)
  }
}
