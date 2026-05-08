export default function InsertUserReducer(state: any, action: any) {
	switch (action.type) {
		case "SET_IS_CURRENT_USER_LOADING":
			return { ...state, isCurrentUserLoading: action.payload }
		case "SET_IS_PROFILE_USER_LOADING":
			return { ...state, isUserLoading: action.payload }
		case "SET_CURRENT_USER":
			return { ...state, currentUser: action.payload }
		case "SET_PROFILE_USER":
			return { ...state, profileUser: action.payload }
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
				}
			}
		case "SET_IS_AVATAR_LOADING":
			return { ...state, isAvatarUploading: action.payload }
		default:
			return state;
	}
}