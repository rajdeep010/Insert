// "use client";

// import Image from "next/image";
// import { WobbleCard } from "../ui/wobble-card";
// import {
//     PenTool,
//     FileText,
//     Settings2,
//     GitBranch,
//     Paintbrush,
//     Boxes,
//     Zap,
// } from "lucide-react";

// type Bullet = {
//     icon: React.ElementType;
//     title: string;
//     desc: string;
// };

// function BulletItem({ icon: Icon, title, desc }: Bullet) {
//     return (
//         <div className="flex items-start gap-3">
//             <div className="mt-0.5 inline-flex h-9 w-9 flex-none items-center justify-center rounded-lg bg-black text-white dark:bg-white dark:text-black">
//                 <Icon className="h-4 w-4" />
//             </div>
//             <div>
//                 <p className="text-sm font-semibold text-black dark:text-white">{title}</p>
//                 <p className="text-sm text-gray-600 dark:text-gray-300">{desc}</p>
//             </div>
//         </div>
//     );
// }

// function SplitRow({
//     reverse = false,
//     eyebrow,
//     title,
//     desc,
//     bullets,
//     image,
//     imageAlt,
//     wobbleBg,
//     idx = 1, // default idx
// }: {
//     reverse?: boolean;
//     eyebrow: string;
//     title: string;
//     desc: string;
//     bullets: Bullet[];
//     image: string;
//     imageAlt: string;
//     wobbleBg: string;
//     idx?: number;
// }) {
//     const ImageSide = (
//         <WobbleCard containerClassName={`h-full ${wobbleBg} min-h-[360px]`} className="">
//             <Image
//                 src={image}
//                 alt={imageAlt}
//                 width={980}
//                 height={640}
//                 className={`absolute ${!reverse ? '-left-6 lg:-left-[10%]' : '-right-6 lg:-right-[10%]'} ${idx === 3 ? '-bottom-36 md:-bottom-36' : '-bottom-12'} object-contain rounded-2xl`}
//                 priority
//             />
//         </WobbleCard>
//     );

//     const TextSide = (
//         <div>
//             <span className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
//                 {eyebrow}
//             </span>
//             <h3 className="mt-2 text-2xl font-bold tracking-tight text-black dark:text-white md:text-3xl">
//                 {title}
//             </h3>
//             <p className="mt-2 text-sm text-gray-700 dark:text-gray-300 md:text-base">
//                 {desc}
//             </p>
//             <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
//                 {bullets.map((b: any) => (
//                     <BulletItem key={b.title} {...b} />
//                 ))}
//             </div>
//         </div>
//     );

//     return (
//         <div className="grid items-center gap-8 md:gap-12 lg:grid-cols-2">
//             {reverse ? (
//                 <>
//                     {TextSide}
//                     {ImageSide}
//                 </>
//             ) : (
//                 <>
//                     {ImageSide}
//                     {TextSide}
//                 </>
//             )}
//         </div>
//     );
// }

// export function Features() {
//     return (
//         <section id="features" className="mx-auto max-w-7xl px-4 py-10 md:py-14">
//             <div className="mx-auto max-w-3xl text-center">
//                 <h2 className="text-3xl font-bold tracking-tight text-black dark:text-white md:text-5xl">
//                     Features
//                 </h2>
//                 <p className="mt-3 text-sm text-gray-600 dark:text-gray-300 md:text-base">
//                     Coding sheet generation, clean blog writing, project editing, and automatic release blogs — in one simple flow.
//                 </p>
//             </div>

//             <div className="mt-10 space-y-14">
//                 {/* 1) Coding sheets — image left, text right */}
//                 <SplitRow
//                     eyebrow="Coding sheets"
//                     title="Spin up structured sheets and stay in flow"
//                     desc="Generate topic-based coding sheets quickly with a keyboard‑first editor. Share publicly or keep them private."
//                     bullets={[
//                         { icon: PenTool, title: "Sheet generation", desc: "Create custom problem sheets in minutes." },
//                         { icon: Boxes, title: "Topics & groups", desc: "Organize by topics and collections effortlessly." },
//                     ]}
//                     image="https://res.cloudinary.com/dgxeg3sju/image/upload/v1753474718/05969d69-43c7-4200-beca-173029a48450.png"
//                     imageAlt="Coding sheets and editor preview"
//                     wobbleBg="bg-fuchsia-600"
//                     idx={1}
//                 />

//                 {/* 2) Blog writing — text left, image right */}
//                 <SplitRow
//                     reverse
//                     eyebrow="Blog writing"
//                     title="A clean, markdown‑friendly editor built for devs"
//                     desc="Write posts without distractions. Shortcuts, markdown, and a crisp reading experience by default."
//                     bullets={[
//                         { icon: FileText, title: "Clean editor", desc: "Markdown, shortcuts, and keyboard‑first controls." },
//                         { icon: Settings2, title: "Publish your way", desc: "Public or private, with simple controls." },
//                     ]}
//                     image="https://res.cloudinary.com/dgxeg3sju/image/upload/v1753474830/4440e28b-4269-42b1-9536-179d06eb8f80.png"
//                     imageAlt="Writing and publishing preview"
//                     wobbleBg="bg-sky-600"
//                     idx={2}
//                 />

