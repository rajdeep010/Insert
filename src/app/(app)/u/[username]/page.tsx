'use client'
import { useTopics } from '@/app/context/TopicProvider'
import { useUser } from '@/app/context/UserProvider'
import Dashboard from '@/components/Dashboard'
import Heatmap from '@/components/Heatmap'
import Navbar from '@/components/Navbar'
import Overview from '@/components/Overview'
import Profile from '@/components/Profile'
import { useParams } from 'next/navigation'
import React from 'react'


export default function UserPage() {
    const params = useParams()
    const username = params.username
    const { user_information, isOverviewVisible, isDashboardVisible } = useUser()
    const { user_Topics } = useTopics()

    // const currentUserTopics = (username === curr_user?.username) ? user_Topics : others_Topics
    const currentUserTopics = user_Topics

    return (
        <div className='flex gap-10 justify-center py-10 px-6 content-col'>
            {/* profile section */}
            <Profile />


            {/* overview section */}
            <div className='w-3/5 flex flex-col gap-5 full-width'>
                <div><Navbar /></div>
                <div>
                    {
                        isDashboardVisible && <Dashboard topics={currentUserTopics} />
                    }

                    {
                        isOverviewVisible && <Overview topics={currentUserTopics} />
                    }

                </div>

                <div>
                    {
                        isOverviewVisible && <Heatmap />
                    }
                </div>
            </div>
        </div>
    )
}

