import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ArrowLeft, ArrowRight, Check, Sparkles } from "lucide-react";

import InsertNavbar from "@/components/InsertNavbar";
import { ScreenshotGallery, type ReleaseScreenshot } from "@/components/release/ReleaseGallery";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export type ReleaseStory = {
    version: string;
    date: string;
    title: string;
    accentTitle: string;
    description: string;
    tags: string[];
    screenshots: ReleaseScreenshot[];
    sections: Array<{ icon: LucideIcon; title: string; description: string; items: string[] }>;
    next?: { label: string; href: string };
};

export function ReleaseStoryPage({ story }: { story: ReleaseStory }) {
    return <main className="relative min-h-screen overflow-hidden bg-slate-50 text-slate-950 dark:bg-[#020817] dark:text-slate-50">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-60 [background-image:linear-gradient(to_right,rgba(100,116,139,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(100,116,139,0.08)_1px,transparent_1px)] [background-size:48px_48px] [mask-image:linear-gradient(to_bottom,black,transparent_94%)]" />
        <div aria-hidden="true" className="pointer-events-none absolute left-[10%] top-40 h-96 w-96 rounded-full bg-violet-500/10 blur-[140px]" />
        <div className="relative mx-auto w-full max-w-[1560px] px-4 py-5 sm:px-8 lg:px-12 lg:py-8">
            <InsertNavbar />
            <section className="grid gap-8 py-10 lg:grid-cols-[160px_minmax(0,1fr)] lg:py-16"><aside><Link href="/release" className="inline-flex items-center gap-2 text-xs text-slate-500 transition hover:text-indigo-500"><ArrowLeft className="h-3.5 w-3.5" />All releases</Link><p className="mt-8 font-mono text-4xl font-semibold tracking-tight">{story.version}</p><p className="mt-2 text-xs text-slate-500">{story.date}</p></aside><div><div className="flex flex-wrap gap-2"><Badge className="rounded-md">Major release</Badge><Badge variant="outline" className="rounded-md">Release archive</Badge></div><h1 className="mt-6 max-w-5xl text-5xl font-semibold tracking-[-0.06em] sm:text-7xl">{story.title}<br /><span className="text-slate-400">{story.accentTitle}</span></h1><p className="mt-6 max-w-3xl text-base leading-7 text-slate-600 dark:text-slate-400">{story.description}</p><div className="mt-7 flex flex-wrap gap-2">{story.tags.map((tag) => <Badge key={tag} variant="secondary" className="rounded-md">{tag}</Badge>)}</div></div></section>
            <ScreenshotGallery screenshots={story.screenshots} />
            <section className="py-12 lg:py-16"><div className="grid gap-8 lg:grid-cols-[260px_minmax(0,1fr)]"><div><p className="text-[10px] uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-300">Inside {story.version}</p><h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em]">What shipped in this release.</h2><p className="mt-3 text-sm leading-6 text-slate-500">A closer look at the product capabilities introduced with this version of Insert.</p></div><div className="grid gap-3 md:grid-cols-2">{story.sections.map(({ icon: Icon, title, description, items }) => <article key={title} className="rounded-2xl border border-slate-200 bg-white/65 p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950/55 sm:p-6"><span className="flex h-10 w-10 items-center justify-center rounded-md bg-indigo-500/10 text-indigo-500"><Icon className="h-5 w-5" /></span><h3 className="mt-5 text-xl font-semibold">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-500">{description}</p><ul className="mt-5 space-y-3 border-t border-slate-200 pt-5 text-sm dark:border-slate-800">{items.map((item) => <li key={item} className="flex items-start gap-2.5"><span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-emerald-500/10 text-emerald-500"><Check className="h-3 w-3" /></span><span className="leading-5 text-slate-600 dark:text-slate-300">{item}</span></li>)}</ul></article>)}</div></div></section>
            <section className="mb-8 flex flex-col gap-5 rounded-2xl border border-slate-200 bg-slate-950 p-6 text-white dark:border-slate-800 sm:p-8 lg:flex-row lg:items-center lg:justify-between"><div><p className="flex items-center gap-2 text-xs text-indigo-300"><Sparkles className="h-4 w-4" />Continue the story</p><h2 className="mt-2 text-2xl font-semibold">See what Insert shipped next.</h2></div><div className="flex gap-2"><Button asChild variant="outline" className="rounded-md border-white/15 bg-white/5 text-white hover:bg-white/10"><Link href="/release"><ArrowLeft className="mr-2 h-4 w-4" />Release history</Link></Button>{story.next && <Button asChild variant="secondary" className="rounded-md"><Link href={story.next.href}>{story.next.label}<ArrowRight className="ml-2 h-4 w-4" /></Link></Button>}</div></section>
        </div>
    </main>;
}
