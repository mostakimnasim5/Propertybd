import { getAuthUser } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { successResponse, errorResponse, unauthorizedResponse } from '@/lib/api'
import { SUBSCRIPTION_PLANS } from '@/lib/subscriptionPlans'

export async function GET() {
  try {
    const authUser = await getAuthUser()
    if (!authUser) return unauthorizedResponse()

    const subscription = await prisma.subscription.findUnique({
      where: { userId: authUser.userId },
    })

    if (!subscription) {
      return successResponse({ hasSubscription: false, subscription: null })
    }

    const isActive = subscription.isActive && subscription.endDate > new Date()
    const daysLeft = isActive
      ? Math.ceil((subscription.endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      : 0

    const planDetails = SUBSCRIPTION_PLANS[subscription.plan as keyof typeof SUBSCRIPTION_PLANS]

    // Count current listings
    const listingCount = await prisma.listing.count({
      where: { ownerId: authUser.userId, status: { in: ['ACTIVE', 'PENDING'] } },
    })

    return successResponse({
      hasSubscription: true,
      isActive,
      subscription: {
        ...subscription,
        daysLeft,
        planDetails,
        listingCount,
        listingLimit: planDetails?.maxListings || 0,
        canAddMore: listingCount < (planDetails?.maxListings || 0),
      },
    })
  } catch (error) {
    console.error('Subscription status error:', error)
    return errorResponse('সার্ভার সমস্যা', 500)
  }
}
