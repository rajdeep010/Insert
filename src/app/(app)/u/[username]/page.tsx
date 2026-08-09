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
        <div className='flex gap-10 justify-center py-10 px-6 content-col'>
            <Profile />


            <div className='w-3/5 flex flex-col gap-5 full-width'>
                <div><InsertNavbar /></div>
                <div>
                    {tab === 'topics' && <Dashboard />}
                    {tab === 'overview' && <Overview />}
                    {tab === 'blogs' && <Blogs />}
                    {tab === 'collections' && <CollectionDirectory />}
                    {tab === 'projects' && <Projects/>}
                    {tab === 'subscribe' && <PaymentPage/>}
                </div>
                <div>
                    {tab === 'overview' && <Heatmap />}
                </div>
            </div>
        </div>
    )
}
