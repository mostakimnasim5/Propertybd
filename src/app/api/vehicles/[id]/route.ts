import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { getAuthUser } from '@/lib/auth'
import { successResponse, errorResponse, notFoundResponse } from '@/lib/api'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const authUser = await getAuthUser()

    const vehicle = await prisma.vehicle.findUnique({
      where: { id, status: 'ACTIVE' },
      include: {
        images: true,
        district: true,
        owner: { select: { id: true, name: true, nidVerified: true } },
      },
    })

    if (!vehicle) return notFoundResponse('গাড়ি')

    await prisma.vehicle.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    })

    let isUnlocked = false
    let ownerPhone: string | null = null

    if (authUser) {
      if (vehicle.ownerId === authUser.userId) {
        isUnlocked = true
      } else {
        const unlock = await prisma.leadUnlock.findFirst({
          where: { userId: authUser.userId, vehicleId: id },
        })
        isUnlocked = !!unlock
      }

      if (isUnlocked) {
        const owner = await prisma.user.findUnique({
          where: { id: vehicle.ownerId },
          select: { phone: true },
        })
        ownerPhone = owner?.phone || null
      }
    }

    return successResponse({ vehicle, isUnlocked, ownerPhone })
  } catch (error) {
    console.error('Vehicle detail error:', error)
    return errorResponse('সার্ভার সমস্যা', 500)
  }
}
