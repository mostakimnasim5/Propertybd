import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { getAuthUser } from '@/lib/auth'
import { successResponse, errorResponse, notFoundResponse } from '@/lib/api'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const authUser = await getAuthUser()

    const listing = await prisma.listing.findUnique({
      where: { id, status: 'ACTIVE' },
      include: {
        images: true,
        district: true,
        upazila: true,
        owner: {
          select: {
            id: true,
            name: true,
            nidVerified: true,
            // Phone only shown if lead is unlocked
          },
        },
      },
    })

    if (!listing) return notFoundResponse('বিজ্ঞাপন')

    // Increment view count
    await prisma.listing.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    })

    // Check if current user has unlocked this lead
    let isUnlocked = false
    if (authUser) {
      // Owner always sees their own listing contact
      if (listing.ownerId === authUser.userId) {
        isUnlocked = true
      } else {
        const unlock = await prisma.leadUnlock.findFirst({
          where: { userId: authUser.userId, listingId: id },
        })
        isUnlocked = !!unlock
      }
    }

    // Get owner phone only if unlocked
    let ownerPhone: string | null = null
    if (isUnlocked) {
      const owner = await prisma.user.findUnique({
        where: { id: listing.ownerId },
        select: { phone: true },
      })
      ownerPhone = owner?.phone || null
    }

    return successResponse({ listing, isUnlocked, ownerPhone })
  } catch (error) {
    console.error('Get listing error:', error)
    return errorResponse('সার্ভার সমস্যা', 500)
  }
}
