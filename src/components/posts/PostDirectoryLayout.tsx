"use client";

import type { ReactNode } from "react";
import { Search } from "lucide-react";

import InsertNavbar from "@/components/InsertNavbar";
import { Input } from "@/components/ui/input";

type PostDirectoryLayoutProps = {
    title: string;
    description: string;
    query: string;
    onQueryChange: (value: string) => void;
    searchPlaceholder: string;
    accentClassName?: string;
    children: ReactNode;
};

export function PostDirectoryLayout({
    title,
    description,
    query,
    onQueryChange,
    searchPlaceholder,
    accentClassName = "text-emerald-600 dark:text-emerald-300",
    children,
}: PostDirectoryLayoutProps) {
    return (
        <main className="relative min-h-screen overflow-hidden bg-slate-50 dark:bg-[#020817]">
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-60 [background-image:linear-gradient(to_right,rgba(100,116,139,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(100,116,139,0.08)_1px,transparent_1px)] [background-size:48px_48px] [mask-image:linear-gradient(to_bottom,black,transparent_90%)]" />
            <div className="relative mx-auto max-w-[1720px] px-4 py-5 sm:px-7 lg:px-10 lg:py-7">
                <InsertNavbar />
                <section className="grid gap-6 border-b border-border/70 py-4 lg:grid-cols-[1fr_440px] lg:items-end">
                    <div>
                        <h1 className={`text-2xl font-semibold uppercase tracking-[0.1em] ${accentClassName}`}>{title}</h1>
                        <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">{description}</p>
                    </div>
                    <div className="rounded-2xl border border-border/70 bg-card/60 p-1 backdrop-blur">
                        <label className="flex h-12 items-center gap-3 rounded-xl px-3 focus-within:bg-background/80">
                            <Search className="h-4 w-4 text-muted-foreground" />
                            <Input value={query} onChange={(event) => onQueryChange(event.target.value)} placeholder={searchPlaceholder} className="border-0 bg-transparent px-0 shadow-none focus-visible:ring-0" />
                        </label>
                    </div>
                </section>
                {children}
            </div>
        </main>
    );
}
