import { Skeleton } from '@/components/ui/skeleton'

export default function ProfileSkeleton() {
    return <div className="space-y-5"><div className="space-y-2"><Skeleton className="h-3 w-24" /><Skeleton className="h-7 w-44" /><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-4/5" /></div><div className="space-y-3 border-t border-slate-200 pt-4 dark:border-slate-800">{Array.from({ length: 4 }).map((_, index) => <div key={index} className="flex items-center gap-3"><Skeleton className="h-4 w-4 rounded" /><Skeleton className="h-4 w-2/3" /></div>)}</div></div>
}
