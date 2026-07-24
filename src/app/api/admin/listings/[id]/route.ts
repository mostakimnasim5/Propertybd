import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { getAuthUser } from '@/lib/auth'
import { successResponse, errorResponse, unauthorizedResponse } from '@/lib/api'
import { sendOTPSMS } from '@/lib/sms'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = await getAuthUser()
    if (!authUser || authUser.role !== 'ADMIN') return unauthorizedResponse()

    const { id } = await params
    const { action, category } = await req.json()
    // action: 'approve' | 'reject' | 'feature' | 'unfeature'

    const statusMap: Record<string, string> = {
      approve: 'ACTIVE',
      reject: 'REJECTED',
    }

    const updateData: Record<string, unknown> = {}
    if (statusMap[action]) updateData.status = statusMap[action]
    if (action === 'feature') updateData.isFeatured = true
    if (action === 'unfeature') updateData.isFeatured = false

    let ownerPhone: string | null = null
    let itemTitle: string = 'আপনার বিজ্ঞাপন'

    if (category === 'vehicle') {
      const vehicle = await prisma.vehicle.update({
        where: { id }, data: updateData,
        include: { owner: { select: { phone: true } } },
      })
      ownerPhone = vehicle.owner?.phone || null
      itemTitle = `${vehicle.brand} ${vehicle.model}`
    } else if (category === 'construction') {
      const company = await prisma.construction.update({
        where: { id }, data: updateData,
        include: { owner: { select: { phone: true } } },
      })
      ownerPhone = company.owner?.phone || null
      itemTitle = company.companyName
    } else {
      const listing = await prisma.listing.update({
        where: { id }, data: updateData,
        include: { owner: { select: { phone: true } } },
      })
      ownerPhone = listing.owner?.phone || null
      itemTitle = listing.title
    }

    // Send SMS notification to owner
    if (ownerPhone && statusMap[action]) {
      const smsMsg = action === 'approve'
        ? `✅ PropertyBD: আপনার বিজ্ঞাপন "${itemTitle.slice(0, 30)}" অনুমোদিত হয়েছে এবং প্রকাশিত হয়েছে।`
        : `❌ PropertyBD: আপনার বিজ্ঞাপন "${itemTitle.slice(0, 30)}" অনুমোদিত হয়নি। বিস্তারিত জানতে যোগাযোগ করুন।`

      // Fire and forget — don't block response
      sendOTPSMS(ownerPhone, smsMsg).catch(console.error)
    }

    return successResponse({ message: 'আপডেট সফল' })
  } catch (error) {
    console.error('Admin approve error:', error)
    return errorResponse('সার্ভার সমস্যা', 500)
  }
}
