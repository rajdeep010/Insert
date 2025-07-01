import { Button } from '@/components/ui/button'
import Link from 'next/link'
import React from 'react'
import '../globals.css'
import { DiamondMinus } from 'lucide-react'

export default function Home() {
    return (
        <div className='flex flex-col gap-5 justify-center min-h-screen items-center'>
            <div className='text-8xl my-2 font-sans tracking-wide'><DiamondMinus/>{" "} Insert</div>
            <div className='text-3xl'>Share your coding problem sheets</div>
            <Link href='/sign-up' className='my-2'>
                <Button>Get Started</Button>
            </Link>
        </div>
    )
}

