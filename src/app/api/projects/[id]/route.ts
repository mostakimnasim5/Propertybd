import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { successResponse, errorResponse, notFoundResponse } from '@/lib/api'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const project = await prisma.developerProject.findUnique({
      where: { id, listingStatus: 'ACTIVE' },
      include: {
        district: true,
        images: true,
        units: { orderBy: [{ unitType: 'asc' }, { floor: 'asc' }] },
        construction: {
          select: {
            id: true,
            companyName: true,
            experience: true,
            coverImage: true,
            owner: {
              select: { name: true, phone: true, nidVerified: true },
            },
          },
        },
      },
    })

    if (!project) return notFoundResponse('প্রজেক্ট')

    // View count
    await prisma.developerProject.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    })

    // Unit availability summary
    const unitSummary = project.units.reduce((acc: Record<string, any>, unit) => {
      if (!acc[unit.unitType]) {
        acc[unit.unitType] = { type: unit.unitType, total: 0, available: 0, minPrice: Infinity, maxPrice: 0 }
      }
      acc[unit.unitType].total++
      if (unit.status === 'AVAILABLE') acc[unit.unitType].available++
      const p = Number(unit.price)
      if (p < acc[unit.unitType].minPrice) acc[unit.unitType].minPrice = p
      if (p > acc[unit.unitType].maxPrice) acc[unit.unitType].maxPrice = p
      return acc
    }, {})

    const amenities = (() => {
      try { return JSON.parse(project.amenities) } catch { return [] }
    })()

    return successResponse({
      project: { ...project, amenities },
      unitSummary: Object.values(unitSummary),
      contactPhone: project.construction?.owner?.phone || null,
    })
  } catch (error) {
    console.error('Project detail error:', error)
    return errorResponse('সার্ভার সমস্যা', 500)
  }
}
