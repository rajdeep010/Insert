'use client'
import { InviteNotificationCardProps } from '@/types/types'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import React from 'react'

const AcceptedInviteCard = ({from, topicid, topicname, read}: InviteNotificationCardProps) => {
    const {data: session} = useSession()
    const session_user_username = session?.user?.username

    return (
        <div className={`flex flex-col gap-3 px-3 py-2 ${read === true ? 'bg-green-50 dark:bg-green-800' : 'bg-white dark:bg-gray-800'} text-gray-800 dark:text-gray-200`}>
            <div className='text-sm'>
                {
                    (from === session_user_username) && <>
                        You have accepted the invitation for <Link href={`/topic/${topicid}`} className='text-blue-500 underline dark:text-blue-300'>{topicname}</Link>
                    </>
                }

                {
                    (from !== session_user_username) && <>
                        <Link href={`/u/${from}`} className='underline text-blue-400 dark:text-blue-300'>{from}</Link> has accepted the invitation for <Link href={`/topic/${topicid}`} className='text-blue-500 underline dark:text-blue-300'>{topicname}</Link>
                    </>
                }
            </div>
        </div>
    )
}

export default AcceptedInviteCard
