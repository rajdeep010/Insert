import { DeclineNotificationProps } from '@/types/types'
import Link from 'next/link'
import React from 'react'


const DeclineInviteCard = ({ from, topicid, topicname, read }: DeclineNotificationProps) => {
    return (
        <div className={`flex flex-col gap-3 px-3 py-2 ${read === true ? 'bg-red-50 dark:bg-red-900' : 'bg-white dark:bg-gray-800'} text-gray-800 dark:text-gray-200`}>
            <Link href={`/u/${from}`} className='underline text-blue-400 dark:text-blue-300'>{from}</Link> has declined the collab request for <Link href={`/topic/${topicid}`} className='text-blue-500 underline dark:text-blue-300'>{topicname}</Link>
        </div>
    )
}

export default DeclineInviteCard
