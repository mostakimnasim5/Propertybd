import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { successResponse, errorResponse } from '@/lib/api'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const divisionId = searchParams.get('divisionId')

    if (divisionId) {
      const districts = await prisma.district.findMany({
        where: { divisionId: parseInt(divisionId) },
        orderBy: { name: 'asc' },
      })
      return successResponse({ districts })
    }

    const divisions = await prisma.division.findMany({
      orderBy: { name: 'asc' },
      include: { districts: { orderBy: { name: 'asc' } } },
    })

    return successResponse({ divisions })
  } catch (error) {
    console.error('Locations error:', error)
    return errorResponse('সার্ভার সমস্যা', 500)
  }
}
