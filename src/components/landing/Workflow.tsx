"use client";
import { CheckCircle2, BookmarkPlus, Send } from "lucide-react";

const steps = [
    {
        title: "Connect repo",
        desc: "Import a GitHub project with one click.",
        icon: BookmarkPlus,
    },
    {
        title: "Commit with keyword",
        desc: "Include your trigger (e.g. #release) in the commit message.",
        icon: Send,
    },
    {
        title: "Auto-generate post",
        desc: "A release blog is created with commit summaries and links.",
        icon: CheckCircle2,
    },
];

export function Workflow() {
    return (
        <section id="workflow" className="mx-auto max-w-5xl px-4 py-8 md:py-12">
            <h2 className="text-center text-3xl font-bold tracking-tight text-black dark:text-white md:text-5xl">
                Workflow in three steps
            </h2>

            <ol className="mx-auto mt-8 grid max-w-3xl grid-cols-1 gap-4">
                {steps.map(({ title, desc, icon: Icon }, idx) => (
                    <li
                        key={title}
                        className="relative rounded-2xl border border-black/10 bg-white/70 p-5 backdrop-blur dark:border-white/10 dark:bg-white/5"
                    >
                        <div className="flex items-start gap-4">
                            <div className="inline-flex h-10 w-10 flex-none items-center justify-center rounded-lg bg-black text-white dark:bg-white dark:text-black">
                                <Icon className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-black dark:text-white">
                                    {idx + 1}. {title}
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-300">
                                    {desc}
                                </p>
                            </div>
                        </div>
                    </li>
                ))}
            </ol>
        </section>
    );
}