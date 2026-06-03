import { ArrowRight, Boxes, LayoutPanelTop, Sparkles } from 'lucide-react'
import Link from 'next/link'

import { Button } from '@/components/ui/button'

import type { ReleaseEntry } from './releases'

type ReleaseHeroProps = {
  latestRelease: ReleaseEntry
}

export function ReleaseHero({ latestRelease }: ReleaseHeroProps) {
  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-black/10 bg-white/75 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-white/5 md:p-8 lg:p-10">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-r from-indigo-500/10 via-sky-400/10 to-fuchsia-500/10 blur-3xl" />

      <div className="relative grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/80 px-3 py-1 text-xs font-medium text-black shadow-sm dark:border-white/10 dark:bg-white/10 dark:text-white">
            <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
            Releases
          </div>

          <h1 className="mt-5 max-w-4xl text-balance text-4xl font-semibold tracking-tight text-black dark:text-white md:text-5xl lg:text-6xl">
            Shipping notes for each major Insert release.
          </h1>

          <p className="mt-5 max-w-3xl text-pretty text-base leading-7 text-gray-700 dark:text-gray-300 md:text-lg">
            Collections, topic workflow improvements, problem references, payments, and other product changes across major versions.
          </p>

          <div className="mt-6 flex flex-wrap gap-2">
            {latestRelease.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center rounded-full border border-black/10 bg-white/80 px-3 py-1 text-xs font-medium text-gray-700 dark:border-white/10 dark:bg-white/10 dark:text-gray-300"
              >
                {tag}
              </span>
            ))}
          </div>

          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="#latest-release">
              <Button className="h-11  border border-black/10 bg-black px-5 text-sm font-medium text-white hover:bg-black/90 dark:border-white/10 dark:bg-white dark:text-black dark:hover:bg-white/90">
                View latest
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="#release-history">
              <Button variant="outline" className="h-11  border-black/10 bg-white/70 px-5 text-sm font-medium backdrop-blur hover:bg-white dark:border-white/10 dark:bg-white/10 dark:hover:bg-white/15">
                View history
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid gap-4">
          <div className="rounded-[1.75rem] border border-black/10 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 p-6 text-white dark:border-white/10">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] uppercase tracking-[0.22em] text-white/50">Latest release</p>
                <p className="mt-2 text-4xl font-semibold tracking-tight">{latestRelease.version}</p>
              </div>
              <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-white/70">
                {latestRelease.kind}
              </span>
            </div>
            <p className="mt-4 text-lg font-medium leading-7 text-white">{latestRelease.label}</p>
            <p className="mt-3 text-sm leading-6 text-white/70">{latestRelease.summary}</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-[1.5rem] border border-black/10 bg-white/85 p-5 shadow-sm dark:border-white/10 dark:bg-white/5">
              <div className="flex items-center gap-2 text-sm font-medium text-black dark:text-white">
                <Boxes className="h-4 w-4 text-indigo-500" />
                Collections
              </div>
              <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-400">
                Public collection pages and better visibility handling.
              </p>
            </div>

            <div className="rounded-[1.5rem] border border-black/10 bg-white/85 p-5 shadow-sm dark:border-white/10 dark:bg-white/5">
              <div className="flex items-center gap-2 text-sm font-medium text-black dark:text-white">
                <LayoutPanelTop className="h-4 w-4 text-indigo-500" />
                Topic Grid
              </div>
              <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-400">
                Stronger AG Grid workflow for problem-heavy topics.
              </p>
            </div>

            <div className="rounded-[1.5rem] border border-black/10 bg-white/85 p-5 shadow-sm dark:border-white/10 dark:bg-white/5">
              <div className="flex items-center gap-2 text-sm font-medium text-black dark:text-white">
                <Sparkles className="h-4 w-4 text-indigo-500" />
                References
              </div>
              <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-400">
                Blog references attached directly to each problem.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}