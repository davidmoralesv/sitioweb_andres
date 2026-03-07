import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { MotionSection } from '@/components/ui/MotionSection'
import { urlFor } from '@/sanity/imageUrl'

interface Project {
  _id: string
  title: string
  slug: { current: string }
  description: string
  image: any
  client: string
  result: string
}

interface ProjectsProps {
  projects: Project[]
}

export function Projects({ projects }: ProjectsProps) {
  return (
    <section id="proyectos" className="py-24 bg-surface">
      <div className="max-w-6xl mx-auto px-6">
        <MotionSection className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <p className="text-gold text-sm font-sans uppercase tracking-widest mb-4">Casos de éxito</p>
            <h2 className="font-heading text-4xl md:text-5xl text-text-primary">Resultados reales</h2>
          </div>
          <Link
            href="/proyectos"
            className="flex items-center gap-2 text-gold hover:text-gold-hover text-sm transition-colors"
          >
            Ver todos <ArrowRight size={16} />
          </Link>
        </MotionSection>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project, i) => {
            const imageUrl = project.image ? urlFor(project.image).width(600).height(400).url() : null
            return (
              <MotionSection key={project._id} delay={i * 0.1}>
                <Link href={`/proyectos/${project.slug.current}`}>
                  <Card className="overflow-hidden p-0 group">
                    {imageUrl && (
                      <div className="relative h-48 w-full overflow-hidden">
                        <Image
                          src={imageUrl}
                          alt={project.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                          sizes="(max-width: 768px) 100vw, 33vw"
                        />
                      </div>
                    )}
                    <div className="p-6">
                      <p className="text-gold text-xs uppercase tracking-widest mb-2">{project.client}</p>
                      <h3 className="font-heading text-xl text-text-primary mb-2">{project.title}</h3>
                      <p className="text-text-muted text-sm mb-4 line-clamp-2">{project.description}</p>
                      <div className="flex items-center gap-2 text-gold text-xs font-sans">
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
    </section>
  )
}
