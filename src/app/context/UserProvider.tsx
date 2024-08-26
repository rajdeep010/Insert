'use client'
import { toast } from "@/components/ui/use-toast";
import { ApiResponse } from "@/types/ApiResponse";
import { NotificationData, UserInfo } from "@/types/types";
import axios, { AxiosError } from "axios";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useState } from "react";
import { getDownloadURL, listAll, ref, uploadBytesResumable } from "firebase/storage";
import db, { storage } from "@/firebaseConfig";



interface UserContextProps {
    // information states
    user_information: UserInfo | null
    user_avatar: string | null
    userNotifications: NotificationData[]

    // loading states
    isOverviewVisible: boolean
    isDashboardVisible: boolean
    isProfileDataLoading: boolean
    isAvatarLoading: boolean

    // functions
    updateUser: (formData: Partial<UserInfo>) => {}
    fetchUser: (username: string) => {}
    uploadAvatar: (file: File) => {}
    uploadAvatarOnSignup: (file: File, username: string) => {}
    fetchAvatar: (username: string) => {}

    handleDashboardClick: () => void
    handleOverViewClick: () => void
    handleAllTopicsClick: () => void

    sendCollabInvite: (to_whom: string, noti: NotificationData) => void
    addCollab: (add_whom_username: string, add_whom_name: string, topicid: string, topicname: string, whose_topic: string, notifyid: string) => void
    sendSuggestion: (to_whom: string, noti: NotificationData) => void
    markAllRead: (username: string) => void

    sendAcceptedCollabNotification: (to_whom: string, noti: NotificationData) => void
    sendDeclinedCollabNotification: (to_whom: string, noti: NotificationData) => void
    deleteNotification: (whose_noti: string, notifyid: string) => void

    isAlreadyCollaborator: (username: string, topicid: string, creator_username: string) => Promise<boolean>
    isInviteAlreadySent: (username: string, topicid: string, creator_username: string) => Promise<boolean>
    getAvatar: (username: string) => Promise<string | null>
}


const UserContext = createContext<UserContextProps|null>(null)

