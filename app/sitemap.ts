import { MetadataRoute } from 'next'
import { getAllProjects } from '@/lib/queries'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://example.com'

  if (!process.env.NEXT_PUBLIC_SANITY_PROJECT_ID) {
    return [
      { url: baseUrl, lastModified: new Date() },
      { url: `${baseUrl}/proyectos`, lastModified: new Date() },
    ]
  }

  const projects = await getAllProjects()

  const projectUrls = projects.map((p: any) => ({
    url: `${baseUrl}/proyectos/${p.slug.current}`,
    lastModified: p.publishedAt ? new Date(p.publishedAt) : new Date(),
  }))

  return [
    { url: baseUrl, lastModified: new Date() },
    { url: `${baseUrl}/proyectos`, lastModified: new Date() },
    ...projectUrls,
  ]
}
