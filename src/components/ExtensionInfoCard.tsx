import { Puzzle, ShieldCheck } from "lucide-react";

import { cn } from "@/lib/utils";

export default function ExtensionInfoCard({ className }: { className?: string }) {
    return <div className={cn("rounded-2xl border border-indigo-500/20 bg-slate-950 p-5 text-white shadow-xl", className)}>
        <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10"><Puzzle className="h-5 w-5" /></span>
            <div>
                <p className="text-sm font-medium">Insert</p>
                <p className="text-xs text-slate-400">Developer Tools extension</p>
            </div>
        </div>
        <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4 text-xs text-slate-400">
            <span>Version 1.1.0</span>
            <span>133 KiB</span>
        </div>
        <div className="mt-4 flex items-center gap-2 text-xs text-slate-400"><ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />No unrelated data collection or ads</div>
    </div>;
}
