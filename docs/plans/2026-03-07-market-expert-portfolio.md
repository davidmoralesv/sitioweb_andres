# Market Expert Portfolio — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a modern, dark-themed, fully responsive personal portfolio for a marketing/business strategy expert, with Sanity CMS for dynamic content and easy Vercel deployment.

**Architecture:** Next.js 14 App Router with static generation on the home page and ISR (60s) on project routes. Sanity v3 manages Services and Case Studies via Portable Text; a Next.js API Route sends contact emails via Resend.

**Tech Stack:** Next.js 14, TypeScript, Tailwind CSS v3, Sanity v3, Framer Motion, React Hook Form, Zod, Resend, Lucide React, Sonner, next-themes (not needed — always dark), @vercel/og.

---

## Environment Setup

Before starting, the following accounts and keys are needed:

- [Sanity](https://sanity.io) — create a free project, note `projectId` and `dataset` (default: `production`)
- [Resend](https://resend.com) — create a free account, generate an API key
- Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_SANITY_PROJECT_ID=your_project_id
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_TOKEN=your_read_token
RESEND_API_KEY=your_resend_key
CONTACT_EMAIL=expert@email.com
```

---

## Task 1: Scaffold Next.js Project

**Files:**
- Create: `package.json`, `tsconfig.json`, `tailwind.config.ts`, `postcss.config.js`, `next.config.ts`, `.env.local`, `.gitignore`

**Step 1: Create the Next.js app**

```bash
cd /c/Repos/antigravitycloude
npx create-next-app@latest . \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir=false \
  --import-alias="@/*" \
  --no-git
```

Answer prompts:
- Use Turbopack? → No (use default)

**Step 2: Install all dependencies**

```bash
npm install \
  @sanity/client \
  @sanity/image-url \
  next-sanity \
  sanity \
  @portabletext/react \
  framer-motion \
  react-hook-form \
  @hookform/resolvers \
  zod \
  resend \
  lucide-react \
  sonner \
  clsx \
  tailwind-merge \
  @vercel/og \
  next-sitemap
```

**Step 3: Install dev dependencies**

```bash
npm install -D \
  vitest \
  @vitejs/plugin-react \
  @testing-library/react \
  @testing-library/jest-dom \
  @testing-library/user-event \
  jsdom \
  @types/node
```

**Step 4: Configure Vitest**

Create `vitest.config.ts`:

```ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    globals: true,
  },
  resolve: {
    alias: { '@': path.resolve(__dirname, '.') },
  },
})
```

Create `vitest.setup.ts`:

```ts
import '@testing-library/jest-dom'
```

Add to `package.json` scripts:

```json
"test": "vitest",
"test:run": "vitest run"
```

**Step 5: Configure Tailwind with custom theme**

Replace contents of `tailwind.config.ts`:

```ts
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './sanity/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#0A0A0A',
        surface: '#111111',
        border: '#1F1F1F',
        'text-primary': '#F5F5F5',
        'text-muted': '#888888',
        gold: '#C9A84C',
        'gold-hover': '#E4C56A',
      },
      fontFamily: {
        heading: ['var(--font-playfair)', 'Georgia', 'serif'],
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
export default config
```

**Step 6: Update next.config.ts**

```ts
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'cdn.sanity.io' },
    ],
  },
}

export default nextConfig
```

**Step 7: Commit**

```bash
git add -A
git commit -m "chore: scaffold Next.js 14 project with Tailwind and Vitest"
```

---

## Task 2: Utility Functions (TDD)

**Files:**
- Create: `lib/utils.ts`
- Create: `lib/utils.test.ts`

**Step 1: Write the failing test**

Create `lib/utils.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { cn, formatDate } from './utils'

describe('cn', () => {
  it('merges class names', () => {
    expect(cn('px-4', 'py-2')).toBe('px-4 py-2')
  })

  it('handles conditional classes', () => {
    expect(cn('base', false && 'hidden', 'active')).toBe('base active')
  })

  it('resolves tailwind conflicts — last wins', () => {
    expect(cn('px-4', 'px-6')).toBe('px-6')
  })
})

