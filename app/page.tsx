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
