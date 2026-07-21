import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { getAuthUser } from '@/lib/auth'
import { successResponse, errorResponse, unauthorizedResponse } from '@/lib/api'

export async function POST(req: NextRequest) {
  try {
    const authUser = await getAuthUser()
    if (!authUser) return unauthorizedResponse()

    const body = await req.json()
    const { companyName, description, services, experience, address, districtId, coverImage, portfolio } = body

    if (!companyName || !description || !districtId) {
      return errorResponse('সব প্রয়োজনীয় তথ্য দিন')
    }

    const company = await prisma.construction.create({
      data: {
        companyName: companyName.trim(),
        description: description.trim(),
        services: JSON.stringify(services || []),
        experience: parseInt(experience) || 0,
        address: (address || '').trim(),
        districtId: parseInt(districtId),
        coverImage: coverImage || null,
        ownerId: authUser.userId,
        status: 'PENDING',
        portfolio: {
          create: (portfolio || []).map((item: { title: string; imageUrl: string }) => ({
            title: item.title,
            imageUrl: item.imageUrl,
          })),
        },
      },
    })

    return successResponse({ company }, 201)
  } catch (error) {
    console.error('Construction create error:', error)
    return errorResponse('সার্ভার সমস্যা', 500)
  }
}
