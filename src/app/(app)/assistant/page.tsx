import type { Metadata } from "next";
import Link from "next/link";
import {
    ArrowRight,
    BadgeCheck,
    BookOpenText,
    Eye,
    FolderKanban,
    GitBranch,
    History,
    LayoutDashboard,
    LogIn,
    MessageSquareText,
    MousePointerClick,
    PenLine,
    ShieldCheck,
    Sparkles,
    TableProperties,
} from "lucide-react";

import AssistantInfoCard from "@/components/AssistantInfoCard";
import InsertNavbar from "@/components/InsertNavbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
    title: "Dex, your Insert assistant | Insert",
    description: "Meet Dex, Insert's built-in assistant. Ask about your topics and problems, or what any Insert feature does, from a floating widget on every page.",
};

const features = [
    { title: "Ask about your data", description: "How many hard problems do you have, what's in a topic — Dex answers from your real Insert data.", icon: LayoutDashboard },
    { title: "Ask about Insert itself", description: "What does Projects do, how does Pro work — Dex knows every feature, and only states what's true.", icon: MessageSquareText },
    { title: "Remembers the conversation", description: "Ask a follow-up without repeating yourself — Dex keeps context within your session.", icon: History },
    { title: "Never guesses", description: "If Dex isn't sure about something, it says so instead of making something up.", icon: ShieldCheck },
    { title: "Read-only, for now", description: "Dex can't create topics, add problems, or edit anything on your behalf yet — it only answers questions.", icon: Eye },
];

const steps = [
    { title: "Sign in to Insert", description: "Dex is available to every signed-in user, included free.", icon: LogIn },
    { title: "Click the Dex button", description: "Look for the floating button in the bottom-left corner of any page.", icon: MousePointerClick },
    { title: "Ask anything", description: "Type a question, or pick one of the suggested ones to get started.", icon: Sparkles },
];

const availableNow = [
    { label: "Your Topics and problems", icon: LayoutDashboard },
    { label: "Problem stats and difficulty breakdowns", icon: TableProperties },
    { label: "What Insert, and each feature, does", icon: MessageSquareText },
];
const comingSoon = [
    { label: "Creating and editing topics or problems", icon: PenLine },
    { label: "Blogs", icon: BookOpenText },
    { label: "Collections", icon: FolderKanban },
    { label: "Projects", icon: GitBranch },
];

