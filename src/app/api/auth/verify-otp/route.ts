import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { signToken } from '@/lib/auth'
import { successResponse, errorResponse } from '@/lib/api'

export async function POST(req: NextRequest) {
  try {
    const { phone, code, name } = await req.json()

    if (!phone || !code) {
      return errorResponse('ফোন নম্বর ও OTP দিন')
    }

    const normalizedPhone = phone.replace(/^\+?88/, '').replace(/^0/, '0')

    // Find valid OTP
    const otpRecord = await prisma.oTP.findFirst({
      where: {
        phone: normalizedPhone,
        code,
        used: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    })

    if (!otpRecord) {
      return errorResponse('OTP সঠিক নয় বা মেয়াদ শেষ হয়েছে', 401)
    }

    // Mark OTP as used
    await prisma.oTP.update({
      where: { id: otpRecord.id },
      data: { used: true },
    })

    // Find or create user
    let user = await prisma.user.findUnique({
      where: { phone: normalizedPhone },
    })

    const isNewUser = !user

    if (!user) {
      user = await prisma.user.create({
        data: {
          phone: normalizedPhone,
          name: name || null,
          isVerified: true,
        },
      })
    } else {
      // Mark as verified if not already
      if (!user.isVerified) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: { isVerified: true },
        })
      }
    }

    const token = signToken({
      userId: user.id,
      phone: user.phone,
      role: user.role,
    })

    const response = NextResponse.json({
      success: true,
      data: {
        isNewUser,
        user: {
          id: user.id,
          phone: user.phone,
          name: user.name,
          role: user.role,
        },
      },
    })

    // Set HTTP-only cookie
    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    })

    return response
  } catch (error) {
    console.error('Verify OTP error:', error)
    return errorResponse('সার্ভার সমস্যা', 500)
  }
}