describe('formatDate', () => {
  it('formats a date string to Spanish locale', () => {
    // Fixed date to avoid timezone issues
    const result = formatDate('2024-06-15')
    expect(result).toMatch(/junio/i)
    expect(result).toMatch(/2024/)
  })
})
```

**Step 2: Run test to verify it fails**

```bash
npm run test:run lib/utils.test.ts
```

Expected: FAIL — "Cannot find module './utils'"

**Step 3: Write minimal implementation**

Create `lib/utils.ts`:

```ts
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}
```

**Step 4: Run tests to verify they pass**

```bash
npm run test:run lib/utils.test.ts
```

Expected: PASS (3 tests)

**Step 5: Commit**

```bash
git add lib/utils.ts lib/utils.test.ts
git commit -m "feat: add cn and formatDate utilities with tests"
```

---

## Task 3: Contact Form Validation Schema (TDD)

**Files:**
- Create: `lib/validations.ts`
- Create: `lib/validations.test.ts`

**Step 1: Write the failing test**

Create `lib/validations.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { contactSchema } from './validations'

describe('contactSchema', () => {
  const valid = {
    name: 'Juan Pérez',
    email: 'juan@example.com',
    subject: 'Consulta de servicio',
    message: 'Hola, me interesa conocer más sobre sus servicios.',
  }

  it('accepts valid data', () => {
    const result = contactSchema.safeParse(valid)
    expect(result.success).toBe(true)
  })

  it('rejects invalid email', () => {
    const result = contactSchema.safeParse({ ...valid, email: 'not-an-email' })
    expect(result.success).toBe(false)
  })

  it('rejects empty name', () => {
    const result = contactSchema.safeParse({ ...valid, name: '' })
    expect(result.success).toBe(false)
  })

  it('rejects message under 10 chars', () => {
    const result = contactSchema.safeParse({ ...valid, message: 'Hola' })
    expect(result.success).toBe(false)
  })
})
```

**Step 2: Run test to verify it fails**

```bash
npm run test:run lib/validations.test.ts
```

Expected: FAIL — "Cannot find module './validations'"

**Step 3: Write minimal implementation**

Create `lib/validations.ts`:

```ts
import { z } from 'zod'

export const contactSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  email: z.string().email('Email inválido'),
  subject: z.string().min(1, 'El asunto es requerido'),
  message: z.string().min(10, 'El mensaje debe tener al menos 10 caracteres'),
})

export type ContactFormData = z.infer<typeof contactSchema>
```

**Step 4: Run tests to verify they pass**

```bash
npm run test:run lib/validations.test.ts
```

Expected: PASS (4 tests)

**Step 5: Commit**

```bash
git add lib/validations.ts lib/validations.test.ts
git commit -m "feat: add contact form Zod validation schema with tests"
```

---

## Task 4: Sanity Configuration and Schemas

**Files:**
- Create: `sanity/client.ts`
- Create: `sanity/imageUrl.ts`
- Create: `sanity/schemas/siteConfig.ts`
- Create: `sanity/schemas/service.ts`
- Create: `sanity/schemas/project.ts`
- Create: `sanity/schemas/index.ts`
- Create: `sanity.config.ts`

**Step 1: Create Sanity client**

Create `sanity/client.ts`:

```ts
import { createClient } from 'next-sanity'

export const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: '2024-01-01',
  useCdn: process.env.NODE_ENV === 'production',
  token: process.env.SANITY_API_TOKEN,
})
```

**Step 2: Create image URL builder**

Create `sanity/imageUrl.ts`:

```ts
import imageUrlBuilder from '@sanity/image-url'
import { client } from './client'
import type { SanityImageSource } from '@sanity/image-url/lib/types/types'

const builder = imageUrlBuilder(client)

