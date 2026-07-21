import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { generateOTP, getOTPExpiry } from '@/lib/auth'
import { sendOTPSMS } from '@/lib/sms'
import { successResponse, errorResponse, rateLimit } from '@/lib/api'

export async function POST(req: NextRequest) {
  try {
    const { phone } = await req.json()

    // Validate BD phone number
    const phoneRegex = /^(?:\+?88)?01[3-9]\d{8}$/
    if (!phone || !phoneRegex.test(phone)) {
      return errorResponse('সঠিক মোবাইল নম্বর দিন')
    }

    const normalizedPhone = phone.replace(/^\+?88/, '').replace(/^0/, '0')

    // Rate limit: max 5 OTPs per phone per hour
    const rateLimitKey = `otp:${normalizedPhone}`
    if (!rateLimit(rateLimitKey, 5, 60 * 60 * 1000)) {
      return errorResponse('অনেকবার চেষ্টা করেছেন। ১ ঘণ্টা পর আবার চেষ্টা করুন।', 429)
    }

    // Invalidate old OTPs
    await prisma.oTP.updateMany({
      where: { phone: normalizedPhone, used: false },
      data: { used: true },
    })

    const code = generateOTP()
    const expiresAt = getOTPExpiry()

    await prisma.oTP.create({
      data: { phone: normalizedPhone, code, expiresAt },
    })

    const smsSent = await sendOTPSMS(normalizedPhone, code)
    if (!smsSent) {
      return errorResponse('SMS পাঠাতে সমস্যা হয়েছে। আবার চেষ্টা করুন।', 500)
    }

    return successResponse({ message: 'OTP পাঠানো হয়েছে' })
  } catch (error) {
    console.error('Send OTP error:', error)
    return errorResponse('সার্ভার সমস্যা', 500)
  }
}
