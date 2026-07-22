import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { getAuthUser } from '@/lib/auth'
import { successResponse, errorResponse, unauthorizedResponse } from '@/lib/api'

// GET — all listings for admin (with filters)
export async function GET(req: NextRequest) {
  try {
    const authUser = await getAuthUser()
    if (!authUser || authUser.role !== 'ADMIN') return unauthorizedResponse()

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status') || 'PENDING'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const category = searchParams.get('category') || 'property'

    if (category === 'vehicle') {
      const [items, total] = await Promise.all([
        prisma.vehicle.findMany({
          where: { status: status as never },
          skip: (page - 1) * limit,
          take: limit,
          orderBy: { createdAt: 'desc' },
          include: {
            images: { where: { isPrimary: true }, take: 1 },
            district: { select: { name: true } },
            owner: { select: { name: true, phone: true } },
          },
        }),
        prisma.vehicle.count({ where: { status: status as never } }),
      ])
      return successResponse({ items, total, totalPages: Math.ceil(total / limit) })
    }

    if (category === 'construction') {
      const [items, total] = await Promise.all([
        prisma.construction.findMany({
          where: { status: status as never },
          skip: (page - 1) * limit,
          take: limit,
          orderBy: { createdAt: 'desc' },
          include: {
            district: { select: { name: true } },
            owner: { select: { name: true, phone: true } },
          },
        }),
        prisma.construction.count({ where: { status: status as never } }),
      ])
      return successResponse({ items, total, totalPages: Math.ceil(total / limit) })
    }

    const [items, total] = await Promise.all([
      prisma.listing.findMany({
        where: { status: status as never },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          images: { where: { isPrimary: true }, take: 1 },
          district: { select: { name: true } },
          owner: { select: { name: true, phone: true } },
        },
      }),
      prisma.listing.count({ where: { status: status as never } }),
    ])

    return successResponse({ items, total, totalPages: Math.ceil(total / limit) })
  } catch (error) {
    console.error('Admin listings error:', error)
    return errorResponse('সার্ভার সমস্যা', 500)
  }
}

// PATCH — approve, reject, feature a listing
export async function PATCH(req: NextRequest) {
  try {
    const authUser = await getAuthUser()
    if (!authUser || authUser.role !== 'ADMIN') return unauthorizedResponse()

    const { id, category, action } = await req.json()
    // action: 'approve' | 'reject' | 'feature' | 'unfeature'

    if (!id || !category || !action) return errorResponse('তথ্য অসম্পূর্ণ')

    const statusMap: Record<string, string> = {
      approve: 'ACTIVE',
      reject: 'REJECTED',
    }

    const newStatus = statusMap[action]
    const isFeatured = action === 'feature' ? true : action === 'unfeature' ? false : undefined

    const updateData: Record<string, unknown> = {}
    if (newStatus) updateData.status = newStatus
    if (isFeatured !== undefined) updateData.isFeatured = isFeatured

    if (category === 'vehicle') {
      await prisma.vehicle.update({ where: { id }, data: updateData })
    } else if (category === 'construction') {
      await prisma.construction.update({ where: { id }, data: updateData })
    } else {
      await prisma.listing.update({ where: { id }, data: updateData })
    }

    return successResponse({ message: 'আপডেট সফল' })
  } catch (error) {
    console.error('Admin action error:', error)
    return errorResponse('সার্ভার সমস্যা', 500)
  }
}
