'use client'
import React from 'react'
import { ModeToggle } from './ModeToggle'
import Link from 'next/link'



const Footer = () => {
    return (
        <div className='flex flex-row items-center justify-start'>
            <div className='font-sans text-sm fixed bottom-5 left-5 border-2 p-2 rounded-md dark:bg-gray-50 dark:text-black bg-gray-900 text-white'>Made with ❤️ by <Link className='text-blue-500' href='https://www.linkedin.com/in/rajdeep-mallick999'>Rajdeep Mallick</Link></div>

            <div className='fixed text-lg w-fit z-100 bottom-5 right-5'>
                <ModeToggle />
            </div>
        </div>

    )
}

export default Footer