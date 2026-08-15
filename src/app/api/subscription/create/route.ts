import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { getAuthUser } from '@/lib/auth'
import { successResponse, errorResponse, unauthorizedResponse } from '@/lib/api'
import { SUBSCRIPTION_PLANS, PlanId } from '@/lib/subscriptionPlans'

export async function POST(req: NextRequest) {
  try {
    const authUser = await getAuthUser()
    if (!authUser) return unauthorizedResponse()

    const { plan, transactionId } = await req.json()

    if (!plan || !SUBSCRIPTION_PLANS[plan as PlanId]) {
      return errorResponse('সঠিক plan বেছে নিন')
    }

    const selectedPlan = SUBSCRIPTION_PLANS[plan as PlanId]

    // Check existing active subscription
    const existing = await prisma.subscription.findUnique({
      where: { userId: authUser.userId },
    })

    if (existing?.isActive && existing.endDate > new Date()) {
      return errorResponse('আপনার বর্তমান subscription এখনো active আছে')
    }

    const startDate = new Date()
    const endDate = new Date()
    endDate.setDate(endDate.getDate() + selectedPlan.duration)

    // Create or update subscription
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

    // Upgrade user role based on plan (never downgrade ADMIN)
    const currentUser = await prisma.user.findUnique({
      where: { id: authUser.userId },
      select: { role: true },
    })

    const roleMap: Record<string, string> = {
      BASIC: 'BROKER',
      PRO: 'BUILDER',
      ENTERPRISE: 'BUILDER',
    }
    const newRole = roleMap[plan] || 'BROKER'
    const shouldUpgradeRole = currentUser?.role !== 'ADMIN'

    if (shouldUpgradeRole) {
      await prisma.user.update({
        where: { id: authUser.userId },
        data: { role: newRole as any },
      })
    }

    return successResponse({
      subscription,
      plan: selectedPlan,
      newRole,
      message: `✅ ${selectedPlan.name} subscription সফলভাবে চালু হয়েছে!`,
    }, 201)
  } catch (error) {
    console.error('Subscription create error:', error)
    return errorResponse('সার্ভার সমস্যা', 500)
  }
}
