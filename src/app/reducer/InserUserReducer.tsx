


export default function InsertUserReducer(state: any,action: any) {
    switch (action.type) {
        case "SET_IS_USER_LOADING": 
            return {
                ...state,
                isUserLoading: action.payload
            }

        case "SET_USER":
            return {
                ...state,
                user: action.payload
            }

        case "SET_USER_AFTER_PAYMENT":
            return {
                ...state,
                user: {
                    ...state.user,
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
                user: {
                    ...state.user,
                    avatar: action.payload,
                }
            }

        case "SET_IS_AVATAR_LOADING":
            return {
                ...state,
                isAvatarUploading: action.payload
            }
        
        case "SET_NOTIFY_COUNT":
            return {
                ...state,
                unreadNotifyCount: action.payload
            }

        case "SET_NOTIFICATIONS": {
            const notifications = action.payload;
            const unreadCount = notifications.filter((n: any) => !n.read).length;

            return {
                ...state,
                notifications,
                unreadNotifyCount: unreadCount,
            }
        }

        case "MARK_ALL_READ_NOTIFICATIONS": {
            const marked = state.notifications.map((each: any) => ({
                ...each,
                read: true,
            }))
            return {
                ...state,
                notifications: marked,
                unreadNotifyCount: 0,
            }
        }
        
        default:
            return state;
    }
}