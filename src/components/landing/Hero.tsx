"use client";

import Link from "next/link";
import { Button } from "../ui/button";
import { Spotlight } from "../ui/spotlight-new";
import { BackgroundBeams } from "../ui/background-beams";
import InsertIcon from "../InsertIcon";

export function Hero() {
    return (
        <section className="relative mx-auto flex min-h-[86vh] w-full flex-col items-center justify-center overflow-hidden px-6 pt-24">
            <Spotlight />
            <div className="relative z-20 mx-auto max-w-5xl text-center">
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/70 px-3 py-1 text-xs font-medium text-black shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/10 dark:text-white">
                    <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
                    Insert 4.0 — more powerful with pro
                </div>

                <div className="mb-4 flex items-center justify-center gap-3">
                    <InsertIcon
                        height={60}
                        width={60}
                        className="rounded-xl border-2 border-gray-900 p-1 dark:border-gray-700 dark:bg-white"
                    />
                    <h1 className="text-balance  text-5xl font-bold tracking-tight text-black dark:text-white md:text-6xl">
                        Insert
                    </h1>
                </div>

                <p className="mx-auto max-w-2xl text-pretty text-base text-gray-700 dark:text-gray-300 md:text-xl">
                    Simple, powerful developer documentation & release‑notes automation
                </p>

                <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                    <Link href="/sign-up">
                        <Button className="rounded-md text-sm font-medium border-2 dark:border-white border-black" variant="default">
                            Get Started
                        </Button>
                    </Link>
                </div>
            </div>
            <BackgroundBeams />
        </section>
    );
}