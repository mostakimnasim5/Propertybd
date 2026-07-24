import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { successResponse, errorResponse } from '@/lib/api'

// Call this daily via Vercel Cron or external cron service
// Vercel cron: add to vercel.json
export async function GET(req: NextRequest) {
  // Verify cron secret to prevent unauthorized calls
  const secret = req.headers.get('x-cron-secret')
  if (secret !== process.env.CRON_SECRET) {
    return errorResponse('Unauthorized', 401)
  }

  try {
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const [expiredListings, expiredVehicles] = await Promise.all([
      prisma.listing.updateMany({
        where: {
          status: 'ACTIVE',
          createdAt: { lt: thirtyDaysAgo },
        },
        data: { status: 'EXPIRED' },
      }),
      prisma.vehicle.updateMany({
        where: {
          status: 'ACTIVE',
          createdAt: { lt: thirtyDaysAgo },
        },
        data: { status: 'EXPIRED' },
      }),
    ])

    console.log(`[CRON] Expired: ${expiredListings.count} listings, ${expiredVehicles.count} vehicles`)

    return successResponse({
      expired: {
        listings: expiredListings.count,
        vehicles: expiredVehicles.count,
      },
    })
  } catch (error) {
    console.error('Cron expire error:', error)
    return errorResponse('Cron job failed', 500)
  }
}
