import { Sparkles } from "lucide-react";

import { cn } from "@/lib/utils";

export default function AssistantInfoCard({ className }: { className?: string }) {
    return <div className={cn("rounded-2xl border border-indigo-500/20 bg-slate-950 p-5 text-white shadow-xl", className)}>
        <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10"><Sparkles className="h-5 w-5" /></span>
            <div>
                <p className="text-sm font-medium">Dex</p>
                <p className="text-xs text-slate-400">Insert&apos;s assistant</p>
            </div>
        </div>
        <div className="mt-5 space-y-2 border-t border-white/10 pt-4">
            <div className="ml-auto max-w-[80%] rounded-xl rounded-br-sm bg-white px-3 py-1.5 text-xs text-slate-950">How many hard problems do I have?</div>
            <div className="max-w-[80%] rounded-xl rounded-bl-sm bg-white/10 px-3 py-1.5 text-xs text-slate-200">You have 6 hard problems across your topics.</div>
        </div>
    </div>;
}