export const UserProvider = ({children}: {children: React.ReactNode}) => {
    const {data: session, status} = useSession()
    const router = useRouter()
    const params = useParams()
    const param_username = params.username as string

    //! information states
    const [user_information, setUserInformation] = useState<UserInfo|null>(null)
    const [user_avatar, setUserAvatar] = useState<string|null>(null)
    const [userNotifications, setUserNotifications] = useState<NotificationData[]>([])

    //! loading states
    const [isProfileDataLoading, setIsProfileDataLoading] = useState<boolean>(false)
    const [isAvatarLoading, setIsAvatarLoading] = useState<boolean>(false)

    const [isOverviewVisible, setOverviewVisible] = useState(true)
    const [isDashboardVisible, setDashboardVisible] = useState(false)


    //! FUNCTIONS
    const handleDashboardClick = () => {
        setOverviewVisible(false)
        setDashboardVisible(true)
    }

    const handleOverViewClick = () => {
        setDashboardVisible(false)
        setOverviewVisible(true)
    }

    const handleAllTopicsClick = () => {
        setDashboardVisible(false)
        setOverviewVisible(false)
    }

    //! user information & avatar functions
    const fetchUser = async (username: string) => {
        try {
            if (!username)  return
            
            setIsProfileDataLoading(true)
            const response = await axios.get(`/api/get-user-by-username?username=${username}`)
            if (!response) {
                toast({
                    title: 'Not Found',
                    description: 'No such user exists',
                    variant: 'destructive'
                })
                router.push('/')
                return
            }

            const userdata = await response.data.userdata as UserInfo
            // console.log(userdata)

            setUserNotifications(userdata.notifications ? userdata.notifications.reverse() : [])
            setUserInformation(userdata)
        } catch (error) {
            const axiosError = error as AxiosError<ApiResponse>
            let errorMessage = axiosError?.message
            router.push('/')
        }
        finally {
            setIsProfileDataLoading(false)
        }
    }

    const checkIfFileExists = async (username: string) => {
        try {
            if (!username) return false
    
            const listRef = ref(storage, 'avatars/')
            const res = await listAll(listRef)
            const fileExists = res.items.some(item => item.name === username)
    
            return fileExists
        } catch (error) {
            console.error('Error listing files:', error)
            return false
        }
    }
    
    const fetchAvatar = async (username: string) => {
        try {
            if (!username) return
    
            setIsAvatarLoading(true)
            const fileExists = await checkIfFileExists(username)
    
            if (fileExists) {
                const storageRef = ref(storage, `avatars/${username}`)
                try {
                    const url = await getDownloadURL(storageRef)
                    setUserAvatar(url)
                } catch (error: any) {
                    console.error('Error fetching avatar:', error)
                    setUserAvatar(null)
                }
            } else {
                setUserAvatar(null)
            }
        } catch (error) {
            console.error('Unexpected error:', error)
            setUserAvatar(null)
        } finally {
            setIsAvatarLoading(false)
        }
    }
    
    const uploadAvatar = async (file: File) => {
        try {
            if (!session) return

            setIsAvatarLoading(true)
            const storageRef = ref(storage, `avatars/${session?.user?.username}`)
            const uploadTask = uploadBytesResumable(storageRef, file)

            uploadTask.on('state_changed',
                (snapshot) => {
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
                    // setUploadProgress(progress)
                },
                (error) => {
                    toast({
                        title: 'Error ⭕',
                        description: 'Error in uploading avatar',
                        variant: 'destructive'
                    })
                },
                () => {
                    getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                        // setSessionUserAvatarURL(downloadURL)
                        // console.log(downloadURL)
                        toast({
                            title: 'Uploaded ✅',
                            description: 'Avatar uploaded successfully',
                            variant: 'default'
                        })
                    })
                }
            )

            fetchAvatar(session?.user?.username as string)
        } catch (error) {
            toast({
                title: 'Error ⭕',
                description: 'Error in uploading avatar',
                variant: 'destructive'
            })
        } finally {
            setIsAvatarLoading(false)
        }
    }

    const uploadAvatarOnSignup = async (file: File, username: string) => {
        try {
            const storageRef = ref(storage, `avatars/${username}`)
            const uploadTask = uploadBytesResumable(storageRef, file)

        } catch (error) {
            toast({
                title: 'Error ⭕',
                description: 'Default avatar uploading error',
                variant: 'destructive'
            })
        }
    }

    const updateUser = async (formData: Partial<UserInfo>) => {
        try {
            // console.log(session_user_username, session)
            if (status !== 'authenticated') return

            setIsProfileDataLoading(true)
            const response = await axios.post(`/api/update-user-info`, {
                username: session?.user?.username,
                ...formData
            })

            if (response.data.success) {
                // console.log(response.data)
                toast({
                    title: 'Updated ✅',
                    description: 'User info updated successfully',
                    variant: 'default'
                })

                fetchUser(session?.user?.username!)
            }
            
        } catch (error) {
            toast({
                title: 'Error ⭕',
                description: 'Something went wrong',
                variant: 'destructive'
            })
        }
        finally {
            setIsProfileDataLoading(false)
        }
    }

    //! collaboration functions
    const sendCollabInvite = async (to_whom: string, noti: NotificationData) => {
        try {
            if (!to_whom || !noti) return

            const response = await axios.post(`/api/add-notification`, {
                to_whom,
                notification: noti
            })

            if (!response.data.success) {
                toast({
                    title: 'Error',
                    description: response.data.message,
                    variant: 'default'
                })
                return
            }

            toast({
                title: 'Sent ✅',
                description: `Collab invite sent to ${to_whom}`,
                variant: 'default'
            })

        } catch (error) {
            toast({
                title: 'Error',
                description: 'Collab request not sent',
                variant: 'destructive'
            })
        }
    }

    const addCollab = async (add_whom_username: string, add_whom_name: string, topicid: string, topicname: string, whose_topic: string, notifyid: string) => {
        try {
            if (!add_whom_username || !topicid) return

            const response = await axios.post(`/api/add-collaborator`, {
                whose_topic,
                add_whom_username,
                add_whom_name,
                topicid
            })

            if (!response.data.success) {
                toast({
                    title: 'Error',
                    description: response.data.message,
                    variant: 'destructive'
                })
                return
            }

            toast({
                title: 'Congrats ✅',
                description: 'Successfully added as collaborator',
                variant: 'default'
            })

            deleteNotification(add_whom_username, notifyid!)

            fetchNotifications(add_whom_username)
            fetchNotifications(whose_topic)
        } catch (error) {

            // console.log(error)

            toast({
                title: 'Error',
                description: 'Something wrong in adding as collabrator',
                variant: 'destructive'
            })
        }
    }

    const deleteNotification = async (whose_noti: string, notifyid: string) => {
        try {
            if (!whose_noti) return

            const delete_response = await axios.post(`/api/delete-notification`, {
                username: whose_noti,
                notifyid,
            })

            if (!delete_response) {
                toast({
                    title: 'Error',
                    description: 'Error in deleting the notification',
                    variant: 'destructive'
                })
            }

            fetchNotifications(whose_noti)
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Something went wrong',
                variant: 'destructive'
            })
        }
    }

    const fetchNotifications = async (username: string) => {
        try {
            if (!username) return
            const response = await axios.get(`/api/get-notifications?username=${username}`)
            if (response.data.success) {
                setUserNotifications(response.data.notifications.reverse())
            }
        } catch (error) {
            // console.log(error)
        }
    }

    const sendAcceptedCollabNotification = async (to_whom: string, noti: NotificationData) => {
        try {
            if (!to_whom) return

            // 2 accepted notifications type notification has to be send
            // one to himself and another to the other user

            const response = await axios.post(`/api/add-notification`, {
                to_whom,
                notification: noti
            })

            if (!response.data.success) {
                toast({
                    title: 'Error',
                    description: response.data.message,
                    variant: 'destructive'
                })
            }
            // general notifacation no toast for sending properly.
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Accept response not sent',
                variant: 'destructive'
            })
        }
    }

    const sendDeclinedCollabNotification = async (to_whom: string, noti: NotificationData) => {
        try {
            if (!to_whom) return

            const response = await axios.post(`/api/add-notification`, {
                to_whom,
                notification: noti
            })

            if (!response.data.success) {
                toast({
                    title: 'Error',
                    description: response.data.message,
                    variant: 'destructive'
                })
            }
            // general notifacation no toast for sending properly.
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Decline response not sent',
                variant: 'destructive'
            })
        }
    }

    const sendSuggestion = async (to_whom: string, noti: NotificationData) => {
        try {
            if (!to_whom || !noti) return

            const response = await axios.post(`/api/add-notification`, {
                to_whom,
                notification: noti
            })

            if (!response.data.success) {
                toast({
                    title: 'Error',
                    description: response.data.message,
                    variant: 'default'
                })
                return
            }

            toast({
                title: 'Sent ✅',
                description: `Suggestion sent to ${to_whom}`,
                variant: 'default'
            })
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Suggestion request not sent',
                variant: 'destructive'
            })
        }
    }

    const sendGeneralNotification = async (to_whom: string, noti: NotificationData) => {
        try {
            if (!to_whom) return

            const response = await axios.post(`/api/add-notification`, {
                to_whom,
                notification: noti
            })

            if (!response.data.success) {
                toast({
                    title: 'Error',
                    description: response.data.message,
                    variant: 'destructive'
                })
                return
            }

            // general notifacation no toast for sending properly.
        } catch (error) {
            toast({
                title: 'Error',
                description: 'message not sent',
                variant: 'destructive'
            })
        }
    }

    const isAlreadyCollaborator = async (username: string, topicid: string, creator_username: string) => {
        try {
            if (!username || !topicid || !creator_username) return true

            const response = await axios.get(`/api/check-collaborator?creator_username=${creator_username}&topicid=${topicid}&check_whom=${username}`)

            if (response.data.success) {
                return false
            } else {
                toast({
                    title: 'Not possible',
                    description: 'User is already a collaborator',
                    variant: 'destructive'
                })
                return true
            }

        } catch (error) {
            const axiosError = error as AxiosError<ApiResponse>
            toast({
                title: 'Oops',
                description: axiosError.response?.data.message || 'Something went wrong',
                variant: 'destructive'
            })
            return true
        }
    }

    const isInviteAlreadySent = async (username: string, topicid: string, creator_username: string) => {
        try {
            if (!username || !topicid || !creator_username) return true

            const response = await axios.get(`/api/check-invite-sent?from=${creator_username}&topicid=${topicid}&username=${username}`)
            if (response.data.success) {
                return false
            } else {
                toast({
                    title: 'Not possible',
                    description: 'Invite already sent',
                    variant: 'destructive'
                })
                return true
            }

        } catch (error) {
            const axiosError = error as AxiosError<ApiResponse>
            // console.log(axiosError)

            toast({
                title: 'Oops',
                description: axiosError.response?.data.message || 'Something went wrong',
                variant: 'destructive'
            })
            return true
        }
    }

    //! small size avatar fetching function
    const getAvatar = async (username: string) => {
        try {
            if (!username) return null

            const storageRef = ref(storage, `avatars/${username}`)

            if (storageRef) {
                const url = await getDownloadURL(storageRef)
                return url
            }
            return null
        } catch (error) {
            // console.error('Error fetching avatar:', error)
            // setSessionUserAvatarURL(null)
            return null
        }
    }

    const markAllRead = async (username: string) => {
        try {
            if (!username) return

            // console.log('mark all read called', username)

            const response = await axios.post(`/api/mark-all-as-read`, { username })
            if (response.data.success) {
                toast({
                    title: 'Done ✅',
                    description: 'Successfully marked all read',
                    variant: 'default'
                })
                // console.log(response.data)
                fetchUser(username)
                // setUserNotifications(response.data.notifications.reverse())
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Could not mark read',
                variant: 'destructive'
            })
        }
    }


    useEffect(() => {
        const fetchData = async () => {
            try {    
                await fetchUser(param_username)
                await fetchAvatar(param_username)
            } catch (error) {
                setUserInformation(null)
                setUserAvatar(null)
            }
        }
    
        fetchData()
    }, [param_username])


    return <UserContext.Provider value={{ user_avatar, markAllRead, getAvatar, isInviteAlreadySent, sendDeclinedCollabNotification, isAlreadyCollaborator, deleteNotification, sendAcceptedCollabNotification, userNotifications, sendSuggestion, addCollab, sendCollabInvite, isAvatarLoading, isProfileDataLoading, uploadAvatarOnSignup, handleOverViewClick, handleDashboardClick, handleAllTopicsClick, isOverviewVisible, isDashboardVisible, uploadAvatar, fetchAvatar, user_information, updateUser, fetchUser }}>
        {children}
    </UserContext.Provider>
}

export const useUser = () => {
    const context = useContext(UserContext)
    if(!context){
        throw new Error('User Provider must be wrapped properly')
    }
    return context
}