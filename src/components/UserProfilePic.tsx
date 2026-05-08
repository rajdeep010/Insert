import React, { useEffect, useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import axios from 'axios';


interface UserProfilePicProps{
    username: string;
}

const UserProfilePic = ({username}: UserProfilePicProps) => {

    const [currentUser, setCurrentUser] = useState<any>(null)

    useEffect(() => {
        const collectUser = async () => {
            try {
                const response = await axios.get(`/api/users/${username}`)
                setCurrentUser(response.data?.userdata)
            } catch (error) {
                setCurrentUser(null)
            }
        }
        collectUser()
    }, [username])

    return (
        <>
            <Avatar className='cursor-pointer outline-2 outline-black'>
                <AvatarImage src={currentUser?.avatar || ''} />
                <AvatarFallback>{currentUser?.username[0]}</AvatarFallback>
            </Avatar>
        </>
    )
}

export default UserProfilePic