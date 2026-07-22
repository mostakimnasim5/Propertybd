import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const type = searchParams.get('type')
    const itemId = searchParams.get('itemId')
    const appUrl = process.env.NEXT_PUBLIC_APP_URL!

    if (status === 'success') {
      const body = await req.formData()
      const valId = body.get('val_id') as string
      const tranId = body.get('tran_id') as string

      // Redirect to frontend with payment details
      const redirectUrl = new URL('/payment/success', appUrl)
      redirectUrl.searchParams.set('val_id', valId || '')
      redirectUrl.searchParams.set('tran_id', tranId || '')
      redirectUrl.searchParams.set('type', type || '')
      if (itemId) redirectUrl.searchParams.set('itemId', itemId)

      return NextResponse.redirect(redirectUrl)
    }

    if (status === 'fail' || status === 'cancel') {
      return NextResponse.redirect(new URL('/payment/failed', appUrl))
    }

    // IPN (Instant Payment Notification) — silent background confirm
    if (status === 'ipn') {
      // Log for audit; handle async if needed
      return NextResponse.json({ received: true })
    }

    return NextResponse.redirect(new URL('/', appUrl))
  } catch (error) {
    console.error('Payment callback error:', error)
    return NextResponse.redirect(new URL('/payment/failed', process.env.NEXT_PUBLIC_APP_URL!))
  }
}

// SSLCommerz sends GET for some redirects
export async function GET(req: NextRequest) {
  return POST(req)
}
