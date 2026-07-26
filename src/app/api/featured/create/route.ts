import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { getAuthUser } from '@/lib/auth'
import { successResponse, errorResponse, unauthorizedResponse } from '@/lib/api'

const MIN_DAILY_BID = 50
const MIN_BUDGET = 200

export async function POST(req: NextRequest) {
  try {
    const authUser = await getAuthUser()
    if (!authUser) return unauthorizedResponse()

    const { listingId, bidPerDay, totalBudget, targetDistrictId, targetType, targetPurpose, endDate } = await req.json()

    if (!listingId || !bidPerDay || !totalBudget) return errorResponse('listing, bid এবং budget দিন')
    if (bidPerDay < MIN_DAILY_BID) return errorResponse(`সর্বনিম্ন দৈনিক bid ৳${MIN_DAILY_BID}`)
    if (totalBudget < MIN_BUDGET) return errorResponse(`সর্বনিম্ন total budget ৳${MIN_BUDGET}`)

    const listing = await prisma.listing.findUnique({
      where: { id: listingId, ownerId: authUser.userId, status: 'ACTIVE' },
    })
    if (!listing) return errorResponse('Listing পাওয়া যায়নি বা active নয়')

    const existing = await prisma.featuredListing.findFirst({
      where: { listingId, status: 'ACTIVE' },
    })
    if (existing) return errorResponse('এই listing ইতিমধ্যে boost-এ আছে')

    const featured = await prisma.featuredListing.create({
      data: {
        listingId,
        ownerId: authUser.userId,
        bidPerDay: parseFloat(bidPerDay),
        totalBudget: parseFloat(totalBudget),
        budgetSpent: 0,
        targetDistrictId: targetDistrictId ? parseInt(targetDistrictId) : null,
        targetType: targetType || null,
        targetPurpose: targetPurpose || null,
        endDate: endDate ? new Date(endDate) : null,
        status: 'ACTIVE',
        relevanceScore: 0.5,
      },
    })

    return successResponse({ featured }, 201)
  } catch (error) {
    console.error('Featured create error:', error)
    return errorResponse('সার্ভার সমস্যা', 500)
  }
}
