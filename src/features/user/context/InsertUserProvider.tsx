'use client'
import type { UserPaymentUpdate } from "@/types/payment";
import type { UserInfo } from "@/types/user";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useReducer } from "react";
import InsertUserReducer from "@/features/user/reducers/InsertUserReducer";
import axios from "axios";
import { toast } from "@/components/ui/use-toast";
import { uniqueId } from "@/helpers/unique-id";
import { externalServices } from "@/lib/config/services";

interface InsertUserProviderProps {
	currentUser: UserInfo | Record<string, any>
	profileUser: UserInfo | Record<string, any>
	isCurrentUserLoading: boolean
	isUserLoading: boolean
	isAvatarUploading: boolean
	updateUser: (formData: Partial<UserInfo>) => void
	fetchCurrentUser: () => void
	fetchProfileUser: (username: string) => void
	uploadAvatar: (file: File) => void
	updateUserAfterPayment: (payload: UserPaymentUpdate) => void
}

const initialState: InsertUserProviderProps = {
	currentUser: {},
	profileUser: {},
	isCurrentUserLoading: false,
	isUserLoading: false,
	isAvatarUploading: false,
	updateUser: () => { },
	fetchCurrentUser: () => { },
	fetchProfileUser: () => { },
	uploadAvatar: () => { },
	updateUserAfterPayment: () => { },
}

const InsertUserContext = createContext<InsertUserProviderProps | null>(null)

export const InsertUserProvider = ({ children }: { children: React.ReactNode }) => {
	const { data: session, status } = useSession()
	const router = useRouter()
	const [state, dispatch] = useReducer(InsertUserReducer, initialState)
	const username = session?.user?.username || null
	const { cloudName, uploadPreset, uploadUrl } = externalServices.cloudinary
	const syncCurrentUserIntoProfile = (updatedUser: UserInfo | Record<string, any>) => {
		if (state.profileUser?.username && state.profileUser?.username === updatedUser?.username) {
			dispatch({ type: "SET_PROFILE_USER", payload: updatedUser })
		}
	}

	const fetchCurrentUser = async () => {
		try {
			if (status !== 'authenticated') return
			dispatch({ type: "SET_IS_CURRENT_USER_LOADING", payload: true })
			const response = await axios.get(`/api/me`)
			if (!response?.data?.success) return
			dispatch({ type: "SET_CURRENT_USER", payload: response.data.userdata as UserInfo })
		} catch {
		} finally {
			dispatch({ type: "SET_IS_CURRENT_USER_LOADING", payload: false })
		}
	}

	const uploadAvatar = async (file: File) => {
		try {
			if (!username) return
			dispatch({ type: "SET_IS_AVATAR_LOADING", payload: true })
			const uuid = uniqueId
			const formData = new FormData()
			formData.append('file', file)
			formData.append('upload_preset', uploadPreset)
			formData.append('folder', 'insert')
			formData.append('cloud_name', cloudName)
			formData.append('public_id', uuid)
			const response = await axios.post(uploadUrl, formData)
			const avatarUrl = response.data.secure_url
			const res = await axios.patch(`/api/me/avatar`, { avatarURL: avatarUrl })
			if (res.data.success) {
				toast({ title: 'Updated ✅', description: 'Avatar updated successfully', variant: 'default' })
				dispatch({ type: "UPDATE_USER_AVATAR", payload: res.data?.userdata?.avatar })
				syncCurrentUserIntoProfile({ ...state.currentUser, avatar: res.data?.userdata?.avatar })
			} else {
				toast({ title: 'Failed ⭕', description: res.data.message, variant: 'destructive' })
			}
		} catch {
			toast({ title: 'Failed ⭕', description: 'Something wrong', variant: 'destructive' })
		} finally {
			dispatch({ type: "SET_IS_AVATAR_LOADING", payload: false })
		}
	}

	const fetchProfileUser = async (username: string) => {
		try {
			if (!username) return
			dispatch({ type: "SET_IS_PROFILE_USER_LOADING", payload: true })
			const response = await axios.get(`/api/users/${username}`)
			if (!response?.data?.success) {
				toast({ title: 'Not Found', description: response?.data?.message || 'No such user exists', variant: 'destructive' })
				router.push('/')
				return
			}
			const userdata = await response.data.userdata as UserInfo
			dispatch({ type: "SET_PROFILE_USER", payload: userdata })
		} catch {
			router.push('/')
		} finally {
			dispatch({ type: "SET_IS_PROFILE_USER_LOADING", payload: false })
		}
	}

	const updateUser = async (formData: Partial<UserInfo>) => {
		try {
			if (status !== 'authenticated') return
			dispatch({ type: "SET_IS_CURRENT_USER_LOADING", payload: true })
			const response = await axios.patch(`/api/me`, formData)
			if (response.data.success) {
				toast({ title: 'Updated ✅', description: 'User info updated successfully', variant: 'default' })
				dispatch({ type: "SET_CURRENT_USER", payload: response.data.userdata })
				syncCurrentUserIntoProfile(response.data.userdata)
			}
		} catch {
			toast({ title: 'Error ⭕', description: 'Something went wrong', variant: 'destructive' })
		} finally {
			dispatch({ type: "SET_IS_CURRENT_USER_LOADING", payload: false })
		}
	}

	const updateUserAfterPayment = async (payload: UserPaymentUpdate) => {
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
			void fetchCurrentUser()
		}
	}, [status])

	return (
		<InsertUserContext.Provider value={{ ...state, uploadAvatar, fetchCurrentUser, fetchProfileUser, updateUser, updateUserAfterPayment }}>
			{children}
		</InsertUserContext.Provider>
	)
}

export const useInsertUser = () => {
	const context = useContext(InsertUserContext)
	if (!context) throw new Error('InsertUser Provider must be wrapped properly')
	return context
}