export function urlFor(source: SanityImageSource) {
  return builder.image(source)
}
```

**Step 3: Create SiteConfig schema**

Create `sanity/schemas/siteConfig.ts`:

```ts
import { defineField, defineType } from 'sanity'

export const siteConfig = defineType({
  name: 'siteConfig',
  title: 'Configuración del sitio',
  type: 'document',
  fields: [
    defineField({ name: 'name', title: 'Nombre completo', type: 'string', validation: (R) => R.required() }),
    defineField({ name: 'title', title: 'Título profesional', type: 'string', validation: (R) => R.required() }),
    defineField({ name: 'shortBio', title: 'Bio corta (Hero)', type: 'text', rows: 3 }),
    defineField({ name: 'longBio', title: 'Bio larga (Sobre mí)', type: 'array', of: [{ type: 'block' }] }),
    defineField({ name: 'photo', title: 'Foto profesional', type: 'image', options: { hotspot: true } }),
    defineField({ name: 'email', title: 'Email de contacto', type: 'string' }),
    defineField({
      name: 'stats',
      title: 'Estadísticas clave',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'value', title: 'Valor (ej: 10+)', type: 'string' },
            { name: 'label', title: 'Etiqueta (ej: Años de experiencia)', type: 'string' },
          ],
        },
      ],
    }),
    defineField({
      name: 'socialLinks',
      title: 'Redes sociales',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'platform',
              title: 'Plataforma',
              type: 'string',
              options: { list: ['linkedin', 'twitter', 'instagram', 'youtube'] },
            },
            { name: 'url', title: 'URL', type: 'url' },
          ],
        },
      ],
    }),
  ],
})
```

**Step 4: Create Service schema**

Create `sanity/schemas/service.ts`:

```ts
import { defineField, defineType } from 'sanity'

export const service = defineType({
  name: 'service',
  title: 'Servicios',
  type: 'document',
  fields: [
    defineField({ name: 'name', title: 'Nombre del servicio', type: 'string', validation: (R) => R.required() }),
    defineField({ name: 'description', title: 'Descripción', type: 'text', rows: 4 }),
    defineField({ name: 'icon', title: 'Ícono (nombre de Lucide)', type: 'string', description: 'Ej: TrendingUp, BarChart2, Target' }),
    defineField({ name: 'order', title: 'Orden de aparición', type: 'number' }),
  ],
  orderings: [{ title: 'Orden', name: 'orderAsc', by: [{ field: 'order', direction: 'asc' }] }],
})
```

**Step 5: Create Project schema**

Create `sanity/schemas/project.ts`:

```ts
import { defineField, defineType } from 'sanity'

export const project = defineType({
  name: 'project',
  title: 'Casos de éxito',
  type: 'document',
  fields: [
    defineField({ name: 'title', title: 'Título', type: 'string', validation: (R) => R.required() }),
    defineField({ name: 'slug', title: 'Slug', type: 'slug', options: { source: 'title' }, validation: (R) => R.required() }),
    defineField({ name: 'description', title: 'Descripción corta', type: 'text', rows: 3 }),
    defineField({ name: 'content', title: 'Contenido detallado', type: 'array', of: [{ type: 'block' }, { type: 'image' }] }),
    defineField({ name: 'image', title: 'Imagen de portada', type: 'image', options: { hotspot: true } }),
    defineField({ name: 'client', title: 'Cliente', type: 'string' }),
    defineField({ name: 'result', title: 'Resultado clave', type: 'string', description: 'Ej: +40% en conversiones en 3 meses' }),
    defineField({ name: 'url', title: 'URL del proyecto (opcional)', type: 'url' }),
    defineField({ name: 'featured', title: 'Destacado en Home', type: 'boolean', initialValue: false }),
    defineField({ name: 'publishedAt', title: 'Fecha', type: 'date' }),
  ],
})
```

**Step 6: Create schema index and Sanity config**

Create `sanity/schemas/index.ts`:

```ts
import { siteConfig } from './siteConfig'
import { service } from './service'
import { project } from './project'

