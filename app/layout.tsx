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
