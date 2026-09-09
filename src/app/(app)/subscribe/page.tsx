"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
    ArrowRight,
    BadgeCheck,
    BookOpenText,
    Check,
    Crown,
    FolderGit2,
    Layers3,
    ShieldCheck,
    Sparkles,
    Users,
    Zap,
} from "lucide-react";

import { Footer } from "@/components/landing/Footer";
import { Navbar } from "@/components/landing/Navbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const proFeatures = [
    { icon: Layers3, title: "Unlimited topic sheets", description: "Build structured problem sets without workspace limits." },
    { icon: BookOpenText, title: "Unlimited technical writing", description: "Create, organize, and publish technical blogs." },
    { icon: FolderGit2, title: "Projects and release journals", description: "Connect GitHub work and turn changes into clear releases." },
    { icon: Users, title: "Collaboration workspace", description: "Manage editor and viewer access from one focused place." },
];

const included = [
    "Topic and blog collections",
    "Public and private publishing",
    "Collection V2 workspaces",
    "Realtime notifications",
    "Early access to new capabilities",
    "Verified Pro profile badge",
];

type BillingPeriod = "monthly" | "yearly";

const monthlyPrice = 11;
const yearlyPrice = 99;

export default function SubscribePage() {
    const [billing, setBilling] = useState<BillingPeriod>("yearly");
    const discountPercent = useMemo(() => Math.round((1 - yearlyPrice / (monthlyPrice * 12)) * 100), []);
    const displayPrice = billing === "monthly" ? monthlyPrice : yearlyPrice;
    const unit = billing === "monthly" ? "/month" : "/year";
    const subtext = billing === "monthly" ? "Billed monthly. Cancel anytime." : `Save ${discountPercent}% compared with monthly billing.`;

    return (
        <main className="min-h-screen overflow-hidden bg-slate-50 text-slate-950 dark:bg-[#020817] dark:text-white">
            <Navbar />
            <section className="relative border-b border-slate-200 pt-32 dark:border-slate-800 sm:pt-36">
                <div aria-hidden="true" className="absolute inset-0 opacity-70 [background-image:linear-gradient(to_right,rgba(100,116,139,0.09)_1px,transparent_1px),linear-gradient(to_bottom,rgba(100,116,139,0.09)_1px,transparent_1px)] [background-size:48px_48px] [mask-image:linear-gradient(to_bottom,black,transparent)]" />
                <div aria-hidden="true" className="absolute left-1/2 top-12 h-80 w-[44rem] -translate-x-1/2 rounded-full bg-indigo-500/15 blur-[120px]" />
                <div className="relative mx-auto max-w-[1560px] px-5 pb-16 sm:px-8 lg:px-12 lg:pb-24">
                    <div className="mx-auto max-w-4xl text-center">
                        <Badge variant="outline" className="rounded-md border-indigo-500/25 bg-indigo-500/[0.08] px-3 py-1 text-indigo-600 dark:text-indigo-300">
                            <Sparkles className="mr-1.5 h-3.5 w-3.5" /> Insert membership
                        </Badge>
                        <h1 className="mt-6 text-5xl font-semibold tracking-[-0.06em] sm:text-6xl lg:text-7xl">
                            More room for your<br /><span className="text-slate-400">developer workflow.</span>
                        </h1>
                        <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-400 sm:text-lg">
                            Create without limits across topics, blogs, collections, projects, and releases. One membership unlocks Pro everywhere in Insert.
                        </p>
                    </div>

                    <div className="mx-auto mt-12 grid max-w-6xl overflow-hidden rounded-xl border border-slate-200 bg-white/70 shadow-[0_30px_100px_-55px_rgba(79,70,229,0.65)] backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/65 lg:grid-cols-[0.9fr_1.1fr]">
                        <div className="flex flex-col border-b border-slate-200 p-6 dark:border-slate-800 sm:p-8 lg:border-b-0 lg:border-r">
                            <div className="flex items-center justify-between gap-4">
                                <span className="flex h-11 w-11 items-center justify-center rounded-md bg-slate-100 text-slate-500 dark:bg-slate-900"><Zap className="h-5 w-5" /></span>
                                <Badge variant="secondary" className="rounded-md">Free forever</Badge>
                            </div>
                            <p className="mt-8 text-sm font-medium">Insert Free</p>
                            <div className="mt-2 flex items-end gap-2"><span className="text-5xl font-semibold tracking-[-0.05em]">₹0</span><span className="pb-1 text-sm text-slate-500">forever</span></div>
                            <p className="mt-4 max-w-md text-sm leading-6 text-slate-500">The essentials for exploring Insert and publishing your first developer resources.</p>
                            <ul className="mt-7 space-y-3 text-sm">
                                {["Core topic workspace", "Technical blog editor", "Public publishing", "Community access"].map((item) => <li key={item} className="flex items-center gap-2.5"><Check className="h-4 w-4 text-slate-400" />{item}</li>)}
                            </ul>
                            <Button asChild variant="outline" className="mt-9 rounded-md lg:mt-auto"><Link href="/sign-up">Start with Free</Link></Button>
                        </div>

                        <div className="relative p-6 sm:p-8">
                            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-indigo-500 via-violet-500 to-cyan-400" />
                            <div className="flex flex-wrap items-start justify-between gap-4">
                                <div>
                                    <div className="flex items-center gap-2"><span className="flex h-11 w-11 items-center justify-center rounded-md bg-indigo-500/10 text-indigo-500"><Crown className="h-5 w-5" /></span><Badge className="rounded-md bg-indigo-600 text-white">Recommended</Badge></div>
                                    <p className="mt-7 text-sm font-medium text-indigo-600 dark:text-indigo-300">Insert Pro</p>
                                    <div className="mt-2 flex items-end gap-2"><span className="text-5xl font-semibold tracking-[-0.05em]">₹{displayPrice}</span><span className="pb-1 text-sm text-slate-500">{unit}</span></div>
                                    <p className="mt-2 text-sm text-slate-500">{subtext}</p>
                                </div>
                                <Button asChild className="rounded-md bg-indigo-600 text-white hover:bg-indigo-500"><Link href="/sign-in?callbackUrl=%2Fsubscribe">Sign in to upgrade <ArrowRight className="ml-2 h-4 w-4" /></Link></Button>
                            </div>
                            <div className="mt-6 inline-grid grid-cols-2 rounded-md border border-slate-200 bg-slate-100/70 p-1 dark:border-slate-800 dark:bg-slate-900/70">
                                <Button type="button" size="sm" variant={billing === "monthly" ? "default" : "ghost"} className="rounded-md" onClick={() => setBilling("monthly")}>Monthly</Button>
                                <Button type="button" size="sm" variant={billing === "yearly" ? "default" : "ghost"} className="rounded-md" onClick={() => setBilling("yearly")}>Yearly <span className="ml-1 text-[10px] opacity-70">Save {discountPercent}%</span></Button>
                            </div>
                            <div className="mt-8 grid gap-3 sm:grid-cols-2">
                                {included.map((item) => <div key={item} className="flex items-center gap-2.5 rounded-md border border-slate-200 bg-slate-50/70 px-3 py-3 text-sm dark:border-slate-800 dark:bg-slate-900/55"><BadgeCheck className="h-4 w-4 shrink-0 text-emerald-500" />{item}</div>)}
                            </div>
                            <div className="mt-6 flex items-center gap-2 text-xs text-slate-500"><ShieldCheck className="h-4 w-4 text-indigo-500" />Secure checkout through Razorpay. Cancel at the end of any billing period.</div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="mx-auto max-w-[1560px] px-5 py-20 sm:px-8 lg:px-12 lg:py-28">
                <div className="grid gap-10 lg:grid-cols-[0.72fr_1.28fr] lg:items-start">
                    <div className="max-w-xl lg:sticky lg:top-28">
                        <p className="text-xs font-medium uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-300">Everything stays connected</p>
                        <h2 className="mt-4 text-4xl font-semibold tracking-[-0.05em] sm:text-5xl">Pro follows your work, not a single feature.</h2>
                        <p className="mt-5 text-sm leading-7 text-slate-600 dark:text-slate-400">Move naturally from a coding sheet to a technical explanation, group it in a typed collection, and document the release—all inside the same workspace.</p>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                        {proFeatures.map(({ icon: Icon, title, description }) => <article key={title} className="rounded-xl border border-slate-200 bg-white/65 p-5 transition hover:-translate-y-0.5 hover:border-indigo-500/30 dark:border-slate-800 dark:bg-slate-950/55"><span className="flex h-10 w-10 items-center justify-center rounded-md bg-indigo-500/10 text-indigo-500"><Icon className="h-4 w-4" /></span><h3 className="mt-5 font-medium">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-500">{description}</p></article>)}
                    </div>
                </div>
            </section>
            <Footer />
        </main>
    );
}
