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
      title, description, type, purpose, price, negotiable,
      area, bedrooms, bathrooms, floor, totalFloors, facing,
      furnished, parking, gasLine, lift,
      address, districtId, upazilaId, areaName,
      mapLat, mapLng, images,
    } = body

    // Basic validation
    if (!title || !description || !type || !purpose || !price || !address || !districtId) {
      return errorResponse('সব প্রয়োজনীয় তথ্য দিন')
    }

    // Check if district exists
    const district = await prisma.district.findUnique({ where: { id: parseInt(districtId) } })
    if (!district) return errorResponse('জেলা সঠিক নয়')

    const listing = await prisma.listing.create({
      data: {
        title: title.trim(),
        description: description.trim(),
        type,
        purpose,
        price: parseFloat(price),
        negotiable: negotiable || false,
        area: area ? parseFloat(area) : null,
        bedrooms: bedrooms ? parseInt(bedrooms) : null,
        bathrooms: bathrooms ? parseInt(bathrooms) : null,
        floor: floor ? parseInt(floor) : null,
        totalFloors: totalFloors ? parseInt(totalFloors) : null,
        facing: facing || null,
        furnished: furnished || false,
        parking: parking || false,
        gasLine: gasLine || false,
        lift: lift || false,
        address: address.trim(),
        districtId: parseInt(districtId),
        upazilaId: upazilaId ? parseInt(upazilaId) : null,
        areaName: areaName?.trim() || null,
        mapLat: mapLat ? parseFloat(mapLat) : null,
        mapLng: mapLng ? parseFloat(mapLng) : null,
        ownerId: authUser.userId,
        status: 'PENDING', // Admin must approve
        images: {
          create: (images || []).map((url: string, idx: number) => ({
            url,
            isPrimary: idx === 0,
          })),
        },
      },
      include: { images: true },
    })

    return successResponse({ listing }, 201)
  } catch (error) {
    console.error('Create listing error:', error)
    return errorResponse('সার্ভার সমস্যা', 500)
  }
}
