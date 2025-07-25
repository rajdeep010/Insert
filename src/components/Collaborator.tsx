'use client'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tooltip, TooltipContent, TooltipTrigger } from '@radix-ui/react-tooltip';
import axios from 'axios';
import Link from 'next/link';
import React, { useEffect, useState } from 'react'

interface CollaboratorProps {
    username: string;
    name: string;
}

const Collaborator = ({ username,name }: CollaboratorProps) => {
    const [currentUser, setCurrentUser] = useState<any>(null)

    useEffect(() => {
        const collectUser = async () => {
            try {
                const response = await axios.get(`/api/get-user-by-username?username=${username}`)
                setCurrentUser(response.data?.userdata)
            } catch (error) {
                setCurrentUser(null)
            }
        }
        collectUser()
    }, [username])


    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <Avatar className='cursor-pointer outline-2 outline-black'>
                    <AvatarImage src={currentUser?.avatar || ''} />
                    <AvatarFallback>{currentUser?.username[0]}</AvatarFallback>
                </Avatar>
            </TooltipTrigger>
            <TooltipContent className='text-white outline-2 px-2 py-1 z-10 bg-slate-400 rounded-md'>
                <Link className='text-xs' href={`/u/${currentUser?.username}`}>
                    {name ? name : username }
                </Link>
            </TooltipContent>
        </Tooltip>
    )
}

export default Collaborator