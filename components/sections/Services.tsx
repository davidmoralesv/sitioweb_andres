import { icons } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { MotionSection } from '@/components/ui/MotionSection'

interface Service {
  _id: string
  name: string
  description: string
  icon: string
}

interface ServicesProps {
  services: Service[]
}

function DynamicIcon({ name }: { name: string }) {
  const Icon = icons[name as keyof typeof icons]
  if (!Icon) return null
  return <Icon size={28} className="text-gold mb-4" />
}

export function Services({ services }: ServicesProps) {
  return (
    <section id="servicios" className="py-24">
      <div className="max-w-6xl mx-auto px-6">
        <MotionSection>
          <p className="text-gold text-sm font-sans uppercase tracking-widest mb-4">Servicios</p>
          <h2 className="font-heading text-4xl md:text-5xl text-text-primary mb-12">
            Cómo puedo ayudarte
          </h2>
        </MotionSection>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, i) => (
            <MotionSection key={service._id} delay={i * 0.1}>
              <Card className="h-full">
                <DynamicIcon name={service.icon} />
                <h3 className="font-heading text-xl text-text-primary mb-3">{service.name}</h3>
                <p className="text-text-muted text-sm leading-relaxed">{service.description}</p>
              </Card>
            </MotionSection>
          ))}
        </div>
      </div>
    </section>
  )
}
