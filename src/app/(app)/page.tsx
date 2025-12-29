import '../globals.css'
import React from 'react'
import { Navbar } from '@/components/landing/Navbar'
import { Hero } from '@/components/landing/Hero'
import { Features } from '@/components/landing/Features'
import { About } from '@/components/About'
import { Footer } from '@/components/landing/Footer'

const shell = 'rounded-2xl border border-black/10 dark:border-white/10 bg-white supports-[backdrop-filter]:bg-white/80 dark:bg-gray-900/50 dark:supports-[backdrop-filter]:bg-gray-900/40 backdrop-blur transition-colors'

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <div className="fixed inset-0 -z-10 bg-gradient-to-b from-indigo-50 via-white to-white dark:from-indigo-950 dark:via-gray-900 dark:to-gray-900" />
      {/* Background — subtle grid with edge fade */}
      <div className="fixed inset-0 -z-10 opacity-40 [mask-image:radial-gradient(ellipse_at_center,black,transparent)] [background-image:linear-gradient(to_right,rgba(99,102,241,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(99,102,241,0.08)_1px,transparent_1px)] [background-size:20px_20px] [background-position:center] dark:opacity-35 dark:[background-image:linear-gradient(to_right,rgba(99,102,241,0.12)_1px,transparent_1px),linear-gradient(to_bottom,rgba(99,102,241,0.12)_1px,transparent_1px)]" />
      {/* Background — glow accent */}
      <div className="pointer-events-none fixed left-1/2 top-[-12rem] -z-10 h-[32rem] w-[32rem] -translate-x-1/2 rounded-full bg-gradient-to-tr from-indigo-400/35 via-fuchsia-400/25 to-transparent blur-3xl dark:from-indigo-600/30 dark:via-fuchsia-600/25" />

      <Navbar />
      <Hero />
      <About />
      <Features />
      <Footer />
    </div>
  )
}