import { NextRequest } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import { successResponse, errorResponse, unauthorizedResponse } from '@/lib/api'

const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
const MAX_SIZE_MB = 5

export async function POST(req: NextRequest) {
  try {
    const authUser = await getAuthUser()
    if (!authUser) return unauthorizedResponse()

    const formData = await req.formData()
    const file = formData.get('file') as File | null

    if (!file) return errorResponse('ফাইল নির্বাচন করুন')

    // Validate type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return errorResponse('শুধু JPG, PNG, WEBP ফাইল আপলোড করা যাবে')
    }

    // Validate size
    const sizeMB = file.size / (1024 * 1024)
    if (sizeMB > MAX_SIZE_MB) {
      return errorResponse(`ফাইলের সাইজ ${MAX_SIZE_MB}MB এর বেশি হবে না`)
    }

    // Upload to Cloudinary
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64 = buffer.toString('base64')
    const dataUri = `data:${file.type};base64,${base64}`

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME!
    const apiKey = process.env.CLOUDINARY_API_KEY!
    const apiSecret = process.env.CLOUDINARY_API_SECRET!

    const timestamp = Math.round(Date.now() / 1000)
    const folder = 'propertybd'

    // Generate signature
    const signatureString = `folder=${folder}&timestamp=${timestamp}${apiSecret}`
    const signature = await generateSHA1(signatureString)

    const uploadData = new FormData()
    uploadData.append('file', dataUri)
    uploadData.append('api_key', apiKey)
    uploadData.append('timestamp', timestamp.toString())
    uploadData.append('signature', signature)
    uploadData.append('folder', folder)

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      { method: 'POST', body: uploadData }
    )

    if (!res.ok) {
      return errorResponse('আপলোড ব্যর্থ হয়েছে', 500)
    }

    const result = await res.json()

    return successResponse({
      url: result.secure_url,
      publicId: result.public_id,
    })
  } catch (error) {
    console.error('Upload error:', error)
    return errorResponse('সার্ভার সমস্যা', 500)
  }
}

async function generateSHA1(message: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(message)
  const hashBuffer = await crypto.subtle.digest('SHA-1', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}
