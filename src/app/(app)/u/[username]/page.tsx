'use client'
import { useInsertTopics } from '@/app/context/InsertTopicProvider'
import { useTopics } from '@/app/context/TopicProvider'
import Blogs from '@/components/Blogs'
import Dashboard from '@/components/Dashboard'
import Heatmap from '@/components/Heatmap'
import InsertNavbar from '@/components/InsertNavbar'
import Overview from '@/components/Overview'
import Profile from '@/components/Profile'
import Projects from '@/components/Projects'
import { useParams, useSearchParams } from 'next/navigation'
import React from 'react'


export default function UserPage() {
    const params = useParams()
    // const { user_Topics } = useTopics()
    const { user_Topics } = useInsertTopics()

    const currentUserTopics = user_Topics
    const searchParams = useSearchParams()
    const tab = searchParams.get('tab') || 'overview'

    return (
        <div className='flex gap-10 justify-center py-10 px-6 content-col'>
            <Profile />


            <div className='w-3/5 flex flex-col gap-5 full-width'>
                <div><InsertNavbar /></div>
                <div>
                    {tab === 'topics' && <Dashboard />}
                    {tab === 'overview' && <Overview />}
                    {tab === 'blogs' && <Blogs />}
                    {tab === 'projects' && <Projects/>}
                </div>
                <div>
                    {tab === 'overview' && <Heatmap />}
                </div>
            </div>
        </div>
    )
}

