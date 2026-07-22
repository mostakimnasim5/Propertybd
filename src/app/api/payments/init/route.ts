import { NextRequest } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { successResponse, errorResponse, unauthorizedResponse } from '@/lib/api'

export async function POST(req: NextRequest) {
  try {
    const authUser = await getAuthUser()
    if (!authUser) return unauthorizedResponse()

    const { type, itemId, amount } = await req.json()
    // type: 'lead' | 'featured' | 'subscription'

    if (!type || !amount) return errorResponse('Payment তথ্য সঠিক নয়')

    const user = await prisma.user.findUnique({
      where: { id: authUser.userId },
      select: { name: true, phone: true, email: true },
    })

    if (!user) return unauthorizedResponse()

    const isLive = process.env.SSLCOMMERZ_IS_LIVE === 'true'
    const baseUrl = isLive
      ? 'https://securepay.sslcommerz.com/gwprocess/v4/api.php'
      : 'https://sandbox.sslcommerz.com/gwprocess/v4/api.php'

    const appUrl = process.env.NEXT_PUBLIC_APP_URL!
    const transactionId = `PBD-${Date.now()}-${authUser.userId.slice(0, 6)}`

    const params = new URLSearchParams({
      store_id: process.env.SSLCOMMERZ_STORE_ID!,
      store_passwd: process.env.SSLCOMMERZ_STORE_PASSWORD!,
      total_amount: amount.toString(),
      currency: 'BDT',
      tran_id: transactionId,
      success_url: `${appUrl}/api/payments/callback?status=success&type=${type}&itemId=${itemId || ''}`,
      fail_url: `${appUrl}/api/payments/callback?status=fail`,
      cancel_url: `${appUrl}/api/payments/callback?status=cancel`,
      ipn_url: `${appUrl}/api/payments/callback?status=ipn`,
      cus_name: user.name || 'PropertyBD User',
      cus_email: user.email || 'user@propertybd.com',
      cus_phone: user.phone,
      cus_add1: 'Bangladesh',
      cus_city: 'Dhaka',
      cus_country: 'Bangladesh',
      shipping_method: 'NO',
      product_name: type === 'lead' ? 'Lead Unlock' : type === 'featured' ? 'Featured Listing' : 'Subscription',
      product_category: 'Service',
      product_profile: 'non-physical-goods',
    })

    const res = await fetch(baseUrl, {
      method: 'POST',
      body: params,
    })

    const data = await res.json()

    if (data.status !== 'SUCCESS') {
      return errorResponse('Payment gateway সংযোগ ব্যর্থ হয়েছে', 500)
    }

    return successResponse({
      gatewayUrl: data.GatewayPageURL,
      transactionId,
    })
  } catch (error) {
    console.error('Payment init error:', error)
    return errorResponse('সার্ভার সমস্যা', 500)
  }
}
