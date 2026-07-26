import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { getAuthUser } from '@/lib/auth'
import { successResponse, errorResponse, unauthorizedResponse } from '@/lib/api'

export async function GET() {
  try {
    const authUser = await getAuthUser()
    if (!authUser) return unauthorizedResponse()

    const boosts = await prisma.featuredListing.findMany({
      where: { ownerId: authUser.userId },
      orderBy: { createdAt: 'desc' },
      include: {
        listing: {
          select: {
            id: true, title: true, price: true, type: true, purpose: true,
            images: { where: { isPrimary: true }, take: 1 },
            district: { select: { nameBn: true } },
          },
        },
      },
    })

    const enriched = boosts.map(b => {
      const remaining = Number(b.totalBudget) - Number(b.budgetSpent)
      const daysLeft = Number(b.bidPerDay) > 0 ? Math.floor(remaining / Number(b.bidPerDay)) : 0
      return {
        ...b,
        daysLeft,
        ctrPercent: b.ctr ? (b.ctr * 100).toFixed(1) : '0.0',
        budgetRemaining: remaining,
        budgetPercent: Math.round((Number(b.budgetSpent) / Number(b.totalBudget)) * 100),
      }
    })

    return successResponse({ boosts: enriched })
  } catch (error) {
    console.error('Boost GET error:', error)
    return errorResponse('সার্ভার সমস্যা', 500)
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const authUser = await getAuthUser()
    if (!authUser) return unauthorizedResponse()

    const { featuredId, action } = await req.json()
    if (!featuredId || !action) return errorResponse('featuredId এবং action দিন')

    const boost = await prisma.featuredListing.findUnique({
      where: { id: featuredId, ownerId: authUser.userId },
    })
    if (!boost) return errorResponse('Boost পাওয়া যায়নি')

    const statusMap: Record<string, string> = { pause: 'PAUSED', resume: 'ACTIVE', stop: 'EXPIRED' }
    const newStatus = statusMap[action]
    if (!newStatus) return errorResponse('Invalid action')

    if (action === 'resume') {
      const remaining = Number(boost.totalBudget) - Number(boost.budgetSpent)
      if (remaining <= 0) return errorResponse('Budget শেষ। নতুন boost তৈরি করুন।')
    }

    await prisma.featuredListing.update({
      where: { id: featuredId },
      data: { status: newStatus as any },
    })

    return successResponse({ message: 'আপডেট সফল', status: newStatus })
  } catch (error) {
    console.error('Boost PATCH error:', error)
    return errorResponse('সার্ভার সমস্যা', 500)
  }
}
