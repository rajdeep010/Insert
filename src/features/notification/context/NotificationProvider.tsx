'use client'
import type { NotificationData } from "@/types/notifications";
import axios from "axios";
import { useSession } from "next-auth/react";
import { createContext, useContext, useEffect, useReducer } from "react";
import { toast } from "@/components/ui/use-toast";
import { notifyFormatter } from "@/helpers/notify-format";
import NotificationReducer from "@/features/notification/reducers/NotificationReducer";
import { externalServices } from "@/lib/config/services";

const INSERT_NOTIFY_SERVICE = externalServices.notification.origin

interface NotificationProviderProps {
	notifications: NotificationData[]
	unreadNotifyCount: number
	getNotifications: () => void
	markAllRead: () => void
	sendCollabInvite: (toWhom: string, notification: any) => void
	addCollab: (addWhomUsername: string, addWhomName: string, topicId: string, topicName: string, ownerUsername: string, toUsername: string, notifyId: string, fromUserId: string, toUserId: string) => void
	sendDeclinedCollabNotification: (toWhom: string, notification: NotificationData) => void
	sendSuggestion: (toWhom: string, notification: any) => void
}

const initialState: Omit<NotificationProviderProps, "getNotifications" | "markAllRead" | "sendCollabInvite" | "addCollab" | "sendDeclinedCollabNotification" | "sendSuggestion"> = {
	notifications: [],
	unreadNotifyCount: 0,
}

const NotificationContext = createContext<NotificationProviderProps | null>(null)