//                 {/* 3) Projects & releases — image left, text right (lower image) */}
//                 <SplitRow
//                     eyebrow="Projects & releases"
//                     title="Edit projects and auto‑generate release blogs from commits"
//                     desc="Connect a GitHub repo. Commit with the keyword and let Insert create a polished release blog with summaries and deep links."
//                     bullets={[
//                         { icon: Settings2, title: "Project editing", desc: "Manage project details, keywords, and metadata." },
//                         { icon: GitBranch, title: "Release generation", desc: "Keyworded commits compile notes and links automatically." },
//                     ]}
//                     image="/insert_project.png"
//                     imageAlt="Project dashboard and releases"
//                     wobbleBg="bg-emerald-600"
//                     idx={3}
//                 />
//             </div>

//             {/* Latest Releases (unchanged) */}
//             <div className="mx-auto mt-16 max-w-4xl">
//                 <div className="rounded-3xl border border-black/10 bg-white/70 p-6 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/5">
//                     <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
//                         <div>
//                             <span className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
//                                 Latest releases
//                             </span>
//                             <h3 className="mt-2 text-2xl font-bold tracking-tight text-black dark:text-white md:text-3xl">
//                                 Smarter UI, modular services, faster everything
//                             </h3>
//                             <p className="mt-2 max-w-2xl text-sm text-gray-700 dark:text-gray-300 md:text-base">
//                                 Recent updates include a cleaner interface, microservice architecture improvements, and performance boosts across the editor and release pipeline.
//                             </p>
//                         </div>

//                         <div className="rounded-2xl border border-dashed border-black/10 p-4 font-mono text-xs text-gray-800 dark:border-white/10 dark:text-gray-200">
//                             feat(editor): slash-commands for media #release
//                             {"\n"}^ keyword triggers a release blog
//                         </div>
//                     </div>

//                     <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
//                         <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-white/10">
//                             <div className="mb-2 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-black text-white dark:bg-white dark:text-black">
//                                 <Paintbrush className="h-4 w-4" />
//                             </div>
//                             <p className="text-sm font-semibold text-black dark:text-white">UI refinements</p>
//                             <p className="text-sm text-gray-600 dark:text-gray-300">
//                                 Clearer layout, better contrast, and smoother interactions.
//                             </p>
//                         </div>

//                         <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-white/10">
//                             <div className="mb-2 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-black text-white dark:bg-white dark:text-black">
//                                 <Boxes className="h-4 w-4" />
//                             </div>
//                             <p className="text-sm font-semibold text-black dark:text-white">Microservices</p>
//                             <p className="text-sm text-gray-600 dark:text-gray-300">
//                                 More modular services for reliability and scale.
//                             </p>
//                         </div>

//                         <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-white/10">
//                             <div className="mb-2 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-black text-white dark:bg-white dark:text-black">
//                                 <Zap className="h-4 w-4" />
//                             </div>
//                             <p className="text-sm font-semibold text-black dark:text-white">Performance</p>
//                             <p className="text-sm text-gray-600 dark:text-gray-300">
//                                 Faster loads and snappier authoring & release flow.
//                             </p>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         </section>
//     );
// }

"use client";

