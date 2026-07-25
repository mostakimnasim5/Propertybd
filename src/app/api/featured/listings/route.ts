import { NextRequest } from 'next/server'
import { getRotatedFeaturedListings } from '@/lib/featuredAlgorithm'
import { successResponse, errorResponse } from '@/lib/api'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)

    const districtId = searchParams.get('districtId')
    const type = searchParams.get('type')
    const purpose = searchParams.get('purpose')
    const limit = parseInt(searchParams.get('limit') || '3')

    const featured = await getRotatedFeaturedListings({
      districtId: districtId ? parseInt(districtId) : undefined,
      type: type || undefined,
      purpose: purpose || undefined,
      limit: Math.min(limit, 5), // সর্বোচ্চ ৫টা
    })

    // Clean response — ranking details client-এ expose করবো না
    const listings = featured.map(f => ({
      featuredId: f.featuredId,
      listingId: f.listingId,
      listing: f.listing,
      isFeatured: true,
    }))

    return successResponse({ listings, count: listings.length })
  } catch (error) {
    console.error('Featured listings error:', error)
    return errorResponse('সার্ভার সমস্যা', 500)
  }
}
