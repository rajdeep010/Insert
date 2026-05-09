import Image from 'next/image'
import { Check, Layers3 } from 'lucide-react'

import type { ReleaseEntry } from './releases'

type ReleaseCardProps = {
  release: ReleaseEntry
  latest?: boolean
}

export function ReleaseCard({ release, latest = false }: ReleaseCardProps) {
  return (
    <article className="rounded-[2rem] border border-black/10 bg-white/75 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-white/5 md:p-8">
      <div className="flex flex-col gap-8">
        <div className="grid gap-8 lg:grid-cols-[0.32fr_0.68fr] lg:items-start">
          <aside className="flex flex-col gap-4 rounded-[1.5rem] border border-black/10 bg-white/85 p-5 shadow-sm dark:border-white/10 dark:bg-white/5">
            <span className={`inline-flex w-fit items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${latest ? 'bg-indigo-600 text-white' : 'bg-black text-white dark:bg-white dark:text-black'}`}>
              {latest ? 'Latest release' : release.dateLabel}
            </span>
            <div>
              <p className="text-3xl font-semibold tracking-tight text-black dark:text-white">{release.version}</p>
              <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-400">{release.kind === 'major' ? 'Major release' : 'Minor release'}</p>
            </div>
            <div className="space-y-2">
              {release.tags.map((tag) => (
                <span key={tag} className="inline-flex mr-2 items-center rounded-full border border-black/10 bg-white/80 px-3 py-1 text-xs font-medium text-gray-700 dark:border-white/10 dark:bg-white/10 dark:text-gray-300">
                  {tag}
                </span>
              ))}
            </div>
          </aside>

          <div className="space-y-8">
            <h2 className="text-balance text-3xl font-semibold tracking-tight text-black dark:text-white md:text-4xl">
              {release.label}
            </h2>
            <div className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
              <div className="rounded-[1.5rem] border border-black/10 bg-white/85 p-6 shadow-sm dark:border-white/10 dark:bg-white/5">
                <div className="flex items-center gap-2 text-sm font-medium text-black dark:text-white">
                  <Layers3 className="h-4 w-4 text-indigo-500" />
                  Overview
                </div>
                <p className="mt-4 text-base leading-7 text-gray-700 dark:text-gray-300">
                  {release.summary}
                </p>
                <p className="mt-4 text-sm leading-7 text-gray-600 dark:text-gray-400">
                  {release.details}
                </p>
              </div>

              {release.image ? (
                <div className="overflow-hidden rounded-[1.5rem] border border-black/10 bg-white shadow-sm dark:border-white/10 dark:bg-white/10">
                  <Image
                    src={release.image}
                    alt={release.imageAlt ?? release.label}
                    width={1600}
                    height={1000}
                    className="h-full w-full object-cover"
                  />
                </div>
              ) : (
                <div className="rounded-[1.5rem] border border-black/10 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 p-6 text-white dark:border-white/10">
                  <p className="text-[11px] uppercase tracking-[0.22em] text-white/50">Overview</p>
                  <p className="mt-3 text-xl font-semibold">{release.version}</p>
                  <p className="mt-3 text-sm leading-6 text-white/75">{release.summary}</p>
                </div>
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {release.sections.map((section) => (
                <section
                  key={section.title}
                  className="rounded-[1.5rem] border border-black/10 bg-white/85 p-5 shadow-sm dark:border-white/10 dark:bg-white/5"
                >
                  <p className="text-sm font-semibold text-black dark:text-white">{section.title}</p>
                  {section.description ? (
                    <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-400">
                      {section.description}
                    </p>
                  ) : null}
                  <ul className="mt-4 space-y-3 text-sm leading-6 text-gray-700 dark:text-gray-300">
                    {section.items.map((item) => (
                      <li key={item} className="flex items-start gap-3 rounded-xl border border-black/5 px-3 py-3 dark:border-white/10">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-indigo-500" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>
            </div>
        </div>
      </div>
    </article>
  )
}