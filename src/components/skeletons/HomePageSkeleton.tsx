import AvatarSkeleton from '@/components/skeletons/AvatarSkeleton'
import OverviewSkeleton from '@/components/skeletons/OverviewSkeleton'
import ProfileSkeleton from '@/components/skeletons/ProfileSkeleton'
import { Skeleton } from '@/components/ui/skeleton'

export default function HomePageSkeleton() {
    return <main className="min-h-screen bg-slate-50 dark:bg-[#020817]"><div className="mx-auto max-w-[1720px] px-4 py-5 sm:px-7 lg:px-10"><Skeleton className="h-16 w-full rounded-2xl" /><div className="grid gap-6 py-6 lg:grid-cols-[310px_minmax(0,1fr)]"><aside className="overflow-hidden rounded-2xl border border-slate-200 bg-white/65 dark:border-slate-800 dark:bg-slate-950/55"><Skeleton className="h-20 w-full rounded-none" /><div className="-mt-10 space-y-5 px-5 pb-5"><AvatarSkeleton /><ProfileSkeleton /></div></aside><OverviewSkeleton /></div></div></main>
}
