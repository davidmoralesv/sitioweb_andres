# Market Expert Portfolio — Design Document

**Date:** 2026-03-07
**Status:** Approved

---

## Overview

A modern, elegant, and fully responsive personal portfolio website for a marketing/business strategy expert. Deployable on Vercel with a headless CMS for managing dynamic content (services and case studies) without touching code.

---

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| CMS | Sanity v3 + Sanity Studio |
| Styles | Tailwind CSS v3 |
| Animations | Framer Motion |
| Fonts | Playfair Display (headings) + Inter (UI/body) |
| Icons | Lucide React |
| Contact form | React Hook Form + Zod + Resend |
| Deploy | Vercel |

---

## Routes

```
/                      → Home (all sections on a single scroll)
/proyectos             → All case studies
/proyectos/[slug]      → Individual case study
/studio                → Sanity Studio (blocked from robots.txt)
/api/contact           → Contact form API route (Resend)
```

---

## Sanity Data Models

### `SiteConfig` (singleton)
- `name` — string
- `shortBio` — string
- `longBio` — text (Portable Text)
- `photo` — image
- `email` — string
- `socialLinks` — array of `{ platform, url }`

### `Service`
- `name` — string
- `description` — text
- `icon` — string (Lucide icon name)
- `order` — number (for sorting)

### `Project`
- `title` — string
- `slug` — slug
- `description` — text
- `image` — image
- `client` — string
- `result` — string (key outcome)
- `url` — url (optional)

---

## Rendering Strategy

| Route | Strategy |
|---|---|
| `/` | Static (SSG) |
| `/proyectos` | ISR — `revalidate: 60` |
| `/proyectos/[slug]` | ISR — `revalidate: 60` |
| `/api/contact` | Edge Runtime |

Sanity webhooks trigger ISR revalidation on content publish.

---

## Visual Design

### Color Palette

```
Background:    #0A0A0A   (near-black)
Surface:       #111111   (cards, nav)
Border:        #1F1F1F   (subtle separators)
Text primary:  #F5F5F5   (off-white)
Text muted:    #888888   (subtitles, meta)
Accent gold:   #C9A84C   (CTAs, highlights, links)
Accent hover:  #E4C56A   (gold hover state)
```

### Typography

- **Headings (H1–H3):** Playfair Display — elegant serif, conveys authority
- **Body / UI:** Inter — clean and highly legible at all sizes

---

## Home Page Layout (single scroll)

```
┌─────────────────────────────────────────┐
│  NAV  Logo  ·  Servicios  ·  Proyectos  [Contacto] │
├─────────────────────────────────────────┤
│  HERO                                   │
│  [Photo]  Name                          │
│           Marketing Strategist          │
│           Short bio                     │
│           [Ver servicios] [Contacto]    │
├─────────────────────────────────────────┤
│  SOBRE MÍ                               │
│  Long bio + key stats/achievements      │
├─────────────────────────────────────────┤
│  SERVICIOS                              │
│  3-column card grid (from Sanity)       │
├─────────────────────────────────────────┤
│  CASOS DE ÉXITO                         │
│  2-3 featured project cards             │
├─────────────────────────────────────────┤
│  CONTACTO                               │
│  Form (Name, Email, Subject, Message)   │
│  + Social links                         │
├─────────────────────────────────────────┤
│  FOOTER                                 │
└─────────────────────────────────────────┘
```

---

## Responsive Breakpoints

| Breakpoint | Layout |
|---|---|
| Mobile < 768px | Single column, hamburger menu |
| Tablet 768–1024px | 2-column grid for services/projects |
| Desktop > 1024px | 3-column grid, hero side-by-side |

---

## Animations (Framer Motion)

- Fade-in + slide-up on scroll (IntersectionObserver via Framer variants)
- Card hover: `scale(1.02)` + gold border transition
- Page transitions on route changes

---

## Contact Form

- **Fields:** Name, Email, Subject, Message
- **Validation:** React Hook Form + Zod
- **Email provider:** Resend (3,000 emails/month free)
- **API route:** `app/api/contact/route.ts`
- **Feedback:** Toast notifications via Sonner

---

## SEO

- Dynamic metadata per route via `generateMetadata()`
- Open Graph images via `@vercel/og`
- `robots.txt` blocks `/studio`
- No sitemap needed (no blog)

---

## Environment Variables

```
NEXT_PUBLIC_SANITY_PROJECT_ID
NEXT_PUBLIC_SANITY_DATASET
SANITY_API_TOKEN
RESEND_API_KEY
```

---

## Project File Structure

```
/
├── app/
│   ├── layout.tsx
│   ├── page.tsx                    ← Home (all sections)
│   ├── proyectos/
│   │   ├── page.tsx
│   │   └── [slug]/page.tsx
│   └── api/
│       └── contact/route.ts
├── components/
│   ├── ui/                         ← Button, Card, Badge, Input...
│   ├── sections/                   ← Hero, About, Services, Projects, Contact
│   └── layout/                     ← Navbar, Footer
├── sanity/
│   ├── schemas/                    ← siteConfig, service, project
│   └── client.ts
└── lib/
    ├── queries.ts                  ← GROQ queries
    └── utils.ts
```

---

## Deployment Flow

1. Push to GitHub
2. Connect repo on vercel.com (one click)
3. Set environment variables in Vercel dashboard
4. Automatic deploys on push to `main`
5. Preview deployments on every PR
6. Configure Sanity webhook → Vercel Deploy Hook for ISR revalidation
