import Link from "next/link";
import { ArrowRight, Check, MessageSquareText, Sparkles, TableProperties } from "lucide-react";

import AssistantInfoCard from "@/components/AssistantInfoCard";
import { Button } from "@/components/ui/button";

const points = [
    { icon: MessageSquareText, text: "Ask about your topics, problems, and stats in plain English" },
    { icon: TableProperties, text: "Get instant answers about any Insert feature, from Projects to Pro" },
    { icon: Sparkles, text: "Remembers your conversation, so follow-up questions just work" },
];

const comingSoon = ["Creating & editing", "Blogs", "Collections", "Projects"];

export function Assistant() {
    return <section id="assistant" className="relative scroll-mt-24 overflow-hidden bg-white py-16 dark:bg-[#030a18] sm:py-24">
        <div className="relative mx-auto max-w-[1560px] px-4 sm:px-8 lg:px-12">
            <div className="grid gap-12 lg:grid-cols-[minmax(320px,0.9fr)_minmax(0,1.1fr)] lg:items-center">
                <div className="relative order-2 lg:order-1"><div className="absolute -inset-8 rounded-full bg-indigo-500/10 blur-3xl" /><AssistantInfoCard className="relative" /></div>
                <div className="order-1 lg:order-2">
                    <p className="flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-300"><Sparkles className="h-3.5 w-3.5" />Meet Dex</p>
                    <h2 className="mt-4 max-w-4xl text-4xl font-semibold tracking-[-0.05em] sm:text-6xl">Meet Dex.<br /><span className="text-slate-400">Insert&apos;s built-in AI assistant.</span></h2>
                    {/* <p className="mt-4 max-w-xl text-sm leading-6 text-slate-500">Dex is Insert&apos;s built-in AI assistant — ask about your Topics and problems, or what any Insert feature does, right from a floating widget available on every page. Dex answers questions today; it can&apos;t create or edit anything on your behalf yet.</p> */}
                    <ul className="mt-6 space-y-3">{points.map(({ icon: Icon, text }) => <li key={text} className="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-300"><span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-indigo-500/10 text-indigo-500"><Icon className="h-3.5 w-3.5" /></span>{text}</li>)}</ul>
                    <div className="mt-5 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                        <span className="font-medium uppercase tracking-wide text-slate-400">Coming soon</span>
                        {comingSoon.map((item) => <span key={item} className="rounded-full border border-dashed border-slate-300 px-2.5 py-1 dark:border-slate-700">{item}</span>)}
                    </div>
                    <div className="mt-8 flex flex-wrap gap-3">
                        <Button asChild size="lg" className="rounded-md"><Link href="/assistant"><Sparkles className="h-4 w-4" /> Meet Dex<ArrowRight className="ml-2 h-4 w-4" /></Link></Button>
                        {/* <Button asChild size="lg" variant="outline" className="rounded-md"><Link href="/sign-up">Create your workspace</Link></Button> */}
                    </div>
                    <div className="mt-6 flex items-center gap-1.5 text-xs text-slate-500"><Check className="h-3.5 w-3.5 text-emerald-500" />Included free for every signed-in user</div>
                </div>
            </div>
        </div>
    </section>;
}
