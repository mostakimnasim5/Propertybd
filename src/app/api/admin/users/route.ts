import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { getAuthUser } from '@/lib/auth'
import { successResponse, errorResponse, unauthorizedResponse } from '@/lib/api'

export async function GET(req: NextRequest) {
  try {
    const authUser = await getAuthUser()
    if (!authUser || authUser.role !== 'ADMIN') return unauthorizedResponse()

    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const role = searchParams.get('role')
    const search = searchParams.get('search')

    const where: Record<string, unknown> = {}
    if (role) where.role = role
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { phone: { contains: search } },
        { email: { contains: search } },
      ]
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true, name: true, phone: true,
          email: true, role: true, isVerified: true,
          nidVerified: true, createdAt: true,
          _count: { select: { listings: true, vehicles: true } },
        },
      }),
      prisma.user.count({ where }),
    ])

    return successResponse({ users, total, totalPages: Math.ceil(total / limit) })
  } catch (error) {
    console.error('Admin users error:', error)
    return errorResponse('সার্ভার সমস্যা', 500)
  }
}

// Change user role or ban
export async function PATCH(req: NextRequest) {
  try {
    const authUser = await getAuthUser()
    if (!authUser || authUser.role !== 'ADMIN') return unauthorizedResponse()

    const { userId, role, nidVerified } = await req.json()
    if (!userId) return errorResponse('User ID দিন')

    const updateData: Record<string, unknown> = {}
    if (role) updateData.role = role
    if (typeof nidVerified === 'boolean') updateData.nidVerified = nidVerified

    const updated = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: { id: true, name: true, role: true, nidVerified: true },
    })

    return successResponse({ user: updated })
  } catch (error) {
    console.error('Admin user update error:', error)
    return errorResponse('সার্ভার সমস্যা', 500)
  }
}
