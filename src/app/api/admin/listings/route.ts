import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { getAuthUser } from '@/lib/auth'
import { successResponse, errorResponse, unauthorizedResponse } from '@/lib/api'
import { sendApprovalNotification } from '@/lib/sms'

// GET — all listings for admin (with filters)
export async function GET(req: NextRequest) {
  try {
    const authUser = await getAuthUser()
    if (!authUser || authUser.role !== 'ADMIN') return unauthorizedResponse()

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status') || 'PENDING'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(Math.max(parseInt(searchParams.get('limit') || '20') || 20, 1), 50)
    const category = searchParams.get('category') || 'property'

    if (category === 'vehicle') {
      const [items, total] = await Promise.all([
        prisma.vehicle.findMany({
          where: { status: status as never },
          skip: (page - 1) * limit, take: limit,
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
          skip: (page - 1) * limit, take: limit,
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

    if (category === 'project') {
      const [items, total] = await Promise.all([
        prisma.developerProject.findMany({
          where: { listingStatus: status as never },
          skip: (page - 1) * limit, take: limit,
          orderBy: { createdAt: 'desc' },
          include: {
            images: { where: { isPrimary: true }, take: 1 },
            district: { select: { name: true } },
            construction: {
              include: {
                owner: { select: { name: true, phone: true } },
              },
            },
          },
        }),
        prisma.developerProject.count({ where: { listingStatus: status as never } }),
      ])
      return successResponse({ items, total, totalPages: Math.ceil(total / limit) })
    }

    // Project category
    if (category === 'project') {
      const [items, total] = await Promise.all([
        prisma.developerProject.findMany({
          where: { listingStatus: status as never },
          skip: (page - 1) * limit, take: limit,
          orderBy: { createdAt: 'desc' },
          include: {
            images: { where: { isPrimary: true }, take: 1 },
            district: { select: { name: true } },
            construction: {
              select: {
                companyName: true,
                owner: { select: { name: true, phone: true } },
              },
            },
            _count: { select: { units: true } },
          },
        }),
        prisma.developerProject.count({ where: { listingStatus: status as never } }),
      ])
      return successResponse({ items, total, totalPages: Math.ceil(total / limit) })
    }

    // Default: property
    const [items, total] = await Promise.all([
      prisma.listing.findMany({
        where: { status: status as never },
        skip: (page - 1) * limit, take: limit,
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

// PATCH — approve, reject, feature
export async function PATCH(req: NextRequest) {
  try {
    const authUser = await getAuthUser()
    if (!authUser || authUser.role !== 'ADMIN') return unauthorizedResponse()

    const { id, category, action } = await req.json()
    if (!id || !category || !action) return errorResponse('তথ্য অসম্পূর্ণ')

    const approved = action === 'approve'
    const rejected = action === 'reject'
    const isFeatured = action === 'feature' ? true : action === 'unfeature' ? false : undefined

    let ownerPhone: string | null = null
    let itemTitle = 'আপনার বিজ্ঞাপন'

    if (category === 'project') {
      const updateData: Record<string, unknown> = {}
      if (approved) updateData.listingStatus = 'ACTIVE'
      if (rejected) updateData.listingStatus = 'REJECTED'
      if (isFeatured !== undefined) updateData.isFeatured = isFeatured

      const project = await prisma.developerProject.update({
        where: { id },
        data: updateData,
        include: {
          construction: {
            include: { owner: { select: { phone: true } } },
          },
        },
      })
      ownerPhone = project.construction?.owner?.phone || null
      itemTitle = project.title

    } else if (category === 'vehicle') {
      const updateData: Record<string, unknown> = {}
      if (approved) updateData.status = 'ACTIVE'
      if (rejected) updateData.status = 'REJECTED'
      if (isFeatured !== undefined) updateData.isFeatured = isFeatured

      const vehicle = await prisma.vehicle.update({
        where: { id }, data: updateData,
        include: { owner: { select: { phone: true } } },
      })
      ownerPhone = vehicle.owner?.phone || null
      itemTitle = `${vehicle.brand} ${vehicle.model}`

    } else if (category === 'construction') {
      const updateData: Record<string, unknown> = {}
      if (approved) updateData.status = 'ACTIVE'
      if (rejected) updateData.status = 'REJECTED'
      if (isFeatured !== undefined) updateData.isFeatured = isFeatured

      const company = await prisma.construction.update({
        where: { id }, data: updateData,
        include: { owner: { select: { phone: true } } },
      })
      ownerPhone = company.owner?.phone || null
      itemTitle = company.companyName

    } else {
      const updateData: Record<string, unknown> = {}
      if (approved) updateData.status = 'ACTIVE'
      if (rejected) updateData.status = 'REJECTED'
      if (isFeatured !== undefined) updateData.isFeatured = isFeatured

      const listing = await prisma.listing.update({
        where: { id }, data: updateData,
        include: { owner: { select: { phone: true } } },
      })
      ownerPhone = listing.owner?.phone || null
      itemTitle = listing.title
    }

    // SMS notification on approve/reject
    if (ownerPhone && (approved || rejected)) {
      sendApprovalNotification(ownerPhone, itemTitle, approved).catch(console.error)
    }

    return successResponse({ message: 'আপডেট সফল' })
  } catch (error) {
    console.error('Admin action error:', error)
    return errorResponse('সার্ভার সমস্যা', 500)
  }
}
