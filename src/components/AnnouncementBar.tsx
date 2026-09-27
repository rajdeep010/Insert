"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, Sparkles, X } from "lucide-react";

const DISMISS_KEY = "insert-announcement-dex-v7.1";
const HEIGHT_VAR = "--announcement-height";

export function AnnouncementBar() {
    const [dismissed, setDismissed] = useState(true);
    const barRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        try {
            setDismissed(localStorage.getItem(DISMISS_KEY) === "1");
        } catch {
            setDismissed(false);
        }
    }, []);

    // The landing navbar is `fixed`, so it ignores this bar's height entirely
    // unless told about it explicitly — publish the real (possibly wrapped,
    // possibly zero once dismissed) height as a CSS var it can read from.
    useEffect(() => {
        if (dismissed || !barRef.current) {
            document.documentElement.style.setProperty(HEIGHT_VAR, "0px");
            return;
        }

        const el = barRef.current;
        const updateHeight = () => document.documentElement.style.setProperty(HEIGHT_VAR, `${el.offsetHeight}px`);
        updateHeight();

        const observer = new ResizeObserver(updateHeight);
        observer.observe(el);
        return () => {
            observer.disconnect();
            document.documentElement.style.setProperty(HEIGHT_VAR, "0px");
        };
    }, [dismissed]);

    if (dismissed) return null;

    const handleDismiss = () => {
        setDismissed(true);
        try {
            localStorage.setItem(DISMISS_KEY, "1");
        } catch {
            // localStorage can throw in private/blocked-storage contexts — dismissal
            // just won't persist across reloads there, which is an acceptable fallback.
        }
    };

    return (
        <div
            ref={barRef}
            className="relative z-[60] flex items-center justify-center gap-2 bg-emerald-500 px-10 py-2 text-center text-xs font-medium text-slate-950 sm:text-sm"
        >
            <Sparkles className="h-3.5 w-3.5 shrink-0" />
            <span>New: Meet Dex, Insert&apos;s AI assistant.</span>
            <Link href="/assistant" className="inline-flex items-center gap-1 font-semibold underline underline-offset-2">
                Try it now <ArrowRight className="h-3 w-3" />
            </Link>
            <button
                onClick={handleDismiss}
                aria-label="Dismiss announcement"
                className="absolute right-3 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded hover:bg-black/10"
            >
                <X className="h-3.5 w-3.5" />
            </button>
        </div>
    );
}
