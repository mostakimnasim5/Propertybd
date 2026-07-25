import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { successResponse, errorResponse } from '@/lib/api'
import { deductDailyBudgets } from '@/lib/featuredAlgorithm'

export async function GET(req: NextRequest) {
  const secret = req.headers.get('x-cron-secret')
  if (secret !== process.env.CRON_SECRET) {
    return errorResponse('Unauthorized', 401)
  }

  try {
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const [expiredListings, expiredVehicles, deductedCount] = await Promise.all([
      prisma.listing.updateMany({
        where: { status: 'ACTIVE', createdAt: { lt: thirtyDaysAgo } },
        data: { status: 'EXPIRED' },
      }),
      prisma.vehicle.updateMany({
        where: { status: 'ACTIVE', createdAt: { lt: thirtyDaysAgo } },
        data: { status: 'EXPIRED' },
      }),
      deductDailyBudgets(),
    ])

    // Expire featured listings past endDate
    await prisma.featuredListing.updateMany({
      where: {
        status: 'ACTIVE',
        endDate: { lt: new Date() },
      },
      data: { status: 'EXPIRED' },
    })

    return successResponse({
      expired: {
        listings: expiredListings.count,
        vehicles: expiredVehicles.count,
      },
      featured: {
        budgetsDeducted: deductedCount,
      },
    })
  } catch (error) {
    console.error('Cron error:', error)
    return errorResponse('Cron job failed', 500)
  }
}
