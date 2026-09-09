import Link from "next/link";
import { ArrowRight, Chrome, Check, ListChecks, LayoutDashboard, MousePointerClick } from "lucide-react";

import ExtensionInfoCard from "@/components/ExtensionInfoCard";
import { Button } from "@/components/ui/button";
import { CHROME_EXTENSION_URL } from "@/lib/constants";

const points = [
    { icon: MousePointerClick, text: "Capture a problem's title, link, difficulty, and notes in one click" },
    { icon: LayoutDashboard, text: "Route every save straight to the Insert sheet you're practicing from" },
    { icon: ListChecks, text: "Keep details structured and ready to review later" },
];

export function Extension() {
    return <section id="extension" className="relative scroll-mt-24 overflow-hidden bg-white py-16 dark:bg-[#030a18] sm:py-24">
        <div className="relative mx-auto max-w-[1560px] px-4 sm:px-8 lg:px-12">
            <div className="grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)] lg:items-center">
                <div>
                    <p className="flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-300"><Chrome className="h-3.5 w-3.5" />Chrome extension</p>
                    <h2 className="mt-4 max-w-2xl text-4xl font-semibold tracking-[-0.05em] sm:text-6xl">Save problems<br /><span className="text-slate-400">without leaving the tab.</span></h2>
                    <p className="mt-4 max-w-xl text-sm leading-6 text-slate-500">Install the Insert extension and capture coding problems while you browse. Every save lands in your Insert sheet, structured and ready to revisit.</p>
                    <ul className="mt-6 space-y-3">{points.map(({ icon: Icon, text }) => <li key={text} className="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-300"><span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-indigo-500/10 text-indigo-500"><Icon className="h-3.5 w-3.5" /></span>{text}</li>)}</ul>
                    <div className="mt-8 flex flex-wrap gap-3">
                        <Button asChild size="lg" className="rounded-md"><a href={CHROME_EXTENSION_URL} target="_blank" rel="noopener noreferrer"><Chrome className="mr-2 h-4 w-4" />Add to Chrome</a></Button>
                        <Button asChild size="lg" variant="outline" className="rounded-md"><Link href="/extension">Learn more<ArrowRight className="ml-2 h-4 w-4" /></Link></Button>
                    </div>
                    <div className="mt-6 flex items-center gap-1.5 text-xs text-slate-500"><Check className="h-3.5 w-3.5 text-emerald-500" />Free to install, works with your existing sheets</div>
                </div>
                <div className="relative"><div className="absolute -inset-8 rounded-full bg-indigo-500/10 blur-3xl" /><ExtensionInfoCard className="relative" /></div>
            </div>
        </div>
    </section>;
}
