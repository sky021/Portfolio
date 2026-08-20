import Hero from '@/components/Hero'
import ImpactMetrics from '@/components/ImpactMetrics'
import SelectedWork from '@/components/SelectedWork'
import Experience from '@/components/Experience'
import Skills from '@/components/Skills'
import Credentials from '@/components/Credentials'
import About from '@/components/About'
import Recommendation from '@/components/Recommendation'
import Contact from '@/components/Contact'

export default function Home() {
  return (
    <>
      <Hero />
      <ImpactMetrics />
      <SelectedWork />
      <Experience />
      <Skills />
      <Credentials />
      <About />
      <Recommendation />
      <Contact />
    </>
  )
}
