import Link from "next/link";
import { ArrowRight, Bell, CalendarDays, FolderKanban, GitBranch, Sparkles } from "lucide-react";

import InsertNavbar from "@/components/InsertNavbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const releases = [
    { version: "v7.0", date: "August 2026", href: "/release/v7", title: "A modern Insert workspace", description: "A complete product UI refresh, Collection V2, redesigned project experiences, clearer profiles, and consistent collaboration and membership workspaces.", features: ["Collection V2", "Profile workspace", "Projects", "Modern UI"], icon: Sparkles, latest: true },
    { version: "v6.0", date: "June 2026", href: "/release/v6", title: "Collaboration & realtime notifications", description: "Role-based collaboration, actionable notifications, workspace switching, and cleaner access management.", features: ["Collaboration", "Notifications", "Roles"], icon: Bell, latest: false },
    { version: "v5.0", date: "March 2026", href: "/release/v5", title: "Workflow automation & editor enhancements", description: "Automation workflows, GitHub integration, editor improvements, and a stronger developer workspace.", features: ["Automation", "GitHub", "Editor"], icon: GitBranch, latest: false },
];

export default function ReleasePage() {
    return <main className="relative min-h-screen overflow-hidden bg-slate-50 text-slate-950 dark:bg-[#020817] dark:text-slate-50">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-60 [background-image:linear-gradient(to_right,rgba(100,116,139,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(100,116,139,0.08)_1px,transparent_1px)] [background-size:48px_48px] [mask-image:linear-gradient(to_bottom,black,transparent_92%)]" />
        <div aria-hidden="true" className="pointer-events-none absolute left-[8%] top-28 h-80 w-80 rounded-full bg-indigo-500/10 blur-[120px]" />
        <div aria-hidden="true" className="pointer-events-none absolute right-[8%] top-96 h-72 w-72 rounded-full bg-cyan-500/10 blur-[120px]" />
        <div className="relative mx-auto w-full max-w-[1560px] px-4 py-5 sm:px-8 lg:px-12 lg:py-8">
            <InsertNavbar />
            <section className="grid gap-8 border-b border-slate-200/80 py-10 dark:border-slate-800/80 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-end lg:py-16">
                <div><div className="flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-300"><Sparkles className="h-3.5 w-3.5" />Product updates</div><h1 className="mt-5 max-w-4xl text-5xl font-semibold tracking-[-0.06em] sm:text-7xl">Built in the open.<br /><span className="text-slate-400">Shipped with intent.</span></h1><p className="mt-5 max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-400">Follow the features, design improvements, and platform changes shaping Insert into a better developer workspace.</p></div>
                <div className="rounded-2xl border border-indigo-500/20 bg-slate-950 p-5 text-white shadow-xl"><p className="text-[10px] uppercase tracking-[0.18em] text-indigo-300">Latest release</p><div className="mt-3 flex items-end justify-between"><div><p className="text-4xl font-semibold">v7.0</p><p className="mt-1 text-sm text-slate-400">August 2026</p></div><Button asChild size="icon" className="rounded-md bg-white text-slate-950 hover:bg-slate-200"><Link href="/release/v7" aria-label="Read v7 release"><ArrowRight className="h-4 w-4" /></Link></Button></div></div>
            </section>

            <section className="py-8 lg:py-10"><div className="mb-5 flex items-end justify-between"><div><p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">Release history</p><h2 className="mt-1 text-2xl font-semibold">What we shipped</h2></div><Badge variant="outline" className="rounded-md">{releases.length} releases</Badge></div>
                <div className="space-y-3">{releases.map(({ version, date, href, title, description, features, icon: Icon, latest }, index) => <Link key={version} href={href} className="group grid gap-5 rounded-2xl border border-slate-200 bg-white/65 p-5 shadow-sm backdrop-blur-xl transition hover:-translate-y-0.5 hover:border-indigo-400/40 dark:border-slate-800 dark:bg-slate-950/55 sm:p-6 lg:grid-cols-[150px_minmax(0,1fr)_auto] lg:items-center"><div><div className="flex items-center gap-2"><span className="font-mono text-xl font-semibold">{version}</span>{latest && <Badge className="rounded-md text-[9px]">Latest</Badge>}</div><p className="mt-2 flex items-center gap-1.5 text-xs text-slate-500"><CalendarDays className="h-3.5 w-3.5" />{date}</p></div><div className="min-w-0"><div className="flex items-center gap-3"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-indigo-500/10 text-indigo-500"><Icon className="h-4 w-4" /></span><h3 className="text-xl font-semibold tracking-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-300">{title}</h3></div><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-500">{description}</p><div className="mt-4 flex flex-wrap gap-1.5">{features.map((feature) => <Badge key={feature} variant="secondary" className="rounded-md text-[10px]">{feature}</Badge>)}</div></div><ArrowRight className="h-5 w-5 text-slate-400 transition-transform group-hover:translate-x-1 group-hover:text-indigo-500" /></Link>)}</div>
            </section>

            <section className="mb-8 grid gap-4 rounded-2xl border border-slate-200 bg-white/65 p-6 dark:border-slate-800 dark:bg-slate-950/55 sm:p-8 lg:grid-cols-[1fr_auto] lg:items-center"><div><div className="flex items-center gap-2 text-sm font-medium"><FolderKanban className="h-4 w-4 text-indigo-500" />The workspace keeps evolving</div><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">Start building topics, blogs, collections, and project release journals with the latest Insert experience.</p></div><Button asChild className="rounded-md"><Link href="/sign-up">Get started free<ArrowRight className="ml-2 h-4 w-4" /></Link></Button></section>
        </div>
    </main>
}
