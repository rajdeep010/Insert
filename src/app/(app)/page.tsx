import { Button } from '@/components/ui/button'
import Link from 'next/link'
import React from 'react'
import '../globals.css'

export default function Home() {
    return (
        <div className='flex flex-col gap-5 justify-center min-h-screen items-center home-bg'>
            <div className='text-8xl my-2 font-extrabold'>Insert</div>
            <div className='text-5xl'>Share your problem sheets</div>
            <Link href='/sign-up' className='my-2'>
                <Button>Get Started</Button>
            </Link>
        </div>
    )
}

