"use client";

import Image from "next/image";
import Link from "next/link";
import {
    PenTool,
    FileText,
    Settings2,
    GitBranch,
    Boxes,
    BookMarked,
    Eye,
    Zap,
    CreditCard,
    BadgeCheck,
    Users,
    Bell,
    GitMerge,
    ArrowRight,
    ArrowUpRight
} from "lucide-react";

type Bullet = {
    icon: React.ElementType;
    title: string;
    desc: string;
};

function BulletItem({ icon: Icon, title, desc }: Bullet) {
    return (
        <div className="flex items-start gap-3">
            <div className="mt-0.5 inline-flex h-8 w-8 flex-none items-center justify-center rounded-lg border border-border bg-background text-foreground shadow-sm">
                <Icon className="h-4 w-4 text-muted-foreground" />
            </div>
            <div>
                <p className="text-sm font-semibold text-foreground">{title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
            </div>
        </div>
    );
}

function FeatureGridCard({
    eyebrow,
    title,
    desc,
    bullets,
    image,
    imageAlt,
    className = "",
    imageClassName = "",
    accentColor = "violet",
}: {
    eyebrow: string;
    title: string;
    desc: string;
    bullets: Bullet[];
    image?: string;
    imageAlt?: string;
    className?: string;
    imageClassName?: string;
    accentColor?: "violet" | "sky" | "emerald" | "amber" | "rose" | "indigo";
}) {
    const accents = {
        violet: "border-violet-500/15 bg-violet-500/[0.02] dark:border-violet-500/10 dark:bg-violet-500/[0.02] text-violet-600 dark:text-violet-400",
        sky: "border-sky-500/15 bg-sky-500/[0.02] dark:border-sky-500/10 dark:bg-sky-500/[0.02] text-sky-600 dark:text-sky-400",
        emerald: "border-emerald-500/15 bg-emerald-500/[0.02] dark:border-emerald-500/10 dark:bg-emerald-500/[0.02] text-emerald-600 dark:text-emerald-400",
        amber: "border-amber-500/15 bg-amber-500/[0.02] dark:border-amber-500/10 dark:bg-amber-500/[0.02] text-amber-600 dark:text-amber-400",
        rose: "border-rose-500/15 bg-rose-500/[0.02] dark:border-rose-500/10 dark:bg-rose-500/[0.02] text-rose-600 dark:text-rose-400",
        indigo: "border-indigo-500/15 bg-indigo-500/[0.02] dark:border-indigo-500/10 dark:bg-indigo-500/[0.02] text-indigo-600 dark:text-indigo-400",
    };

    return (
        <div className={`relative overflow-hidden rounded-2xl border p-6 lg:p-8 min-h-[320px] flex flex-col justify-between ${accents[accentColor]} ${className}`}>
            <div className="max-w-xl relative z-10">
                <span className="mb-2 inline-block font-mono text-[10px] uppercase tracking-widest opacity-80">
                    {eyebrow}
                </span>
                <h3 className="text-xl lg:text-2xl font-semibold tracking-[-0.02em] text-foreground leading-snug">
                    {title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground max-w-md">
                    {desc}
                </p>

                <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {bullets.map((bullet) => (
                        <BulletItem key={bullet.title} {...bullet} />
                    ))}
                </div>
            </div>

            {image && (
                <div className={`mt-6 lg:mt-0 relative w-full h-48 lg:h-auto lg:absolute ${imageClassName}`}>
                    <Image
                        src={image}
                        alt={imageAlt ?? title}
                        fill
                        className="object-contain object-left-bottom lg:object-right-bottom rounded-xl"
                        sizes="(max-w-7xl) 100vw"
                    />
                </div>
            )}
        </div>
    );
}

export function Features() {
    return (
        <section id="features" className="relative mx-auto px-6 py-16 md:py-24 bg-background">

            {/* Structural Background Alignment Grid */}
            <div
                className="pointer-events-none absolute inset-0 z-0 opacity-40"
                style={{
                    backgroundImage: [
                        "linear-gradient(hsl(var(--border) / 0.5) 1px, transparent 1px)",
                        "linear-gradient(90deg, hsl(var(--border) / 0.5) 1px, transparent 1px)",
                    ].join(", "),
                    backgroundSize: "48px 48px",
                }}
            />

            {/* Header section matching Hero/About flow */}
            <div className="mb-8 lg:mb-8 mx-10 lg:mx-20">
                <div className="flex items-center gap-3 mb-4">
                    <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground/60">
                        Capabilities & Workspace Tooling
                    </span>
                    <span className="h-px w-12 bg-border/40" />
                </div>
                <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-5xl tracking-[-0.02em]">
                    Features
                </h2>
                {/* <p className="mt-4 max-w-2xl text-sm md:text-base leading-relaxed text-muted-foreground">
                    Structured coding sheets, technical writing, public collections, project tooling, and automated release notes all live in one workflow. Core utilities remain beautifully native, while higher-scale workflows stay Pro-first.
                </p> */}
            </div>

            {/* Main Features Grid Block */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mx-10 lg:mx-20">

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

                    {/* 1. Coding Sheets (Wide) */}
                    <FeatureGridCard
                        accentColor="violet"
                        eyebrow="Coding Sheets"
                        title="Spin up structured sheets and stay in flow"
                        desc="Generate topic-based sheets fast with a keyboard-first editor. Publish or export with flexible visibility settings."
                        className="lg:col-span-2 lg:pr-[10%]"
                        imageClassName="lg:right-[-5%] lg:-bottom-12 lg:w-[45%] lg:h-[110%]"
                        image="https://res.cloudinary.com/dgxeg3sju/image/upload/v1753474718/05969d69-43c7-4200-beca-173029a48450.png"
                        imageAlt="Coding sheets and editor preview"
                        bullets={[
                            { icon: PenTool, title: "Sheet Generation", desc: "Custom problem sheets in minutes." },
                            { icon: Boxes, title: "Topics & Structure", desc: "Organize solving without losing context." },
                        ]}
                    />

                    {/* 2. Blog Collections */}
                    <FeatureGridCard
                        accentColor="sky"
                        eyebrow="Blog Collections"
                        title="Bundle related posts into clean flows"
                        className="lg:col-span-2 lg:pr-[10%]"
                        imageClassName="lg:right-[-2%] lg:-bottom-12 lg:w-[30%] lg:h-[110%]"
                        desc="Group blogs into a focused reading experience. Build tutorial series or release roundups, then share one unified destination link."
                        bullets={[
                            { icon: BookMarked, title: "Curated Reading Paths", desc: "Turn separate blogs into guided sequences." },
                            { icon: Eye, title: "Visibility Management", desc: "Keep sequences hidden while drafting." },
                        ]}
                    />

                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* 3. Technical Writing (Wide) */}
                    <FeatureGridCard
                        accentColor="indigo"
                        eyebrow="Technical Writing"
                        title="A clean, markdown-friendly editor built for devs"
                        desc="Write without distractions. Shortcuts, markdown parameters, and a crisp reading interface by default. Draft privately and review carefully."
                        className="lg:col-span-2 lg:pr-[10%]"
                        imageClassName="lg:right-[-2%] lg:-bottom-12 lg:w-[45%] lg:h-[110%]"
                        image="https://res.cloudinary.com/dgxeg3sju/image/upload/v1753474830/4440e28b-4269-42b1-9536-179d06eb8f80.png"
                        imageAlt="Writing and publishing preview"
                        bullets={[
                            { icon: FileText, title: "Clean Editor Controls", desc: "Markdown shortcuts and keyboard-first controls." },
                            { icon: Settings2, title: "Flexible Distribution", desc: "Isolate public versus internal assets." },
                        ]}
                    />

                    {/* 4. Project Engineering (Pro-First) */}
                    <FeatureGridCard
                        accentColor="rose"
                        eyebrow="Projects & Releases · Pro"
                        title="Automated notes compiled from GitHub commits"
                        desc="Connect a repo. Commit with keywords and let Insert aggregate a draft release note equipped with summaries and cross-links."
                        className="lg:col-span-2 lg:pr-[10%]"
                        imageClassName="lg:right-4 lg:bottom-4 lg:w-[32%] lg:h-[90%]"
                        image="/insert_project.png"
                        imageAlt="Project dashboard and releases"
                        bullets={[
                            { icon: Settings2, title: "Project Editing Engine", desc: "Manage operational keywords and layout metadata." },
                            { icon: GitBranch, title: "Release Automation", desc: "Keyword triggers compile summaries directly from Git." },
                        ]}
                    />
                </div>

            </div>

            {/* --- V6.0 MAJOR COLLABORATION UPGRADE SECTION --- */}
            <div className="relative mt-12 grid grid-cols-1 lg:grid-cols-3 gap-4 mx-10 lg:mx-20">
                <div className="lg:col-span-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.03] p-6 lg:p-8">
                    <div className="flex flex-wrap items-center justify-between gap-6 mb-8 border-b border-emerald-500/10 pb-6">
                        <div>
                            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-500/25 bg-emerald-500/8 px-2.5 py-0.5">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="font-mono text-[10px] uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                                    Major Release v6.0.0 [June 2026]
                                </span>
                            </div>
                            <h3 className="text-2xl font-bold tracking-[-0.02em] text-foreground">
                                Collaboration & Realtime Notifications
                            </h3>
                            <p className="mt-1 text-sm text-muted-foreground max-w-2xl">
                                Work together across Topics and Blogs with role-based collaboration, actionable notification center delivery, workspace switcher panels, and refined management frameworks.
                            </p>
                        </div>
                        <div className="flex gap-2 font-mono text-[11px] text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 rounded-xl p-3 bg-background/50 backdrop-blur-sm">
                            <div>• Role-Based Access</div>
                            <div>• Realtime In-App Feeds</div>
                            <div>• Zero Overhead Switchers</div>
                        </div>
                    </div>

                    {/* Bento Split for Version 6 Deep-Dive Components */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

                        {/* V6 Sub-feature 1: Workspace Management */}
                        <div className="rounded-xl border border-border bg-background p-5 flex flex-col justify-between">
                            <div>
                                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 mb-3">
                                    <Users className="h-4 w-4" />
                                    <h4 className="text-sm font-semibold text-foreground">Role Collaboration</h4>
                                </div>
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                    Invite teammates straight to individual Blogs and Topics. Assign rigid Editor or Viewer policies, track pending invites, and modify roles instantly.
                                </p>
                            </div>
                            <div className="mt-4 pt-4 border-t border-border/60 relative h-32 w-full">
                                <Image
                                    src="https://res.cloudinary.com/dgxeg3sju/image/upload/v1780849703/fb26e6fe-28c0-457b-b894-3d2ff511cd43.png"
                                    alt="Collab UI"
                                    fill
                                    className="object-cover object-top rounded-lg border border-border/40"
                                />
                            </div>
                        </div>

                        {/* V6 Sub-feature 2: Notification Center */}
                        <div className="rounded-xl border border-border bg-background p-5 flex flex-col justify-between">
                            <div>
                                <div className="flex items-center gap-2 text-sky-600 dark:text-sky-400 mb-3">
                                    <Bell className="h-4 w-4" />
                                    <h4 className="text-sm font-semibold text-foreground">Realtime Notification Center</h4>
                                </div>
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                    Stay contextualized without manual dashboard refreshes. Active counters, actionable workflows, and quick-accept modules allow inline request resolution.
                                </p>
                            </div>
                            <div className="mt-4 pt-4 border-t border-border/60 relative h-32 w-full">
                                <Image
                                    src="https://res.cloudinary.com/dgxeg3sju/image/upload/v1780920862/2c389123-efa6-41c2-9af7-607392b856b7.png"
                                    alt="Notification UI"
                                    fill
                                    className="object-cover object-top rounded-lg border border-border/40"
                                />
                            </div>
                        </div>

                        {/* V6 Sub-feature 3: Switchers */}
                        <div className="rounded-xl border border-border bg-background p-5 flex flex-col justify-between md:col-span-2 lg:col-span-1">
                            <div>
                                <div className="flex items-center gap-2 text-violet-600 dark:text-violet-400 mb-3">
                                    <GitMerge className="h-4 w-4" />
                                    <h4 className="text-sm font-semibold text-foreground">Workspace Switching</h4>
                                </div>
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                    Seamlessly jump between distinct shared resources. Native Topic Switchers and Blog Switchers remove navigation overhead entirely from deep code flows.
                                </p>
                            </div>
                            <div className="mt-4 pt-4 border-t border-border/60 relative h-32 w-full">
                                <Image
                                    src="https://res.cloudinary.com/dgxeg3sju/image/upload/v1780920987/413a62f2-90c4-4e32-8ad3-a58b6ecde383.png"
                                    alt="Switcher UI"
                                    fill
                                    className="object-cover object-top rounded-lg border border-border/40"
                                />
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            {/* --- PRO SUBSCRIPTION BLOCK (Realigned to Pro Theme) --- */}
            <div className="relative mt-16 border border-indigo-500/15 bg-indigo-500/[0.01] rounded-2xl p-6 lg:p-10 mx-10 lg:mx-20">
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-center">
                    <div className="lg:col-span-3">
                        <span className="inline-flex items-center rounded-md border border-indigo-500/30 bg-indigo-500/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
                            Insert Pro Tier
                        </span>
                        <h3 className="mt-3 text-2xl font-bold tracking-tight text-foreground md:text-3xl tracking-[-0.02em]">
                            Upgrade once — Pro unlocks everywhere
                        </h3>
                        <p className="mt-2 text-sm leading-relaxed text-muted-foreground max-w-xl">
                            Gain access to unlimited structured sheets, documentation pipelines, production-scale publishing configurations, continuous automated release generation, and enterprise visibility handling rules.
                        </p>

                        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <BulletItem icon={Zap} title="Instant Unlock" desc="Pro parameters activate ecosystem-wide." />
                            <BulletItem icon={GitBranch} title="Projects Core Integration" desc="Sync repos and watch releases construct itself." />
                            <BulletItem icon={Boxes} title="Unbounded Scale" desc="No soft ceilings on technical documentation maps." />
                            <BulletItem icon={FileText} title="Release Automation Hub" desc="Compile summaries, metadata flags, and tracklogs." />
                        </div>

                        <div className="mt-8">
                            <Link
                                href="/subscribe"
                                className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-indigo-500 transition-colors shadow-sm gap-2"
                            >
                                View Pricing Plans
                                <ArrowRight className="h-3.5 w-3.5" />
                            </Link>
                        </div>
                    </div>

                    <div className="lg:col-span-2 relative h-64 lg:h-80 w-full border border-indigo-500/10 rounded-xl bg-background/40 p-2 overflow-hidden shadow-inner">
                        <Image
                            src="https://res.cloudinary.com/dgxeg3sju/image/upload/v1767039488/d295b056-15b7-46c3-8935-21d254ea1687.png"
                            alt="Insert Pro pricing matrix representation"
                            fill
                            className="object-cover object-top rounded-lg"
                        />
                    </div>
                </div>
            </div>

            {/* --- COMPACT FOOT NOTES / CHANGELOG ATOM --- */}
            <div className="mx-auto mt-12 max-w-5xl relative z-10">
                <div className="rounded-2xl border border-border bg-muted/20 p-5 backdrop-blur-md">
                    <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                        <div>
                            <div className="inline-flex items-center gap-2">
                                <span className="inline-flex items-center rounded-full bg-indigo-500/10 px-2 py-0.5 text-[10px] font-mono text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                                    Changelog Info
                                </span>
                                <span className="text-[11px] font-mono tracking-wider text-muted-foreground">
                                    Subsystem State Adjustments
                                </span>
                            </div>
                            <h4 className="mt-2 text-base font-semibold text-foreground">
                                Accurate Pro state parameters & visibility updates
                            </h4>
                            <p className="mt-1 text-xs text-muted-foreground max-w-xl">
                                Active Pro states map correctly across dashboards, historical expired records are cleanly segmented, and visibility filters ensure isolation layers between owners and workspace readers.
                            </p>
                        </div>

                        <div className="rounded-xl border border-border bg-background p-3 font-mono text-[10px] text-muted-foreground space-y-1 shadow-sm shrink-0">
                            <div className="text-emerald-600 dark:text-emerald-400">feat(collections): sequence feeds functional</div>
                            <div className="text-indigo-600 dark:text-indigo-400">fix(pro): active vs expired telemetry mapped</div>
                            <div>chore(access): visibility validation tightening</div>
                        </div>
                    </div>

                    <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3 pt-4 border-t border-border/60">
                        {[
                            { icon: BookMarked, title: "Shareable Feeds", desc: "Group sequences into structured collection layouts." },
                            { icon: BadgeCheck, title: "Telemetry Badging", desc: "Active Pro displays clear indicators relative to legacy histories." },
                            { icon: CreditCard, title: "Scale Workflows", desc: "Higher capacity workspace distribution mechanics." }
                        ].map((item, idx) => (
                            <div key={idx} className="flex gap-2.5 items-start">
                                <item.icon className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                                <div>
                                    <span className="text-xs font-medium text-foreground block">{item.title}</span>
                                    <span className="text-[11px] text-muted-foreground mt-0.5 block leading-normal">{item.desc}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

        </section>
    );
}