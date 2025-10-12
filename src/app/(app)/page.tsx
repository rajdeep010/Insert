import '../globals.css'
import React from 'react'
import { Navbar } from '@/components/landing/Navbar'
import { Hero } from '@/components/landing/Hero'
import { Features } from '@/components/landing/Features'
import { About } from '@/components/About'
import { Footer } from '@/components/landing/Footer'
import { Changelog } from '@/components/landing/Changelog'
import { CTA } from '@/components/landing/CTA'

export default function Home() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-white dark:bg-black">
      <Navbar />
      <Hero />
      {/* <Features /> */}
      <About />
      <Features/>
      <Footer />
    </div>
  )
}