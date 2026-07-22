"use client";
import React from "react";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

export function About() {
    return (
        <section id="about" className="relative mx-auto px-6 py-16 md:py-24 bg-background">

            {/* Structural Background Alignment Grid */}
            <div
                className="pointer-events-none absolute inset-0 z-0 opacity-40"
                style={{
                    backgroundImage: [
                        "linear-gradient(hsl(var(--border) / 0.5) 1px, transparent 1px)",
                        "linear-gradient(90deg, hsl(var(--border) / 0.5) 1px, transparent 1px)",
                    ].join(", "),
                    backgroundSize: "48px 48px",
                }}
            />

            {/* Header section matching Hero/About flow */}
            <div className="mb-8 lg:mb-8 mx-10 lg:mx-20">
                <div className="flex items-center gap-1 mb-2">
                    <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground/60">
                        Get to know Insert
                    </span>
                    <span className="h-px w-12 bg-border/40" />
                </div>
                <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-5xl tracking-[-0.02em]">
                    About
                </h2>
                {/* <p className="mt-4 max-w-2xl text-sm md:text-base leading-relaxed text-muted-foreground">
                    Structured coding sheets, technical writing, public collections, project tooling, and automated release notes all live in one workflow. Core utilities remain beautifully native, while higher-scale workflows stay Pro-first.
                </p> */}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 lg:px-20 px-10">

                {/* Card 1 — Topics / Sheets (wide) */}
                <div className="relative col-span-1 lg:col-span-2 overflow-hidden rounded-2xl border border-violet-500/15 bg-violet-500/5 dark:border-violet-500/10 dark:bg-violet-500/[0.04] p-7 min-h-[280px]">
                    <span className="mb-3 inline-block font-mono text-[10px] uppercase tracking-widest text-violet-600 dark:text-violet-400/70">
                        Topics
                    </span>
                    <h2 className="max-w-xs text-xl lg:text-2xl font-medium tracking-[-0.03em] text-foreground leading-snug">
                        Structured coding sheets, built for developers
                    </h2>
                    <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted-foreground">
                        Build and refine problem sets with versioned drafts and workspace controls. Publish or export when ready.
                    </p>
                    <Image
                        src="https://res.cloudinary.com/dgxeg3sju/image/upload/v1753474718/05969d69-43c7-4200-beca-173029a48450.png"
                        width={440}
                        height={440}
                        alt="Sheets preview"
                        className="absolute -right-4 lg:-right-[6%] -bottom-8 object-contain rounded-xl"
                    />
                </div>

                {/* Card 2 — Blogs */}
                <div className="relative col-span-1 overflow-hidden rounded-2xl border border-sky-500/15 bg-sky-500/5 dark:border-sky-500/10 dark:bg-sky-500/[0.04] p-7 min-h-[280px]">
                    <span className="mb-3 inline-block font-mono text-[10px] uppercase tracking-widest text-sky-600 dark:text-sky-400/70">
                        Blogs
                    </span>
                    <h2 className="max-w-[200px] text-xl lg:text-2xl font-medium tracking-[-0.03em] text-foreground leading-snug">
                        Curate blog collections that stay easy to share
                    </h2>
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                        Group posts into a single collection, control visibility, and publish a clean reading flow — no loose links.
                    </p>
                </div>

                {/* Card 3 — Collaboration banner (v6.0, full-width) */}
                <div className="col-span-1 lg:col-span-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.04] dark:border-emerald-500/15 dark:bg-emerald-500/[0.04] p-7">
                    <div className="flex flex-wrap items-center justify-between gap-8">
                        <div className="max-w-lg">
                            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-500/25 bg-emerald-500/8 px-3 py-1">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                <span className="font-mono text-[10px] uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                                    New in v6.0
                                </span>
                            </div>
                            <h2 className="text-xl lg:text-2xl font-medium tracking-[-0.03em] text-foreground leading-snug">
                                Collaborate in realtime — across every topic and blog
                            </h2>
                            <p className="mt-3 text-sm leading-relaxed text-muted-foreground max-w-md">
                                Invite collaborators, assign editor or viewer roles, accept or decline requests, and stay updated with instant in-app notifications. No context switching.
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-2.5 shrink-0">
                            {[
                                { label: "Role-based access", color: "border-emerald-500/25 bg-emerald-500/8 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400" },
                                { label: "Realtime notifications", color: "border-amber-500/25 bg-amber-500/8 text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-400" },
                                { label: "Workspace switcher", color: "border-sky-500/25 bg-sky-500/8 text-sky-700 dark:border-sky-500/20 dark:bg-sky-500/10 dark:text-sky-400" },
                                { label: "Collab requests", color: "border-violet-500/25 bg-violet-500/8 text-violet-700 dark:border-violet-500/20 dark:bg-violet-500/10 dark:text-violet-400" },
                            ].map((chip) => (
                                <span
                                    key={chip.label}
                                    className={`inline-flex items-center rounded-lg border px-3.5 py-2 text-xs font-medium ${chip.color}`}
                                >
                                    {chip.label}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Card 4 — Technical writing (wide) */}
                <div className="relative col-span-1 lg:col-span-2 overflow-hidden rounded-2xl border border-teal-500/15 bg-teal-500/5 dark:border-teal-500/10 dark:bg-teal-500/[0.04] p-7 min-h-[280px]">
                    <span className="mb-3 inline-block font-mono text-[10px] uppercase tracking-widest text-teal-600 dark:text-teal-400/70">
                        Writing
                    </span>
                    <h2 className="max-w-xs text-xl lg:text-2xl font-medium tracking-[-0.03em] text-foreground leading-snug">
                        Write technical blogs and docs with a focused editor
                    </h2>
                    <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted-foreground">
                        Draft articles and project docs, then organize related posts into collections for tutorials, release trails, or learning paths.
                    </p>
                    <Image
                        src="https://res.cloudinary.com/dgxeg3sju/image/upload/v1753474830/4440e28b-4269-42b1-9536-179d06eb8f80.png"
                        width={440}
                        height={440}
                        alt="Blog editor preview"
                        className="absolute -right-10 lg:-right-[4%] -bottom-10 object-contain rounded-xl"
                    />
                </div>

                {/* Card 5 — Pro */}
                <div className="relative col-span-1 overflow-hidden rounded-2xl border border-indigo-500/15 bg-indigo-500/5 dark:border-indigo-500/10 dark:bg-indigo-500/[0.04] p-7 min-h-[280px]">
                    <div className="mb-3 inline-flex items-center gap-2">
                        <span className="rounded-md border border-indigo-500/30 bg-indigo-500/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-indigo-600 dark:border-indigo-500/25 dark:bg-indigo-500/10 dark:text-indigo-400">
                            Pro
                        </span>
                    </div>
                    <h2 className="max-w-[200px] text-xl lg:text-2xl font-medium tracking-[-0.03em] text-foreground leading-snug">
                        More scale when you need it
                    </h2>
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                        Unlock project dashboards, unlimited sheets, organized publishing workflows, and automated release notes — instantly on upgrade.
                    </p>
                    <a
                        href="/pricing"
                        className="mt-6 inline-flex items-center gap-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors"
                    >
                        See Pro features <ArrowRight className="h-3 w-3" />
                    </a>
                </div>

                {/* Card 6 — Release notes (full-width) */}
                <div className="relative col-span-1 lg:col-span-3 overflow-hidden rounded-2xl border border-rose-500/15 bg-rose-500/[0.03] dark:border-rose-500/10 dark:bg-rose-500/[0.04] p-7 min-h-[200px]">
                    <div className="flex flex-wrap items-start justify-between gap-8">
                        <div className="max-w-md">
                            <div className="mb-3 flex items-center gap-2">
                                <span className="rounded-md border border-indigo-500/30 bg-indigo-500/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-indigo-600 dark:border-indigo-500/25 dark:text-indigo-400">
                                    Pro
                                </span>
                                <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground/40">
                                    Projects
                                </span>
                            </div>
                            <h2 className="text-xl lg:text-2xl font-medium tracking-[-0.03em] text-foreground leading-snug">
                                Automated release notes from GitHub commits
                            </h2>
                            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                                Connect a repository once. Insert analyzes commit messages, groups changes by keywords, and prepares a draft release note for review — all in one workspace.
                            </p>
                        </div>
                        <Image
                            src="/insert_project.png"
                            width={420}
                            height={280}
                            alt="Insert project dashboard"
                            className="object-contain rounded-xl self-end opacity-90"
                        />
                    </div>
                </div>

            </div>
        </section>
    );
}