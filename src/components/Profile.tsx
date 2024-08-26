'use client'
import { useUser } from '@/app/context/UserProvider'
import EditProfile from '@/components/EditProfile'
import { useSession } from 'next-auth/react'
import Image from 'next/image'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import React, { useState } from 'react'
import { FaBuilding, FaLinkedin } from 'react-icons/fa';
import { FaLink, FaLocationDot } from 'react-icons/fa6';
import { Skeleton } from './ui/skeleton'
import ProfileSkeleton from './skeletons/ProfileSkeleton'
import AvatarSkeleton from './skeletons/AvatarSkeleton'



const Profile = () => {
    const params = useParams()
    const username = params.username
    const { data: session } = useSession()
    const { user_information, user_avatar, isAvatarLoading, isProfileDataLoading } = useUser()


    const currentUser =  user_information
    const avatarURL = user_avatar

    // console.log(user_avatar)

    return (
        <div className='flex justify-between'>

            <div className='profile-row flex flex-col px-4 items-start profile-flex-row custom-lg-gap'>

                <div className='flex flex-col gap-4'>
                    {isAvatarLoading && <AvatarSkeleton />}

                    {!isAvatarLoading && <Image
                        src={avatarURL || '/user_png.png'}
                        width={260}
                        height={260}
                        alt='profile_img'
                        className='profile-img-size rounded-full border-2 max-w-[260px] max-h-[260px] p-4 custom-lg-img-size'
                    />}

                    <div className='flex flex-col gap-2'>
                        {
                            session && session?.user?.username === username && <EditProfile />
                        }
                    </div>
                </div>
                
                {
                    isProfileDataLoading && <ProfileSkeleton/>
                }

                {!isProfileDataLoading && <div className='flex flex-col items-start justify-between mt-4 gap-6 profile-details-gap'>
                    <div className='flex flex-col'>
                        <p className='text-md text-slate-500 profile-text-sm'>@{currentUser?.username}</p>
                        <p className='text-2xl font-bold mb-1 profile-text-md'>{currentUser?.name}</p>
                        <p className='text-sm '>{currentUser?.about}</p>
                    </div>

                    <div className='flex flex-col gap-1'>
                        {currentUser?.company && <div className='flex items-center gap-2 text-sm '> <FaBuilding /> {currentUser?.company} </div>}
                        {currentUser?.location && <div className='flex items-center gap-2 text-sm '> <FaLocationDot /> {currentUser?.location} </div>}
                        {currentUser?.profile && <Link href={`${currentUser?.profile}`} className='transition hover:text-blue-500 flex items-center gap-2 text-sm '> <FaLink /> {currentUser?.profile}</Link>}
                        {currentUser?.linkedin && <Link href={`${currentUser?.linkedin}`} className='transition hover:text-blue-500 flex items-center gap-2 text-sm '> <FaLinkedin /> {currentUser?.linkedin}</Link>}
                    </div>
                </div>}

            </div>
        </div>
    )
}

export default Profile