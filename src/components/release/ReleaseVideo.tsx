"use client";

export type ReleaseVideoProps = {
    src: string;
    poster?: string;
    title: string;
    description: string;
};

export function ReleaseVideo({ src, poster, title, description }: ReleaseVideoProps) {
    return <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white/65 shadow-sm dark:border-slate-800 dark:bg-slate-950/55">
        <div className="relative aspect-[16/9] overflow-hidden bg-slate-950">
            <video key={src} src={src} poster={poster} controls playsInline className="h-full w-full object-contain" />
        </div>
        <div className="border-t border-slate-200 p-4 dark:border-slate-800 sm:p-5">
            <p className="text-sm font-medium">{title}</p>
            <p className="mt-1 text-xs leading-5 text-slate-500">{description}</p>
        </div>
    </section>;
}
