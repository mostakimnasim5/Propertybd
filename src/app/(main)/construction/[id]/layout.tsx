import { Metadata } from 'next'
import { prisma } from '@/lib/db'

interface Props {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params

  try {
    const company = await prisma.construction.findUnique({
      where: { id },
      include: { district: { select: { nameBn: true } } },
    })

    if (!company) return { title: 'কোম্পানি পাওয়া যায়নি | PropertyBD' }

    const title = `${company.companyName} | নির্মাণ কোম্পানি ${company.district?.nameBn} | PropertyBD`
    const description = `${company.companyName} — ${company.district?.nameBn}-তে ${company.experience} বছরের অভিজ্ঞাসম্পন্ন নির্মাণ কোম্পানি। ${company.description?.slice(0, 100)}...`

    return {
      title,
      description,
      openGraph: { title, description, type: 'website', locale: 'bn_BD' },
      keywords: `নির্মাণ, ${company.companyName}, ${company.district?.nameBn}, builder bangladesh, construction company`,
    }
  } catch {
    return { title: 'PropertyBD' }
  }
}

export default function ConstructionDetailLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
