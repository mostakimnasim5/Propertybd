// BulkSMSBD API integration

export async function sendOTPSMS(phone: string, message: string): Promise<boolean> {
  const formattedPhone = phone.startsWith('0') ? '88' + phone : phone

  try {
    const params = new URLSearchParams({
      api_key: process.env.SMS_API_KEY!,
      senderid: process.env.SMS_SENDER_ID || 'PropertyBD',
      number: formattedPhone,
      message,
      type: 'text',
    })

    const res = await fetch(`https://bulksmsbd.net/api/smsapi?${params}`)
    const data = await res.json()
    return data.response_code === 202
  } catch (error) {
    console.error('SMS send error:', error)
    if (process.env.NODE_ENV === 'development') {
      console.log(`[DEV SMS] → ${phone}: ${message}`)
      return true
    }
    return false
  }
}

export async function sendOTPCode(phone: string, otp: string): Promise<boolean> {
  const message = `আপনার PropertyBD যাচাই কোড: ${otp}। এটি ৫ মিনিটের জন্য বৈধ। কাউকে জানাবেন না।`
  return sendOTPSMS(phone, message)
}

export async function sendApprovalNotification(phone: string, title: string, approved: boolean): Promise<boolean> {
  const message = approved
    ? `✅ PropertyBD: আপনার বিজ্ঞাপন "${title.slice(0, 40)}" অনুমোদিত ও প্রকাশিত হয়েছে।`
    : `❌ PropertyBD: আপনার বিজ্ঞাপন "${title.slice(0, 40)}" অনুমোদিত হয়নি। যোগাযোগ: 01700-000000`
  return sendOTPSMS(phone, message)
}

// Generate WhatsApp link
export function getWhatsAppLink(phone: string, message: string): string {
  const formatted = phone.startsWith('0') ? '88' + phone : phone
  return `https://wa.me/${formatted}?text=${encodeURIComponent(message)}`
}
