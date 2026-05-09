"use client";

import Image from "next/image";
import Link from "next/link";
import { WobbleCard } from "../ui/wobble-card";
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
} from "lucide-react";

type Bullet = {
    icon: React.ElementType;
    title: string;
    desc: string;
};

function BulletItem({ icon: Icon, title, desc }: Bullet) {
    return (
        <div className="flex items-start gap-3">
            <div className="mt-0.5 inline-flex h-9 w-9 flex-none items-center justify-center rounded-lg bg-black text-white dark:bg-white dark:text-black">
                <Icon className="h-4 w-4" />
            </div>
            <div>
                <p className="text-sm font-semibold text-black dark:text-white">{title}</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">{desc}</p>
            </div>
        </div>
    );
}

function SplitRow({
    reverse = false,
    eyebrow,
    title,
    desc,
    bullets,
    image,
    imageAlt,
    wobbleBg,
    imageClassName,
    idx = 1,
}: {
    reverse?: boolean;
    eyebrow: string;
    title: string;
    desc: string;
    bullets: Bullet[];
    image: string;
    imageAlt: string;
    wobbleBg: string;
    imageClassName?: string;
    idx?: number;
}) {
    const ImageSide = (
        <WobbleCard containerClassName={`h-full ${wobbleBg} min-h-[360px]`} className="">
            <Image
                src={image}
                alt={imageAlt}
                width={980}
                height={640}
                className={`absolute ${!reverse ? "-left-6 lg:-left-[10%]" : "-right-6 lg:-right-[10%]"} ${idx === 4 ? "-bottom-30 md:-bottom-35 lg:-bottom-40 -left-24 lg:-left-[16%]" : idx === 3 ? "-bottom-36 md:-bottom-36" : "-bottom-12"} object-contain rounded-2xl ${imageClassName ?? ""}`}
                priority
            />
        </WobbleCard>
    );

    const TextSide = (
        <div>
            <span className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                {eyebrow}
            </span>
            <h3 className="mt-2 text-2xl font-bold tracking-tight text-black dark:text-white md:text-3xl">
                {title}
            </h3>
            <p className="mt-2 text-sm text-gray-700 dark:text-gray-300 md:text-base">
                {desc}
            </p>
            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                {bullets.map((bullet) => (
                    <BulletItem key={bullet.title} {...bullet} />
                ))}
            </div>
        </div>
    );

    return (
        <div className="grid items-center gap-8 md:gap-12 lg:grid-cols-2">
            {reverse ? (
                <>
                    {TextSide}
                    {ImageSide}
                </>
            ) : (
                <>
                    {ImageSide}
                    {TextSide}
                </>
            )}
        </div>
    );
}

