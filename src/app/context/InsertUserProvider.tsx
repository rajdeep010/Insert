'use client'
import { NotificationData,UserInfo } from "@/types/types";
import { useSession } from "next-auth/react";
import { useParams,useRouter } from "next/navigation";
import { createContext,useContext,useEffect,useReducer,useState } from "react";
import InsertUserReducer from "../reducer/InserUserReducer";
import axios from "axios";
import { toast } from "@/components/ui/use-toast";
import { uniqueId } from "@/helpers/unique-id";


interface InsertUserProviderProps {
    user: any
    isUserLoading: boolean
    isAvatarUploading: boolean

    updateUser: (formData: Partial<UserInfo>) => void
    fetchUser: (username: string) => void
    sendCollabInvite: (to_whom: string,noti: NotificationData) => void
    addCollab: (add_whom_username: string,add_whom_name: string,topicid: string,topicname: string,whose_topic: string,notifyid: string) => void
    sendSuggestion: (to_whom: string,noti: NotificationData) => void
    markAllRead: (username: string) => void

    sendAcceptedCollabNotification: (to_whom: string,noti: NotificationData) => void
    sendDeclinedCollabNotification: (to_whom: string,noti: NotificationData) => void
    deleteNotification: (whose_noti: string,notifyid: string) => void

    isAlreadyCollaborator: (username: string,topicid: string,creator_username: string) => Promise<boolean>
    isInviteAlreadySent: (username: string,topicid: string,creator_username: string) => Promise<boolean>
    uploadAvatar: (file: File) => void
}

const initialState: InsertUserProviderProps = {
    user: {},
    isUserLoading: false,
    isAvatarUploading: false,

    updateUser: (formData: Partial<UserInfo>) => { },
    fetchUser: (username: string) => { },
    sendCollabInvite: (to_whom: string,noti: NotificationData) => { },
    addCollab: (add_whom_username: string,add_whom_name: string,topicid: string,topicname: string,whose_topic: string,notifyid: string) => { },
    sendSuggestion: (to_whom: string,noti: NotificationData) => { },
    markAllRead: (username: string) => { },

    sendAcceptedCollabNotification: (to_whom: string,noti: NotificationData) => { },
    sendDeclinedCollabNotification: (to_whom: string,noti: NotificationData) => { },
    deleteNotification: (whose_noti: string,notifyid: string) => { },

    isAlreadyCollaborator: async () => true,
    isInviteAlreadySent: async () => true,
    uploadAvatar: (file: File) => { }
}

const InsertUserContext = createContext<InsertUserProviderProps | null>(null)

