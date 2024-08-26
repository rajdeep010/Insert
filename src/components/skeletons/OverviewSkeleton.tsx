import React from 'react'
import { Skeleton } from '../ui/skeleton'


const EachTopicBoxSkeleton = () => {
    return (
        <>
            <div className='border-[1px] p-4 rounded-md'>
                <div className='flex flex-col gap-2 text-wrap break-all'>
                    <Skeleton className='h-8 w-[180px]'/>
                    <Skeleton className='h-3 w-[300px]'/>
                </div>
            </div>
        </>
    )
}

const OverviewSkeleton = () => {
    const times = 6
    return (
        <div className='grid grid-cols-2 gap-5'>
            {
                Array.from({length: times}).map((_,idx) => (
                    <EachTopicBoxSkeleton key={idx}/>
                ))
            }
        </div>
    )
}

export default OverviewSkeleton