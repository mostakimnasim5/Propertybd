import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { getAuthUser } from '@/lib/auth'
import { successResponse, errorResponse, unauthorizedResponse } from '@/lib/api'
import { SUBSCRIPTION_PLANS, PlanId } from '@/lib/subscriptionPlans'

// GET — current subscription status
export async function GET() {
  try {
    const authUser = await getAuthUser()
    if (!authUser) return unauthorizedResponse()

    const subscription = await prisma.subscription.findUnique({
      where: { userId: authUser.userId },
    })

    if (!subscription) {
      return successResponse({ subscription: null, isActive: false })
    }

    const isActive = subscription.isActive && subscription.endDate > new Date()
    const daysLeft = Math.max(0, Math.ceil(
      (subscription.endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    ))

    // Count current month's listings
    const monthStart = new Date()
    monthStart.setDate(1)
    monthStart.setHours(0, 0, 0, 0)

    const listingCount = await prisma.listing.count({
      where: {
        ownerId: authUser.userId,
        createdAt: { gte: monthStart },
      },
    })

    const plan = SUBSCRIPTION_PLANS[subscription.plan as PlanId]

    return successResponse({
      subscription: {
        ...subscription,
        daysLeft,
        isActive,
        listingCount,
        listingLimit: plan?.listingLimit || 0,
        planDetails: plan,
      },
    })
  } catch (error) {
    console.error('Subscription status error:', error)
    return errorResponse('সার্ভার সমস্যা', 500)
  }
}

// POST — activate subscription after payment
export async function POST(req: NextRequest) {
  try {
    const authUser = await getAuthUser()
    if (!authUser) return unauthorizedResponse()

    const { plan, transactionId } = await req.json()

    if (!plan || !SUBSCRIPTION_PLANS[plan as PlanId]) {
      return errorResponse('Invalid plan')
    }

    const planDetails = SUBSCRIPTION_PLANS[plan as PlanId]

    // Verify payment with SSLCommerz
    const paymentValid = await verifyPayment(transactionId)
    if (!paymentValid) {
      return errorResponse('Payment যাচাই করা যায়নি', 402)
    }

    const startDate = new Date()
    const endDate = new Date()
    endDate.setDate(endDate.getDate() + planDetails.duration)

    // Upsert subscription
    const subscription = await prisma.subscription.upsert({
      where: { userId: authUser.userId },
      create: {
        userId: authUser.userId,
        plan: plan as any,
        startDate,
        endDate,
        isActive: true,
      },
      update: {
        plan: plan as any,
        startDate,
        endDate,
        isActive: true,
      },
    })

    // Upgrade user role to BROKER
    await prisma.user.update({
      where: { id: authUser.userId },
      data: { role: 'BROKER' },
    })

    return successResponse({ subscription, plan: planDetails })
  } catch (error) {
    console.error('Subscription create error:', error)
    return errorResponse('সার্ভার সমস্যা', 500)
  }
}

async function verifyPayment(transactionId: string): Promise<boolean> {
  try {
    const storeId = process.env.SSLCOMMERZ_STORE_ID!
    const storePass = process.env.SSLCOMMERZ_STORE_PASSWORD!
    const isLive = process.env.SSLCOMMERZ_IS_LIVE === 'true'
    const baseUrl = isLive
      ? 'https://securepay.sslcommerz.com'
      : 'https://sandbox.sslcommerz.com'

    const res = await fetch(
      `${baseUrl}/validator/api/validationserverAPI.php?val_id=${transactionId}&store_id=${storeId}&store_passwd=${storePass}&format=json`
    )
    const data = await res.json()
    return data.status === 'VALID' || data.status === 'VALIDATED'
  } catch {
    if (process.env.NODE_ENV === 'development') return true
    return false
  }
}
