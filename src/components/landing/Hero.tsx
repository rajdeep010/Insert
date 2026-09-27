"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BookOpen, FolderKanban, GitBranch, Sparkles, Users } from "lucide-react";

import InsertIcon from "@/components/InsertIcon";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function Hero() {
    return <section className="relative overflow-hidden bg-slate-50 pt-28 text-slate-950 dark:bg-[#020817] dark:text-slate-50 sm:pt-32">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-60 [background-image:linear-gradient(to_right,rgba(100,116,139,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(100,116,139,0.08)_1px,transparent_1px)] [background-size:48px_48px] [mask-image:linear-gradient(to_bottom,black,transparent_92%)]" />
        <div aria-hidden="true" className="pointer-events-none absolute left-[10%] top-32 h-96 w-96 rounded-full bg-indigo-500/10 blur-[140px]" />
        <div className="relative mx-auto max-w-[1560px] px-4 pb-16 sm:px-8 lg:px-12 lg:pb-24">
            <div className="grid gap-10 lg:grid-cols-[minmax(0,0.92fr)_minmax(520px,1.08fr)] lg:items-center">
                <div><Link href="/release/v7" className="inline-flex items-center gap-2 rounded-md border border-indigo-500/20 bg-indigo-500/[0.06] px-3 py-1.5 text-xs text-indigo-600 transition hover:bg-indigo-500/10 dark:text-indigo-300"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /><span className="font-mono">v7.0</span><span className="text-slate-400">The workspace, reconsidered</span><ArrowRight className="h-3.5 w-3.5" /></Link>
                    {/* <div className="mt-8 flex items-center gap-3"><InsertIcon width={64} height={64} className="rounded-xl border border-slate-200 bg-white p-1.5 dark:border-slate-700" /><span className="text-5xl tracking-[-0.04em]">Insert</span></div> */}

                    <div className="mt-6 sm:mt-8">
                        <h1 className="flex items-center gap-[0.22em] font-serif text-5xl font-bold leading-none tracking-[-0.02em] sm:text-5xl lg:text-6xl xl:text-7xl"><InsertIcon width="0.92em" height="0.92em" className="shrink-0 rounded-[0.22em] border border-slate-200 bg-white p-[0.08em] shadow-sm dark:border-slate-700" />Insert</h1>
                        <p className="mt-3 max-w-3xl font-serif text-3xl font-light italic leading-[1.15] tracking-[-0.01em] text-slate-400 sm:mt-4 sm:text-4xl lg:text-5xl xl:text-6xl dark:text-slate-500">Dev workspace...</p>
                    </div>

                    <p className="mt-6 max-w-xl text-base leading-7 text-slate-600 dark:text-slate-400">A connected developer workspace for structured coding sheets, technical writing, typed collections, collaborative work, and GitHub-powered release journals.</p>
                    <div className="mt-8 flex flex-wrap gap-3"><Button asChild size="lg" className="rounded-md"><Link href="/sign-up">Start building free<ArrowRight className="ml-2 h-4 w-4" /></Link></Button><Button asChild size="lg" variant="outline" className="rounded-md"><Link href="/release">Latest releases</Link></Button></div>
                    <div className="mt-10 grid grid-cols-2 gap-x-6 gap-y-4 border-t border-slate-200 pt-6 dark:border-slate-800 sm:grid-cols-4">{[{ icon: BookOpen, label: "Topics", value: "Structured" }, { icon: FolderKanban, label: "Collections", value: "Typed" }, { icon: Users, label: "Access", value: "Role-based" }, { icon: GitBranch, label: "Releases", value: "Automated" }].map(({ icon: Icon, label, value }) => <div key={label}><p className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.14em] text-slate-400"><Icon className="h-3.5 w-3.5" />{label}</p><p className="mt-1 text-sm font-medium">{value}</p></div>)}</div>
                </div>
                <div className="relative"><div className="absolute -inset-8 rounded-full bg-indigo-500/10 blur-3xl" /><div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white/65 p-2 shadow-2xl shadow-slate-950/10 dark:border-slate-800 dark:bg-slate-950/65"><div className="flex items-center justify-between px-3 py-2"><div className="flex gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-red-400" /><span className="h-2.5 w-2.5 rounded-full bg-amber-400" /><span className="h-2.5 w-2.5 rounded-full bg-emerald-400" /></div><Badge variant="secondary" className="rounded-md text-[9px]"><Sparkles className="mr-1 h-3 w-3" />Insert workspace</Badge></div><div className="relative aspect-[16/10] overflow-hidden rounded-xl border border-slate-200 bg-slate-950 dark:border-slate-800"><Image src="https://res.cloudinary.com/dgxeg3sju/image/upload/v1786237523/4468230f-24b7-46de-9953-73cd42b7f70b.png" alt="Modern Insert developer workspace" fill priority sizes="(max-width: 1024px) 100vw, 52vw" className="object-cover object-top" /></div></div></div>
            </div>
        </div>
    </section>;
}
