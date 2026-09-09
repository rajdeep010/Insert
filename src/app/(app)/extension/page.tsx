import type { Metadata } from "next";
import Link from "next/link";
import {
    ArrowRight,
    BookOpenText,
    Chrome,
    Download,
    LayoutDashboard,
    ListChecks,
    MousePointerClick,
    Puzzle,
    Save,
    ShieldCheck,
    Tag,
} from "lucide-react";

import ExtensionInfoCard from "@/components/ExtensionInfoCard";
import InsertNavbar from "@/components/InsertNavbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CHROME_EXTENSION_URL } from "@/lib/constants";

export const metadata: Metadata = {
    title: "Chrome Extension | Insert",
    description: "Install the Insert Chrome extension to capture coding problems while you browse and save them straight into your Insert sheets.",
};

const features = [
    { title: "Capture in one click", description: "Save a problem's title, link, difficulty, and notes without leaving the page you're on.", icon: MousePointerClick },
    { title: "Route to any sheet", description: "Send captured problems directly to the Insert sheet you're currently practicing from.", icon: LayoutDashboard },
    { title: "Structured details", description: "Every save keeps title, link, difficulty, and notes organized and ready to review later.", icon: ListChecks },
    { title: "Lightweight companion", description: "A small, focused popup built to stay out of your way while you solve problems.", icon: Puzzle },
];

const steps = [
    { title: "Install the extension", description: "Add Insert to Chrome from the Web Store in a few seconds, no setup required.", icon: Download },
    { title: "Sign in to your workspace", description: "Connect the extension to your Insert account so captures land in the right place.", icon: ShieldCheck },
    { title: "Save as you browse", description: "Open the popup on any problem page, add a difficulty or note, and save it to a sheet.", icon: Save },
];

export default function ExtensionPage() {
    return <main className="relative min-h-screen overflow-hidden bg-slate-50 text-slate-950 dark:bg-[#020817] dark:text-slate-50">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-60 [background-image:linear-gradient(to_right,rgba(100,116,139,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(100,116,139,0.08)_1px,transparent_1px)] [background-size:48px_48px] [mask-image:linear-gradient(to_bottom,black,transparent_92%)]" />
        <div aria-hidden="true" className="pointer-events-none absolute left-[8%] top-28 h-80 w-80 rounded-full bg-indigo-500/10 blur-[120px]" />
        <div aria-hidden="true" className="pointer-events-none absolute right-[8%] top-96 h-72 w-72 rounded-full bg-cyan-500/10 blur-[120px]" />
        <div className="relative mx-auto w-full max-w-[1560px] px-4 py-5 sm:px-8 lg:px-12 lg:py-8">
            <InsertNavbar />

            <section className="grid gap-8 border-b border-slate-200/80 py-10 dark:border-slate-800/80 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-end lg:py-16">
                <div>
                    <div className="flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-300"><Chrome className="h-3.5 w-3.5" />Chrome extension</div>
                    <h1 className="mt-5 max-w-4xl text-5xl font-semibold tracking-[-0.06em] sm:text-7xl">Save problems<br /><span className="text-slate-400">without switching tabs.</span></h1>
                    <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-400">The Insert extension captures coding problems while you browse and saves them straight into your Insert sheets, with title, link, difficulty, and notes attached.</p>
                    <div className="mt-7 flex flex-wrap items-center gap-3">
                        <Button asChild size="lg" className="rounded-md"><a href={CHROME_EXTENSION_URL} target="_blank" rel="noopener noreferrer"><Chrome className="mr-2 h-4 w-4" />Add to Chrome</a></Button>
                        <Button asChild variant="outline" size="lg" className="rounded-md"><Link href="/sign-up">Create your workspace<ArrowRight className="ml-2 h-4 w-4" /></Link></Button>
                    </div>
                </div>
                <ExtensionInfoCard />
            </section>

            <section className="py-8 lg:py-10">
                <div className="mb-5"><p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">Why install it</p><h2 className="mt-1 text-2xl font-semibold">Built for solving problems, not tab-switching</h2></div>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    {features.map(({ title, description, icon: Icon }) => <div key={title} className="rounded-2xl border border-slate-200 bg-white/65 p-5 shadow-sm backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/55">
                        <span className="flex h-9 w-9 items-center justify-center rounded-md bg-indigo-500/10 text-indigo-500"><Icon className="h-4 w-4" /></span>
                        <h3 className="mt-4 text-sm font-semibold">{title}</h3>
                        <p className="mt-2 text-xs leading-5 text-slate-500">{description}</p>
                    </div>)}
                </div>
            </section>

            <section className="py-8 lg:py-10">
                <div className="mb-5"><p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">Getting started</p><h2 className="mt-1 text-2xl font-semibold">Three steps to your first save</h2></div>
                <div className="grid gap-3 lg:grid-cols-3">
                    {steps.map(({ title, description, icon: Icon }, index) => <div key={title} className="rounded-2xl border border-slate-200 bg-white/65 p-5 shadow-sm backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/55">
                        <div className="flex items-center gap-3"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-indigo-500/10 text-indigo-500"><Icon className="h-4 w-4" /></span><Badge variant="secondary" className="rounded-md text-[10px]">Step {index + 1}</Badge></div>
                        <h3 className="mt-4 text-sm font-semibold">{title}</h3>
                        <p className="mt-2 text-xs leading-5 text-slate-500">{description}</p>
                    </div>)}
                </div>
            </section>

            <section className="py-8 lg:py-10">
                <div className="mb-5"><p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">What gets saved</p><h2 className="mt-1 text-2xl font-semibold">Every capture keeps the details you need</h2></div>
                <div className="grid gap-3 rounded-2xl border border-slate-200 bg-white/65 p-5 shadow-sm backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/55 sm:grid-cols-2 sm:p-6 lg:grid-cols-4">
                    <div className="flex items-center gap-2 text-sm"><BookOpenText className="h-4 w-4 text-indigo-500" />Problem title</div>
                    <div className="flex items-center gap-2 text-sm"><ArrowRight className="h-4 w-4 text-indigo-500" />Direct link</div>
                    <div className="flex items-center gap-2 text-sm"><Tag className="h-4 w-4 text-indigo-500" />Difficulty</div>
                    <div className="flex items-center gap-2 text-sm"><ListChecks className="h-4 w-4 text-indigo-500" />Your notes</div>
                </div>
            </section>

            <section className="mb-8 grid gap-4 rounded-2xl border border-slate-200 bg-white/65 p-6 dark:border-slate-800 dark:bg-slate-950/55 sm:p-8 lg:grid-cols-[1fr_auto] lg:items-center">
                <div>
                    <div className="flex items-center gap-2 text-sm font-medium"><Chrome className="h-4 w-4 text-indigo-500" />Available now on the Chrome Web Store</div>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">Free to install, and works alongside your existing Insert sheets. Sign in with your Insert account to start saving.</p>
                </div>
                <Button asChild className="rounded-md"><a href={CHROME_EXTENSION_URL} target="_blank" rel="noopener noreferrer">Add to Chrome<ArrowRight className="ml-2 h-4 w-4" /></a></Button>
            </section>
        </div>
    </main>;
}
