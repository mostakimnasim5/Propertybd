import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { successResponse, errorResponse } from '@/lib/api'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const districtId = searchParams.get('districtId')
    const projectType = searchParams.get('projectType')
    const status = searchParams.get('status')
    const search = searchParams.get('search')

    const where: Record<string, unknown> = { listingStatus: 'ACTIVE' }
    if (districtId) where.districtId = parseInt(districtId)
    if (projectType) where.projectType = projectType
    if (status) where.status = status
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { address: { contains: search } },
        { areaName: { contains: search } },
      ]
    }

    const [projects, total] = await Promise.all([
      prisma.developerProject.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }],
        include: {
          district: { select: { name: true, nameBn: true } },
          images: { where: { isPrimary: true }, take: 1 },
          construction: { select: { companyName: true } },
          _count: { select: { units: true } },
        },
      }),
      prisma.developerProject.count({ where }),
    ])

    return successResponse({
      projects,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    })
  } catch (error) {
    console.error('Projects search error:', error)
    return errorResponse('সার্ভার সমস্যা', 500)
  }
}
