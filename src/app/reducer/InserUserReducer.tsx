


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

        case "MARK_ALL_READ_NOTIFICATIONS": {
            const marked = state.notifications.map((each: any) => {
                each.read = true
            })
            return {
                ...state,
                notifications: marked
            }
        }

        case "UPDATE_USER_AVATAR":
            return {
                ...state,
                user: {
                    ...state.user,
                    avatar: action.payload,
                    isAvatarUploading: false,
                }
            }

        case "SET_IS_AVATAR_LOADING":
            return {
                ...state,
                user: {
                    ...state.user,
                    isAvatarUploading: action.payload
                }
            }
        
        case "SET_NOTIFY_COUNT":
            return {
                ...state,
                unreadNotifyCount: action.payload
            }

        case "SET_NOTIFICATIONS":
            return {
                ...state,
                notifications: action.payload
            }
        
        default:
            return state;
    }
}