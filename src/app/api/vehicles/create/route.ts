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
      title, description, type, purpose, brand, model, year,
      price, negotiable, mileage, condition, color, fuelType,
      transmission, address, districtId, areaName, images,
    } = body

    if (!title || !type || !purpose || !brand || !model || !year || !price || !condition || !districtId) {
      return errorResponse('সব প্রয়োজনীয় তথ্য দিন')
    }

    const vehicle = await prisma.vehicle.create({
      data: {
        title: title.trim(),
        description: (description || '').trim(),
        type,
        purpose,
        brand: brand.trim(),
        model: model.trim(),
        year: parseInt(year),
        price: parseFloat(price),
        negotiable: negotiable || false,
        mileage: mileage ? parseInt(mileage) : null,
        condition,
        color: color || null,
        fuelType: fuelType || null,
        transmission: transmission || null,
        address: address.trim(),
        districtId: parseInt(districtId),
        areaName: areaName?.trim() || null,
        ownerId: authUser.userId,
        status: 'PENDING',
        images: {
          create: (images || []).map((url: string, idx: number) => ({
            url,
            isPrimary: idx === 0,
          })),
        },
      },
      include: { images: true },
    })

    return successResponse({ vehicle }, 201)
  } catch (error) {
    console.error('Vehicle create error:', error)
    return errorResponse('সার্ভার সমস্যা', 500)
  }
}