export const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
	const { data: session, status } = useSession()
	const username = session?.user?.username || null
	const [state, dispatch] = useReducer(NotificationReducer, initialState)

	const getNotifications = async () => {
		try {
			const response = await axios.get(`${INSERT_NOTIFY_SERVICE}/api/notify/get-notifications`, {
				headers: { Authorization: `Bearer ${session?.accessToken}` },
			})
			dispatch({ type: "SET_NOTIFICATIONS", payload: response.data.notifications ?? [] })
		} catch { }
	}

	const getUnreadNotifyCount = async () => {
		try {
			if (!session?.accessToken) return
			const response = await axios.get(`${INSERT_NOTIFY_SERVICE}/api/notify/get-unread-count`, {
				headers: { Authorization: `Bearer ${session?.accessToken}` },
			})
			dispatch({ type: "SET_NOTIFY_COUNT", payload: response.data.count ?? 0 })
		} catch { }
	}

	const sendCollabInvite = async (toWhom: string, notification: any) => {
		try {
			if (!toWhom || !notification) return
			const payload = notifyFormatter("COLLAB_REQUEST", {
				topicName: notification.topicName,
				topicId: notification.topicId,
				fromUsername: session?.user?.username,
				toUsername: notification.to,
				fromUserId: notification?.fromID,
				toUserId: notification?.toID,
			})
			const response = await axios.post(`${INSERT_NOTIFY_SERVICE}/api/notify/add-notification`, payload, {
				headers: { Authorization: `Bearer ${session?.accessToken}` },
			})
			if (!response.data.success) {
				toast({ title: 'Oops!', description: response.data.message, variant: 'default' })
				return
			}
			toast({ title: 'Sent ✅', description: `Collab invite sent to ${toWhom}`, variant: 'default' })
		} catch (error: any) {
			toast({ title: 'Oops', description: error.message || 'Collab request not sent', variant: 'destructive' })
		}
	}

	const addCollab = async (addWhomUsername: string, addWhomName: string, topicId: string, topicName: string, ownerUsername: string, toUsername: string, notifyId: string, fromUserId: string, toUserId: string) => {
		try {
			if (!addWhomUsername || !topicId) return
			const response = await axios.post(`/api/topics/${topicId}/collaborators`, {
				collaborator: { username: addWhomUsername, name: addWhomName },
			})
			if (!response.data.success) {
				toast({ title: 'Oops', description: response.data.message, variant: 'destructive' })
				return
			}
			toast({ title: 'Congrats ✅', description: 'Successfully added as collaborator', variant: 'default' })
			const payload = notifyFormatter("COLLAB_ACCEPT", {
				topicName: topicName,
				topicId: topicId,
				fromUsername: ownerUsername,
				toUsername: toUsername,
				notifyId: notifyId,
				fromUserId,
				toUserId,
			})
			const notifyResponse = await axios.post(`${INSERT_NOTIFY_SERVICE}/api/notify/add-notification`, payload, {
				headers: { Authorization: `Bearer ${session?.accessToken}` },
			})
			if (!notifyResponse.data.success) {
				toast({ title: 'Oops', description: response.data.message, variant: 'destructive' })
			}
		} catch {
			toast({ title: 'Error', description: 'Something wrong in adding as collabrator', variant: 'destructive' })
		}
	}

	const sendDeclinedCollabNotification = async (toWhom: string, notification: NotificationData) => {
		try {
			if (!toWhom) return
			const payload = notifyFormatter("COLLAB_DECLINE", {
				topicName: notification.topicname,
				topicId: notification.topicid,
				fromUsername: notification.from,
				toUsername: notification.to,
				notifyId: notification?._id,
				fromUserId: notification?.fromUserId,
				toUserId: notification?.toUserId,
			})
			const response = await axios.post(`${INSERT_NOTIFY_SERVICE}/api/notify/add-notification`, payload, {
				headers: { Authorization: `Bearer ${session?.accessToken}` },
			})
			if (!response.data.success) {
				toast({ title: 'Error', description: response.data.message, variant: 'destructive' })
			}
		} catch {
			toast({ title: 'Error', description: `Decline response not sent`, variant: 'destructive' })
		}
	}

	const sendSuggestion = async (toWhom: string, notification: any) => {
		try {
			if (!toWhom || !notification) return
			const payload = notifyFormatter("SUGGEST_PROBLEM", {
				topicName: notification.topicname,
				topicId: notification.topicid,
				fromUsername: session?.user?.username,
				toUsername: toWhom,
				problemName: notification.problemname,
				problemUrl: notification.problemurl,
			})
			const response = await axios.post(`${INSERT_NOTIFY_SERVICE}/api/notify/add-notification`, payload, {
				headers: { Authorization: `Bearer ${session?.accessToken}` },
			})
			if (!response.data.success) {
				toast({ title: 'Error', description: response.data.message, variant: 'default' })
				return
			}
			toast({ title: 'Sent ✅', description: `Suggestion sent to ${toWhom}`, variant: 'default' })
		} catch {
			toast({ title: 'Error', description: 'Suggestion request not sent', variant: 'destructive' })
		}
	}

	const markAllRead = async () => {
		try {
			if (!username) return
			const response = await axios.patch(`${INSERT_NOTIFY_SERVICE}/api/notify/mark-all-read`, {}, {
				headers: { Authorization: `Bearer ${session?.accessToken}` },
			})
			if (response.data.success) {
				toast({ title: 'Done ✅', description: 'Successfully marked all read', variant: 'default' })
				dispatch({ type: "MARK_ALL_READ_NOTIFICATIONS" })
			}
		} catch {
			toast({ title: 'Error', description: 'Could not mark read', variant: 'destructive' })
		}
	}

	useEffect(() => {
		if (status === "authenticated") {
			void getUnreadNotifyCount()
		}
	}, [status])

	return (
		<NotificationContext.Provider value={{ ...state, getNotifications, markAllRead, sendCollabInvite, addCollab, sendDeclinedCollabNotification, sendSuggestion }}>
			{children}
		</NotificationContext.Provider>
	)
}

export const useNotifications = () => {
	const context = useContext(NotificationContext)
	if (!context) throw new Error('NotificationProvider must be wrapped properly')
	return context
}