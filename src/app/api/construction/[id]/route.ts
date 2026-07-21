import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { getAuthUser } from '@/lib/auth'
import { successResponse, errorResponse, notFoundResponse } from '@/lib/api'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const authUser = await getAuthUser()

    const company = await prisma.construction.findUnique({
      where: { id, status: 'ACTIVE' },
      include: {
        district: true,
        owner: { select: { id: true, name: true, nidVerified: true } },
        portfolio: true,
        reviews: {
          include: { reviewer: { select: { name: true } } },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    })

    if (!company) return notFoundResponse('কোম্পানি')

    let isUnlocked = false
    let ownerPhone: string | null = null

    if (authUser) {
      if (company.ownerId === authUser.userId) {
        isUnlocked = true
      } else {
        const unlock = await prisma.leadUnlock.findFirst({
          where: { userId: authUser.userId, constructionId: id },
        })
        isUnlocked = !!unlock
      }

      if (isUnlocked) {
        const owner = await prisma.user.findUnique({
          where: { id: company.ownerId },
          select: { phone: true },
        })
        ownerPhone = owner?.phone || null
      }
    }

    const avgRating = company.reviews.length
      ? company.reviews.reduce((sum, r) => sum + r.rating, 0) / company.reviews.length
      : null

    return successResponse({ company, isUnlocked, ownerPhone, avgRating })
  } catch (error) {
    console.error('Construction detail error:', error)
    return errorResponse('সার্ভার সমস্যা', 500)
  }
}
