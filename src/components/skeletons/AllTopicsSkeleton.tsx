import React from 'react'
import { Skeleton } from '../ui/skeleton'


const EachTopicSkeleton = () => {
    return (
        <div className='border-[1px] p-4 rounded-md flex flex-row items-center gap-4'>
            <div className='flex items-center gap-3 pr-4'>
                <div>
                    <Skeleton className='h-12 w-12 rounded-full' />
                </div>
                <div className='flex flex-col gap-1'>
                    <Skeleton className='h-4 w-[150px]' />
                    <Skeleton className='h-3 w-[90px]' />
                </div>
            </div>

            <div className='flex items-center gap-2'>
                <Skeleton className='h-8 w-[200px]' />
                <Skeleton className='h-3 w-[100px]' />
            </div>
        </div>
    )
}


const AllTopicsSkeleton = () => {
    let times = 6
    return (
        <>
            {
                Array.from({length: times}).map((_,idx) => (
                    <EachTopicSkeleton key={idx}/>
                ))
            }

        </>
    )
}

export default AllTopicsSkeleton