export const InsertUserProvider = ({ children }: { children: React.ReactNode }) => {
    const { data: session,status } = useSession()
    const router = useRouter()
    const params = useParams()
    const param_username = params.username as string

    const [state,dispatch] = useReducer(InsertUserReducer,initialState)
    const username = session?.user?.username || null

    const NEXT_PUBLIC_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUD_NAME as string
    const NEXT_PUBLIC_CLOUD_PRESET = process.env.NEXT_PUBLIC_CLOUD_PRESET as string

    const uploadAvatar = async (file: File) => {
        try {
            if(!username)   return
            dispatch({type: "SET_IS_AVATAR_LOADING", payload: true})

            const uuid = uniqueId
            const formData = new FormData()
            formData.append('file', file)
            formData.append('upload_preset', NEXT_PUBLIC_CLOUD_PRESET)
            formData.append('folder', 'insert')
            formData.append('cloud_name', NEXT_PUBLIC_CLOUD_NAME)
            formData.append('public_id', uuid)

            const response = await axios.post(
                `https://api.cloudinary.com/v1_1/${NEXT_PUBLIC_CLOUD_NAME}/image/upload`,
                formData
            )

            const avatarUrl = response.data.secure_url
            const res = await axios.post(`/api/save-user-avatar`, {avatarURL: avatarUrl})

            if (res.data.success) {
                toast({
                    title: 'Updated ✅',
                    description: 'Avatar updated successfully',
                    variant: 'default'
                })

                dispatch({type: "UPDATE_USER_AVATAR", payload: res.data?.avatar})
            } else {
                toast({
                    title: 'Failed ⭕',
                    description: res.data.message,
                    variant: 'destructive'
                })
            }

        } catch (error) {
            toast({
                title: 'Failed ⭕',
                description: 'Something wrong',
                variant: 'destructive'
            })
        } finally{
            dispatch({type: "SET_IS_AVATAR_LOADING", payload: false})
        }
    }

    const fetchUser = async (username: string) => {
        try {
            if (!username) return

            dispatch({ type: "SET_IS_USER_LOADING",payload: true })
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
            dispatch({ type: "SET_USER",payload: userdata })

        } catch (error) {
            router.push('/')
        }
        finally {
            dispatch({ type: "SET_IS_USER_LOADING",payload: false })
        }
    }

    const updateUser = async (formData: Partial<UserInfo>) => {
        try {
            if (status !== 'authenticated') return

            dispatch({ type: "SET_IS_USER_LOADING",payload: true })
            const response = await axios.post(`/api/update-user-info`,{
                ...formData
            })

            if (response.data.success) {
                toast({
                    title: 'Updated ✅',
                    description: 'User info updated successfully',
                    variant: 'default'
                })

                const userdata = await response.data.userdata
                dispatch({ type: "SET_USER",payload: userdata })
            }

        } catch (error) {
            toast({
                title: 'Error ⭕',
                description: 'Something went wrong',
                variant: 'destructive'
            })
        }
        finally {
            dispatch({ type: "SET_IS_USER_LOADING",payload: false })
        }
    }

    const sendCollabInvite = async (to_whom: string,noti: NotificationData) => {
        try {
            if (!to_whom || !noti) return

            const response = await axios.post(`/api/add-notification`,{
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

    const addCollab = async (add_whom_username: string,add_whom_name: string,topicid: string,topicname: string,whose_topic: string,notifyid: string) => {
        try {
            if (!add_whom_username || !topicid) return

            const response = await axios.post(`/api/add-collaborator`,{
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
            // fetchNotifications(add_whom_username)
            // fetchNotifications(whose_topic)
        } catch (error) {

            toast({
                title: 'Error',
                description: 'Something wrong in adding as collabrator',
                variant: 'destructive'
            })
        }
    }

    const deleteNotification = async (whose_noti: string,notifyid: string) => {
        try {
            if (!whose_noti) return

            const response = await axios.post(`/api/delete-notification`,{
                username: whose_noti,
                notifyid,
            })

            if (!response.data.success) {
                toast({
                    title: 'Error',
                    description: 'Error in deleting the notification',
                    variant: 'destructive'
                })
                return
            }

            // fetchNotifications(whose_noti)
            dispatch({
                type: "UPDATE_USER_NOTIFICATIONS",
                payload: response.data?.notifications
            })
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Something went wrong',
                variant: 'destructive'
            })
        }
    }

    const sendAcceptedCollabNotification = async (to_whom: string,noti: NotificationData) => {
        try {
            if (!to_whom) return

            const response = await axios.post(`/api/add-notification`,{
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
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Accept response not sent',
                variant: 'destructive'
            })
        }
    }

    const sendDeclinedCollabNotification = async (to_whom: string,noti: NotificationData) => {
        try {
            if (!to_whom) return

            const response = await axios.post(`/api/add-notification`,{
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

    const sendSuggestion = async (to_whom: string,noti: NotificationData) => {
        try {
            if (!to_whom || !noti) return

            const response = await axios.post(`/api/add-notification`,{
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

    const isAlreadyCollaborator = async (username: string,topicid: string,creator_username: string) => {
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

        } catch (error: any) {
            const axiosError = error
            toast({
                title: 'Oops',
                description: axiosError.response?.data.message || 'Something went wrong',
                variant: 'destructive'
            })
            return true
        }
    }

    const isInviteAlreadySent = async (username: string,topicid: string,creator_username: string) => {
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

        } catch (error: any) {
            const axiosError = error

            toast({
                title: 'Oops',
                description: axiosError.response?.data.message || 'Something went wrong',
                variant: 'destructive'
            })
            return true
        }
    }

    const markAllRead = async () => {
        try {
            if (!username) return

            const response = await axios.post(`/api/mark-all-as-read`)
            if (response.data.success) {
                toast({
                    title: 'Done ✅',
                    description: 'Successfully marked all read',
                    variant: 'default'
                })
                dispatch({
                    type: "UPDATE_USER_NOTIFICATIONS",
                    payload: response.data?.notifications
                })
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
            } catch (error) {
                dispatch({
                    type: "SET_USER",
                    user: null
                })
            }
        }

        fetchData()
    }, [param_username])

    return (
        <InsertUserContext.Provider
            value={{
                ...state,
                uploadAvatar,
                fetchUser,
                updateUser,
                sendCollabInvite,
                addCollab,
                sendAcceptedCollabNotification,
                sendDeclinedCollabNotification,
                sendSuggestion,
                isAlreadyCollaborator,
                isInviteAlreadySent,
                markAllRead
            }}>
            {children}
        </InsertUserContext.Provider>)
}

export const useInsertUser = () => {
    const context = useContext(InsertUserContext)
    if (!context) {
        throw new Error('InsertUser Provider must be wrapped properly')
    }
    return context
}