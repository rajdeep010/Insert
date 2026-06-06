'use client'
import { Button } from "./ui/button";
import { useState } from "react";
import { Loader2, Send } from "lucide-react";
import { useSession } from "next-auth/react";
import { toast } from "./ui/use-toast";
import { useNotifications } from "@/features/notification/context/NotificationProvider";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";



const UserCard = ({user, topicid, topic, collaborators}: any) => {
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
    const { data: session } = useSession()
    const { sendCollabInvite } = useNotifications()
    const isExistingCollaborator = Boolean(
        collaborators?.some((collaborator: { username?: string }) => collaborator?.username === user?.username)
    )


    const handleAdd = async () => {
        if (isExistingCollaborator) return
        try {
            setIsSubmitting(true)

            const data = {
                to: user?.username,
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
            <div className='flex justify-between items-center py-2 px-3  rounded-md'>
                <div className="flex gap-2">
                    <div>
                        <Avatar>
                            <AvatarImage src={user?.avatar || './user_png.png'} />
                            <AvatarFallback>{user?.username[0]}</AvatarFallback>
                        </Avatar>
                    </div>

                    <div className="flex flex-col gap-[4px]">
                        <div className='text-sm'>{user?.name}</div>
                        <div className='text-xs text-blue-600'>{user?.username}</div>
                    </div>
                </div>

                <Button className='py-1' variant="outline" disabled={isSubmitting || isExistingCollaborator} onClick={handleAdd}>
                    {
                        isExistingCollaborator ? (
                            <>Added</>
                        ) : isSubmitting ? (
                            <>
                                <Loader2 className='mr-2 h-4 w-4 animate-spin' /> Please Wait
                            </>
                        ) : (<><Send className="h-4 w-4"/></>)
                    }
                </Button>
            </div>
        </>
    )
}

export default UserCard