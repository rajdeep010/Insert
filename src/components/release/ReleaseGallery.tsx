"use client";

import Image from "next/image";
import { useState } from "react";
import { ArrowLeft, ArrowRight, Expand } from "lucide-react";

import { Button } from "@/components/ui/button";

export type ReleaseScreenshot = { title: string; description: string; image: string };

export function ScreenshotGallery({ screenshots }: { screenshots: ReleaseScreenshot[] }) {
    const [activeShot, setActiveShot] = useState(0);
    const shot = screenshots[activeShot];
    return <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white/65 shadow-sm dark:border-slate-800 dark:bg-slate-950/55">
        <div className="relative aspect-[16/9] overflow-hidden bg-slate-950"><Image key={shot.image} src={shot.image} alt={shot.title} fill priority={activeShot === 0} sizes="(max-width: 1280px) 100vw, 1200px" className="object-contain" /><div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/10" /><span className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-md border border-white/10 bg-slate-950/70 text-white backdrop-blur"><Expand className="h-4 w-4" /></span></div>
        <div className="flex flex-col gap-4 border-t border-slate-200 p-4 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between sm:p-5"><div><p className="text-sm font-medium">{shot.title}</p><p className="mt-1 text-xs leading-5 text-slate-500">{shot.description}</p></div><div className="flex items-center gap-3"><span className="font-mono text-xs text-slate-500">{String(activeShot + 1).padStart(2, "0")} / {String(screenshots.length).padStart(2, "0")}</span><Button variant="outline" size="icon" className="rounded-md" disabled={activeShot === 0} onClick={() => setActiveShot((value) => value - 1)}><ArrowLeft className="h-4 w-4" /></Button><Button variant="outline" size="icon" className="rounded-md" disabled={activeShot === screenshots.length - 1} onClick={() => setActiveShot((value) => value + 1)}><ArrowRight className="h-4 w-4" /></Button></div></div>
        <div className="grid border-t border-slate-200 dark:border-slate-800 sm:grid-cols-4">{screenshots.map((item, index) => <button key={item.image} type="button" onClick={() => setActiveShot(index)} className={`border-b-2 px-4 py-3 text-left text-xs transition ${index === activeShot ? "border-indigo-500 bg-indigo-500/[0.06] text-indigo-600 dark:text-indigo-300" : "border-transparent text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900"}`}>{item.title}</button>)}</div>
    </section>
}
