import { DeclineNotificationProps } from '@/types/types'
import Link from 'next/link'
import React from 'react'



const DeclineInviteCard = ({ from, topicid, topicname, read }: DeclineNotificationProps) => {
    return (
        <div className={`flex flex-col gap-3 px-3 py-2 ${read === true && `bg-red-50`}`}>
            <Link href={`/u/${from}`} className='underline text-blue-400'>{from}</Link> has declined the collab request for <Link href={`/topic/${topicid}`}>{topicname}</Link>
        </div>
    )
}


export default DeclineInviteCard