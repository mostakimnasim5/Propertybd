// BulkSMSBD API integration

export async function sendOTPSMS(phone: string, otp: string): Promise<boolean> {
  const message = `আপনার PropertyBD যাচাই কোড: ${otp}। এটি ৫ মিনিটের জন্য বৈধ। কাউকে জানাবেন না।`

  // Format BD phone number
  const formattedPhone = phone.startsWith('0') ? '88' + phone : phone

  try {
    const params = new URLSearchParams({
      api_key: process.env.SMS_API_KEY!,
      senderid: process.env.SMS_SENDER_ID!,
      number: formattedPhone,
      message,
      type: 'text',
    })

    const res = await fetch(`https://bulksmsbd.net/api/smsapi?${params}`)
    const data = await res.json()

    // BulkSMSBD returns 202 on success
    return data.response_code === 202
  } catch (error) {
    console.error('SMS send error:', error)
    // In development, log OTP instead of failing
    if (process.env.NODE_ENV === 'development') {
      console.log(`[DEV] OTP for ${phone}: ${otp}`)
      return true
    }
    return false
  }
}
