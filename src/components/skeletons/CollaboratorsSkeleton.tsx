import React from 'react'
import { Skeleton } from '../ui/skeleton'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'


const EachItemSkeleton = () => {
    return (
        <Skeleton className='h-10 w-10 rounded-full' />
    )
}


const CollaboratorsSkeleton = () => {
    let times = 5
    return (
        <>
            <div className='flex items-center gap-2'>
            {
                Array.from({ length: times }).map((_, idx) => (
                    <EachItemSkeleton key={idx} />
                ))
            }
            </div>
        </>
    )
}

export default CollaboratorsSkeleton