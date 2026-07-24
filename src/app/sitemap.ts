import { MetadataRoute } from 'next'
import { prisma } from '@/lib/db'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://propertybd.com'

  const staticPages: MetadataRoute.Sitemap = [
    { url: appUrl, changeFrequency: 'daily', priority: 1 },
    { url: `${appUrl}/properties`, changeFrequency: 'hourly', priority: 0.9 },
    { url: `${appUrl}/vehicles`, changeFrequency: 'hourly', priority: 0.9 },
    { url: `${appUrl}/construction`, changeFrequency: 'daily', priority: 0.8 },
    { url: `${appUrl}/about`, changeFrequency: 'monthly', priority: 0.4 },
    { url: `${appUrl}/contact`, changeFrequency: 'monthly', priority: 0.4 },
  ]

  try {
    const [listings, vehicles, companies] = await Promise.all([
      prisma.listing.findMany({
        where: { status: 'ACTIVE' },
        select: { id: true, updatedAt: true },
        take: 5000,
        orderBy: { updatedAt: 'desc' },
      }),
      prisma.vehicle.findMany({
        where: { status: 'ACTIVE' },
        select: { id: true, updatedAt: true },
        take: 2000,
        orderBy: { updatedAt: 'desc' },
      }),
      prisma.construction.findMany({
        where: { status: 'ACTIVE' },
        select: { id: true, updatedAt: true },
        take: 500,
        orderBy: { updatedAt: 'desc' },
      }),
    ])

    const listingPages: MetadataRoute.Sitemap = listings.map(l => ({
      url: `${appUrl}/properties/${l.id}`,
      lastModified: l.updatedAt,
      changeFrequency: 'weekly',
      priority: 0.7,
    }))

    const vehiclePages: MetadataRoute.Sitemap = vehicles.map(v => ({
      url: `${appUrl}/vehicles/${v.id}`,
      lastModified: v.updatedAt,
      changeFrequency: 'weekly',
      priority: 0.7,
    }))

    const constructionPages: MetadataRoute.Sitemap = companies.map(c => ({
      url: `${appUrl}/construction/${c.id}`,
      lastModified: c.updatedAt,
      changeFrequency: 'monthly',
      priority: 0.6,
    }))

    return [...staticPages, ...listingPages, ...vehiclePages, ...constructionPages]
  } catch {
    return staticPages
  }
}
