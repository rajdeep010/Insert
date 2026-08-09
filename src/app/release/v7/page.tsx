import Link from "next/link";
import { ArrowLeft, ArrowRight, Check, FolderKanban, FolderOpen, LayoutDashboard, PanelsTopLeft, Sparkles, Users } from "lucide-react";

import InsertNavbar from "@/components/InsertNavbar";
import { ScreenshotGallery, type ReleaseScreenshot } from "@/components/release/ReleaseGallery";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const screenshots: ReleaseScreenshot[] = [
    { title: "Profile overview", description: "A wider personal workspace with clearer activity, topics, and profile context.", image: "https://res.cloudinary.com/dgxeg3sju/image/upload/v1786237523/4468230f-24b7-46de-9953-73cd42b7f70b.png" },
    { title: "Projects workspace", description: "Modern repository cards, release metadata, search, and GitHub-powered workflows.", image: "https://res.cloudinary.com/dgxeg3sju/image/upload/v1786237602/82e0c97f-337d-4907-a629-1135d2f3e4d1.png" },
    { title: "Collection V2", description: "Topic-only and blog-only collections with visibility and type made immediately clear.", image: "https://res.cloudinary.com/dgxeg3sju/image/upload/v1786238057/097fa55b-832f-4097-8833-9b6c1a9f55de.png" },
    { title: "Collection workspace", description: "Accordion-based sheets and focused collection management for structured learning.", image: "https://res.cloudinary.com/dgxeg3sju/image/upload/v1786238122/27d23293-aff5-4c4b-96d5-2319562302ce.png" },
];

const featureGroups = [
    { icon: LayoutDashboard, title: "A cohesive workspace", description: "Profile and discovery surfaces now share one design language.", items: ["Redesigned Overview, Topics, Blogs, Projects, and Membership tabs", "A wider responsive profile workspace with a modern identity rail", "Updated loading skeletons that match final content geometry", "A new shadcn Navigation Menu across application pages"] },
    { icon: FolderKanban, title: "Collection V2", description: "Collections now support distinct content types without breaking the original flow.", items: ["Create BLOG-only or TOPIC-only collections", "Public/private visibility and content-type badges", "Dedicated collection screens with accordion-based sheets", "AG Grid topic rows with focused source and action columns"] },
    { icon: PanelsTopLeft, title: "Projects & releases", description: "Project discovery and reading are faster and more focused.", items: ["Modern project directory and project-detail workspace", "Responsive release cards with repository metadata", "Full-screen release reader with no horizontal overflow", "Improved rich-content wrapping for code, tables, images, and text"] },
    { icon: Users, title: "Collaboration & polish", description: "Shared work and account surfaces now feel part of the same product.", items: ["Modern collaboration workspace with access and invite summaries", "Redesigned Pro membership and billing experience", "Consistent responsive empty, loading, and error states", "Compact rounded-md controls and clearer visual hierarchy"] },
];

export default function ReleaseV7Page() {
    return <main className="relative min-h-screen overflow-hidden bg-slate-50 text-slate-950 dark:bg-[#020817] dark:text-slate-50">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-60 [background-image:linear-gradient(to_right,rgba(100,116,139,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(100,116,139,0.08)_1px,transparent_1px)] [background-size:48px_48px] [mask-image:linear-gradient(to_bottom,black,transparent_94%)]" />
        <div aria-hidden="true" className="pointer-events-none absolute left-[10%] top-40 h-96 w-96 rounded-full bg-indigo-500/10 blur-[140px]" />
        <div className="relative mx-auto w-full max-w-[1560px] px-4 py-5 sm:px-8 lg:px-12 lg:py-8">
            <InsertNavbar />
            <section className="grid gap-8 py-10 lg:grid-cols-[160px_minmax(0,1fr)] lg:py-16">
                <aside><Link href="/release" className="inline-flex items-center gap-2 text-xs text-slate-500 transition hover:text-indigo-500"><ArrowLeft className="h-3.5 w-3.5" />All releases</Link><p className="mt-8 font-mono text-4xl font-semibold tracking-tight">v7.0</p><p className="mt-2 text-xs text-slate-500">August 2026</p></aside>
                <div><div className="flex flex-wrap items-center gap-2"><Badge className="rounded-md">Latest release</Badge><Badge variant="outline" className="rounded-md">Major update</Badge></div><h1 className="mt-6 max-w-5xl text-5xl font-semibold tracking-[-0.06em] sm:text-7xl">The workspace,<br /><span className="text-slate-400">reconsidered.</span></h1><p className="mt-6 max-w-3xl text-base leading-7 text-slate-600 dark:text-slate-400">v7 brings Insert’s core experiences into one cohesive system—from the profile overview to typed collections, project release journals, collaboration, and membership.</p><div className="mt-7 flex flex-wrap gap-2">{["Collection V2", "Projects", "Profiles", "Navigation", "Collaboration", "Membership"].map((tag) => <Badge key={tag} variant="secondary" className="rounded-md">{tag}</Badge>)}</div></div>
            </section>

            <ScreenshotGallery screenshots={screenshots} />

            <section className="py-12 lg:py-16"><div className="grid gap-8 lg:grid-cols-[260px_minmax(0,1fr)]"><div><p className="text-[10px] uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-300">What changed</p><h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em]">A release across the whole product.</h2><p className="mt-3 text-sm leading-6 text-slate-500">The goal was not isolated polish. It was a more coherent way to move between creating, organizing, sharing, and reading.</p></div><div className="grid gap-3 md:grid-cols-2">{featureGroups.map(({ icon: Icon, title, description, items }) => <article key={title} className="rounded-2xl border border-slate-200 bg-white/65 p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950/55 sm:p-6"><span className="flex h-10 w-10 items-center justify-center rounded-md bg-indigo-500/10 text-indigo-500"><Icon className="h-5 w-5" /></span><h3 className="mt-5 text-xl font-semibold">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-500">{description}</p><ul className="mt-5 space-y-3 border-t border-slate-200 pt-5 text-sm dark:border-slate-800">{items.map((item) => <li key={item} className="flex items-start gap-2.5"><span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-emerald-500/10 text-emerald-500"><Check className="h-3 w-3" /></span><span className="leading-5 text-slate-600 dark:text-slate-300">{item}</span></li>)}</ul></article>)}</div></div></section>

            <section className="mb-8 overflow-hidden rounded-2xl border border-slate-200 bg-slate-950 p-6 text-white dark:border-slate-800 sm:p-8"><div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center"><div><div className="flex items-center gap-2 text-xs text-indigo-300"><Sparkles className="h-4 w-4" />Available now</div><h2 className="mt-3 text-3xl font-semibold tracking-tight">Explore the new Insert workspace.</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">Build a topic, publish a blog, organize a collection, or connect a project repository.</p></div><div className="flex flex-wrap gap-2"><Button asChild variant="secondary" className="rounded-md"><Link href="/sign-up">Get started<ArrowRight className="ml-2 h-4 w-4" /></Link></Button><Button asChild variant="outline" className="rounded-md border-white/15 bg-white/5 text-white hover:bg-white/10"><Link href="/posts/collections"><FolderOpen className="mr-2 h-4 w-4" />Browse collections</Link></Button></div></div></section>
        </div>
    </main>
}
