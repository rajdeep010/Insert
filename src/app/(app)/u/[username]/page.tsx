'use client'
import Blogs from '@/components/Blogs'
import Dashboard from '@/components/Dashboard'
import Heatmap from '@/components/Heatmap'
import InsertNavbar from '@/components/InsertNavbar'
import Overview from '@/components/Overview'
import PaymentPage from '@/components/PaymentPage'
import Profile from '@/components/Profile'
import Projects from '@/components/Projects'
import { Loader2 } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import React from 'react'


export default function UserPage() {
    const {status} = useSession()
    const router = useRouter()
    const searchParams = useSearchParams()
    const tab = searchParams.get('tab') || 'overview'

    if(status === "unauthenticated"){
        router.push('/sign-in')
    } else if(status === "loading") {
        return <Loader2 className='absolute inset-0 m-auto animate-spin h-8 w-8' />
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

