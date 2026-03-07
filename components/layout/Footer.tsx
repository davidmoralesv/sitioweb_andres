import { Linkedin, Twitter, Instagram, Youtube } from 'lucide-react'

const iconMap: Record<string, React.ElementType> = {
  linkedin: Linkedin,
  twitter: Twitter,
  instagram: Instagram,
  youtube: Youtube,
}

interface FooterProps {
  name: string
  socialLinks: { platform: string; url: string }[]
}

export function Footer({ name, socialLinks }: FooterProps) {
  return (
    <footer className="border-t border-[#1F1F1F] bg-surface">
      <div className="max-w-6xl mx-auto px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-text-muted text-sm">
          © {new Date().getFullYear()} {name}. Todos los derechos reservados.
        </p>
        <div className="flex items-center gap-4">
          {socialLinks.map((link) => {
            const Icon = iconMap[link.platform]
            if (!Icon) return null
            return (
              <a
                key={link.platform}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-text-muted hover:text-gold transition-colors duration-200"
                aria-label={link.platform}
              >
                <Icon size={18} />
              </a>
            )
          })}
        </div>
      </div>
    </footer>
  )
}
