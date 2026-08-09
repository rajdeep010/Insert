'use client'

import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { ArrowRight, BookOpen, Crown, Eye, FileText, Globe2, Lock, ShieldCheck } from 'lucide-react'

import OverviewSkeleton from '@/components/skeletons/OverviewSkeleton'
import { Badge } from '@/components/ui/badge'
import { useInsertTopics } from '@/features/topic/context/InsertTopicProvider'
import { useInsertUser } from '@/features/user/context/InsertUserProvider'
import { getLastModifiedText } from '@/helpers/last-modified'

export default function Overview() {
    const { isTopicsLoading, user_Topics } = useInsertTopics()
    const { profileUser } = useInsertUser()
    const { data: session } = useSession()
    const topics = user_Topics || []
    const featured = topics.slice(0, 4)
    const publicCount = topics.filter((topic) => topic.visibility === 'public').length

    if (isTopicsLoading) return <OverviewSkeleton />

    return (
        <div className="space-y-6">
            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white/65 shadow-sm backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/55">
                <div className="grid gap-6 p-5 sm:p-7 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
                    <div><p className="text-[10px] font-medium uppercase tracking-[0.18em] text-indigo-600 dark:text-indigo-300">Workspace overview</p><h2 className="mt-2 text-3xl font-semibold tracking-[-0.04em]"><span className='text-muted-foreground'>Hi 👋</span> <span className='mr-4'>{profileUser?.name || profileUser?.username}</span></h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-400">A quick view of published sheets, shared knowledge, and recent work.</p></div>
                    <Link href={`/u/${profileUser?.username}?tab=topics`} className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-300">View all topics<ArrowRight className="h-4 w-4" /></Link>
                </div>
                <div className="grid border-t border-slate-200 dark:border-slate-800 sm:grid-cols-3">
                    {[{ icon: BookOpen, label: 'Topics', value: topics.length }, { icon: Globe2, label: 'Public sheets', value: publicCount }, { icon: Lock, label: 'Collections', value: topics.length - publicCount }].map(({ icon: Icon, label, value }, index) => <div key={label} className={`flex items-center gap-3 px-5 py-4 ${index ? 'border-t border-slate-200 dark:border-slate-800 sm:border-l sm:border-t-0' : ''}`}><span className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-500"><Icon className="h-4 w-4" /></span><div><p className="text-2xl font-semibold leading-none">{value}</p><p className="mt-1 text-xs text-slate-500">{label}</p></div></div>)}
                </div>
            </section>

            <section>
                <div className="mb-4 flex items-end justify-between gap-4"><div><p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">Recent work</p><h3 className="mt-1 text-xl font-semibold">Featured topics</h3></div><Badge variant="outline">{topics.length} total</Badge></div>
                {featured.length ? <div className="grid auto-rows-fr gap-3 md:grid-cols-2 xl:grid-cols-4">{featured.map((topic) => {
                    const role = topic.creator_username === session?.user?.username ? 'OWNER' : topic.currentAccessRole
                    const access = role === 'OWNER' ? { label: 'Owner', icon: Crown } : role === 'EDITOR' ? { label: 'Editor', icon: ShieldCheck } : role === 'VIEWER' ? { label: 'Viewer', icon: Eye } : null
                    const AccessIcon = access?.icon
                    return <Link key={topic.id} href={`/topic/${topic.id}`} className="group flex min-h-56 flex-col rounded-2xl border border-slate-200 bg-white/65 p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-400/40 dark:border-slate-800 dark:bg-slate-950/55"><div className="flex items-start justify-between gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-500"><FileText className="h-5 w-5" /></span><div className="flex gap-1"><Badge variant={topic.visibility === 'private' ? 'destructive' : 'secondary'} className="text-[9px] uppercase">{topic.visibility}</Badge>{access && AccessIcon && <Badge variant="outline" className="gap-1 text-[9px]"><AccessIcon className="h-3 w-3" />{access.label}</Badge>}</div></div><h4 className="mt-5 line-clamp-2 text-lg font-semibold group-hover:text-indigo-600 dark:group-hover:text-indigo-300">{topic.title}</h4><p className="mt-2 line-clamp-2 text-sm leading-5 text-slate-500">{topic.about || 'A structured coding sheet.'}</p><div className="mt-auto flex items-center justify-between border-t border-slate-200 pt-4 text-xs text-slate-500 dark:border-slate-800"><span>{getLastModifiedText(topic.createdAt)}</span><ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></div></Link>
                })}</div> : <div className="flex min-h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white/40 text-center dark:border-slate-700 dark:bg-slate-950/35"><BookOpen className="h-7 w-7 text-slate-400" /><h3 className="mt-3 font-medium">No topics yet</h3><p className="mt-1 text-sm text-slate-500">Created and shared topics will appear here.</p></div>}
            </section>
        </div>
    )
}
