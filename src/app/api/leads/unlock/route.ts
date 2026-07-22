import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { getAuthUser } from '@/lib/auth'
import { successResponse, errorResponse, unauthorizedResponse } from '@/lib/api'

const LEAD_PRICE = 20 // ৳20 per lead unlock

export async function POST(req: NextRequest) {
  try {
    const authUser = await getAuthUser()
    if (!authUser) return unauthorizedResponse()

    const { listingId, vehicleId, constructionId, transactionId } = await req.json()

    if (!listingId && !vehicleId && !constructionId) {
      return errorResponse('কোন listing নির্বাচন করুন')
    }

    if (!transactionId) {
      return errorResponse('Payment transaction ID দিন')
    }

    // Check already unlocked
    const existing = await prisma.leadUnlock.findFirst({
      where: {
        userId: authUser.userId,
        ...(listingId && { listingId }),
        ...(vehicleId && { vehicleId }),
        ...(constructionId && { constructionId }),
      },
    })

    if (existing) {
      // Already unlocked — return phone directly
      const targetOwnerId = await getOwnerId(listingId, vehicleId, constructionId)
      const owner = await prisma.user.findUnique({
        where: { id: targetOwnerId! },
        select: { phone: true },
      })
      return successResponse({ alreadyUnlocked: true, phone: owner?.phone })
    }

    // Verify payment with SSLCommerz (simplified check)
    const paymentValid = await verifyPayment(transactionId)
    if (!paymentValid) {
      return errorResponse('Payment যাচাই করা যায়নি', 402)
    }

    // Create unlock record
    const unlock = await prisma.leadUnlock.create({
      data: {
        userId: authUser.userId,
        listingId: listingId || null,
        vehicleId: vehicleId || null,
        constructionId: constructionId || null,
        amountPaid: LEAD_PRICE,
      },
    })

    // Get owner phone
    const targetOwnerId = await getOwnerId(listingId, vehicleId, constructionId)
    const owner = await prisma.user.findUnique({
      where: { id: targetOwnerId! },
      select: { phone: true },
    })

    return successResponse({ unlock, phone: owner?.phone })
  } catch (error) {
    console.error('Lead unlock error:', error)
    return errorResponse('সার্ভার সমস্যা', 500)
  }
}

async function getOwnerId(
  listingId?: string,
  vehicleId?: string,
  constructionId?: string
): Promise<string | null> {
  if (listingId) {
    const l = await prisma.listing.findUnique({ where: { id: listingId }, select: { ownerId: true } })
    return l?.ownerId || null
  }
  if (vehicleId) {
    const v = await prisma.vehicle.findUnique({ where: { id: vehicleId }, select: { ownerId: true } })
    return v?.ownerId || null
  }
  if (constructionId) {
    const c = await prisma.construction.findUnique({ where: { id: constructionId }, select: { ownerId: true } })
    return c?.ownerId || null
  }
  return null
}

async function verifyPayment(transactionId: string): Promise<boolean> {
  try {
    const storeId = process.env.SSLCOMMERZ_STORE_ID!
    const storePass = process.env.SSLCOMMERZ_STORE_PASSWORD!
    const isLive = process.env.SSLCOMMERZ_IS_LIVE === 'true'
    const baseUrl = isLive
      ? 'https://securepay.sslcommerz.com'
      : 'https://sandbox.sslcommerz.com'

    const res = await fetch(
      `${baseUrl}/validator/api/validationserverAPI.php?val_id=${transactionId}&store_id=${storeId}&store_passwd=${storePass}&format=json`
    )
    const data = await res.json()
    return data.status === 'VALID' || data.status === 'VALIDATED'
  } catch {
    // In development, skip payment verification
    if (process.env.NODE_ENV === 'development') return true
    return false
  }
}
