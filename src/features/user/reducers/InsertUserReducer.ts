import type { UserInfo, UserState } from "@/types/user";

type UserAction =
	| { type: "SET_IS_CURRENT_USER_LOADING"; payload: boolean }
	| { type: "SET_IS_PROFILE_USER_LOADING"; payload: boolean }
	| { type: "SET_CURRENT_USER"; payload: UserInfo | null }
	| { type: "SET_PROFILE_USER"; payload: UserInfo | null }
	| { type: "SET_PUBLIC_USER"; payload: UserInfo }
	| { type: "SET_USER_AFTER_PAYMENT"; payload: { active?: boolean | null; plan?: string | null; startedAt?: string | Date | null; expiresAt?: string | Date | null; autoRenew?: boolean | null; cancelledAt?: string | Date | null } }
	| { type: "UPDATE_USER_AVATAR"; payload: string | null | undefined }
	| { type: "SET_IS_AVATAR_LOADING"; payload: boolean }

const upsertPublicUser = (cache: Record<string, UserInfo>, user: UserInfo | null) => {
	if (!user?.username) return cache
	return { ...cache, [user.username]: user }
}

export default function InsertUserReducer(state: UserState, action: UserAction): UserState {
	switch (action.type) {
		case "SET_IS_CURRENT_USER_LOADING":
			return { ...state, isCurrentUserLoading: action.payload }
		case "SET_IS_PROFILE_USER_LOADING":
			return { ...state, isUserLoading: action.payload }
		case "SET_CURRENT_USER":
			return { ...state, currentUser: action.payload, publicUsersByUsername: upsertPublicUser(state.publicUsersByUsername, action.payload) }
		case "SET_PROFILE_USER":
			return { ...state, profileUser: action.payload, publicUsersByUsername: upsertPublicUser(state.publicUsersByUsername, action.payload) }
		case "SET_PUBLIC_USER":
			return { ...state, publicUsersByUsername: upsertPublicUser(state.publicUsersByUsername, action.payload) }
		case "SET_USER_AFTER_PAYMENT":
			return {
				...state,
				currentUser: {
					...state.currentUser,
					proStatus: {
						active: action.payload.active,
						plan: action.payload.plan,
						startedAt: action.payload.startedAt,
						expiresAt: action.payload.expiresAt,
						autoRenew: action.payload.autoRenew,
						cancelledAt: action.payload?.cancelledAt || null,
					}
				}
			}
		case "UPDATE_USER_AVATAR":
			return {
				...state,
				isAvatarUploading: false,
				currentUser: {
					...state.currentUser,
					avatar: action.payload,
				},
				publicUsersByUsername: state.currentUser?.username
					? {
						...state.publicUsersByUsername,
						[state.currentUser.username]: {
							...state.publicUsersByUsername[state.currentUser.username],
							...state.currentUser,
							avatar: action.payload,
						},
					}
					: state.publicUsersByUsername,
			}
		case "SET_IS_AVATAR_LOADING":
			return { ...state, isAvatarUploading: action.payload }
		default:
			return state;
	}
}