import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { getAuthUser } from '@/lib/auth'
import { successResponse, errorResponse, unauthorizedResponse } from '@/lib/api'

export async function GET(req: NextRequest) {
  try {
    const authUser = await getAuthUser()
    if (!authUser || authUser.role !== 'ADMIN') return unauthorizedResponse()

    const [
      totalUsers, totalListings, pendingListings,
      totalVehicles, pendingVehicles,
      totalLeads, totalConstruction,
      totalProjects, pendingProjects,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.listing.count({ where: { status: 'ACTIVE' } }),
      prisma.listing.count({ where: { status: 'PENDING' } }),
      prisma.vehicle.count({ where: { status: 'ACTIVE' } }),
      prisma.vehicle.count({ where: { status: 'PENDING' } }),
      prisma.leadUnlock.count(),
      prisma.construction.count({ where: { status: 'ACTIVE' } }),
      prisma.developerProject.count({ where: { listingStatus: 'ACTIVE' } }),
      prisma.developerProject.count({ where: { listingStatus: 'PENDING' } }),
    ])

    return successResponse({
      totalUsers,
      totalListings,
      pendingListings,
      totalVehicles,
      pendingVehicles,
      totalLeads,
      totalConstruction,
      totalProjects,
      pendingProjects,
      // Combined pending for dashboard alert
      totalPending: pendingListings + pendingVehicles + pendingProjects,
    })
  } catch (error) {
    console.error('Admin stats error:', error)
    return errorResponse('সার্ভার সমস্যা', 500)
  }
}
