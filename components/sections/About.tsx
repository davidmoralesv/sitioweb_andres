import { PortableText } from '@portabletext/react'
import { MotionSection } from '@/components/ui/MotionSection'

interface Stat {
  value: string
  label: string
}

interface AboutProps {
  longBio: any[]
  stats: Stat[]
}

export function About({ longBio, stats }: AboutProps) {
  return (
    <section id="sobre-mi" className="py-24 bg-surface">
      <div className="max-w-6xl mx-auto px-6">
        <MotionSection>
          <p className="text-gold text-sm font-sans uppercase tracking-widest mb-4">Sobre mí</p>
          <h2 className="font-heading text-4xl md:text-5xl text-text-primary mb-12">
            Mi trayectoria
          </h2>
        </MotionSection>

        <div className="grid md:grid-cols-2 gap-16 items-start">
          <MotionSection delay={0.1}>
            <div className="prose prose-invert prose-lg max-w-none [&>p]:text-text-muted [&>p]:leading-relaxed [&>p]:mb-4">
              <PortableText value={longBio} />
            </div>
          </MotionSection>

          <MotionSection delay={0.2}>
            <div className="grid grid-cols-2 gap-6">
              {stats.map((stat, i) => (
                <div
                  key={i}
                  className="border border-[#1F1F1F] rounded-sm p-6 text-center hover:border-gold/40 transition-colors"
                >
                  <p className="font-heading text-4xl text-gold mb-2">{stat.value}</p>
                  <p className="text-text-muted text-sm">{stat.label}</p>
                </div>
              ))}
            </div>
          </MotionSection>
        </div>
      </div>
    </section>
  )
}
