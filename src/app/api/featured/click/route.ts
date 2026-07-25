import { NextRequest } from 'next/server'
import { logFeaturedClick } from '@/lib/featuredAlgorithm'
import { successResponse, errorResponse } from '@/lib/api'

export async function POST(req: NextRequest) {
  try {
    const { featuredId, listingId, districtId } = await req.json()

    if (!featuredId || !listingId) {
      return errorResponse('featuredId এবং listingId দিন')
    }

    await logFeaturedClick(
      featuredId,
      listingId,
      districtId ? parseInt(districtId) : undefined
    )

    return successResponse({ logged: true })
  } catch (error) {
    console.error('Featured click log error:', error)
    // Click logging failure should not break user experience
    return successResponse({ logged: false })
  }
}
