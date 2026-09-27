"use client";

import { useState } from "react";

import AssistantInfoCard from "@/components/AssistantInfoCard";
import { cn } from "@/lib/utils";

const DEX_VIDEO_URL = "https://res.cloudinary.com/dgxeg3sju/video/upload/v1790482525/insert-dex2_b8evqv.mp4";

export default function DexPreview({ className }: { className?: string }) {
    const [videoFailed, setVideoFailed] = useState(false);

    if (videoFailed) return <AssistantInfoCard className={cn("relative", className)} />;

    return <div className={cn("relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-950 shadow-2xl shadow-slate-950/10 dark:border-slate-800", className)}>
        <video src={DEX_VIDEO_URL} autoPlay muted loop playsInline preload="metadata" aria-label="Dex, Insert's AI assistant, answering questions in the workspace" onError={() => setVideoFailed(true)} className="block aspect-video h-auto w-full object-cover" />
    </div>;
}
