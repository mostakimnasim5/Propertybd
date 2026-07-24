import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { getAuthUser } from '@/lib/auth'
import { successResponse, errorResponse, unauthorizedResponse } from '@/lib/api'

export async function POST(req: NextRequest) {
  try {
    const authUser = await getAuthUser()
    if (!authUser) return unauthorizedResponse()

    const { constructionId, rating, comment } = await req.json()

    if (!constructionId || !rating) {
      return errorResponse('কোম্পানি ও রেটিং দিন')
    }

    if (rating < 1 || rating > 5) {
      return errorResponse('রেটিং ১ থেকে ৫ এর মধ্যে হতে হবে')
    }

    // Check company exists
    const company = await prisma.construction.findUnique({
      where: { id: constructionId, status: 'ACTIVE' },
    })
    if (!company) return errorResponse('কোম্পানি পাওয়া যায়নি')

    // Prevent owner from reviewing own company
    if (company.ownerId === authUser.userId) {
      return errorResponse('নিজের কোম্পানিতে রিভিউ দেওয়া যাবে না')
    }

    // Check already reviewed
    const existing = await prisma.review.findFirst({
      where: { constructionId, reviewerId: authUser.userId },
    })
    if (existing) return errorResponse('আপনি ইতিমধ্যে রিভিউ দিয়েছেন')

    const review = await prisma.review.create({
      data: {
        rating: parseInt(rating),
        comment: comment?.trim() || null,
        reviewerId: authUser.userId,
        constructionId,
      },
      include: {
        reviewer: { select: { name: true } },
      },
    })

    return successResponse({ review }, 201)
  } catch (error) {
    console.error('Review submit error:', error)
    return errorResponse('সার্ভার সমস্যা', 500)
  }
}
