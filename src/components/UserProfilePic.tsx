import { useUser } from '@/app/context/UserProvider';
import React, { useEffect, useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"


interface UserProfilePicProps{
    username: string;
}

const UserProfilePic = ({username}: UserProfilePicProps) => {

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
        <>
            <Avatar className='cursor-pointer outline-2 outline-black'>
                    <AvatarImage src={avatarURL || ''} />
                    <AvatarFallback>{username[0]}</AvatarFallback>
                </Avatar>
        </>
    )
}

export default UserProfilePic