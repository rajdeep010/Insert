import { Button } from '@/components/ui/button'
import Link from 'next/link'
import React from 'react'
import '../globals.css'
import { DiamondMinus,Linkedin } from 'lucide-react'
import { ThreeDMarqueeDemoSecond } from '@/components/Hero'
import { About } from '@/components/About'
import { GlobeConnect } from '@/components/GlobeConnect'
import { GitHubLogoIcon,InstagramLogoIcon } from '@radix-ui/react-icons'

export default function Home() {
    return (
        <div className='bg-black overflow-x-hidden'>
            <ThreeDMarqueeDemoSecond />
            <About />
            {/* <GlobeConnect/> */}
            <div className="flex flex-col justify-center items-center gap-8 my-24 mx-auto max-w-[100px]">
                <div className="flex justify-around gap-8">
                    <Link href={'https://www.linkedin.com/in/rajdeep-mallick999/'}><Linkedin className="h-6 w-6" /></Link>
                    <Link href={'https://github.com/rajdeep010'}><GitHubLogoIcon className="h-6 w-6" /></Link>
                    <Link href={'https://www.instagram.com/rajdeepmallick010/'}><InstagramLogoIcon className="h-6 w-6" /></Link>
                </div>
                <div className='flex gap-2 text-gray-500 text-sm mt-2'>
                    <span>Insert2.0</span>{" "}<span>•</span>{" "}<span>2025</span>
                </div>
            </div>
        </div>
    )
}

