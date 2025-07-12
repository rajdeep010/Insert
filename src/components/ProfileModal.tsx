import React, { useEffect, useState } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import axios from "axios";

interface ProfileModalProps {
    creator_username: string;
    creator_name?: string;
}

const ProfileModal = ({creator_username, creator_name}: ProfileModalProps) => {
    const [currentUser, setCurrentUser] = useState<any>(null)

    useEffect(() => {
        const collectUser = async () => {
            try {
                const response = await axios.get(`/api/get-user-by-username?username=${creator_username}`)
                setCurrentUser(response.data?.userdata)
            } catch (error) {
                setCurrentUser(null)
            }
        }
        collectUser()
    }, [creator_username])

    if(!creator_username) return

    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <Link className='text-blue-400 underline ml-2 my-2' href={`/u/${creator_username}`}>
                    @{creator_username}
                </Link>
            </TooltipTrigger>
            <TooltipContent>
                <div className="flex gap-2 items-center justify-between px-3 py-4">
                    <div>
                        <Avatar className='cursor-pointer outline-2 outline-black'>
                            <AvatarImage src={currentUser?.avatar|| ''} />
                            <AvatarFallback>{currentUser?.username[0]}</AvatarFallback>
                        </Avatar>
                    </div>

                    <div>
                        <p>{creator_name}</p>
                        <p className='text-xs text-slate-500'>@{creator_username}</p>
                    </div>
                </div>
            </TooltipContent>
        </Tooltip>
    )
};

export default ProfileModal;