export default function AssistantPage() {
    return <main className="relative min-h-screen overflow-hidden bg-slate-50 text-slate-950 dark:bg-[#020817] dark:text-slate-50">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-60 [background-image:linear-gradient(to_right,rgba(100,116,139,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(100,116,139,0.08)_1px,transparent_1px)] [background-size:48px_48px] [mask-image:linear-gradient(to_bottom,black,transparent_92%)]" />
        <div aria-hidden="true" className="pointer-events-none absolute left-[8%] top-28 h-80 w-80 rounded-full bg-indigo-500/10 blur-[120px]" />
        <div aria-hidden="true" className="pointer-events-none absolute right-[8%] top-96 h-72 w-72 rounded-full bg-purple-500/10 blur-[120px]" />
        <div className="relative mx-auto w-full max-w-[1560px] px-4 py-5 sm:px-8 lg:px-12 lg:py-8">
            <InsertNavbar />

            <section className="grid gap-8 border-b border-slate-200/80 py-10 dark:border-slate-800/80 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-end lg:py-16">
                <div>
                    <div className="flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-300"><Sparkles className="h-3.5 w-3.5" />Meet Dex</div>
                    <h1 className="mt-5 max-w-4xl text-5xl font-semibold tracking-[-0.06em] sm:text-7xl">Meet Dex.<br /><span className="text-slate-400">Insert&apos;s built-in assistant.</span></h1>
                    <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-400">Dex is Insert&apos;s built-in assistant. Ask about your Topics and problems, or what any Insert feature does — right from a floating widget available on every page, once you&apos;re signed in.</p>
                    <div className="mt-7 flex flex-wrap items-center gap-3">
                        <Button asChild size="lg" className="rounded-md"><Link href="/posts/topic"><Sparkles className="mr-2 h-4 w-4" />Try Dex now</Link></Button>
                        <Button asChild variant="outline" size="lg" className="rounded-md"><Link href="/sign-up">Create your workspace<ArrowRight className="ml-2 h-4 w-4" /></Link></Button>
                    </div>
                </div>
                <AssistantInfoCard />
            </section>

            <section className="py-8 lg:py-10">
                <div className="mb-5"><p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">What Dex does</p><h2 className="mt-1 text-2xl font-semibold">One assistant, your whole workspace</h2></div>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    {features.map(({ title, description, icon: Icon }) => <div key={title} className="rounded-2xl border border-slate-200 bg-white/65 p-5 shadow-sm backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/55">
                        <span className="flex h-9 w-9 items-center justify-center rounded-md bg-indigo-500/10 text-indigo-500"><Icon className="h-4 w-4" /></span>
                        <h3 className="mt-4 text-sm font-semibold">{title}</h3>
                        <p className="mt-2 text-xs leading-5 text-slate-500">{description}</p>
                    </div>)}
                </div>
            </section>

            <section className="py-8 lg:py-10">
                <div className="mb-5"><p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">Roadmap</p><h2 className="mt-1 text-2xl font-semibold">Growing module by module</h2></div>
                <div className="grid overflow-hidden rounded-2xl border border-slate-200 bg-white/65 shadow-sm backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/55 sm:grid-cols-2">
                    <div className="border-b border-slate-200 p-6 dark:border-slate-800 sm:border-b-0 sm:border-r">
                        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-emerald-600 dark:text-emerald-400"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />Available now</div>
                        <ul className="mt-4 space-y-3">
                            {availableNow.map(({ label, icon: Icon }) => (
                                <li key={label} className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-300">
                                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-emerald-500/10 text-emerald-500"><Icon className="h-3.5 w-3.5" /></span>
                                    {label}
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="p-6">
                        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-400"><span className="h-1.5 w-1.5 rounded-full bg-slate-400" />Coming soon</div>
                        <ul className="mt-4 space-y-3">
                            {comingSoon.map(({ label, icon: Icon }) => (
                                <li key={label} className="flex items-center gap-3 text-sm text-slate-500">
                                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-dashed border-slate-300 text-slate-400 dark:border-slate-700"><Icon className="h-3.5 w-3.5" /></span>
                                    {label}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </section>

            <section className="py-8 lg:py-10">
                <div className="mb-5"><p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">Getting started</p><h2 className="mt-1 text-2xl font-semibold">Three steps to your first answer</h2></div>
                <div className="grid gap-3 lg:grid-cols-3">
                    {steps.map(({ title, description, icon: Icon }, index) => <div key={title} className="rounded-2xl border border-slate-200 bg-white/65 p-5 shadow-sm backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/55">
                        <div className="flex items-center gap-3"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-indigo-500/10 text-indigo-500"><Icon className="h-4 w-4" /></span><Badge variant="secondary" className="rounded-md text-[10px]">Step {index + 1}</Badge></div>
                        <h3 className="mt-4 text-sm font-semibold">{title}</h3>
                        <p className="mt-2 text-xs leading-5 text-slate-500">{description}</p>
                    </div>)}
                </div>
            </section>

            <section className="mb-8 grid gap-4 rounded-2xl border border-slate-200 bg-white/65 p-6 dark:border-slate-800 dark:bg-slate-950/55 sm:p-8 lg:grid-cols-[1fr_auto] lg:items-center">
                <div>
                    <div className="flex items-center gap-2 text-sm font-medium"><BadgeCheck className="h-4 w-4 text-indigo-500" />Included free for every signed-in user</div>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">No extra setup, no separate install — Dex is already there the moment you sign in.</p>
                </div>
                <Button asChild className="rounded-md"><Link href="/posts/topic">Try Dex now<ArrowRight className="ml-2 h-4 w-4" /></Link></Button>
            </section>
        </div>
    </main>;
}
