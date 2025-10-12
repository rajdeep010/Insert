"use client";
import { GitBranch, FileText, Link as LinkIcon, Tag } from "lucide-react";

export function ProjectService() {
    return (
        <section id="project-service" className="mx-auto max-w-7xl px-4 py-8 md:py-14">
            <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-2">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-black dark:text-white md:text-5xl">
                        Project Service
                    </h2>
                    <p className="mt-3 text-sm text-gray-700 dark:text-gray-300 md:text-base">
                        Import your GitHub project once. Every commit with your keyword
                        automatically spins up a new release blog — complete with commit
                        messages, links, and metadata.
                    </p>

                    <div className="mt-6 space-y-3">
                        <Feature
                            icon={<GitBranch className="h-5 w-5" />}
                            label="Import"
                            desc="Connect a repo via OAuth. We watch commits securely."
                        />
                        <Feature
                            icon={<Tag className="h-5 w-5" />}
                            label="Keyword Trigger"
                            desc='Use messages like: "feat(auth): add OTP support #release"'
                        />
                        <Feature
                            icon={<FileText className="h-5 w-5" />}
                            label="Auto Blog"
                            desc="We generate a structured release post with summaries."
                        />
                        <Feature
                            icon={<LinkIcon className="h-5 w-5" />}
                            label="Deep Links"
                            desc="Commits, PRs and tags linked back to GitHub."
                        />
                    </div>

                    <div className="mt-6 rounded-xl border border-black/10 bg-white/70 p-4 font-mono text-xs text-gray-800 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/5 dark:text-gray-200 md:text-sm">
                        <p className="mb-2 text-[10px] uppercase tracking-wider text-gray-500 dark:text-gray-400">
                            Example commit message
                        </p>
                        <pre className="overflow-x-auto">
                            {`feat(editor): add slash-commands for images #release
^ keyword: #release -> triggers Release Blog generation`}
                        </pre>
                    </div>
                </div>

                <div className="rounded-2xl border border-black/10 bg-gradient-to-br from-white to-gray-50 p-6 shadow-sm dark:border-white/10 dark:from-white/5 dark:to-white/0">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        {["Release name", "Highlights", "Performance", "Microservices"].map(
                            (t) => (
                                <div
                                    key={t}
                                    className="rounded-xl border border-black/10 bg-white/70 p-4 dark:border-white/10 dark:bg-white/5"
                                >
                                    <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                                        {t}
                                    </p>
                                    <p className="mt-2 text-sm font-semibold text-black dark:text-white">
                                        {t === "Release name" ? "Insert 2.0" : "Included"}
                                    </p>
                                </div>
                            )
                        )}
                    </div>
                    <div className="mt-4 rounded-xl border border-dashed border-black/10 p-4 text-sm text-gray-600 dark:border-white/10 dark:text-gray-300">
                        Generated release blogs are editable before publishing.
                    </div>
                </div>
            </div>
        </section>
    );
}

function Feature({
    icon,
    label,
    desc,
}: {
    icon: React.ReactNode;
    label: string;
    desc: string;
}) {
    return (
        <div className="flex items-start gap-3">
            <div className="mt-0.5 inline-flex h-8 w-8 flex-none items-center justify-center rounded-lg bg-black text-white dark:bg-white dark:text-black">
                {icon}
            </div>
            <div>
                <p className="text-sm font-semibold text-black dark:text-white">
                    {label}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300">{desc}</p>
            </div>
        </div>
    );
}