import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { getAuthUser } from '@/lib/auth'
import { successResponse, errorResponse, unauthorizedResponse } from '@/lib/api'

const UNIT_STATUSES = ['AVAILABLE', 'BOOKED', 'SOLD']

// PATCH — builder updates unit details/status on their own project
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; unitId: string }> }
) {
  try {
    const authUser = await getAuthUser()
    if (!authUser) return unauthorizedResponse()

    const { id, unitId } = await params
    const body = await req.json()
    const { status, price, floor, unitType, size } = body

    // Validate new status if provided
    if (status && !UNIT_STATUSES.includes(status)) {
      return errorResponse('অবৈধ স্ট্যাটাস')
    }

    // Only allow the project's owning company (i.e. the builder) to modify units
    const unit = await prisma.projectUnit.findFirst({
      where: { id: unitId, projectId: id, project: { construction: { ownerId: authUser.userId } } },
    })
    if (!unit) return errorResponse('unit পাওয়া যায়নি বা অনুমতি নেই', 404)

    const updated = await prisma.projectUnit.update({
      where: { id: unitId },
      data: {
        ...(status && { status }),
        ...(price != null && price !== '' && { price: parseFloat(price) }),
        ...(floor != null && floor !== '' && { floor: parseInt(floor) }),
        ...(unitType && { unitType: unitType.trim() }),
        ...(size != null && size !== '' && { size: parseFloat(size) }),
      },
    })

    // Keep DeveloperProject.availableUnits consistent with actual unit states
    const availableCount = await prisma.projectUnit.count({
      where: { projectId: id, status: 'AVAILABLE' },
    })
    await prisma.developerProject.update({
      where: { id },
      data: { availableUnits: availableCount },
    })

    return successResponse({ unit: updated, availableUnits: availableCount })
  } catch (error) {
    console.error('Unit update error:', error)
    return errorResponse('সার্ভার সমস্যা', 500)
  }
}

// DELETE — remove a unit from the project (ownership enforced the same way)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; unitId: string }> }
) {
  try {
    const authUser = await getAuthUser()
    if (!authUser) return unauthorizedResponse()

    const { id, unitId } = await params

    const deleted = await prisma.projectUnit.deleteMany({
      where: { id: unitId, projectId: id, project: { construction: { ownerId: authUser.userId } } },
    })

    if (deleted.count === 0) {
      return errorResponse('unit পাওয়া যায়নি বা অনুমতি নেই', 404)
    }

    const availableCount = await prisma.projectUnit.count({
      where: { projectId: id, status: 'AVAILABLE' },
    })
    await prisma.developerProject.update({
      where: { id },
      data: { availableUnits: availableCount },
    })

    return successResponse({ deleted: true, availableUnits: availableCount })
  } catch (error) {
    console.error('Unit delete error:', error)
    return errorResponse('সার্ভার সমস্যা', 500)
  }
}
