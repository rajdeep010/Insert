import { SuggestionNotificationCardProps } from '@/types/types'
import Link from 'next/link'
import React from 'react'



const SuggestionNotificationCard = ({ from, topicid, problemurl, read, topicname }: SuggestionNotificationCardProps) => {
    
    return (
        <>
            <div className={`flex flex-col gap-3 px-3 py-2 ${read === true && `bg-blue-50`}`}>
                <div className="text-sm">
                    Problem <Link className='text-blue-600 underline' href={`${problemurl}`} target='_blank'>suggestion</Link> from <Link className='text-blue-400 underline' href={`/u/${from}`} target='_blank'>{from}</Link> on this <Link className='text-green-500 underline' href={`/topic/${topicid}`} target='_blank'>{topicname}</Link>
                </div>
            </div>
        </>
    )
}

export default SuggestionNotificationCard