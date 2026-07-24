import { Metadata } from 'next'
import { prisma } from '@/lib/db'

interface Props {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params

  try {
    const vehicle = await prisma.vehicle.findUnique({
      where: { id },
      include: {
        district: { select: { nameBn: true } },
        images: { where: { isPrimary: true }, take: 1 },
      },
    })

    if (!vehicle) return { title: 'গাড়ি পাওয়া যায়নি | PropertyBD' }

    const purposeMap: Record<string, string> = { SALE: 'বিক্রয়', RENT: 'ভাড়া' }
    const typeMap: Record<string, string> = { CAR: 'গাড়ি', BIKE: 'বাইক' }

    const title = `${vehicle.brand} ${vehicle.model} ${vehicle.year} | ${typeMap[vehicle.type]} ${purposeMap[vehicle.purpose]} | PropertyBD`
    const description = `${vehicle.district?.nameBn}-তে ${vehicle.brand} ${vehicle.model} ${vehicle.year} ${purposeMap[vehicle.purpose]} — ৳${Number(vehicle.price).toLocaleString('bn-BD')}। ${vehicle.description?.slice(0, 100)}...`
    const image = vehicle.images?.[0]?.url

    return {
      title,
      description,
      openGraph: {
        title, description, type: 'website', locale: 'bn_BD',
        ...(image && { images: [{ url: image, width: 1200, height: 630 }] }),
      },
      keywords: `${vehicle.brand}, ${vehicle.model}, ${typeMap[vehicle.type]} ${purposeMap[vehicle.purpose]}, ${vehicle.district?.nameBn}, car bikroy bd`,
    }
  } catch {
    return { title: 'PropertyBD' }
  }
}

export default function VehicleDetailLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