export const schemaTypes = [siteConfig, service, project]
```

Create `sanity.config.ts` (root):

```ts
import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { visionTool } from '@sanity/vision'
import { schemaTypes } from './sanity/schemas'

export default defineConfig({
  name: 'portfolio',
  title: 'Portfolio CMS',
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  plugins: [structureTool(), visionTool()],
  schema: { types: schemaTypes },
})
```

**Step 7: Commit**

```bash
git add sanity/ sanity.config.ts
git commit -m "feat: add Sanity v3 client, schemas (siteConfig, service, project)"
```

---

## Task 5: GROQ Queries

**Files:**
- Create: `lib/queries.ts`

**Step 1: Write queries**

Create `lib/queries.ts`:

```ts
import { client } from '@/sanity/client'

export async function getSiteConfig() {
  return client.fetch(
    `*[_type == "siteConfig"][0]{
      name, title, shortBio, longBio, photo, email, stats, socialLinks
    }`,
    {},
    { next: { revalidate: 3600 } }
  )
}

export async function getServices() {
  return client.fetch(
    `*[_type == "service"] | order(order asc){
      _id, name, description, icon
    }`,
    {},
    { next: { revalidate: 60 } }
  )
}

export async function getFeaturedProjects() {
  return client.fetch(
    `*[_type == "project" && featured == true] | order(publishedAt desc)[0...3]{
      _id, title, slug, description, image, client, result
    }`,
    {},
    { next: { revalidate: 60 } }
  )
}

export async function getAllProjects() {
  return client.fetch(
    `*[_type == "project"] | order(publishedAt desc){
      _id, title, slug, description, image, client, result, publishedAt
    }`,
    {},
    { next: { revalidate: 60 } }
  )
}

export async function getProjectBySlug(slug: string) {
  return client.fetch(
    `*[_type == "project" && slug.current == $slug][0]{
      _id, title, slug, description, content, image, client, result, url, publishedAt
    }`,
    { slug },
    { next: { revalidate: 60 } }
  )
}
```

**Step 2: Commit**

```bash
git add lib/queries.ts
git commit -m "feat: add GROQ queries for Sanity data fetching"
```

---

## Task 6: Root Layout and Fonts

**Files:**
- Modify: `app/layout.tsx`
- Create: `app/globals.css`

**Step 1: Update globals.css**

Replace `app/globals.css` with:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-text-primary font-sans antialiased;
  }
  h1, h2, h3 {
    @apply font-heading;
  }
  ::selection {
    @apply bg-gold text-background;
  }
  ::-webkit-scrollbar {
    width: 6px;
  }
  ::-webkit-scrollbar-track {
    @apply bg-surface;
  }
  ::-webkit-scrollbar-thumb {
    @apply bg-gold rounded-full;
  }
}
```

**Step 2: Update app/layout.tsx**

```tsx
import type { Metadata } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import { Toaster } from 'sonner'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
})

export const metadata: Metadata = {
  title: {
    default: 'Portfolio | Experto en Marketing',
    template: '%s | Experto en Marketing',
  },
  description: 'Estratega de mercado especializado en crecimiento empresarial y posicionamiento de marca.',
  openGraph: {
    type: 'website',
    locale: 'es_ES',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${inter.variable} ${playfair.variable}`}>
      <body>
        {children}
        <Toaster
          theme="dark"
          toastOptions={{ style: { background: '#111111', border: '1px solid #1F1F1F', color: '#F5F5F5' } }}
        />
      </body>
    </html>
  )
}
```

**Step 3: Commit**

```bash
git add app/globals.css app/layout.tsx
git commit -m "feat: configure root layout with Playfair Display, Inter and dark theme"
```

---

## Task 7: UI Primitives — Button and Card

**Files:**
- Create: `components/ui/Button.tsx`
- Create: `components/ui/Card.tsx`

**Step 1: Create Button component**

Create `components/ui/Button.tsx`:

```tsx
import { cn } from '@/lib/utils'
import { type ButtonHTMLAttributes, forwardRef } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center font-sans font-medium transition-all duration-200 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold disabled:opacity-50 disabled:pointer-events-none',
          {
            'bg-gold text-background hover:bg-gold-hover': variant === 'primary',
            'border border-gold text-gold hover:bg-gold hover:text-background': variant === 'outline',
            'text-text-muted hover:text-text-primary': variant === 'ghost',
          },
          {
            'px-3 py-1.5 text-sm': size === 'sm',
            'px-6 py-3 text-base': size === 'md',
            'px-8 py-4 text-lg': size === 'lg',
          },
          className
        )}
        {...props}
      >
        {children}
      </button>
    )
  }
)
Button.displayName = 'Button'
```

**Step 2: Create Card component**

Create `components/ui/Card.tsx`:

```tsx
import { cn } from '@/lib/utils'

