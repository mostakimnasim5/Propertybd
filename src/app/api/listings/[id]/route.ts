import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { successResponse, errorResponse, notFoundResponse } from '@/lib/api'
import { calculateUnlockFee } from '@/lib/pricing'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const listing = await prisma.listing.findUnique({
      where: { id, status: 'ACTIVE' },
      include: {
        images: true,
        district: true,
        upazila: true,
        owner: {
          select: {
            id: true, name: true, phone: true,
            nidVerified: true,
          },
        },
      },
    })

    if (!listing) return notFoundResponse('বিজ্ঞাপন')

    // View count increment
    await prisma.listing.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    })

    return successResponse({
      listing,
      ownerPhone: listing.owner?.phone || null,
    })
  } catch (error) {
    console.error('Get listing error:', error)
    return errorResponse('সার্ভার সমস্যা', 500)
  }
}
