const InsertPaymentReducer = (state: any, action: any) => {
    switch (action.type) {
        case 'SET_ORDER':
            return { ...state, order: action.payload }
        case 'SET_PAYMENT_STATUS':
            return { ...state, paymentStatus: action.payload }
        case 'SET_IS_PAYMENT_LOADING':
            return { ...state, isPaymentLoading: action.payload }
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
        case "SET_USER_PAYMENT_UPDATE":
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
        default:
            return state
    }
}

export default InsertPaymentReducer