interface CardProps {
  className?: string
  children: React.ReactNode
}

export function Card({ className, children }: CardProps) {
  return (
    <div
      className={cn(
        'bg-surface border border-[#1F1F1F] rounded-sm p-6 transition-all duration-300 hover:border-gold/40 hover:scale-[1.02]',
        className
      )}
    >
      {children}
    </div>
  )
}
```

**Step 3: Commit**

```bash
git add components/ui/
git commit -m "feat: add Button and Card UI primitives"
```

---

## Task 8: Navbar Component

**Files:**
- Create: `components/layout/Navbar.tsx`

**Step 1: Create Navbar**

Create `components/layout/Navbar.tsx`:

```tsx
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

const links = [
  { href: '#sobre-mi', label: 'Sobre mí' },
  { href: '#servicios', label: 'Servicios' },
  { href: '#proyectos', label: 'Proyectos' },
]

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        scrolled ? 'bg-surface/95 backdrop-blur-sm border-b border-[#1F1F1F]' : 'bg-transparent'
      )}
    >
      <nav className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="font-heading text-xl text-gold tracking-wide">
          ME.
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-text-muted hover:text-text-primary text-sm transition-colors duration-200"
            >
              {l.label}
            </a>
          ))}
          <a href="#contacto">
            <Button variant="outline" size="sm">Contacto</Button>
          </a>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden text-text-muted hover:text-text-primary"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-surface border-b border-[#1F1F1F] px-6 py-4 flex flex-col gap-4">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="text-text-muted hover:text-text-primary text-base transition-colors"
            >
              {l.label}
            </a>
          ))}
          <a href="#contacto" onClick={() => setOpen(false)}>
            <Button variant="outline" size="sm" className="w-full">Contacto</Button>
          </a>
        </div>
      )}
    </header>
  )
}
```

**Step 2: Commit**

```bash
git add components/layout/Navbar.tsx
git commit -m "feat: add responsive Navbar with scroll-aware styling and mobile menu"
```

---

## Task 9: Footer Component

**Files:**
- Create: `components/layout/Footer.tsx`

**Step 1: Create Footer**

Create `components/layout/Footer.tsx`:

```tsx
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
```

**Step 2: Commit**

```bash
git add components/layout/Footer.tsx
git commit -m "feat: add Footer with dynamic social links"
```

---

## Task 10: Motion Wrapper (Framer Motion)

**Files:**
- Create: `components/ui/MotionSection.tsx`

This is a reusable wrapper that fades in + slides up any section when it enters the viewport.

**Step 1: Create MotionSection**

Create `components/ui/MotionSection.tsx`:

```tsx
'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { cn } from '@/lib/utils'

interface MotionSectionProps {
  children: React.ReactNode
  className?: string
  delay?: number
}

