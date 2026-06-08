"use client";

import Link from "next/link";
import { ArrowRight, Bell, GitMerge, Users } from "lucide-react";
import { Button } from "../ui/button";
import InsertIcon from "../InsertIcon";

export function Hero() {
    return (
        <section className="relative mx-auto flex min-h-[92vh] w-full items-center overflow-hidden bg-background px-6 pt-20">

            {/* Grid */}
            <div
                className="pointer-events-none absolute inset-0"
                style={{
                    backgroundImage: [
                        "linear-gradient(hsl(var(--border) / 0.5) 0.5px, transparent 0.5px)",
                        "linear-gradient(90deg, hsl(var(--border) / 0.5) 0.5px, transparent 0.5px)",
                    ].join(", "),
                    backgroundSize: "48px 48px",
                }}
            />

            {/* Glow */}
            <div className="pointer-events-none absolute left-1/2 top-0 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-indigo-500/8 blur-[120px]" />

            <div className="grid lg:grid-cols-[65%_1fr] grid-cols-1 gap-5 relative z-10 w-full lg:px-20 px-10">

                {/* left section */}
                <div className="relative z-10 mx-auto w-full max-w-6xl">

                    {/* Release pill */}
                    <Link
                        href="/releases/v6-0"
                        className="mb-10 inline-flex items-center gap-2 rounded-full border border-border bg-muted/50 px-3 py-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
                    >
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        <span className="font-mono text-emerald-600 dark:text-emerald-400">v6.0</span>
                        <span className="opacity-40">·</span>
                        Collaboration & Realtime Notifications
                        <ArrowRight className="h-3 w-3" />
                    </Link>

                    {/* App identity + headline as one block */}
                    <div className="flex items-center gap-4 mb-6">
                        <InsertIcon
                            height={64}
                            width={64}
                            className="rounded-xl border border-border bg-muted p-2 shrink-0 bg-white"
                        />
                        <h1 className="text-[clamp(2.5rem,7vw,5rem)] font-bold leading-none tracking-[-0.02em] text-foreground">
                            Insert
                        </h1>
                    </div>

                    {/* Subheadline */}
                    <p className="max-w-2xl text-[clamp(1.25rem,2.5vw,1.75rem)] font-medium leading-snug tracking-[-0.02em] text-foreground/80">
                        A developer workspace for writing,<br className="hidden sm:block" />
                        collaborating, and shipping — all in one place.
                    </p>

                    {/* Body */}
                    <p className="mt-4 max-w-lg text-sm leading-relaxed text-muted-foreground">
                        Structured sheets, technical blogs, team collaboration with role-based access, and release-ready notes without splitting your workflow across tools.
                    </p>

                    {/* CTAs */}
                    <div className="mt-8 flex flex-wrap items-center gap-3">
                        <Link href="/sign-up">
                            <Button className="h-10 rounded-lg px-5 text-sm font-medium">
                                Get started free
                                <ArrowRight className="ml-2 h-3.5 w-3.5" />
                            </Button>
                        </Link>
                        <Link href="/releases">
                            <Button variant="outline" className="h-10 rounded-lg px-5 text-sm font-medium text-muted-foreground hover:text-foreground">
                                See what&apos;s new
                            </Button>
                        </Link>
                    </div>

                    {/* Stats */}
                    <div className="mt-14 flex flex-wrap gap-10 border-t border-border pt-8">
                        {[
                            { label: "Topics & Blogs", value: "Unified writing" },
                            { label: "Team access", value: "Role-based" },
                            { label: "Notifications", value: "Realtime" },
                            { label: "Release notes", value: "Automated" },
                        ].map((s) => (
                            <div key={s.label}>
                                <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground/50">
                                    {s.label}
                                </p>
                                <p className="mt-1 text-sm font-medium text-foreground">
                                    {s.value}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* right section */}
                <div className="flex flex-col gap-3">

                    {/* Collaboration card */}
                    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                        <div className="mb-4 flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500/10 dark:bg-indigo-500/15">
                                    <Users className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                                </div>
                                <span className="text-sm font-medium text-card-foreground">Collaboration</span>
                            </div>
                            <span className="rounded-full bg-indigo-500/10 px-2 py-0.5 font-mono text-[10px] text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400">
                                new
                            </span>
                        </div>
                        <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
                            Invite editors and viewers to your Topics and Blogs. Manage roles and permissions without sharing ownership.
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {["Invite", "Editor access", "Viewer access", "Role updates"].map((t) => (
                                <span
                                    key={t}
                                    className="rounded-md border border-border bg-muted px-2.5 py-1 text-[11px] text-muted-foreground"
                                >
                                    {t}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Notifications card */}
                    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                        <div className="mb-4 flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-500/10 dark:bg-sky-500/15">
                                    <Bell className="h-3.5 w-3.5 text-sky-600 dark:text-sky-400" />
                                </div>
                                <span className="text-sm font-medium text-card-foreground">Realtime Notifications</span>
                            </div>
                            <span className="rounded-full bg-sky-500/10 px-2 py-0.5 font-mono text-[10px] text-sky-600 dark:bg-sky-500/15 dark:text-sky-400">
                                live
                            </span>
                        </div>
                        <p className="text-sm leading-relaxed text-muted-foreground">
                            In-app notifications with popup delivery, dismiss, and action support — accept or decline collaboration requests right from the notification.
                        </p>
                    </div>

                    {/* Workspace switcher card */}
                    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                        <div className="mb-3 flex items-center gap-2.5">
                            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 dark:bg-emerald-500/15">
                                <GitMerge className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <span className="text-sm font-medium text-card-foreground">Workspace Switching</span>
                        </div>
                        <div className="flex items-center gap-2">
                            {["Topic switcher", "Blog switcher"].map((label, i) => (
                                <div
                                    key={label}
                                    className={`flex-1 rounded-xl border px-3 py-2.5 text-center text-xs font-medium transition-colors ${i === 0
                                        ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:border-emerald-500/25 dark:bg-emerald-500/10 dark:text-emerald-400"
                                        : "border-red-500/30 bg-red-500/10 text-red-700 dark:border-red-500/25 dark:bg-red-500/10 dark:text-red-400"
                                        }`}
                                >
                                    {label}
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </div>





        </section>
    );
}