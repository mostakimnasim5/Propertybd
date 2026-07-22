import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { getAuthUser } from '@/lib/auth'
import { successResponse, errorResponse, unauthorizedResponse } from '@/lib/api'

// GET — fetch all saved listings
export async function GET() {
  try {
    const authUser = await getAuthUser()
    if (!authUser) return unauthorizedResponse()

    const saved = await prisma.savedListing.findMany({
      where: { userId: authUser.userId },
      orderBy: { savedAt: 'desc' },
      include: {
        listing: {
          include: {
            images: { where: { isPrimary: true }, take: 1 },
            district: { select: { name: true, nameBn: true } },
          },
        },
      },
    })

    return successResponse({ saved })
  } catch (error) {
    console.error('Saved fetch error:', error)
    return errorResponse('সার্ভার সমস্যা', 500)
  }
}

// POST — save or unsave a listing
export async function POST(req: NextRequest) {
  try {
    const authUser = await getAuthUser()
    if (!authUser) return unauthorizedResponse()

    const { listingId } = await req.json()
    if (!listingId) return errorResponse('Listing ID দিন')

    const existing = await prisma.savedListing.findUnique({
      where: { userId_listingId: { userId: authUser.userId, listingId } },
    })

    if (existing) {
      // Unsave
      await prisma.savedListing.delete({
        where: { userId_listingId: { userId: authUser.userId, listingId } },
      })
      return successResponse({ saved: false })
    } else {
      // Save
      await prisma.savedListing.create({
        data: { userId: authUser.userId, listingId },
      })
      return successResponse({ saved: true })
    }
  } catch (error) {
    console.error('Save toggle error:', error)
    return errorResponse('সার্ভার সমস্যা', 500)
  }
}
