'use client'
import { Button } from "./ui/button";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { NotificationData } from '@/types/types';
import { useSession } from "next-auth/react";
import { toast } from "./ui/use-toast";
import { useInsertUser } from "@/app/context/InsertUserProvider";



const UserCard = ({user, topicid, topic, collaborators}: any) => {
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
    const { data: session } = useSession()
    const { sendCollabInvite } = useInsertUser()


    const handleAdd = async () => {
        try {
            setIsSubmitting(true)

            const data = {
                from: session?.user?.username,
                to: user?.username,
                fromID: session?.user?._id,
                toID: user?._id,
                topicId: topicid,
                topicName: topic?.title
            }

            await sendCollabInvite(user?.username, data)
        } catch (error) {
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
            <div className='flex justify-between items-center py-2 px-3  bg-blue-200 rounded-md'>
                <div className='flex gap-2 items-center '>
                    <div className='text-sm text-black'>{user?.name}</div>
                    <div className='text-sm text-black'>({user?.username})</div>
                </div>

                <Button className='py-1' variant="default" disabled={isSubmitting} onClick={handleAdd}>
                    {
                        isSubmitting ? (
                            <>
                                <Loader2 className='mr-2 h-4 w-4 animate-spin' /> Please Wait
                            </>
                        ) : (<><span className='text-sm'>Add</span></>)
                    }
                </Button>
            </div>
        </>
    )
}

export default UserCard