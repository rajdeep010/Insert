'use client'
import { useTopics } from '@/app/context/TopicProvider'
import { useUser } from '@/app/context/UserProvider'
import Page from '@/app/simple/page'
import Blogs from '@/components/Blogs'
import Dashboard from '@/components/Dashboard'
import Heatmap from '@/components/Heatmap'
import InsertNavbar from '@/components/InsertNavbar'
import Overview from '@/components/Overview'
import Profile from '@/components/Profile'
import { useParams, useSearchParams } from 'next/navigation'
import React from 'react'


export default function UserPage() {
    const params = useParams()
    const username = params.username
    const { user_information, isOverviewVisible, isDashboardVisible, isBlogEditorVisible } = useUser()
    const { user_Topics } = useTopics()

    const currentUserTopics = user_Topics
    const searchParams = useSearchParams()
    const tab = searchParams.get('tab') || 'overview'

    return (
        <div className='flex gap-10 justify-center py-10 px-6 content-col'>
            <Profile />


            <div className='w-3/5 flex flex-col gap-5 full-width'>
                <div><InsertNavbar /></div>
                <div>
                    {tab === 'topics' && <Dashboard topics={currentUserTopics} />}
                    {tab === 'overview' && <Overview topics={currentUserTopics} />}
                    {tab === 'blogs' && <Blogs />}
                </div>
                <div>
                    {tab === 'overview' && <Heatmap />}
                </div>
            </div>
        </div>
    )
}

