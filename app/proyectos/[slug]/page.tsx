import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, ExternalLink } from 'lucide-react'
import { PortableText } from '@portabletext/react'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { getProjectBySlug, getAllProjects, getSiteConfig } from '@/lib/queries'
import { urlFor } from '@/sanity/imageUrl'
import { formatDate } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export async function generateStaticParams() {
  const projects = await getAllProjects()
  return projects.map((p: any) => ({ slug: p.slug.current }))
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const project = await getProjectBySlug(params.slug)
  if (!project) return {}
  return {
    title: project.title,
    description: project.description,
  }
}

export default async function ProjectPage({ params }: { params: { slug: string } }) {
  const [project, config] = await Promise.all([getProjectBySlug(params.slug), getSiteConfig()])
  if (!project) notFound()

  const imageUrl = project.image ? urlFor(project.image).width(1200).height(600).url() : null

  return (
    <>
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-6">
          <Link href="/proyectos" className="inline-flex items-center gap-2 text-text-muted hover:text-gold transition-colors text-sm mb-8">
            <ArrowLeft size={16} /> Volver a proyectos
          </Link>

          {imageUrl && (
            <div className="relative w-full h-64 md:h-96 mb-8 rounded-sm overflow-hidden">
              <Image src={imageUrl} alt={project.title} fill className="object-cover" priority sizes="(max-width: 768px) 100vw, 896px" />
            </div>
          )}

          <p className="text-gold text-sm uppercase tracking-widest mb-2">{project.client}</p>
          <h1 className="font-heading text-4xl md:text-5xl text-text-primary mb-4">{project.title}</h1>

          <div className="flex flex-wrap items-center gap-4 mb-8">
            {project.publishedAt && (
              <span className="text-text-muted text-sm">{formatDate(project.publishedAt)}</span>
            )}
            <span className="flex items-center gap-2 text-gold text-sm">
              <span className="w-2 h-2 rounded-full bg-gold inline-block" />
              {project.result}
            </span>
            {project.url && (
              <a href={project.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-gold hover:text-gold-hover text-sm transition-colors">
                Ver proyecto <ExternalLink size={14} />
              </a>
            )}
          </div>

          <div className="prose prose-invert prose-lg max-w-none [&>p]:text-text-muted [&>p]:leading-relaxed [&>h2]:font-heading [&>h2]:text-text-primary [&>h3]:font-heading [&>h3]:text-text-primary">
            {project.content && <PortableText value={project.content} />}
          </div>
        </div>
      </main>
      <Footer name={config.name} socialLinks={config.socialLinks ?? []} />
    </>
  )
}
