import { NextResponse } from 'next/server'

export function successResponse(data: unknown, status = 200) {
  return NextResponse.json({ success: true, data }, { status })
}

export function errorResponse(message: string, status = 400) {
  return NextResponse.json({ success: false, error: message }, { status })
}

export function unauthorizedResponse() {
  return errorResponse('Unauthorized', 401)
}

export function notFoundResponse(resource = 'Resource') {
  return errorResponse(`${resource} not found`, 404)
}

// Rate limiting store (use Redis in production)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now()
  const record = rateLimitMap.get(key)

  if (!record || now > record.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + windowMs })
    return true // allowed
  }

  if (record.count >= limit) return false // blocked

  record.count++
  return true // allowed
}
