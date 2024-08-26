import React from 'react'
import { Skeleton } from '../ui/skeleton';


const HeatmapSkeleton = () => {
    return (
        <div className='my-6'>
            <div className='flex items-center mb-[20px] text-md'>
                <Skeleton className='mr-2 font-medium h-6 w-[80px]'/>
                <Skeleton className=' cursor-pointer h-4 w-[50px]' />
            </div>

            <div className='px-6 py-4 border-[1px] rounded-md'>
                <Skeleton className='h-[125px] w-full'/>
            </div>
        </div>
    )
}

export default HeatmapSkeleton