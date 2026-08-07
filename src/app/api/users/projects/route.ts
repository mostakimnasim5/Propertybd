import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { getAuthUser } from '@/lib/auth'
import { successResponse, errorResponse, unauthorizedResponse } from '@/lib/api'

export async function GET(_req: NextRequest) {
  try {
    const authUser = await getAuthUser()
    if (!authUser) return unauthorizedResponse()

    // Get user's construction companies first
    const companies = await prisma.construction.findMany({
      where: { ownerId: authUser.userId },
      select: { id: true },
    })

    const companyIds = companies.map(c => c.id)

    if (companyIds.length === 0) {
      return successResponse({ projects: [] })
    }

    const projects = await prisma.developerProject.findMany({
      where: { constructionId: { in: companyIds } },
      orderBy: { createdAt: 'desc' },
      include: {
        images: { where: { isPrimary: true }, take: 1 },
        district: { select: { name: true, nameBn: true } },
        construction: { select: { companyName: true } },
        _count: { select: { units: true } },
      },
    })

    return successResponse({ projects })
  } catch (error) {
    console.error('User projects error:', error)
    return errorResponse('সার্ভার সমস্যা', 500)
  }
}