import Image from "next/image";
import Link from "next/link";
import { WobbleCard } from "../ui/wobble-card";
import {
    PenTool,
    FileText,
    Settings2,
    GitBranch,
    Paintbrush,
    Boxes,
    Zap,
    CreditCard,
    BadgeCheck,
    ShieldCheck,
    AlertTriangle,
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
    idx?: number;
}) {
    const ImageSide = (
        <WobbleCard containerClassName={`h-full ${wobbleBg} min-h-[360px]`} className="">
            <Image
                src={image}
                alt={imageAlt}
                width={980}
                height={640}
                className={`absolute ${!reverse ? '-left-6 lg:-left-[10%]' : '-right-6 lg:-right-[10%]'} ${idx === 3 ? '-bottom-36 md:-bottom-36' : '-bottom-12'} object-contain rounded-2xl`}
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
                {bullets.map((b: any) => (
                    <BulletItem key={b.title} {...b} />
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
                    Structured coding sheets, clean blog writing, project editing, and automatic release blogs — all in one flow. Projects are Pro‑first for a seamless, synced experience.
                </p>
            </div>

            <div className="mt-10 space-y-14">
                {/* 1) Coding sheets — image left, text right */}
                <SplitRow
                    eyebrow="Coding sheets"
                    title="Spin up structured sheets and stay in flow"
                    desc="Generate topic‑based sheets fast with a keyboard‑first editor. Share publicly or keep them private."
                    bullets={[
                        { icon: PenTool, title: "Sheet generation", desc: "Create custom problem sheets in minutes." },
                        { icon: Boxes, title: "Topics & groups", desc: "Organize by topics and collections effortlessly." },
                    ]}
                    image="https://res.cloudinary.com/dgxeg3sju/image/upload/v1753474718/05969d69-43c7-4200-beca-173029a48450.png"
                    imageAlt="Coding sheets and editor preview"
                    wobbleBg="bg-gradient-to-br from-fuchsia-600 to-pink-600"
                    idx={1}
                />

                {/* 2) Blog writing — text left, image right */}
                <SplitRow
                    reverse
                    eyebrow="Blog writing"
                    title="A clean, markdown‑friendly editor built for devs"
                    desc="Write without distractions. Shortcuts, markdown, and a crisp reading experience by default."
                    bullets={[
                        { icon: FileText, title: "Clean editor", desc: "Markdown, shortcuts, and keyboard‑first controls." },
                        { icon: Settings2, title: "Publish your way", desc: "Public or private, with simple controls." },
                    ]}
                    image="https://res.cloudinary.com/dgxeg3sju/image/upload/v1753474830/4440e28b-4269-42b1-9536-179d06eb8f80.png"
                    imageAlt="Writing and publishing preview"
                    wobbleBg="bg-gradient-to-br from-sky-600 to-blue-600"
                    idx={2}
                />

                {/* 3) Projects & releases — image left, text right (lower image) */}
                <SplitRow
                    eyebrow="Projects & releases · Pro‑first"
                    title="Edit projects and auto‑generate release blogs from commits"
                    desc="Connect a GitHub repo. Commit with a keyword and let Insert compile a polished release blog with summaries and deep links."
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

            {/* Pro pricing */}
            <div className="mt-16">
                <div className="mx-auto max-w-3xl text-center">
                    <span className="inline-flex items-center rounded-full bg-indigo-600/90 px-2 py-0.5 text-[13px] font-semibold uppercase tracking-wide text-white">
                        Insert Pro
                    </span>
                    <h3 className="mt-2 text-2xl font-bold tracking-tight text-black dark:text-white md:text-3xl">
                        Upgrade once — Pro unlocks everywhere
                    </h3>
                    <p className="mt-2 text-sm text-gray-700 dark:text-gray-300 md:text-base">
                        Unlimited sheets, blogs, release automation, and priority support. One upgrade, sync across Insert.
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
                            <BulletItem icon={GitBranch} title="Projects service" desc="Connect repos, track keywords, auto‑generate release blogs." />
                            <BulletItem icon={Boxes} title="Unlimited sheets & blogs" desc="Organize topics and blogs without limits." />
                            <BulletItem icon={FileText} title="Release automation" desc="Polished blog drafts with summaries and deep links." />
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

            <div className="mx-auto mt-16 max-w-4xl">
                <div className="rounded-3xl border border-black/10 bg-white/70 p-6 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/5">
                    <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
                        <div>
                            <div className="inline-flex items-center gap-2">
                                <span className="inline-flex items-center rounded-full bg-indigo-600/90 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-white">
                                    New
                                </span>
                                <span className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                    Latest releases
                                </span>
                            </div>
                            <h3 className="mt-2 text-2xl font-bold tracking-tight text-black dark:text-white md:text-3xl">
                                Pro access with<span
                                    className="ml-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-blue-500 align-middle"
                                    aria-label="Verified"
                                    title="Verified"
                                >
                                    <BadgeCheck className="text-white" size={18} strokeWidth={3} />
                                </span> badge
                            </h3>
                            <p className="mt-2 max-w-2xl text-sm text-gray-700 dark:text-gray-300 md:text-base">
                                Pay with Razorpay and unlock Pro instantly. Pro accounts now show a verified badge across profile and mentions. Some regular features will move to Pro soon.
                            </p>
                        </div>

                        <div className="rounded-2xl border border-dashed border-black/10 p-4 font-mono text-xs text-gray-800 dark:border-white/10 dark:text-gray-200">
                            feat(billing): Razorpay Pro + verified badge #release
                            {"\n"}chore(access): preparing regular features to migrate to Pro
                        </div>
                    </div>

                    <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-white/10">
                            <div className="mb-2 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-black text-white dark:bg-white dark:text-black">
                                <CreditCard className="h-4 w-4" />
                            </div>
                            <p className="text-sm font-semibold text-black dark:text-white">Razorpay Pro access</p>
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                                Secure checkout to unlock Pro across sheets, blogs, and projects.
                            </p>
                        </div>

                        <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-white/10">
                            <div className="mb-2 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-black text-white dark:bg-white dark:text-black">
                                <BadgeCheck className="h-4 w-4" />
                            </div>
                            <p className="text-sm font-semibold text-black dark:text-white">Verified badge</p>
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                                Pro users display a verified mark for quick trust and recognition.
                            </p>
                        </div>

                        <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-white/10">
                            <div className="mb-2 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-black text-white dark:bg-white dark:text-black">
                                <AlertTriangle className="h-4 w-4" />
                            </div>
                            <p className="text-sm font-semibold text-black dark:text-white">Access changes</p>
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                                A few areas still have regular access and will migrate to Pro soon.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}