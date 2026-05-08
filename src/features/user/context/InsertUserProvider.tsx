'use client'
import type { UserPaymentUpdate } from "@/types/payment";
import type { UserInfo, UserState } from "@/types/user";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useReducer, useRef } from "react";
import InsertUserReducer from "@/features/user/reducers/InsertUserReducer";
import axios from "axios";
import { toast } from "@/components/ui/use-toast";
import { uniqueId } from "@/helpers/unique-id";
import { externalServices } from "@/lib/config/services";

interface InsertUserProviderProps {
	currentUser: UserInfo | null
	profileUser: UserInfo | null
	publicUsersByUsername: Record<string, UserInfo>
	isCurrentUserLoading: boolean
	isUserLoading: boolean
	isAvatarUploading: boolean
	updateUser: (formData: Partial<UserInfo>) => void
	fetchCurrentUser: () => void
	fetchProfileUser: (username: string) => Promise<UserInfo | null>
	fetchPublicUser: (username: string, options?: { force?: boolean }) => Promise<UserInfo | null>
	uploadAvatar: (file: File) => void
	updateUserAfterPayment: (payload: UserPaymentUpdate) => void
}

const initialState: UserState = {
	currentUser: null,
	profileUser: null,
	publicUsersByUsername: {},
	isCurrentUserLoading: false,
	isUserLoading: false,
	isAvatarUploading: false,
}

const InsertUserContext = createContext<InsertUserProviderProps | null>(null)

export const InsertUserProvider = ({ children }: { children: React.ReactNode }) => {
	const { data: session, status } = useSession()
	const router = useRouter()
	const [state, dispatch] = useReducer(InsertUserReducer, initialState)
	const inflightPublicUsersRef = useRef(new Map<string, Promise<UserInfo | null>>())
	const username = session?.user?.username || null
	const { cloudName, uploadPreset, uploadUrl } = externalServices.cloudinary
	const syncCurrentUserIntoProfile = (updatedUser: UserInfo) => {
		if (state.profileUser?.username && state.profileUser?.username === updatedUser?.username) {
			dispatch({ type: "SET_PROFILE_USER", payload: updatedUser })
		}
	}

	const fetchPublicUser: InsertUserProviderProps["fetchPublicUser"] = async (targetUsername, options) => {
		if (!targetUsername) return null
		if (!options?.force && state.publicUsersByUsername[targetUsername]) {
			return state.publicUsersByUsername[targetUsername]
		}

		const inflightRequest = inflightPublicUsersRef.current.get(targetUsername)
		if (inflightRequest) {
			return inflightRequest
		}

		const request = axios
			.get(`/api/users/${targetUsername}`)
			.then((response) => {
				if (!response?.data?.success) return null
				const user = response.data.userdata as UserInfo
				dispatch({ type: "SET_PUBLIC_USER", payload: user })
				return user
			})
			.catch(() => null)
			.finally(() => {
				inflightPublicUsersRef.current.delete(targetUsername)
			})

		inflightPublicUsersRef.current.set(targetUsername, request)
		return request
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

	const fetchProfileUser: InsertUserProviderProps["fetchProfileUser"] = async (username: string) => {
		try {
			if (!username) return
			if (state.profileUser?.username === username) return state.profileUser
			const cachedUser = state.publicUsersByUsername[username]
			if (cachedUser) {
				dispatch({ type: "SET_PROFILE_USER", payload: cachedUser })
				return cachedUser
			}
			dispatch({ type: "SET_IS_PROFILE_USER_LOADING", payload: true })
			const userdata = await fetchPublicUser(username, { force: true })
			if (!userdata) {
				toast({ title: 'Not Found', description: response?.data?.message || 'No such user exists', variant: 'destructive' })
				router.push('/')
				return null
			}
			dispatch({ type: "SET_PROFILE_USER", payload: userdata })
			return userdata
		} catch {
			router.push('/')
			return null
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
		<InsertUserContext.Provider value={{ ...state, uploadAvatar, fetchCurrentUser, fetchProfileUser, fetchPublicUser, updateUser, updateUserAfterPayment }}>
			{children}
		</InsertUserContext.Provider>
	)
}

export const useInsertUser = () => {
	const context = useContext(InsertUserContext)
	if (!context) throw new Error('InsertUser Provider must be wrapped properly')
	return context
}

export const usePublicUser = (username?: string | null) => {
	const { publicUsersByUsername, fetchPublicUser } = useInsertUser()
	const cachedUser = username ? publicUsersByUsername[username] ?? null : null

	useEffect(() => {
		if (!username || cachedUser) return
		void fetchPublicUser(username)
	}, [cachedUser, fetchPublicUser, username])

	return cachedUser
}