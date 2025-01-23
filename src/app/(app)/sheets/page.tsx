'use client'
import { useTopics } from '@/app/context/TopicProvider'
import React from 'react'
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar"
import Link from 'next/link'
import TopicNavbar from '@/components/TopicNavbar'
import AllTopicsSkeleton from '@/components/skeletons/AllTopicsSkeleton'
import UserProfilePic from '@/components/UserProfilePic'



const Allsheets = () => {

    const { all_topics, isAllSheetsLoading } = useTopics()
    // // console.log(all_topics)

    return (
        <div className='flex flex-col gap-6 py-16 justify-center px-32'>
            <div><TopicNavbar/></div>
            <div className='flex flex-col gap-3 my-4'>
                <div className='text-4xl m-auto my-4 '>All Sheets</div>
                <div className='flex flex-col gap-3'>
                    {
                        isAllSheetsLoading && <AllTopicsSkeleton/>
                    }

                    {
                        !isAllSheetsLoading && all_topics && all_topics.map(({ id, title, problems, creator_name, creator_username }, idx) => (
                            <Link href={`/topic/${id}`} key={idx} className='border-2 p-4 rounded-md flex flex-row items-center gap-4 hover:dark:bg-gray-900 hover:bg-gray-50'>

                                <div className='flex items-center gap-3 pr-4'>
                                    <div>
                                        <UserProfilePic username={creator_username}/>
                                        {/* <Avatar>
                                            <AvatarFallback>U</AvatarFallback>
                                        </Avatar> */}
                                    </div>
                                    <div className='flex flex-col'>
                                        <div className='text-sm font-bold'>{creator_name}</div>
                                        <Link className='text-sm transition underline text-blue-500 hover:text-blue-300' href={`/u/${creator_username}`}>{creator_username}</Link>
                                    </div>
                                </div>

                                <Link className='flex items-center gap-2' href={`/topic/${id}`}>
                                    <div className='text-2xl font-semibold uppercase transition hover:text-blue-400' >
                                        {title}
                                    </div>
                                    <div className='text-gray-400'>
                                        ({(problems.length > 1) ? `${problems.length} problems` : `${problems.length} problem`})
                                    </div>
                                </Link>
                            </Link>
                        ))
                    }

                </div>
            </div>
        </div>
    )
}

export default Allsheets