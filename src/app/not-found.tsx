'use client'
import Image from 'next/image'
import Link from 'next/link'

export default function NotFound() {
    return (
        <div className="flex flex-col items-center justify-center h-screen text-center p-2">
            <Image src={'/not-found.svg'} height={300} width={300} alt='not-found'  className='mb-12' />
            <h1 className="text-4xl font-bold">Page Not Found</h1>
            <p className="text-lg mt-4">Sorry, the page you are looking for does not exist.</p>
            <Link href="/" className="mt-6 text-blue-500 hover:underline">
                Go back
            </Link>
        </div>
    )
}
