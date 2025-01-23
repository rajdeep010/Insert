'use client'
import { useUser } from '@/app/context/UserProvider';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tooltip, TooltipContent, TooltipTrigger } from '@radix-ui/react-tooltip';
import Link from 'next/link';
import React, { useEffect, useState } from 'react'

interface CollaboratorProps {
    username: string;
    name: string;
}

const Collaborator = ({ username,name }: CollaboratorProps) => {
    // // console.log(username, name)
    const [avatarURL, setAvatarURL] = useState<string | null>(null)
    const { getAvatar } = useUser()

    useEffect(() => {
        const collecURL = async () => {
            try {
                const response = await getAvatar(username)
                setAvatarURL(response)
            } catch (error) {
                setAvatarURL(null)
            }
        }
        collecURL()
    }, [username])


    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <Avatar className='cursor-pointer outline-2 outline-black'>
                    <AvatarImage src={avatarURL || ''} />
                    <AvatarFallback>{username[0]}</AvatarFallback>
                </Avatar>
            </TooltipTrigger>
            <TooltipContent className='text-white outline-2 px-2 py-1 z-10 bg-slate-400 rounded-md'>
                <Link className='text-xs' href={`/u/${username}`}>
                    {name ? name : username }
                </Link>
            </TooltipContent>
        </Tooltip>
    )
}

export default Collaborator