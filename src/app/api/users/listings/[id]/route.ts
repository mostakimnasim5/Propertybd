import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { getAuthUser } from '@/lib/auth'
import { successResponse, errorResponse, unauthorizedResponse } from '@/lib/api'

// DELETE — owner removes their own listing (property / vehicle / construction / project)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = await getAuthUser()
    if (!authUser) return unauthorizedResponse()

    const { id } = await params
    const category = new URL(req.url).searchParams.get('category') || 'property'

    // Each model is only deleted if it belongs to the requesting user,
    // so a single `deleteMany` per category keeps ownership checks atomic
    let deleted = 0

    if (category === 'vehicle') {
      const res = await prisma.vehicle.deleteMany({
        where: { id, ownerId: authUser.userId },
      })
      deleted = res.count
    } else if (category === 'construction') {
      const res = await prisma.construction.deleteMany({
        where: { id, ownerId: authUser.userId },
      })
      deleted = res.count
    } else if (category === 'project') {
      const res = await prisma.developerProject.deleteMany({
        where: { id, construction: { ownerId: authUser.userId } },
      })
      deleted = res.count
    } else {
      const res = await prisma.listing.deleteMany({
        where: { id, ownerId: authUser.userId },
      })
      deleted = res.count
    }

    if (deleted === 0) {
      return errorResponse('বিজ্ঞাপনটি পাওয়া যায়নি বা এটি আপনার নয়', 404)
    }

    return successResponse({ deleted: true })
  } catch (error) {
    console.error('Delete listing error:', error)
    return errorResponse('সার্ভার সমস্যা', 500)
  }
}
