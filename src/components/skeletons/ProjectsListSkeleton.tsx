import { Skeleton } from '@/components/ui/skeleton'

const ProjectCardSkeleton = () => <div className="flex min-h-72 flex-col rounded-2xl border border-slate-200 bg-white/65 p-5 dark:border-slate-800 dark:bg-slate-950/55"><div className="flex justify-between"><Skeleton className="h-10 w-10 rounded-xl" /><div className="flex gap-2"><Skeleton className="h-5 w-16 rounded-md" /><Skeleton className="h-8 w-8 rounded-lg" /></div></div><div className="mt-6 space-y-3"><Skeleton className="h-7 w-3/4" /><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-5/6" /><Skeleton className="h-4 w-1/2" /></div><div className="mt-auto flex gap-3 border-t border-slate-200 pt-4 dark:border-slate-800"><Skeleton className="h-4 w-20" /><Skeleton className="h-4 w-20" /><Skeleton className="ml-auto h-4 w-16" /></div></div>

export default function ProjectsListSkeleton({ count = 4 }: { count?: number }) {
    return <div className="grid auto-rows-fr gap-3 md:grid-cols-2 xl:grid-cols-3">{Array.from({ length: count }).map((_, index) => <ProjectCardSkeleton key={index} />)}</div>
}
