import React from 'react'
import { Skeleton } from '../ui/skeleton'


const EachItemSkeleton = () => {
    return (
        <div className='border-2 p-4 rounded-md flex items-center gap-4'>
            <Skeleton className='h-8 w-[200px]' />
            <Skeleton className='h-3 w-[70px]' />
        </div>
    )
}


const DashboardSkeleton = () => {
    let times = 6
    return (
        <>
            {
                Array.from({ length: times }).map((_, idx) => (
                    <EachItemSkeleton key={idx} />
                ))
            }

        </>
    )
}

export default DashboardSkeleton