import React from 'react'

import { Footer } from '@/components/landing/Footer'
import { Navbar } from '@/components/landing/Navbar'
import { ReleaseCard } from '@/components/release/ReleaseCard'
import { ReleaseHero } from '@/components/release/ReleaseHero'
import { latestRelease, releaseEntries } from '@/components/release/releases'

export default function ReleasePage() {
  const previousReleases = releaseEntries.slice(1)

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <div className="fixed inset-0 -z-10 bg-gradient-to-b from-indigo-50 via-white to-white dark:from-indigo-950 dark:via-gray-900 dark:to-gray-900" />
      <div className="fixed inset-0 -z-10 opacity-40 [mask-image:radial-gradient(ellipse_at_center,black,transparent)] [background-image:linear-gradient(to_right,rgba(99,102,241,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(99,102,241,0.08)_1px,transparent_1px)] [background-size:20px_20px] [background-position:center] dark:opacity-35 dark:[background-image:linear-gradient(to_right,rgba(99,102,241,0.12)_1px,transparent_1px),linear-gradient(to_bottom,rgba(99,102,241,0.12)_1px,transparent_1px)]" />
      <div className="pointer-events-none fixed left-1/2 top-[-12rem] -z-10 h-[32rem] w-[32rem] -translate-x-1/2 rounded-full bg-gradient-to-tr from-indigo-400/35 via-fuchsia-400/25 to-transparent blur-3xl dark:from-indigo-600/30 dark:via-fuchsia-600/25" />

      <Navbar />

      <main className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-4 pb-16 pt-24 md:px-6 lg:px-8 lg:pt-28">
        <ReleaseHero latestRelease={latestRelease} />

        <section id="latest-release" className="space-y-6">
          <div className="flex flex-col gap-3 border-b border-black/10 pb-5 dark:border-white/10 md:flex-row md:items-end md:justify-between">
            <div className="max-w-3xl">
              <p className="text-xs font-medium uppercase tracking-[0.22em] text-gray-500 dark:text-gray-400">
                Latest
              </p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight text-black dark:text-white md:text-4xl">
                {latestRelease.version}
              </h2>
            </div>

            <p className="max-w-2xl text-sm leading-7 text-gray-600 dark:text-gray-400 md:text-base md:text-right">
              {latestRelease.label}
            </p>
          </div>

          <ReleaseCard release={latestRelease} latest />
        </section>

        <section id="release-history" className="space-y-6">
          <div className="flex flex-col gap-3 border-b border-black/10 pb-5 dark:border-white/10 md:flex-row md:items-end md:justify-between">
            <div className="max-w-3xl">
              <p className="text-xs font-medium uppercase tracking-[0.22em] text-gray-500 dark:text-gray-400">
                Release history
              </p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight text-black dark:text-white md:text-4xl">
                Previous versions
              </h2>
            </div>

            <p className="max-w-2xl text-sm leading-7 text-gray-600 dark:text-gray-400 md:text-base md:text-right">
              Major product changes from earlier releases.
            </p>
          </div>

          <div className="space-y-6">
            {previousReleases.map((release) => (
              <ReleaseCard key={release.version} release={release} />
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}