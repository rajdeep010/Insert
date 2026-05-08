'use client'
import React,{ useState } from 'react'
import { Button } from './ui/button';
import Link from 'next/link';
import type { InviteNotificationCardProps, NotificationData } from '@/types/notifications';
import { Loader2 } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useInsertUser } from '@/app/context/InsertUserProvider';



const InviteNotificationCard = ({ from, to, topicid,topicname,notifyid,read, fromUserId, toUserId }: InviteNotificationCardProps) => {
    const { data: session } = useSession()
    const [isAccepting,setIsAccepting] = useState<boolean>(false)
    const [isDeclining,setIsDeclining] = useState<boolean>(false)
    const [isClicked,setIsClicked] = useState<boolean>(false)

    const { user,
        addCollab,
        sendDeclinedCollabNotification
    } = useInsertUser()

    if (!user) return

    const session_user_username = session?.user?.username as string
    const session_user_name = session?.user?.name as string

    const handleAcceptInvite = async () => {
        try {
            setIsAccepting(true)
            setIsClicked(true)

            await addCollab(session_user_username,session_user_name,topicid,topicname,from,to,notifyid!, fromUserId!, toUserId!)
        } catch (error) {

        } finally {
            setIsAccepting(false)
            setIsClicked(false)
        }
    }

    const handleDeclineInvite = async () => {
        try {
            setIsDeclining(true)
            setIsClicked(true)

            const declineNoti: NotificationData = {
                noti_type: 'decline_invite',
                from,
                to,
                topicid,
                topicname,
                read: true,
                _id: notifyid,
                fromUserId,
                toUserId
            }
            await sendDeclinedCollabNotification(from,declineNoti)
        } catch (error) {

        } finally {
            setIsDeclining(false)
            setIsClicked(false)
        }
    }

    return (
        <div className={`flex flex-col gap-3 px-3 py-2 ${read === true ? 'bg-yellow-50 dark:bg-yellow-900' : 'bg-yellow-100 dark:bg-yellow-800'} text-gray-800 dark:text-gray-200`}>
            <div className='text-sm'>
                You got a collab invitation from <Link className='text-blue-400 underline dark:text-blue-300' href={`/u/${from}`} target='_blank'>{from}</Link> for <Link className='text-yellow-600 underline dark:text-yellow-300' href={`/topic/${topicid}`} target='_blank'>{topicname}</Link>
            </div>

            <div className='flex items-center gap-5'>
                <Button className='text-sm' disabled={isClicked} onClick={handleAcceptInvite}>
                    {
                        isAccepting ? (
                            <>
                                <Loader2 className='mr-2 h-4 w-4 animate-spin' /> Please Wait
                            </>
                        ) : 'Accept'
                    }
                </Button>
                <Button variant={'outline'} disabled={isClicked} onClick={handleDeclineInvite}>
                    {
                        isDeclining ? (
                            <>
                                <Loader2 className='mr-2 h-4 w-4 animate-spin' /> Please Wait
                            </>
                        ) : 'Decline'
                    }
                </Button>
            </div>
        </div>
    )
}

export default InviteNotificationCard
