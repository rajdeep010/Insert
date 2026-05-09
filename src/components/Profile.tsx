'use client'
import EditProfile from '@/components/EditProfile'
import { useSession } from 'next-auth/react'
import Image from 'next/image'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import React, { useState } from 'react'
import { FaBuilding, FaGithub, FaLinkedin } from 'react-icons/fa';
import { FaLink, FaLocationDot } from 'react-icons/fa6';
import { Skeleton } from './ui/skeleton'
import ProfileSkeleton from './skeletons/ProfileSkeleton'
import AvatarSkeleton from './skeletons/AvatarSkeleton'
import { useInsertUser } from '@/features/user/context/InsertUserProvider'
import ProBadgeIcon from './ProBadgeIcon'



const Profile = () => {
    const params = useParams()
    const username = params.username
    const { data: session } = useSession()
    const { profileUser, isAvatarUploading, isUserLoading } = useInsertUser()

    const badgeState = profileUser?.proStatus?.badgeState ?? 'none'

    return (
        <div className='flex justify-between'>

            <div className='profile-row flex flex-col px-4 items-start profile-flex-row custom-lg-gap'>

                <div className='flex flex-col lg-gap-4 gap-[0.5rem]'>
                    {isAvatarUploading && <AvatarSkeleton />}

                    {!isAvatarUploading && <Image
                        src={profileUser?.avatar || '/user_png.png'}
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
                    isUserLoading && <ProfileSkeleton />
                }

                {!isUserLoading && <div className='flex flex-col items-start justify-between mt-4 gap-6 profile-details-gap'>
                    <div className='flex flex-col'>
                        <p className='flex items-center gap-1 text-md text-slate-500 profile-text-sm'>@{profileUser?.username}
                            <ProBadgeIcon state={badgeState} />
                        </p>
                        <p className='text-2xl font-bold mb-1 profile-text-md'>{profileUser?.name}</p>
                        <p className='text-sm '>{profileUser?.about}</p>
                    </div>

                    <div className='flex flex-col gap-1'>
                        {profileUser?.company && <div className='flex items-center gap-2 text-sm '> <FaBuilding /> {profileUser?.company} </div>}
                        {profileUser?.location && <div className='flex items-center gap-2 text-sm '> <FaLocationDot /> {profileUser?.location} </div>}
                        {profileUser?.profile && <Link href={`https://github.com/${profileUser?.profile}`} className='transition hover:text-blue-500 flex items-center gap-2 text-sm '> <FaGithub /> {profileUser?.profile}</Link>}
                        {profileUser?.linkedin && <Link href={`https://www.linkedin.com/in/${profileUser?.linkedin}`} className='transition hover:text-blue-500 flex items-center gap-2 text-sm '> <FaLinkedin /> {profileUser?.linkedin}</Link>}
                    </div>
                </div>}

            </div>
        </div>
    )
}

export default Profile