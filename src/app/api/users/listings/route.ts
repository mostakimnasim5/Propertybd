import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { getAuthUser } from '@/lib/auth'
import { successResponse, errorResponse, unauthorizedResponse } from '@/lib/api'

export async function GET(req: NextRequest) {
  try {
    const authUser = await getAuthUser()
    if (!authUser) return unauthorizedResponse()

    const { searchParams } = new URL(req.url)
    const category = searchParams.get('category') || 'property'

    if (category === 'vehicle') {
      const vehicles = await prisma.vehicle.findMany({
        where: { ownerId: authUser.userId },
        orderBy: { createdAt: 'desc' },
        include: {
          images: { where: { isPrimary: true }, take: 1 },
          district: { select: { name: true } },
        },
      })
      return successResponse({ vehicles })
    }

    if (category === 'construction') {
      const companies = await prisma.construction.findMany({
        where: { ownerId: authUser.userId },
        orderBy: { createdAt: 'desc' },
        include: {
          district: { select: { name: true } },
        },
      })
      return successResponse({ companies })
    }

    // Default: property listings
    const listings = await prisma.listing.findMany({
      where: { ownerId: authUser.userId },
      orderBy: { createdAt: 'desc' },
      include: {
        images: { where: { isPrimary: true }, take: 1 },
        district: { select: { name: true } },
      },
    })

    return successResponse({ listings })
  } catch (error) {
    console.error('User listings error:', error)
    return errorResponse('সার্ভার সমস্যা', 500)
  }
}
