import React, { useEffect, useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { usePublicUser } from '@/features/user/context/InsertUserProvider';


interface UserProfilePicProps{
    username: string;
}

const UserProfilePic = ({username}: UserProfilePicProps) => {
	const currentUser = usePublicUser(username)

    return (
        <>
            <Avatar className='cursor-pointer outline-2 outline-black'>
                <AvatarImage src={currentUser?.avatar || ''} />
                <AvatarFallback>{currentUser?.username?.[0]}</AvatarFallback>
            </Avatar>
        </>
    )
}

export default UserProfilePic