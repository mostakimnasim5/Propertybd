import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { getAuthUser } from '@/lib/auth'
import { successResponse, errorResponse, notFoundResponse } from '@/lib/api'
import { calculateUnlockFee } from '@/lib/pricing'

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
          select: { id: true, name: true, nidVerified: true },
        },
      },
    })

    if (!listing) return notFoundResponse('বিজ্ঞাপন')

    await prisma.listing.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    })

    let isUnlocked = false
    let ownerPhone: string | null = null

    // numberVisible = true means seller paid, number shown to all
    if (listing.numberVisible) {
      isUnlocked = true
    } else if (authUser) {
      if (listing.ownerId === authUser.userId) {
        isUnlocked = true
      } else {
        const unlock = await prisma.leadUnlock.findFirst({
          where: { userId: authUser.userId, listingId: id },
        })
        isUnlocked = !!unlock
      }
    }

    if (isUnlocked) {
      const owner = await prisma.user.findUnique({
        where: { id: listing.ownerId },
        select: { phone: true },
      })
      ownerPhone = owner?.phone || null
    }

    // Dynamic unlock fee based on property price
    const unlockFee = calculateUnlockFee(Number(listing.price))

    return successResponse({
      listing,
      isUnlocked,
      ownerPhone,
      unlockFee,
      numberVisible: listing.numberVisible,
    })
  } catch (error) {
    console.error('Get listing error:', error)
    return errorResponse('সার্ভার সমস্যা', 500)
  }
}
