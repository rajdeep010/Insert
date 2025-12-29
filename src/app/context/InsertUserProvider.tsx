'use client'
import { NotificationData, UserInfo } from "@/types/types";
import { getCsrfToken, getSession, useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useReducer, useState } from "react";
import InsertUserReducer from "../reducer/InserUserReducer";
import axios from "axios";
import { toast } from "@/components/ui/use-toast";
import { uniqueId } from "@/helpers/unique-id";
import { notifyFormatter } from "@/helpers/notify-format";


const INSERT_NOTIFY_SERVICE = 'https://insert-notification-service.onrender.com'


interface InsertUserProviderProps {
    user: any
    isUserLoading: boolean
    isAvatarUploading: boolean

    notifications: any[],
    unreadNotifyCount: number

    updateUser: (formData: Partial<UserInfo>) => void
    fetchUser: (username: string) => void
    sendCollabInvite: (to_whom: string, noti: any) => void
    addCollab: (add_whom_username: string, add_whom_name: string, topicid: string, topicname: string, whose_topic: string, to: string, notifyid: string, fromUserId: string, toUserId: string) => void
    sendSuggestion: (to_whom: string, noti: any) => void
    markAllRead: (username: string) => void
    getNotifications: () => void

    sendAcceptedCollabNotification: (to_whom: string, noti: any) => void
    sendDeclinedCollabNotification: (to_whom: string, noti: any) => void

    isAlreadyCollaborator: (username: string, topicid: string, creator_username: string) => Promise<boolean>
    isInviteAlreadySent: (username: string, topicid: string, creator_username: string) => Promise<boolean>
    uploadAvatar: (file: File) => void

    updateUserAfterPayment: (payload: any) => void
}

const initialState: InsertUserProviderProps = {
    // this user is basically from db, not exact as session user
    // in session.user the fields are regular and not nested
    // but here user is complete user object from db
    user: {},
    isUserLoading: false,
    isAvatarUploading: false,
    notifications: [],
    unreadNotifyCount: 0,

    updateUser: (formData: Partial<UserInfo>) => { },
    fetchUser: (username: string) => { },
    sendCollabInvite: (to_whom: string, noti: any) => { },
    addCollab: (add_whom_username: string, add_whom_name: string, topicid: string, topicname: string, whose_topic: string, to: string, notifyid: string, fromUserId: string, toUserId: string) => { },
    sendSuggestion: (to_whom: string, noti: any) => { },
    markAllRead: (username: string) => { },
    getNotifications: () => { },

    sendAcceptedCollabNotification: (to_whom: string, noti: any) => { },
    sendDeclinedCollabNotification: (to_whom: string, noti: any) => { },

    isAlreadyCollaborator: async () => true,
    isInviteAlreadySent: async () => true,
    uploadAvatar: (file: File) => { },

    updateUserAfterPayment: (payload: any) => { },
}

const InsertUserContext = createContext<InsertUserProviderProps | null>(null)

