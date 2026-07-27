import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { successResponse, errorResponse, notFoundResponse } from '@/lib/api'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const vehicle = await prisma.vehicle.findUnique({
      where: { id, status: 'ACTIVE' },
      include: {
        images: true,
        district: true,
        owner: {
          select: {
            id: true, name: true, phone: true,
            nidVerified: true,
          },
        },
      },
    })

    if (!vehicle) return notFoundResponse('গাড়ি')

    await prisma.vehicle.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    })

    return successResponse({
      vehicle,
      ownerPhone: vehicle.owner?.phone || null,
    })
  } catch (error) {
    console.error('Vehicle detail error:', error)
    return errorResponse('সার্ভার সমস্যা', 500)
  }
}
