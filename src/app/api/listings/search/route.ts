import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { successResponse, errorResponse } from '@/lib/api'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)

    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit

    const type = searchParams.get('type')
    const purpose = searchParams.get('purpose')
    const districtId = searchParams.get('districtId')
    const upazilaId = searchParams.get('upazilaId')
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')
    const bedrooms = searchParams.get('bedrooms')
    const furnished = searchParams.get('furnished')
    const search = searchParams.get('search')

    const where: Record<string, unknown> = {
      status: 'ACTIVE',
    }

    if (type) where.type = type
    if (purpose) where.purpose = purpose
    if (districtId) where.districtId = parseInt(districtId)
    if (upazilaId) where.upazilaId = parseInt(upazilaId)
    if (bedrooms) where.bedrooms = parseInt(bedrooms)
    if (furnished === 'true') where.furnished = true

    if (minPrice || maxPrice) {
      where.price = {
        ...(minPrice && { gte: parseFloat(minPrice) }),
        ...(maxPrice && { lte: parseFloat(maxPrice) }),
      }
    }

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { address: { contains: search } },
        { areaName: { contains: search } },
      ]
    }

    const [listings, total] = await Promise.all([
      prisma.listing.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }],
        include: {
          images: { where: { isPrimary: true }, take: 1 },
          district: { select: { name: true, nameBn: true } },
          upazila: { select: { name: true, nameBn: true } },
          owner: { select: { name: true, nidVerified: true } },
        },
      }),
      prisma.listing.count({ where }),
    ])

    return successResponse({
      listings,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Listings fetch error:', error)
    return errorResponse('সার্ভার সমস্যা', 500)
  }
}
