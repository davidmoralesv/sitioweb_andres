import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { Card } from '@/components/ui/Card'
import { MotionSection } from '@/components/ui/MotionSection'
import { getAllProjects, getSiteConfig } from '@/lib/queries'
import { urlFor } from '@/sanity/imageUrl'

export const metadata: Metadata = {
  title: 'Casos de éxito',
  description: 'Portfolio completo de proyectos y resultados obtenidos.',
}

export const dynamic = 'force-dynamic'

export default async function ProyectosPage() {
  const [projects, config] = await Promise.all([getAllProjects(), getSiteConfig()])

  return (
    <>
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="max-w-6xl mx-auto px-6">
          <MotionSection>
            <p className="text-gold text-sm font-sans uppercase tracking-widest mb-4">Portfolio</p>
            <h1 className="font-heading text-5xl text-text-primary mb-4">Casos de éxito</h1>
            <p className="text-text-muted mb-12">Resultados reales para clientes reales.</p>
          </MotionSection>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project: any, i: number) => {
              const imageUrl = project.image ? urlFor(project.image).width(600).height(400).url() : null
              return (
                <MotionSection key={project._id} delay={i * 0.05}>
                  <Link href={`/proyectos/${project.slug.current}`}>
                    <Card className="overflow-hidden p-0 group">
                      {imageUrl && (
                        <div className="relative h-48 w-full overflow-hidden">
                          <Image src={imageUrl} alt={project.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="(max-width: 768px) 100vw, 33vw" />
                        </div>
                      )}
                      <div className="p-6">
                        <p className="text-gold text-xs uppercase tracking-widest mb-2">{project.client}</p>
                        <h2 className="font-heading text-xl text-text-primary mb-2">{project.title}</h2>
                        <p className="text-text-muted text-sm mb-4 line-clamp-2">{project.description}</p>
                        <div className="flex items-center gap-2 text-gold text-xs">
                          <span className="w-2 h-2 rounded-full bg-gold inline-block" />
                          {project.result}
                        </div>
                      </div>
                    </Card>
                  </Link>
                </MotionSection>
              )
            })}
          </div>
        </div>
      </main>
      <Footer name={config.name} socialLinks={config.socialLinks ?? []} />
    </>
  )
}
