'use client'
import { Button } from "./ui/button";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { NotificationData } from '@/types/types';
import { useUser } from "@/app/context/UserProvider";
import { useSession } from "next-auth/react";
import { toast } from "./ui/use-toast";
import axios from "axios";


interface UserCardProps {
    username: string;
    name: string;
    topicid: string;
    topicname: string;
    creator_username: string;
}

const UserCard = ({ username, name, topicid, topicname, creator_username }: UserCardProps) => {
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
    const { data: session } = useSession()
    const session_user_username = session?.user?.username as string

    const { sendCollabInvite, isAlreadyCollaborator, isInviteAlreadySent } = useUser()


    const handleAdd = async () => {
        try {
            setIsSubmitting(true)
            const collabNotification: NotificationData = {
                noti_type: 'collab_invitation',
                from: session_user_username,
                topicid,
                topicname,
                read: true
            }
    
            const isCollaborator = await isAlreadyCollaborator(username, topicid, creator_username)
            const isAlreadySent = await isInviteAlreadySent(username, topicid, creator_username)

            if(isCollaborator === false && isAlreadySent === false){
                sendCollabInvite(username, collabNotification)
            }
        } catch (error) {
            // // console.log(error)
            toast({
                title: 'Oops',
                description: 'Something went wrong',
                variant: 'destructive'
            })
        } finally{
            setIsSubmitting(false)
        }
    }

    return (
        <>
            <div className='flex justify-between items-center p-3  bg-blue-50 rounded-md'>
                <div className='flex gap-2 items-center '>
                    <div className='text-md font-semibold'>{name}</div>
                    <div className='text-sm text-gray-400'>({username})</div>
                </div>

                <Button className='bg-blue-400' disabled={isSubmitting} onClick={handleAdd}>
                    {
                        isSubmitting ? (
                            <>
                                <Loader2 className='mr-2 h-4 w-4 animate-spin' /> Please Wait
                            </>
                        ) : 'Add'
                    }
                </Button>
            </div>
        </>
    )
}

export default UserCard