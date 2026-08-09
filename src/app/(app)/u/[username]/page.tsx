'use client'
import { useBlog } from '@/features/blog/context/BlogProvider'
import { useInsertProjects } from '@/features/project/context/InsertProjectProvider'
import { useInsertTopics } from '@/features/topic/context/InsertTopicProvider'
import { useInsertUser } from '@/features/user/context/InsertUserProvider'
import Blogs from '@/components/Blogs'
import Dashboard from '@/components/Dashboard'
import Heatmap from '@/components/Heatmap'
import InsertNavbar from '@/components/InsertNavbar'
import Overview from '@/components/Overview'
import PaymentPage from '@/components/PaymentPage'
import Profile from '@/components/Profile'
import Projects from '@/components/Projects'
import { CollectionDirectory } from '@/features/collection-v2/components/CollectionDirectory'
import { Loader2 } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import React, { useEffect } from 'react'


export default function UserPage() {
    const { data: session, status } = useSession()
    const router = useRouter()
    const params = useParams()
    const username = params.username as string
    const searchParams = useSearchParams()
    const tab = searchParams.get('tab') || 'overview'

    const { fetchProfileUser } = useInsertUser()
    const { fetchTopicsByUsername, fetchHeatmapActivity } = useInsertTopics()
    const { fetchBlogsByUsername, fetchBlogCollections } = useBlog()
    const { fetchProjectsByUsername } = useInsertProjects()

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.replace('/sign-in')
        }
    }, [router, status])

    useEffect(() => {
        if (status !== 'authenticated' || !username) return
        fetchProfileUser(username)
    }, [fetchProfileUser, status, username])

    useEffect(() => {
        if (status !== 'authenticated' || !username) return

        if (tab === 'overview') {
            fetchTopicsByUsername(username)
            fetchHeatmapActivity(username)
            return
        }

        if (tab === 'topics') {
            fetchTopicsByUsername(username)
            return
        }

        if (tab === 'blogs') {
            fetchBlogsByUsername(username)
            if (session?.user?.username === username) {
                fetchBlogCollections()
            }
            return
        }

        if (tab === 'collections') {
            return
        }

        if (tab === 'projects') {
            fetchProjectsByUsername(username)
        }
    }, [fetchBlogsByUsername, fetchBlogCollections, fetchHeatmapActivity, fetchProjectsByUsername, fetchTopicsByUsername, session?.user?.username, status, tab, username])

    if(status === "loading") {
        return <Loader2 className='absolute inset-0 m-auto animate-spin h-8 w-8' />
    }

    if(status !== "authenticated") {
        return null
    }

    return (
        <main className="relative min-h-screen overflow-hidden bg-slate-50 text-slate-950 dark:bg-[#020817] dark:text-slate-50">
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-60 [background-image:linear-gradient(to_right,rgba(100,116,139,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(100,116,139,0.08)_1px,transparent_1px)] [background-size:48px_48px] [mask-image:linear-gradient(to_bottom,black,transparent_92%)]" />
            <div aria-hidden="true" className="pointer-events-none absolute left-[8%] top-20 h-72 w-72 rounded-full bg-indigo-500/10 blur-[120px]" />
            <div className="relative mx-auto w-full max-w-[1720px] px-4 py-5 sm:px-7 lg:px-10 lg:py-7">
                <InsertNavbar />
                <div className="grid gap-6 py-6 lg:grid-cols-[280px_minmax(0,1fr)] xl:grid-cols-[310px_minmax(0,1fr)] lg:items-start">
                    <aside className="lg:sticky lg:top-6"><Profile /></aside>
                    <section className="min-w-0">
                    {tab === 'topics' && <Dashboard />}
                    {tab === 'overview' && <Overview />}
                    {tab === 'blogs' && <Blogs />}
                    {tab === 'collections' && <CollectionDirectory />}
                    {tab === 'projects' && <Projects/>}
                    {tab === 'subscribe' && <PaymentPage/>}
                        {tab === 'overview' && <div className="mt-6"><Heatmap /></div>}
                    </section>
                </div>
            </div>
        </main>
    )
}
