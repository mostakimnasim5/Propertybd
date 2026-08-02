import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { getAuthUser } from '@/lib/auth'
import { successResponse, errorResponse, unauthorizedResponse } from '@/lib/api'

export async function POST(req: NextRequest) {
  try {
    const authUser = await getAuthUser()
    if (!authUser) return unauthorizedResponse()

    const body = await req.json()
    const {
      title, description, projectType, status,
      address, districtId, areaName, mapLat, mapLng,
      totalUnits, availableUnits, floorCount, landArea,
      handoverDate, startDate,
      pricePerSqft, minPrice, maxPrice,
      coverImage, images, floorPlan,
      amenities, constructionId, units,
    } = body

    if (!title || !description || !districtId || !totalUnits || !minPrice || !maxPrice || !constructionId) {
      return errorResponse('সব প্রয়োজনীয় তথ্য দিন')
    }

    // Verify construction company belongs to user
    const company = await prisma.construction.findUnique({
      where: { id: constructionId, ownerId: authUser.userId },
    })
    if (!company) return errorResponse('কোম্পানি পাওয়া যায়নি')

    const project = await prisma.developerProject.create({
      data: {
        title: title.trim(),
        description: description.trim(),
        projectType: projectType || 'RESIDENTIAL',
        status: status || 'ONGOING',
        address: address.trim(),
        districtId: parseInt(districtId),
        areaName: areaName?.trim() || null,
        mapLat: mapLat ? parseFloat(mapLat) : null,
        mapLng: mapLng ? parseFloat(mapLng) : null,
        totalUnits: parseInt(totalUnits),
        availableUnits: parseInt(availableUnits || totalUnits),
        floorCount: floorCount ? parseInt(floorCount) : null,
        landArea: landArea || null,
        handoverDate: handoverDate ? new Date(handoverDate) : null,
        startDate: startDate ? new Date(startDate) : null,
        pricePerSqft: pricePerSqft ? parseFloat(pricePerSqft) : null,
        minPrice: parseFloat(minPrice),
        maxPrice: parseFloat(maxPrice),
        coverImage: coverImage || null,
        floorPlan: floorPlan || null,
        amenities: JSON.stringify(amenities || []),
        constructionId,
        listingStatus: 'PENDING',
        images: {
          create: (images || []).map((url: string, idx: number) => ({
            url,
            isPrimary: idx === 0,
          })),
        },
        units: {
          create: (units || []).map((u: any) => ({
            unitType: u.unitType,
            floor: u.floor ? parseInt(u.floor) : null,
            size: parseFloat(u.size),
            price: parseFloat(u.price),
            status: 'AVAILABLE',
          })),
        },
      },
      include: { images: true, units: true },
    })

    return successResponse({ project }, 201)
  } catch (error) {
    console.error('Project create error:', error)
    return errorResponse('সার্ভার সমস্যা', 500)
  }
}
