"use client";
import { BadgeCheck } from "lucide-react";

export function Changelog() {
    return (
        <section id="changelog" className="mx-auto max-w-6xl px-4 py-8 md:py-12">
            <div className="rounded-2xl border border-black/10 bg-gradient-to-tr from-emerald-50 to-blue-50 p-6 shadow-sm dark:border-white/10 dark:from-white/5 dark:to-white/0">
                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                    <div>
                        <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-emerald-600/10 px-3 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                            <BadgeCheck className="h-4 w-4" />
                            Latest Release
                        </div>
                        <h3 className="text-2xl font-bold text-black dark:text-white">
                            Insert 3.0 — Project Service + UI revamp
                        </h3>
                        <p className="mt-2 max-w-2xl text-sm text-gray-700 dark:text-gray-300">
                            This release introduces the Project Service with keyword-based commit triggers for automatic release blogs. Major UI updates, microservice architecture refactor, and performance improvements included.
                        </p>
                    </div>

                    <div className="shrink-0">
                        <a
                            href="/sign-up"
                            className="inline-flex items-center justify-center rounded-md border border-black/10 bg-white px-4 py-2 text-sm font-medium text-black shadow-sm hover:bg-gray-50 dark:border-white/10 dark:bg-white/10 dark:text-white dark:hover:bg-white/15"
                        >
                            Try it now
                        </a>
                    </div>
                </div>
            </div>
        </section>
    );
}