import React from 'react'
import AvatarSkeleton from './AvatarSkeleton'
import ProfileSkeleton from './ProfileSkeleton'
import OverviewSkeleton from './OverviewSkeleton'



const HomePageSkeleton = () => {
    return (
        <>
            <div className='flex gap-10 justify-center py-10 px-6 content-col'>
                
                <div className='flex flex-col gap-4'>
                    <AvatarSkeleton/>
                    <ProfileSkeleton/>
                </div>

                <div>
                    <OverviewSkeleton/>
                </div>
            </div>
        </>
    )
}

export default HomePageSkeleton