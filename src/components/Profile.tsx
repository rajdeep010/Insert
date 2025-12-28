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
import { useInsertUser } from '@/app/context/InsertUserProvider'
import { BadgeCheck } from 'lucide-react'



const Profile = () => {
    const params = useParams()
    const username = params.username
    const { data: session } = useSession()
    const { user, isAvatarUploading, isUserLoading } = useInsertUser()

    const hasPro = !!(user?.proStatus?.active || session?.user?.proAccess)

    return (
        <div className='flex justify-between'>

            <div className='profile-row flex flex-col px-4 items-start profile-flex-row custom-lg-gap'>

                <div className='flex flex-col lg-gap-4 gap-[0.5rem]'>
                    {isAvatarUploading && <AvatarSkeleton />}

                    {!isAvatarUploading && <Image
                        src={user?.avatar || '/user_png.png'}
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
                        <p className='flex items-center gap-1 text-md text-slate-500 profile-text-sm'>@{user?.username}
                            {hasPro && (
                                <span
                                    className='inline-flex items-center justify-center w-4 h-4 rounded-full bg-blue-500'
                                    aria-label='Verified'
                                    title='Verified'
                                >
                                    <BadgeCheck className='text-white' size={14} strokeWidth={3} />
                                </span>
                            )}
                        </p>
                        <p className='text-2xl font-bold mb-1 profile-text-md'>{user?.name}</p>
                        <p className='text-sm '>{user?.about}</p>
                    </div>

                    <div className='flex flex-col gap-1'>
                        {user?.company && <div className='flex items-center gap-2 text-sm '> <FaBuilding /> {user?.company} </div>}
                        {user?.location && <div className='flex items-center gap-2 text-sm '> <FaLocationDot /> {user?.location} </div>}
                        {user?.profile && <Link href={`https://github.com/${user?.profile}`} className='transition hover:text-blue-500 flex items-center gap-2 text-sm '> <FaGithub /> {user?.profile}</Link>}
                        {user?.linkedin && <Link href={`https://www.linkedin.com/in/${user?.linkedin}`} className='transition hover:text-blue-500 flex items-center gap-2 text-sm '> <FaLinkedin /> {user?.linkedin}</Link>}
                    </div>
                </div>}

            </div>
        </div>
    )
}

export default Profile