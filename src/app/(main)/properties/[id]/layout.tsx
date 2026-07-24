import { Metadata } from 'next'
import { prisma } from '@/lib/db'

interface Props {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params

  try {
    const listing = await prisma.listing.findUnique({
      where: { id },
      include: {
        district: { select: { nameBn: true } },
        images: { where: { isPrimary: true }, take: 1 },
      },
    })

    if (!listing) return { title: 'বিজ্ঞাপন পাওয়া যায়নি | PropertyBD' }

    const typeMap: Record<string, string> = { FLAT: 'ফ্ল্যাট', HOUSE: 'বাড়ি', LAND: 'জমি', SHOP: 'দোকান', OFFICE: 'অফিস', WAREHOUSE: 'গোডাউন', BUILDING: 'ভবন' }
    const purposeMap: Record<string, string> = { SALE: 'বিক্রয়', RENT: 'ভাড়া' }

    const title = `${listing.title} | ${typeMap[listing.type]} ${purposeMap[listing.purpose]} | PropertyBD`
    const description = `${listing.district?.nameBn}-তে ${typeMap[listing.type]} ${purposeMap[listing.purpose]} — ৳${Number(listing.price).toLocaleString('bn-BD')}। ${listing.description?.slice(0, 120)}...`
    const image = listing.images?.[0]?.url

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        type: 'website',
        locale: 'bn_BD',
        ...(image && { images: [{ url: image, width: 1200, height: 630, alt: listing.title }] }),
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        ...(image && { images: [image] }),
      },
      keywords: `${typeMap[listing.type]}, ${listing.district?.nameBn}, ${purposeMap[listing.purpose]}, বাড়ি ভাড়া, property bd`,
    }
  } catch {
    return { title: 'PropertyBD' }
  }
}

export default function PropertyDetailLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
