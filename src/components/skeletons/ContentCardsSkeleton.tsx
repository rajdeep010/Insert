import { Skeleton } from '@/components/ui/skeleton'

export default function ContentCardsSkeleton({ count = 6, image = false }: { count?: number; image?: boolean }) {
    return <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">{Array.from({ length: count }).map((_, index) => <div key={index} className="overflow-hidden rounded-2xl border border-slate-200 bg-white/65 dark:border-slate-800 dark:bg-slate-950/55">{image && <Skeleton className="h-44 w-full rounded-none" />}<div className="flex min-h-52 flex-col p-5"><div className="flex justify-between"><Skeleton className="h-9 w-9 rounded-xl" /><Skeleton className="h-5 w-16 rounded-md" /></div><div className="mt-5 space-y-3"><Skeleton className="h-6 w-4/5" /><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-2/3" /></div><div className="mt-auto border-t border-slate-200 pt-4 dark:border-slate-800"><Skeleton className="h-3 w-28" /></div></div></div>)}</div>
}