export const InsertUserProvider = ({ children }: { children: React.ReactNode }) => {
    const { data: session, status } = useSession()
    const router = useRouter()
    const params = useParams()
    const param_username = params.username as string

    const [state, dispatch] = useReducer(InsertUserReducer, initialState)
    const username = session?.user?.username || null

    const NEXT_PUBLIC_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUD_NAME as string
    const NEXT_PUBLIC_CLOUD_PRESET = process.env.NEXT_PUBLIC_CLOUD_PRESET as string


    const uploadAvatar = async (file: File) => {
        try {
            if (!username) return
            dispatch({ type: "SET_IS_AVATAR_LOADING", payload: true })

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
            const res = await axios.post(`/api/save-user-avatar`, { avatarURL: avatarUrl })

            if (res.data.success) {
                toast({
                    title: 'Updated ✅',
                    description: 'Avatar updated successfully',
                    variant: 'default'
                })

                dispatch({ type: "UPDATE_USER_AVATAR", payload: res.data?.avatar })
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
        } finally {
            dispatch({ type: "SET_IS_AVATAR_LOADING", payload: false })
        }
    }

    const fetchUser = async (username: string) => {
        try {
            if (!username) return

            dispatch({ type: "SET_IS_USER_LOADING", payload: true })
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
            dispatch({ type: "SET_USER", payload: userdata })

        } catch (error) {
            router.push('/')
        }
        finally {
            dispatch({ type: "SET_IS_USER_LOADING", payload: false })
        }
    }

    const updateUser = async (formData: Partial<UserInfo>) => {
        try {
            if (status !== 'authenticated') return

            dispatch({ type: "SET_IS_USER_LOADING", payload: true })
            const response = await axios.post(`/api/update-user-info`, {
                ...formData
            })

            if (response.data.success) {
                toast({
                    title: 'Updated ✅',
                    description: 'User info updated successfully',
                    variant: 'default'
                })

                const userdata = await response.data.userdata
                dispatch({ type: "SET_USER", payload: userdata })
            }

        } catch (error) {
            toast({
                title: 'Error ⭕',
                description: 'Something went wrong',
                variant: 'destructive'
            })
        }
        finally {
            dispatch({ type: "SET_IS_USER_LOADING", payload: false })
        }
    }

    const sendCollabInvite = async (to_whom: string, noti: any) => {
        try {
            if (!to_whom || !noti) return

            const data = {
                topicName: noti.topicName,
                topicId: noti.topicId,
                fromUsername: session?.user?.username,
                toUsername: noti.to,
                fromUserId: noti?.fromID,
                toUserId: noti?.toID,
            }
            const formatPayload = notifyFormatter("COLLAB_REQUEST", data)
            const res = await axios.post(`${INSERT_NOTIFY_SERVICE}/api/notify/add-notification`, formatPayload, {
                headers: {
                    Authorization: `Bearer ${session?.accessToken}`,
                },
            })
            if (!res.data.success) {
                toast({
                    title: 'Oops!',
                    description: res.data.message,
                    variant: 'default'
                })
                return
            }

            toast({
                title: 'Sent ✅',
                description: `Collab invite sent to ${to_whom}`,
                variant: 'default'
            })

        } catch (error: any) {
            toast({
                title: 'Oops',
                description: error.message || 'Collab request not sent',
                variant: 'destructive'
            })
        }
    }

    const getNotifications = async () => {
        try {
            const response = await axios.get(`${INSERT_NOTIFY_SERVICE}/api/notify/get-notifications`, {
                headers: {
                    Authorization: `Bearer ${session?.accessToken}`,
                },
            })
            dispatch({ type: "SET_NOTIFICATIONS", payload: response.data.notifications })
        } catch (error) {

        }
    }

    const getUnreadNotifyCount = async () => {
        try {
            if (!session?.accessToken) return
            const response = await axios.get(`${INSERT_NOTIFY_SERVICE}/api/notify/get-unread-count`, {
                headers: {
                    Authorization: `Bearer ${session?.accessToken}`,
                },
            })
            dispatch({ type: "SET_NOTIFY_COUNT", payload: response.data.count })
        } catch (error) {
        }
    }

    const addCollab = async (add_whom_username: string, add_whom_name: string, topicid: string, topicname: string, whose_topic: string, to: string, notifyid: string, fromUserId: string, toUserId: string) => {
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
                    title: 'Oops',
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

            const data = {
                topicName: topicname,
                topicId: topicid,
                fromUsername: whose_topic,
                toUsername: to,
                notifyId: notifyid,
                fromUserId,
                toUserId
            }
            const formatPayload = notifyFormatter("COLLAB_ACCEPT", data)
            const res = await axios.post(`${INSERT_NOTIFY_SERVICE}/api/notify/add-notification`, formatPayload, {
                headers: {
                    Authorization: `Bearer ${session?.accessToken}`,
                },
            })

            if (!res.data.success) {
                toast({
                    title: 'Oops',
                    description: response.data.message,
                    variant: 'destructive'
                })
                return
            }

        } catch (error) {

            toast({
                title: 'Error',
                description: 'Something wrong in adding as collabrator',
                variant: 'destructive'
            })
        }
    }

    const sendDeclinedCollabNotification = async (to_whom: string, noti: NotificationData) => {
        try {
            if (!to_whom) return

            const data = {
                topicName: noti.topicname,
                topicId: noti.topicid,
                fromUsername: noti.from,
                toUsername: noti.to,
                notifyId: noti?._id,
                fromUserId: noti?.fromUserId,
                toUserId: noti?.toUserId
            }
            const formatPayload = notifyFormatter("COLLAB_DECLINE", data)
            const response = await axios.post(`${INSERT_NOTIFY_SERVICE}/api/notify/add-notification`, formatPayload, {
                headers: {
                    Authorization: `Bearer ${session?.accessToken}`,
                },
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
                description: `Decline response not sent`,
                variant: 'destructive'
            })
        }
    }

    const sendSuggestion = async (to_whom: string, noti: any) => {
        try {
            if (!to_whom || !noti) return

            const data = {
                topicName: noti.topicname,
                topicId: noti.topicid,
                fromUsername: session?.user?.username,
                toUsername: to_whom,
                problemName: noti.problemname,
                problemUrl: noti.problemurl
            }
            const formatPayload = notifyFormatter("SUGGEST_PROBLEM", data)
            const response = await axios.post(`${INSERT_NOTIFY_SERVICE}/api/notify/add-notification`, formatPayload, {
                headers: {
                    Authorization: `Bearer ${session?.accessToken}`,
                },
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

    const markAllRead = async () => {
        try {
            if (!username) return

            const response = await axios.patch(`${INSERT_NOTIFY_SERVICE}/api/notify/mark-all-read`, {}, {
                headers: {
                    Authorization: `Bearer ${session?.accessToken}`,
                },
            })
            if (response.data.success) {
                toast({
                    title: 'Done ✅',
                    description: 'Successfully marked all read',
                    variant: 'default'
                })
                dispatch({ type: "MARK_ALL_READ_NOTIFICATIONS" })
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Could not mark read',
                variant: 'destructive'
            })
        }
    }

    const updateUserAfterPayment = async (payload: any) => {
        dispatch({
            type: "SET_USER_AFTER_PAYMENT",
            payload: {
                active: payload?.active,
                plan: payload?.plan,
                startedAt: payload?.startedAt,
                expiresAt: payload?.expiresAt,
                autoRenew: payload?.autoRenew,
                cancelledAt: payload?.cancelledAt || null,
            }
        })
    }

    useEffect(() => {
        if (status === "authenticated") {
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
        }

    }, [status, param_username])

    useEffect(() => {
        if (status === "authenticated") {
            const fetchNoti = async () => {
                try {
                    await getUnreadNotifyCount()
                } catch (error) {

                }
            }

            fetchNoti()
        }
    }, [status])

    return (
        <InsertUserContext.Provider
            value={{
                ...state,
                uploadAvatar,
                fetchUser,
                updateUser,
                sendCollabInvite,
                addCollab,
                sendDeclinedCollabNotification,
                sendSuggestion,
                markAllRead,
                getNotifications,
                getUnreadNotifyCount,
                updateUserAfterPayment
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