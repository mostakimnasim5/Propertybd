import { Metadata } from 'next'
import { prisma } from '@/lib/db'

interface Props {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params

  try {
    const project = await prisma.developerProject.findUnique({
      where: { id },
      include: {
        district: { select: { nameBn: true } },
        images: { where: { isPrimary: true }, take: 1 },
        construction: { select: { companyName: true } },
      },
    })

    if (!project) return { title: 'প্রজেক্ট পাওয়া যায়নি | PropertyBD' }

    const statusMap: Record<string, string> = {
      UPCOMING: 'শীঘ্রই আসছে', ONGOING: 'নির্মাণাধীন',
      READY: 'রেডি টু মুভ', COMPLETED: 'সম্পন্ন',
    }
    const typeMap: Record<string, string> = {
      RESIDENTIAL: 'আবাসিক', COMMERCIAL: 'বাণিজ্যিক', MIXED: 'মিশ্র',
    }

    const title = `${project.title} | ${project.construction?.companyName || 'Developer'} | PropertyBD`
    const description = `${project.district?.nameBn}-তে ${typeMap[project.projectType]} প্রজেক্ট — ${project.availableUnits}টি unit পাওয়া যাচ্ছে। মূল্য ৳${Number(project.minPrice).toLocaleString()} থেকে। ${statusMap[project.status]}।`
    const image = project.images?.[0]?.url

    return {
      title,
      description,
      keywords: `${project.title}, ${project.construction?.companyName}, ${project.district?.nameBn}, নতুন ফ্ল্যাট, developer project`,
      openGraph: {
        title, description, type: 'website', locale: 'bn_BD',
        ...(image && { images: [{ url: image, width: 1200, height: 630 }] }),
      },
      twitter: {
        card: 'summary_large_image', title, description,
        ...(image && { images: [image] }),
      },
    }
  } catch {
    return { title: 'PropertyBD' }
  }
}

export default function ProjectDetailLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
