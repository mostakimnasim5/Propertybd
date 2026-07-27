import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { successResponse, errorResponse, notFoundResponse } from '@/lib/api'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const company = await prisma.construction.findUnique({
      where: { id, status: 'ACTIVE' },
      include: {
        district: true,
        owner: {
          select: {
            id: true, name: true, phone: true,
            nidVerified: true,
          },
        },
        portfolio: true,
        reviews: {
          include: { reviewer: { select: { name: true } } },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    })

    if (!company) return notFoundResponse('কোম্পানি')

    const avgRating = company.reviews.length
      ? company.reviews.reduce((sum, r) => sum + r.rating, 0) / company.reviews.length
      : null

    return successResponse({
      company,
      ownerPhone: company.owner?.phone || null,
      avgRating,
    })
  } catch (error) {
    console.error('Construction detail error:', error)
    return errorResponse('সার্ভার সমস্যা', 500)
  }
}
