import { Skeleton } from '@/components/ui/skeleton'

export default function HeatmapSkeleton() {
    return <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white/65 dark:border-slate-800 dark:bg-slate-950/55"><div className="flex items-center justify-between border-b border-slate-200 p-5 dark:border-slate-800"><div className="space-y-2"><Skeleton className="h-6 w-40" /><Skeleton className="h-4 w-56" /></div><Skeleton className="h-9 w-28 rounded-lg" /></div><div className="p-5"><Skeleton className="h-36 w-full rounded-xl" /></div></section>
}
