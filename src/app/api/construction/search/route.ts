import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { successResponse, errorResponse } from '@/lib/api'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const districtId = searchParams.get('districtId')
    const search = searchParams.get('search')

    const where: Record<string, unknown> = { status: 'ACTIVE' }
    if (districtId) where.districtId = parseInt(districtId)
    if (search) {
      where.OR = [
        { companyName: { contains: search } },
        { description: { contains: search } },
      ]
    }

    const [companies, total] = await Promise.all([
      prisma.construction.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }],
        include: {
          district: { select: { name: true, nameBn: true } },
          owner: { select: { name: true, nidVerified: true } },
          reviews: { select: { rating: true } },
          portfolio: { take: 1 },
        },
      }),
      prisma.construction.count({ where }),
    ])

    const companiesWithRating = companies.map(c => ({
      ...c,
      avgRating: c.reviews.length
        ? c.reviews.reduce((sum, r) => sum + r.rating, 0) / c.reviews.length
        : null,
      reviewCount: c.reviews.length,
    }))

    return successResponse({
      companies: companiesWithRating,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    })
  } catch (error) {
    console.error('Construction search error:', error)
    return errorResponse('সার্ভার সমস্যা', 500)
  }
}
