import React from 'react'
import { Skeleton } from "@/components/ui/skeleton"


const ProfileSkeleton = () => {
    return (
        <div className='flex flex-col items-start justify-between mt-4 gap-6 profile-details-gap'>
            <div className='flex flex-col gap-2'>
                <Skeleton className='h-3 w-[100px]'/>
                <Skeleton className='h-6 w-[170px]'/>
                <Skeleton className='h-3 w-[200px]'/>
            </div>

            <div className='flex flex-col gap-1'>
                <div className="flex gap-2">
                    <Skeleton className='h-6 w-6 rounded-full' />
                    <Skeleton className='h-3 w-[130px]'/>
                </div>
                <div className="flex gap-2">
                    <Skeleton className='h-6 w-6 rounded-full' />
                    <Skeleton className='h-3 w-[160px]'/>
                </div>
                <div className="flex gap-2">
                    <Skeleton className='h-6 w-6 rounded-full' />
                    <Skeleton className='h-3 w-[180px]'/>
                </div>
                <div className="flex gap-2">
                    <Skeleton className='h-6 w-6 rounded-full' />
                    <Skeleton className='h-3 w-[180px]'/>
                </div>
            </div>
        </div>
    )
}

export default ProfileSkeleton