export function MotionSection({ children, className, delay = 0 }: MotionSectionProps) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, ease: 'easeOut', delay }}
      className={cn(className)}
    >
      {children}
    </motion.div>
  )
}
```

**Step 2: Commit**

```bash
git add components/ui/MotionSection.tsx
git commit -m "feat: add MotionSection scroll-triggered animation wrapper"
```

---

## Task 11: Hero Section

**Files:**
- Create: `components/sections/Hero.tsx`

**Step 1: Create Hero section**

Create `components/sections/Hero.tsx`:

```tsx
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
```

**Step 2: Commit**

```bash
git add components/sections/Hero.tsx
git commit -m "feat: add Hero section with photo, name, title and CTAs"
```

---

## Task 12: About Section

**Files:**
- Create: `components/sections/About.tsx`

**Step 1: Create About section**

Create `components/sections/About.tsx`:

```tsx
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
```

**Step 2: Commit**

```bash
git add components/sections/About.tsx
git commit -m "feat: add About section with Portable Text bio and stats grid"
```

---

## Task 13: Services Section

**Files:**
- Create: `components/sections/Services.tsx`

**Step 1: Create Services section**

Note: Icon names from Sanity are Lucide icon names (e.g. "TrendingUp"). We dynamically import them.

Create `components/sections/Services.tsx`:

```tsx
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
```

**Step 2: Commit**

```bash
git add components/sections/Services.tsx
git commit -m "feat: add Services section with dynamic Lucide icons and animated cards"
```

---

## Task 14: Projects Section (Home — Featured)

**Files:**
- Create: `components/sections/Projects.tsx`

**Step 1: Create Projects section**

Create `components/sections/Projects.tsx`:

```tsx
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
```

**Step 2: Commit**

```bash
git add components/sections/Projects.tsx
git commit -m "feat: add Projects section with featured project cards"
```

---

## Task 15: Contact Section

**Files:**
- Create: `components/sections/Contact.tsx`

**Step 1: Create Contact section**

Create `components/sections/Contact.tsx`:

```tsx
'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Send } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { MotionSection } from '@/components/ui/MotionSection'
import { contactSchema, type ContactFormData } from '@/lib/validations'
import { cn } from '@/lib/utils'

