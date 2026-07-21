import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { successResponse, errorResponse } from '@/lib/api'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)

    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit

    const type = searchParams.get('type')         // CAR | BIKE
    const purpose = searchParams.get('purpose')   // SALE | RENT
    const districtId = searchParams.get('districtId')
    const brand = searchParams.get('brand')
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')
    const condition = searchParams.get('condition')
    const search = searchParams.get('search')

    const where: Record<string, unknown> = { status: 'ACTIVE' }

    if (type) where.type = type
    if (purpose) where.purpose = purpose
    if (districtId) where.districtId = parseInt(districtId)
    if (brand) where.brand = { contains: brand }
    if (condition) where.condition = condition

    if (minPrice || maxPrice) {
      where.price = {
        ...(minPrice && { gte: parseFloat(minPrice) }),
        ...(maxPrice && { lte: parseFloat(maxPrice) }),
      }
    }

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { brand: { contains: search } },
        { model: { contains: search } },
      ]
    }

    const [vehicles, total] = await Promise.all([
      prisma.vehicle.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }],
        include: {
          images: { where: { isPrimary: true }, take: 1 },
          district: { select: { name: true, nameBn: true } },
          owner: { select: { name: true, nidVerified: true } },
        },
      }),
      prisma.vehicle.count({ where }),
    ])

    return successResponse({
      vehicles,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    })
  } catch (error) {
    console.error('Vehicles fetch error:', error)
    return errorResponse('সার্ভার সমস্যা', 500)
  }
}
