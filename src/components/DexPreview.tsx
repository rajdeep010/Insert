"use client";

import { useState } from "react";
import { Volume2, VolumeX } from "lucide-react";

import AssistantInfoCard from "@/components/AssistantInfoCard";
import { cn } from "@/lib/utils";

const DEX_VIDEO_URL = "https://res.cloudinary.com/dgxeg3sju/video/upload/v1790486327/dex-insert_vhy4xs.mp4";
const DEX_LAUNCH_URL = "https://res.cloudinary.com/dgxeg3sju/video/upload/v1790538547/dex-insert-launch_qff2mm.mp4";

export default function DexPreview({
    className,
    variant = "preview",
}: {
    className?: string;
    variant?: "preview" | "launch";
}) {
    const [videoFailed, setVideoFailed] = useState(false);
    // Starts muted, not because that's the goal, but because it's what makes
    // autoplay actually work: browsers block autoplay-with-sound for visitors
    // with no prior media-engagement history on the site, so an unmuted
    // default would just leave the video frozen on frame one for most
    // first-time visitors. Same pattern Twitter/Instagram/Facebook use for
    // autoplaying video — muted by default, one tap to unmute.
    const [muted, setMuted] = useState(true);

    if (videoFailed) return <AssistantInfoCard className={cn("relative", className)} />;

    const src = variant === "launch" ? DEX_LAUNCH_URL : DEX_VIDEO_URL;

    return (
        <div className={cn("relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-950 shadow-2xl shadow-slate-950/10 dark:border-slate-800", className)}>
            <video
                src={src}
                autoPlay
                loop
                playsInline
                muted={muted}
                preload="metadata"
                aria-label="Dex, Insert's AI assistant, answering questions in the workspace"
                onError={() => setVideoFailed(true)}
                onContextMenu={(event) => event.preventDefault()}
                onDoubleClick={(event) => event.preventDefault()}
                className="block aspect-video h-auto w-full object-cover"
            />
            <button
                type="button"
                onClick={() => setMuted((prev) => !prev)}
                aria-label={muted ? "Unmute video" : "Mute video"}
                className="absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-slate-950/70 text-white backdrop-blur transition hover:bg-slate-950/90"
            >
                {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </button>
        </div>
    );
}
