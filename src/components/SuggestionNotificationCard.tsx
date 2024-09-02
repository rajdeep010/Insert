import { SuggestionNotificationCardProps } from '@/types/types'
import Link from 'next/link'
import React from 'react'



const SuggestionNotificationCard = ({ from, topicid, problemurl, read, topicname }: SuggestionNotificationCardProps) => {
    return (
        <div className={`flex flex-col gap-3 px-3 py-2 ${read ? 'bg-blue-50 dark:bg-blue-900' : 'bg-blue-100 dark:bg-blue-800'} text-gray-800 dark:text-gray-200`}>
            <div className="text-sm">
                Problem <Link className='text-blue-600 underline dark:text-blue-300' href={`${problemurl}`} target='_blank'>suggestion</Link> from <Link className='text-blue-500 underline dark:text-blue-400' href={`/u/${from}`} target='_blank'>{from}</Link> on this <Link className='text-green-600 underline dark:text-green-300' href={`/topic/${topicid}`} target='_blank'>{topicname}</Link>
            </div>
        </div>
    )
}

export default SuggestionNotificationCard
