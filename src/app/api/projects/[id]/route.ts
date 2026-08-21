import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { getAuthUser } from '@/lib/auth'
import { successResponse, errorResponse, notFoundResponse, unauthorizedResponse } from '@/lib/api'

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

// PATCH — builder updates editable fields of their own project
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = await getAuthUser()
    if (!authUser) return unauthorizedResponse()

    const { id } = await params
    const body = await req.json()
    const {
      title, description, projectType, status,
      address, areaName, mapLat, mapLng,
      floorCount, landArea, handoverDate, startDate,
      pricePerSqft, minPrice, maxPrice,
      coverImage, floorPlan, amenities,
    } = body

    if (status && !['UPCOMING', 'ONGOING', 'READY', 'COMPLETED'].includes(status)) {
      return errorResponse('অবৈধ প্রজেক্ট স্ট্যাটাস')
    }
    if (projectType && !['RESIDENTIAL', 'COMMERCIAL', 'MIXED'].includes(projectType)) {
      return errorResponse('অবৈধ প্রজেক্ট টাইপ')
    }

    // Ownership check scoped to the project's company — not just any company of this user
    const project = await prisma.developerProject.findFirst({
      where: { id, construction: { ownerId: authUser.userId } },
      select: { id: true },
    })
    if (!project) return errorResponse('প্রজেক্ট পাওয়া যায়নি বা অনুমতি নেই', 404)

    const updated = await prisma.developerProject.update({
      where: { id },
      data: {
        ...(title && { title: title.trim() }),
        ...(description && { description: description.trim() }),
        ...(projectType && { projectType }),
        ...(status && { status }),
        ...(address && { address: address.trim() }),
        ...(areaName != null && { areaName: areaName?.trim() || null }),
        ...(mapLat != null && { mapLat: mapLat !== '' ? parseFloat(mapLat) : null }),
        ...(mapLng != null && { mapLng: mapLng !== '' ? parseFloat(mapLng) : null }),
        ...(floorCount != null && { floorCount: floorCount !== '' ? parseInt(floorCount) : null }),
        ...(landArea != null && { landArea: landArea || null }),
        ...(startDate != null && { startDate: startDate ? new Date(startDate) : null }),
        ...(handoverDate != null && { handoverDate: handoverDate ? new Date(handoverDate) : null }),
        ...(pricePerSqft != null && { pricePerSqft: pricePerSqft !== '' ? parseFloat(pricePerSqft) : null }),
        ...(minPrice != null && { minPrice: parseFloat(minPrice) }),
        ...(maxPrice != null && { maxPrice: parseFloat(maxPrice) }),
        ...(coverImage != null && { coverImage: coverImage || null }),
        ...(floorPlan != null && { floorPlan: floorPlan || null }),
        ...(amenities != null && { amenities: JSON.stringify(amenities) }),
      },
    })

    return successResponse({ project: updated })
  } catch (error) {
    console.error('Project update error:', error)
    return errorResponse('সার্ভার সমস্যা', 500)
  }
}