export function Features() {
    return (
        <section id="features" className="mx-auto max-w-7xl px-4 py-10 md:py-14">
            <div className="mx-auto max-w-3xl text-center">
                <h2 className="text-3xl font-bold tracking-tight text-black dark:text-white md:text-5xl">
                    Features
                </h2>
                <p className="mt-3 text-sm text-gray-600 dark:text-gray-300 md:text-base">
                    Structured coding sheets, technical writing, public collections, project tooling, and automated release notes all live in one workflow. Projects and higher-scale publishing stay Pro-first, while the core writing flow remains intact.
                </p>
            </div>

            <div className="mt-10 space-y-14">
                <SplitRow
                    eyebrow="Coding sheets"
                    title="Spin up structured sheets and stay in flow"
                    desc="Generate topic-based sheets fast with a keyboard-first editor. Publish or export with flexible visibility settings."
                    bullets={[
                        { icon: PenTool, title: "Sheet generation", desc: "Create custom problem sheets in minutes." },
                        { icon: Boxes, title: "Topics & structure", desc: "Organize problem solving by topic without losing context." },
                    ]}
                    image="https://res.cloudinary.com/dgxeg3sju/image/upload/v1753474718/05969d69-43c7-4200-beca-173029a48450.png"
                    imageAlt="Coding sheets and editor preview"
                    wobbleBg="bg-gradient-to-br from-fuchsia-600 to-pink-600"
                    idx={1}
                />

                <SplitRow
                    reverse
                    eyebrow="Technical writing"
                    title="A clean, markdown-friendly editor built for devs"
                    desc="Write without distractions. Shortcuts, markdown, and a crisp reading experience by default. Draft privately, review carefully, and publish when the writing is ready."
                    bullets={[
                        { icon: FileText, title: "Clean editor", desc: "Markdown, shortcuts, and keyboard-first controls." },
                        { icon: Settings2, title: "Flexible publishing", desc: "Draft, review, publish, and decide what stays private or public." },
                    ]}
                    image="https://res.cloudinary.com/dgxeg3sju/image/upload/v1753474830/4440e28b-4269-42b1-9536-179d06eb8f80.png"
                    imageAlt="Writing and publishing preview"
                    wobbleBg="bg-gradient-to-br from-sky-600 to-blue-600"
                    idx={2}
                />

                <SplitRow
                    eyebrow="Blog collections"
                    title="Bundle related posts into one clean public collection"
                    desc="Collections let you group blogs into a focused reading experience. Build tutorial series, release roundups, or topic-based reading lists, then share one link instead of pushing readers across multiple posts manually."
                    bullets={[
                        { icon: BookMarked, title: "Curated reading paths", desc: "Turn separate blogs into a guided sequence for readers." },
                        { icon: Eye, title: "Public or private visibility", desc: "Keep collections internal while drafting, then publish when the sequence is ready." },
                    ]}
                    image="https://res.cloudinary.com/dgxeg3sju/image/upload/v1778334681/22c3959d-0e05-4f0b-9218-68c839a6807b.png"
                    imageAlt="Blog collection management preview"
                    wobbleBg="bg-gradient-to-br from-violet-700 to-indigo-700"
                    imageClassName="w-[108%] max-w-none"
                    idx={4}
                />

                <SplitRow
                    reverse
                    eyebrow="Projects & releases · Pro-first"
                    title="Edit projects and auto-generate release notes from commits"
                    desc="Connect a GitHub repo. Commit with a keyword and let Insert compile a draft release note with summaries and deep links."
                    bullets={[
                        { icon: Settings2, title: "Project editing", desc: "Manage project details, keywords, and metadata." },
                        { icon: GitBranch, title: "Release generation", desc: "Keyworded commits compile notes and links automatically." },
                    ]}
                    image="/insert_project.png"
                    imageAlt="Project dashboard and releases"
                    wobbleBg="bg-gradient-to-br from-emerald-600 to-teal-600"
                    idx={3}
                />
            </div>

            <div className="mt-16">
                <div className="mx-auto max-w-3xl text-center">
                    <span className="inline-flex items-center rounded-full bg-indigo-600/90 px-2 py-0.5 text-[13px] font-semibold uppercase tracking-wide text-white">
                        Insert Pro
                    </span>
                    <h3 className="mt-2 text-2xl font-bold tracking-tight text-black dark:text-white md:text-3xl">
                        Upgrade once — Pro unlocks everywhere
                    </h3>
                    <p className="mt-2 text-sm text-gray-700 dark:text-gray-300 md:text-base">
                        Unlimited sheets, documentation workflows, organized publishing, release automation, and priority support. One upgrade that applies across Insert.
                    </p>
                </div>

                <div className="mt-8 grid items-center gap-8 md:gap-12 lg:grid-cols-2">
                    <WobbleCard containerClassName="h-full bg-gradient-to-br from-indigo-800 to-violet-800 min-h-[360px]" className="">
                        <Image
                            src="https://res.cloudinary.com/dgxeg3sju/image/upload/v1767039488/d295b056-15b7-46c3-8935-21d254ea1687.png"
                            alt="Insert Pro pricing"
                            width={980}
                            height={640}
                            className="absolute -right-6 lg:-right-[10%] -bottom-12 object-contain rounded-2xl"
                            priority
                        />
                    </WobbleCard>

                    <div>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <BulletItem icon={Zap} title="Instant unlock" desc="Upgrade and Pro features apply across your workspace immediately." />
                            <BulletItem icon={GitBranch} title="Projects service" desc="Connect repos, track keywords, auto-generate release blogs." />
                            <BulletItem icon={Boxes} title="Unlimited sheets & publishing" desc="Scale sheets, blogs, and related writing workflows without limits." />
                            <BulletItem icon={FileText} title="Release automation" desc="Polished blog drafts with summaries, deep links, and review-ready structure." />
                        </div>

                        <Link
                            href="/subscribe"
                            className="mt-6 inline-flex items-center justify-center rounded-md border border-black/10 bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 dark:border-white/10"
                        >
                            View plans & upgrade
                        </Link>
                    </div>
                </div>
            </div>

            <div className="mx-auto mt-16 max-w-5xl">
                <div className="rounded-3xl border border-black/10 bg-white/70 p-6 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/5">
                    <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
                        <div>
                            <div className="inline-flex items-center gap-2">
                                <span className="inline-flex items-center rounded-full bg-indigo-600/90 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-white">
                                    New
                                </span>
                                <span className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                    Latest release
                                </span>
                            </div>
                            <h3 className="mt-2 text-2xl font-bold tracking-tight text-black dark:text-white md:text-3xl">
                                Collections are live, and Pro state is now more accurate
                            </h3>
                            <p className="mt-2 max-w-2xl text-sm text-gray-700 dark:text-gray-300 md:text-base">
                                This release adds blog collections with public detail pages, better visibility handling, stronger owner versus public separation, and smarter Pro badge behavior that now distinguishes active Pro from expired Pro history.
                            </p>
                        </div>

                        <div className="rounded-2xl border border-dashed border-black/10 p-4 font-mono text-xs text-gray-800 dark:border-white/10 dark:text-gray-200">
                            feat(collections): public collections feed + detail view
                            {"\n"}fix(pro): active vs expired badge state
                            {"\n"}chore(access): visibility rules tightened for shared content
                        </div>
                    </div>

                    <div className="mt-6 grid grid-cols-3 gap-4 lg:grid-cols-3">
                        {/* <div className="overflow-hidden rounded-2xl border border-black/10 bg-white shadow-sm dark:border-white/10 dark:bg-white/10">
                            <Image
                                src="https://res.cloudinary.com/dgxeg3sju/image/upload/v1778334643/b0c02cc0-cc1b-45db-946f-ca4891bc9e3b.png"
                                alt="Public collection detail page preview"
                                width={1600}
                                height={1000}
                                className="h-full w-full object-cover"
                            />
                        </div> */}

                        {/* <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:grid-cols-1"> */}
                            <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-white/10">
                                <div className="mb-2 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-black text-white dark:bg-white dark:text-black">
                                    <BookMarked className="h-4 w-4" />
                                </div>
                                <p className="text-sm font-semibold text-black dark:text-white">Collections you can share</p>
                                <p className="text-sm text-gray-600 dark:text-gray-300">
                                    Group related posts, publish a single collection link, and give readers a more intentional flow.
                                </p>
                            </div>

                            <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-white/10">
                                <div className="mb-2 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-black text-white dark:bg-white dark:text-black">
                                    <BadgeCheck className="h-4 w-4" />
                                </div>
                                <p className="text-sm font-semibold text-black dark:text-white">Accurate Pro badge state</p>
                                <p className="text-sm text-gray-600 dark:text-gray-300">
                                    Active Pro stays highlighted, expired Pro history turns grey, and never-Pro users stay unmarked.
                                </p>
                            </div>

                            <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-white/10">
                                <div className="mb-2 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-black text-white dark:bg-white dark:text-black">
                                    <CreditCard className="h-4 w-4" />
                                </div>
                                <p className="text-sm font-semibold text-black dark:text-white">Pro still matters</p>
                                <p className="text-sm text-gray-600 dark:text-gray-300">
                                    Billing, higher-scale workflows, and project release tooling remain part of the Pro story.
                                </p>
                            </div>
                        {/* </div> */}
                    </div>
                </div>
            </div>
        </section>
    );
}