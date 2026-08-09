import { Skeleton } from '@/components/ui/skeleton'

export default function OverviewSkeleton() {
    return <div className="space-y-6">
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white/65 dark:border-slate-800 dark:bg-slate-950/55">
            <div className="space-y-3 p-5 sm:p-7"><Skeleton className="h-3 w-32" /><Skeleton className="h-9 w-2/3 max-w-xl" /><Skeleton className="h-4 w-1/2 max-w-md" /></div>
            <div className="grid border-t border-slate-200 dark:border-slate-800 sm:grid-cols-3">{Array.from({ length: 3 }).map((_, index) => <div key={index} className="flex items-center gap-3 px-5 py-4"><Skeleton className="h-9 w-9 rounded-lg" /><div className="space-y-2"><Skeleton className="h-6 w-10" /><Skeleton className="h-3 w-24" /></div></div>)}</div>
        </section>
        <div><div className="mb-4 space-y-2"><Skeleton className="h-3 w-24" /><Skeleton className="h-6 w-40" /></div><div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">{Array.from({ length: 4 }).map((_, index) => <WorkspaceCardSkeleton key={index} />)}</div></div>
    </div>
}

export function WorkspaceCardSkeleton() {
    return <div className="flex min-h-56 flex-col rounded-2xl border border-slate-200 bg-white/65 p-5 dark:border-slate-800 dark:bg-slate-950/55"><div className="flex justify-between"><Skeleton className="h-10 w-10 rounded-xl" /><Skeleton className="h-5 w-20 rounded-md" /></div><div className="mt-5 space-y-3"><Skeleton className="h-6 w-4/5" /><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-2/3" /></div><div className="mt-auto flex justify-between border-t border-slate-200 pt-4 dark:border-slate-800"><Skeleton className="h-3 w-24" /><Skeleton className="h-4 w-4" /></div></div>
}
