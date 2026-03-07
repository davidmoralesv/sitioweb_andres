import Image from 'next/image'
import { Button } from '@/components/ui/Button'
import { urlFor } from '@/sanity/imageUrl'

interface HeroProps {
  name: string
  title: string
  shortBio: string
  photo: any
}

export function Hero({ name, title, shortBio, photo }: HeroProps) {
  const photoUrl = photo ? urlFor(photo).width(600).height(600).url() : null

  return (
    <section
      id="inicio"
      className="min-h-screen flex items-center pt-16"
    >
      <div className="max-w-6xl mx-auto px-6 w-full">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Text */}
          <div className="order-2 md:order-1">
            <p className="text-gold text-sm font-sans uppercase tracking-widest mb-4">
              Experto en Marketing
            </p>
            <h1 className="font-heading text-5xl md:text-6xl lg:text-7xl text-text-primary leading-tight mb-6">
              {name}
            </h1>
            <p className="text-xl text-gold font-heading italic mb-6">{title}</p>
            <p className="text-text-muted leading-relaxed mb-8 max-w-md">{shortBio}</p>
            <div className="flex flex-wrap gap-4">
              <a href="#servicios">
                <Button size="lg">Ver servicios</Button>
              </a>
              <a href="#contacto">
                <Button size="lg" variant="outline">Contacto</Button>
              </a>
            </div>
          </div>

          {/* Photo */}
          {photoUrl && (
            <div className="order-1 md:order-2 flex justify-center">
              <div className="relative w-72 h-72 md:w-96 md:h-96">
                <div className="absolute inset-0 rounded-full border-2 border-gold/30 scale-110" />
                <div className="absolute inset-0 rounded-full border border-gold/10 scale-125" />
                <Image
                  src={photoUrl}
                  alt={name}
                  fill
                  className="object-cover rounded-full"
                  priority
                  sizes="(max-width: 768px) 288px, 384px"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
