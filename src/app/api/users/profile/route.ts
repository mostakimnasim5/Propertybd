import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { getAuthUser } from '@/lib/auth'
import { successResponse, errorResponse, unauthorizedResponse } from '@/lib/api'

export async function GET() {
  try {
    const authUser = await getAuthUser()
    if (!authUser) return unauthorizedResponse()

    const user = await prisma.user.findUnique({
      where: { id: authUser.userId },
      select: {
        id: true,
        phone: true,
        email: true,
        name: true,
        role: true,
        isVerified: true,
        nidVerified: true,
        profileImage: true,
        createdAt: true,
        subscription: true,
        _count: {
          select: {
            listings: true,
            vehicles: true,
            constructions: true,
          },
        },
      },
    })

    if (!user) return unauthorizedResponse()

    return successResponse({ user })
  } catch (error) {
    console.error('Profile fetch error:', error)
    return errorResponse('সার্ভার সমস্যা', 500)
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const authUser = await getAuthUser()
    if (!authUser) return unauthorizedResponse()

    const body = await req.json()
    const { name, email, profileImage } = body

    // Validate email if provided
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email)) {
        return errorResponse('সঠিক ইমেইল দিন')
      }
      // Check uniqueness
      const existing = await prisma.user.findFirst({
        where: { email, NOT: { id: authUser.userId } },
      })
      if (existing) return errorResponse('এই ইমেইল ইতিমধ্যে ব্যবহৃত')
    }

    const updated = await prisma.user.update({
      where: { id: authUser.userId },
      data: {
        ...(name && { name: name.trim() }),
        ...(email && { email: email.trim().toLowerCase() }),
        ...(profileImage && { profileImage }),
      },
      select: {
        id: true, phone: true, email: true,
        name: true, role: true, profileImage: true,
      },
    })

    return successResponse({ user: updated })
  } catch (error) {
    console.error('Profile update error:', error)
    return errorResponse('সার্ভার সমস্যা', 500)
  }
}
