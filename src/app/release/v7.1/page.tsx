import Link from "next/link";
import { ArrowLeft, ArrowRight, Check, LayoutDashboard, MessageSquareText, ShieldCheck, Sparkles } from "lucide-react";

import InsertNavbar from "@/components/InsertNavbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import DexPreview from "@/components/DexPreview";

const featureGroups = [
    { icon: LayoutDashboard, title: "Ask about your data", description: "Dex answers from your real Insert data, not guesses.", items: ["How many problems you have, by difficulty", "A full list of your topics, instantly", "Complete details and problems for any topic", "Fuzzy matching — no need for the exact topic name"] },
    { icon: MessageSquareText, title: "Ask about Insert", description: "Dex knows every feature, grounded in what's actually true.", items: ["What any feature does, from Projects to Pro", "Answers sourced from real product documentation", "Never invents capabilities or pricing that don't exist"] },
    { icon: ShieldCheck, title: "Built with guardrails", description: "Scoped deliberately, not left to guess its own limits.", items: ["Won't process or store sensitive personal or payment info", "Stays scoped to Insert — no general coding help or solutions", "Falls back automatically if a model has an issue mid-answer"] },
    { icon: Sparkles, title: "Available everywhere", description: "One assistant, wherever you're working.", items: ["A floating widget on every signed-in page", "Drag it to whichever corner suits you", "Remembers your conversation within a session", "Free for every signed-in user"] },
];

export default function ReleaseV71Page() {
    return <main className="relative min-h-screen overflow-hidden bg-slate-50 text-slate-950 dark:bg-[#020817] dark:text-slate-50">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-60 [background-image:linear-gradient(to_right,rgba(100,116,139,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(100,116,139,0.08)_1px,transparent_1px)] [background-size:48px_48px] [mask-image:linear-gradient(to_bottom,black,transparent_94%)]" />
        <div aria-hidden="true" className="pointer-events-none absolute left-[10%] top-40 h-96 w-96 rounded-full bg-emerald-500/10 blur-[140px]" />
        <div className="relative mx-auto w-full max-w-[1560px] px-4 py-5 sm:px-8 lg:px-12 lg:py-8">
            <InsertNavbar />
            <section className="grid gap-8 py-10 lg:grid-cols-[160px_minmax(0,1fr)] lg:py-16">
                <aside><Link href="/release" className="inline-flex items-center gap-2 text-xs text-slate-500 transition hover:text-indigo-500"><ArrowLeft className="h-3.5 w-3.5" />All releases</Link><p className="mt-8 font-mono text-4xl font-semibold tracking-tight">v7.1</p><p className="mt-2 text-xs text-slate-500">September 2026</p></aside>
                <div><div className="flex flex-wrap items-center gap-2"><Badge className="rounded-md">Latest release</Badge><Badge variant="outline" className="rounded-md border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">Minor update</Badge></div><h1 className="mt-6 max-w-5xl text-5xl font-semibold tracking-[-0.06em] sm:text-7xl">Say hello<br /><span className="text-slate-400">to Dex.</span></h1><p className="mt-6 max-w-3xl text-base leading-7 text-slate-600 dark:text-slate-400">Insert&apos;s first AI assistant is here. Ask Dex about your Topics and problems, or what any Insert feature does — right from a floating widget available on every page.</p><div className="mt-7 flex flex-wrap gap-2">{["Dex", "AI Assistant", "Topics Q&A", "Guardrails"].map((tag) => <Badge key={tag} variant="secondary" className="rounded-md">{tag}</Badge>)}</div></div>
            </section>

            <DexPreview variant="launch" />

            <section className="py-12 lg:py-16"><div className="grid gap-8 lg:grid-cols-[260px_minmax(0,1fr)]"><div><p className="text-[10px] uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400">What&apos;s new</p><h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em]">One assistant, added on top.</h2><p className="mt-3 text-sm leading-6 text-slate-500">Dex doesn&apos;t change how Insert works today — it adds a faster way to get answers about your work and the product itself.</p></div><div className="grid gap-3 md:grid-cols-2">{featureGroups.map(({ icon: Icon, title, description, items }) => <article key={title} className="rounded-2xl border border-slate-200 bg-white/65 p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950/55 sm:p-6"><span className="flex h-10 w-10 items-center justify-center rounded-md bg-emerald-500/10 text-emerald-500"><Icon className="h-5 w-5" /></span><h3 className="mt-5 text-xl font-semibold">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-500">{description}</p><ul className="mt-5 space-y-3 border-t border-slate-200 pt-5 text-sm dark:border-slate-800">{items.map((item) => <li key={item} className="flex items-start gap-2.5"><span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-emerald-500/10 text-emerald-500"><Check className="h-3 w-3" /></span><span className="leading-5 text-slate-600 dark:text-slate-300">{item}</span></li>)}</ul></article>)}</div></div></section>

            <section className="mb-8 overflow-hidden rounded-2xl border border-slate-200 bg-slate-950 p-6 text-white dark:border-slate-800 sm:p-8"><div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center"><div><div className="flex items-center gap-2 text-xs text-emerald-300"><Sparkles className="h-4 w-4" />Available now</div><h2 className="mt-3 text-3xl font-semibold tracking-tight">Try Dex for yourself.</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">Look for the floating button once you&apos;re signed in, or read more about what Dex can do.</p></div><div className="flex flex-wrap gap-2"><Button asChild variant="secondary" className="rounded-md"><Link href="/assistant">Meet Dex<ArrowRight className="ml-2 h-4 w-4" /></Link></Button><Button asChild variant="outline" className="rounded-md border-white/15 bg-white/5 text-white hover:bg-white/10"><Link href="/sign-up">Get started</Link></Button></div></div></section>
        </div>
    </main>
}
