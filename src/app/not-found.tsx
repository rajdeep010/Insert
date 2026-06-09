import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function NotFound() {
    return (
        <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background px-6">
            {/* Grid Background - Consistent with your Hero/Releases pages */}
            <div
                className="pointer-events-none fixed inset-0 z-0"
                style={{
                    backgroundImage: [
                        "linear-gradient(hsl(var(--border) / 0.5) 1px, transparent 1px)",
                        "linear-gradient(90deg, hsl(var(--border) / 0.5) 1px, transparent 1px)",
                    ].join(", "),
                    backgroundSize: "48px 48px",
                }}
            />

            {/* Decorative Blur - Consistent with your Landing page */}
            <div className="pointer-events-none fixed left-1/2 top-1/2 -z-10 h-[32rem] w-[32rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-tr from-indigo-400/20 to-transparent blur-3xl" />

            {/* Content */}
            <div className="relative z-10 flex w-full max-w-sm flex-col items-center text-center">
                {/* Technical Label */}
                <span className="font-mono text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
                    404 error
                </span>

                {/* Heading */}
                <h1 className="mt-4 text-4xl font-medium tracking-tight text-foreground md:text-5xl">
                    Page not found
                </h1>

                {/* Description */}
                <p className="mt-4 text-muted-foreground">
                    The page you are looking for does not exist or has been moved.
                </p>

                {/* Action Button */}
                <Link
                    href="/"
                    className="mt-8 flex items-center gap-2 rounded-xl border border-border bg-background px-6 py-3 text-sm font-medium text-foreground transition-all hover:bg-muted/50 hover:border-foreground/20"
                >
                    <ArrowLeft size={16} />
                    Return home
                </Link>
            </div>
        </div>
    );
}