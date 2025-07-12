


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

        case "UPDATE_USER_NOTIFICATIONS":
            return {
                ...state,
                user: {
                    ...state.user,
                    notifications: action.payload
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
        
        default:
            return state;
    }
}