import React from 'react'

import { About } from '@/components/About'
import { Features } from '@/components/landing/Features'
import { Footer } from '@/components/landing/Footer'
import { Hero } from '@/components/landing/Hero'
import { Navbar } from '@/components/landing/Navbar'
import FadeUp from '@/components/animations/FadeUp'

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-background">
      <Navbar />

      <FadeUp>
        <Hero />
      </FadeUp>

      <FadeUp>
        <About />
      </FadeUp>

      <FadeUp>
        <Features />
      </FadeUp>


      <FadeUp>
        <Footer />
      </FadeUp>
    </div>
  )
}