export function Contact() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormData>({ resolver: zodResolver(contactSchema) })

  async function onSubmit(data: ContactFormData) {
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Error al enviar')
      toast.success('Mensaje enviado. Te respondo pronto.')
      reset()
    } catch {
      toast.error('Error al enviar el mensaje. Intenta de nuevo.')
    }
  }

  const inputClass = (hasError: boolean) =>
    cn(
      'w-full bg-surface border rounded-sm px-4 py-3 text-text-primary placeholder:text-text-muted text-sm outline-none transition-colors focus:border-gold',
      hasError ? 'border-red-500' : 'border-[#1F1F1F]'
    )

  return (
    <section id="contacto" className="py-24">
      <div className="max-w-3xl mx-auto px-6">
        <MotionSection>
          <p className="text-gold text-sm font-sans uppercase tracking-widest mb-4 text-center">Contacto</p>
          <h2 className="font-heading text-4xl md:text-5xl text-text-primary mb-4 text-center">
            Hablemos de tu proyecto
          </h2>
          <p className="text-text-muted text-center mb-12">
            Cuéntame en qué puedo ayudarte y te respondo en menos de 24 horas.
          </p>
        </MotionSection>

        <MotionSection delay={0.1}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="grid md:grid-cols-2 gap-5">
              <div>
                <input {...register('name')} placeholder="Tu nombre" className={inputClass(!!errors.name)} />
                {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>}
              </div>
              <div>
                <input {...register('email')} placeholder="Tu email" className={inputClass(!!errors.email)} />
                {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
              </div>
            </div>
            <div>
              <input {...register('subject')} placeholder="Asunto" className={inputClass(!!errors.subject)} />
              {errors.subject && <p className="text-red-400 text-xs mt-1">{errors.subject.message}</p>}
            </div>
            <div>
              <textarea
                {...register('message')}
                placeholder="Cuéntame sobre tu proyecto..."
                rows={5}
                className={cn(inputClass(!!errors.message), 'resize-none')}
              />
              {errors.message && <p className="text-red-400 text-xs mt-1">{errors.message.message}</p>}
            </div>
            <Button type="submit" size="lg" disabled={isSubmitting} className="w-full gap-2">
              <Send size={16} />
              {isSubmitting ? 'Enviando...' : 'Enviar mensaje'}
            </Button>
          </form>
        </MotionSection>
      </div>
    </section>
  )
}
```

**Step 2: Commit**

```bash
git add components/sections/Contact.tsx
git commit -m "feat: add Contact section with React Hook Form, Zod validation and Sonner toasts"
```

---

## Task 16: Contact API Route

**Files:**
- Create: `app/api/contact/route.ts`

**Step 1: Create API route**

Create `app/api/contact/route.ts`:

```ts
import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { contactSchema } from '@/lib/validations'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = contactSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 })
    }

    const { name, email, subject, message } = parsed.data

    await resend.emails.send({
      from: 'Portfolio <onboarding@resend.dev>',
      to: process.env.CONTACT_EMAIL!,
      replyTo: email,
      subject: `[Portfolio] ${subject}`,
      text: `De: ${name} <${email}>\n\n${message}`,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Contact API error:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
```

**Step 2: Commit**

```bash
git add app/api/contact/route.ts
git commit -m "feat: add /api/contact route with Resend email sending and Zod validation"
```

---

## Task 17: Home Page

**Files:**
- Modify: `app/page.tsx`

**Step 1: Assemble home page**

Replace `app/page.tsx`:

```tsx
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { Hero } from '@/components/sections/Hero'
import { About } from '@/components/sections/About'
import { Services } from '@/components/sections/Services'
import { Projects } from '@/components/sections/Projects'
import { Contact } from '@/components/sections/Contact'
import { getSiteConfig, getServices, getFeaturedProjects } from '@/lib/queries'

export default async function Home() {
  const [config, services, projects] = await Promise.all([
    getSiteConfig(),
    getServices(),
    getFeaturedProjects(),
  ])

  return (
    <>
      <Navbar />
      <main>
        <Hero
          name={config.name}
          title={config.title}
          shortBio={config.shortBio}
          photo={config.photo}
        />
        <About longBio={config.longBio} stats={config.stats ?? []} />
        <Services services={services} />
        <Projects projects={projects} />
        <Contact />
      </main>
      <Footer name={config.name} socialLinks={config.socialLinks ?? []} />
    </>
  )
}
```

**Step 2: Commit**

```bash
git add app/page.tsx
git commit -m "feat: assemble home page with all sections from Sanity data"
```

---

## Task 18: Projects List Page

**Files:**
- Create: `app/proyectos/page.tsx`

**Step 1: Create projects listing page**

Create `app/proyectos/page.tsx`:

```tsx
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

export const revalidate = 60

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
```

**Step 2: Commit**

```bash
git add app/proyectos/page.tsx
git commit -m "feat: add /proyectos listing page with ISR and all projects"
```

---

## Task 19: Project Detail Page

**Files:**
- Create: `app/proyectos/[slug]/page.tsx`

**Step 1: Create project detail page**

Create `app/proyectos/[slug]/page.tsx`:

```tsx
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

export const revalidate = 60

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
```

**Step 2: Commit**

```bash
git add app/proyectos/[slug]/page.tsx
git commit -m "feat: add /proyectos/[slug] detail page with ISR and PortableText content"
```

---

## Task 20: Sanity Studio Route

**Files:**
- Create: `app/studio/[[...tool]]/page.tsx`

**Step 1: Create Sanity Studio route**

Create `app/studio/[[...tool]]/page.tsx`:

```tsx
'use client'

import { NextStudio } from 'next-sanity/studio'
import config from '../../../sanity.config'

export default function StudioPage() {
  return <NextStudio config={config} />
}
```

**Step 2: Add metadata override for studio (no index)**

Create `app/studio/layout.tsx`:

```tsx
export const metadata = {
  robots: 'noindex, nofollow',
}

export default function StudioLayout({ children }: { children: React.ReactNode }) {
  return children
}
```

**Step 3: Commit**

```bash
git add app/studio/
git commit -m "feat: add embedded Sanity Studio at /studio (noindex)"
```

---

## Task 21: SEO — robots.txt and sitemap

**Files:**
- Create: `app/robots.ts`
- Create: `app/sitemap.ts`

**Step 1: Create robots.ts**

Create `app/robots.ts`:

```ts
import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: '/studio' },
    ],
    sitemap: `${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://example.com'}/sitemap.xml`,
  }
}
```

Add `NEXT_PUBLIC_SITE_URL=https://your-domain.vercel.app` to `.env.local` (update after Vercel deploy).

