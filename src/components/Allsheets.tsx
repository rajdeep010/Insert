import { useTopics } from '@/app/context/TopicProvider'
import React from 'react'
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar"
import Link from 'next/link'



const Allsheets = () => {

    const { all_topics } = useTopics()
    console.log('this is all sheets: ', all_topics)

    return (
        <div className='flex flex-col gap-3 my-4'>
            <div className='text-3xl font-semibold underline my-4'>All Sheets</div>
            <div className='flex flex-col gap-3'>
                {
                    all_topics && all_topics.map(({ id, title, about, visibility, problems, creator_name, creator_username }, idx) => (
                        <div key={idx} className='border-2 p-4 rounded-md flex flex-row items-center gap-4'>

                            {/* add the avatar and username & name */}
                            <div className='flex items-center gap-3 pr-4 border-r-2'>
                                <div>
                                    <Avatar>
                                        <AvatarImage src='./myimg.jpeg' />
                                        <AvatarFallback>U</AvatarFallback>
                                    </Avatar>
                                </div>
                                <div className='flex flex-col'>
                                    <div className='text-sm font-bold'>{creator_name}</div>
                                    <Link className='text-sm transition underline text-blue-500 hover:text-blue-300' href={`/u/${creator_username}`}>{creator_username}</Link>
                                </div>
                            </div>

                            {/* details of the topic and number of problems */}
                            <div className='flex items-center gap-2'>
                                <Link className='text-2xl font-semibold uppercase transition hover:text-blue-400' href={`/`}>
                                    {title}
                                </Link>
                                <div className='text-gray-400'>
                                    ({(problems.length > 0) ? `${problems.length} problems` : `${problems.length} problem`})
                                </div>
                            </div>
                        </div>
                    ))
                }

            </div>
        </div>
    )
}

export default Allsheets