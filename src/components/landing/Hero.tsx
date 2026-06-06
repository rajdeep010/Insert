"use client";

import Link from "next/link";
import { ArrowRight, BadgeCheck, BookMarked, GitBranch, Sparkles } from "lucide-react";
import { Button } from "../ui/button";
import { Spotlight } from "../ui/spotlight-new";
import { BackgroundBeams } from "../ui/background-beams";
import InsertIcon from "../InsertIcon";

export function Hero() {
    return (
        <section className="relative mx-auto flex min-h-[88vh] w-full items-center overflow-hidden px-6 pt-24">
            <Spotlight />
            <div className="pointer-events-none absolute inset-x-0 top-24 z-10 mx-auto h-72 max-w-5xl rounded-full bg-gradient-to-r from-sky-400/15 via-indigo-400/20 to-fuchsia-400/15 blur-3xl" />

            <div className="relative z-20 mx-auto grid w-full max-w-7xl items-center gap-12 lg:grid-cols-[1.08fr_0.92fr]">
                <div className="max-w-3xl">
                    <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/70 px-3 py-1 text-xs font-medium text-black shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/10 dark:text-white">
                        <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
                        Insert 5.1 · collections, pro states, and release workflows
                    </div>

                    <div className="mb-5 flex items-center gap-3">
                        <InsertIcon
                            height={60}
                            width={60}
                            className="rounded-2xl border-2 border-gray-900 p-1.5 shadow-sm dark:border-gray-700 dark:bg-white"
                        />
                        <div className="rounded-2xl border border-black/10 bg-white/65 px-3 py-2 text-left shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/10">
                            <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-gray-500 dark:text-gray-400">
                                Developer workspace
                            </p>
                            <p className="text-sm font-semibold text-black dark:text-white">Writing, collections, and shipping</p>
                        </div>
                    </div>

                    <h1 className="max-w-4xl text-balance text-5xl font-semibold tracking-tight text-black dark:text-white md:text-6xl lg:text-7xl">
                        A cleaner way to <span className="bg-gradient-to-r from-sky-500 via-indigo-500 to-fuchsia-500 bg-clip-text text-transparent">write</span>, organize, and <span className="underline decoration-indigo-400/70 underline-offset-8">ship</span> <span className="italic text-slate-600 dark:text-slate-300">developer</span> work.
                    </h1>

                    <p className="mt-5 max-w-2xl text-pretty text-base leading-7 text-gray-700 dark:text-gray-300 md:text-xl md:leading-8">
                        Build structured sheets, publish technical writing, bundle blogs into public collections, and turn project activity into release-ready notes without splitting your workflow across tools.
                    </p>

                    <div className="mt-8 flex flex-wrap items-center gap-3">
                        <Link href="/sign-up">
                            <Button className="h-11 border border-black/10 bg-black px-5 text-sm font-medium text-white hover:bg-black/90 dark:border-white/10 dark:bg-white dark:text-black dark:hover:bg-white/90">
                                Get started
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </Link>
                    </div>

                    <div className="mt-8 flex flex-wrap gap-3 text-sm text-gray-600 dark:text-gray-300">
                        <div className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/65 px-3 py-2 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/10">
                            <BookMarked className="h-4 w-4" />
                            Public collections
                        </div>
                        <div className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/65 px-3 py-2 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/10">
                            <GitBranch className="h-4 w-4" />
                            Release automation
                        </div>
                        <div className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/65 px-3 py-2 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/10">
                            <BadgeCheck className="h-4 w-4" />
                            Powerful Pro
                        </div>
                    </div>
                </div>

                <div className="relative mx-auto w-full max-w-2xl">
                    <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-br from-white/60 via-white/10 to-transparent blur-2xl dark:from-white/10 dark:via-white/5" />

                    <div className="relative overflow-hidden rounded-[2rem] border border-black/10 bg-white/75 p-4 shadow-[0_30px_80px_rgba(15,23,42,0.12)] backdrop-blur-xl dark:border-white/10 dark:bg-[#0b1220]/75 dark:shadow-[0_30px_80px_rgba(0,0,0,0.35)]">
                        <div className="grid gap-4 sm:grid-cols-[1.1fr_0.9fr]">
                            <div className="rounded-[1.5rem] border border-black/10 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 p-5 text-white dark:border-white/10">
                                <div className="mb-4 flex items-center justify-between">
                                    <div>
                                        <p className="text-[11px] uppercase tracking-[0.22em] text-white/55">Collections</p>
                                        <p className="mt-1 text-lg font-semibold">Publish a better reading </p>
                                    </div>
                                    {/* <div className="rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-medium text-white/80">
                                        new flow
                                    </div> */}
                                </div>

                                <div className="space-y-3">
                                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                                        <div className="flex items-center justify-between">
                                            <p className="text-sm font-medium">Blog collections</p>
                                            <span className="rounded-full bg-emerald-400/15 px-2 py-0.5 text-[11px] text-emerald-300">public</span>
                                        </div>
                                        <p className="mt-2 text-sm text-white/65">Club related blog posts into one guided collection instead of a loose set of links.</p>
                                    </div>

                                    {/* <div className="grid grid-cols-2 gap-3">
                                        <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                                            <p className="text-[11px] uppercase tracking-[0.18em] text-white/45">Posts</p>
                                            <p className="mt-2 text-2xl font-semibold">Blogs</p>
                                        </div>
                                        <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                                            <p className="text-[11px] uppercase tracking-[0.18em] text-white/45">Visibility</p>
                                            <p className="mt-2 text-2xl font-semibold">Mixed</p>
                                        </div>
                                    </div> */}
                                </div>
                            </div>

                            <div className="flex flex-col gap-4">
                                <div className="rounded-[1.5rem] border border-black/10 bg-white/85 p-4 shadow-sm dark:border-white/10 dark:bg-white/5">
                                    <div className="flex items-center gap-2 text-sm font-medium text-black dark:text-white">
                                        <Sparkles className="h-4 w-4 text-indigo-500" />
                                        Release ready
                                    </div>
                                    <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-300">
                                        Commits, writing, and public-facing collections stay connected in one system.
                                    </p>
                                </div>

                                <div className="rounded-[1.5rem] border border-black/10 bg-white/85 p-4 shadow-sm dark:border-white/10 dark:bg-white/5">
                                    <div className="mb-3 flex items-center justify-between">
                                        <p className="text-sm font-medium text-black dark:text-white">Badge states</p>
                                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-slate-500 dark:bg-white/10 dark:text-white/60">improved</span>
                                    </div>
                                    <div className="space-y-2.5 text-sm text-gray-600 dark:text-gray-300">
                                        <div className="flex items-center justify-between border border-black/5 px-3 py-2 dark:border-white/10">
                                            <span>Active Pro</span>
                                            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 text-white"><BadgeCheck className="h-3.5 w-3.5" /></span>
                                        </div>
                                        <div className="flex items-center justify-between border border-black/5 px-3 py-2 dark:border-white/10">
                                            <span>Expired Pro</span>
                                            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-slate-400 text-white"><BadgeCheck className="h-3.5 w-3.5" /></span>
                                        </div>
                                    </div>
                                </div>

                                <div className="rounded-[1.5rem] border border-black/10 bg-gradient-to-r from-black to-slate-800 p-4 text-white shadow-sm dark:border-white/10">
                                    <p className="text-[11px] uppercase tracking-[0.22em] text-white/50">Why teams use Insert</p>
                                    <p className="mt-2 text-sm leading-6 text-white/80">
                                        Less context switching. Cleaner publishing. Faster release communication.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <BackgroundBeams />
        </section>
    );
}