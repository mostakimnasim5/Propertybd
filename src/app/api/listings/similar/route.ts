import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { successResponse, errorResponse } from '@/lib/api'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const listingId = searchParams.get('listingId')
    const districtId = searchParams.get('districtId')
    const type = searchParams.get('type')
    const purpose = searchParams.get('purpose')

    if (!listingId || !districtId) return errorResponse('তথ্য অসম্পূর্ণ')

    const similar = await prisma.listing.findMany({
      where: {
        status: 'ACTIVE',
        id: { not: listingId },
        districtId: parseInt(districtId),
        ...(type && { type: type as any }),
        ...(purpose && { purpose: purpose as any }),
      },
      take: 4,
      orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }],
      include: {
        images: { where: { isPrimary: true }, take: 1 },
        district: { select: { name: true, nameBn: true } },
        owner: { select: { name: true, nidVerified: true } },
      },
    })

    return successResponse({ similar })
  } catch (error) {
    console.error('Similar listings error:', error)
    return errorResponse('সার্ভার সমস্যা', 500)
  }
}