**Step 2: Create sitemap.ts**

Create `app/sitemap.ts`:

```ts
import { MetadataRoute } from 'next'
import { getAllProjects } from '@/lib/queries'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://example.com'
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
```

**Step 3: Commit**

```bash
git add app/robots.ts app/sitemap.ts
git commit -m "feat: add dynamic robots.txt and sitemap"
```

---

## Task 22: Local Development Verification

**Step 1: Run tests**

```bash
npm run test:run
```

Expected: All tests pass (utils + validations).

**Step 2: Start dev server**

```bash
npm run dev
```

Open `http://localhost:3000` and verify:
- [ ] Home page loads with all sections
- [ ] Navbar is sticky and mobile menu works
- [ ] Hero shows correctly on mobile/tablet/desktop
- [ ] Sobre mí section shows bio and stats
- [ ] Servicios section shows cards with icons
- [ ] Proyectos section shows featured projects
- [ ] Contacto form shows validation errors on empty submit
- [ ] Contacto form sends (check Resend dashboard)
- [ ] `/proyectos` page lists all projects
- [ ] `/proyectos/[slug]` shows detail page
- [ ] `/studio` shows Sanity Studio editor

**Step 3: Seed content in Sanity Studio**

Open `http://localhost:3000/studio` and add:
- 1 `SiteConfig` document with name, title, bio, photo, stats, social links
- 3 `Service` documents with names, descriptions and icon names (e.g. `TrendingUp`, `Target`, `BarChart2`)
- 2–3 `Project` documents (mark at least 2 as "featured")

---

## Task 23: Vercel Deploy

**Step 1: Create GitHub repository and push**

```bash
git remote add origin https://github.com/YOUR_USER/YOUR_REPO.git
git push -u origin main
```

**Step 2: Connect to Vercel**

1. Go to [vercel.com](https://vercel.com) → New Project
2. Import the GitHub repository
3. Framework: Next.js (auto-detected)
4. Add environment variables (from `.env.local`):
   - `NEXT_PUBLIC_SANITY_PROJECT_ID`
   - `NEXT_PUBLIC_SANITY_DATASET`
   - `SANITY_API_TOKEN`
   - `RESEND_API_KEY`
   - `CONTACT_EMAIL`
   - `NEXT_PUBLIC_SITE_URL` ← set after first deploy to the Vercel URL
5. Click Deploy

**Step 3: Configure Sanity webhook for ISR**

1. In Vercel: Settings → Git → Deploy Hooks → Create hook named "Sanity" → copy URL
2. In Sanity dashboard → project → API → Webhooks → Create webhook
   - URL: the Vercel hook URL
   - Trigger on: Create, Update, Delete
   - Dataset: production
3. Now publishing content in Sanity triggers a Vercel revalidation

**Step 4: Update NEXT_PUBLIC_SITE_URL**

After first deploy, copy your `.vercel.app` URL and update it in Vercel environment variables.

---

## Done

The portfolio is live. Key points for the expert:

- **Add/edit services and projects:** go to `your-domain.com/studio`
- **Add new project:** create a `Project` document, check "Destacado en Home" to show it on the homepage
- **Update bio/photo/stats:** edit the `SiteConfig` document in Studio
- **Content updates go live in:** up to 60 seconds (ISR revalidation)
- **Contact emails** arrive to `CONTACT_EMAIL` via Resend
