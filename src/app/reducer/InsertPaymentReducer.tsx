type State = {
    order: any
    paymentStatus: 'IDLE' | 'PENDING' | 'SUCCESS' | 'FAILED'
    isPaymentLoading: boolean
}

type Action =
    | { type: 'SET_ORDER'; payload: any }
    | { type: 'SET_PAYMENT_STATUS'; payload: State['paymentStatus'] }
    | { type: 'SET_IS_PAYMENT_LOADING'; payload: boolean }

const InsertPaymentReducer = (state: any, action: Action): State => {
    switch (action.type) {
        case 'SET_ORDER':
            return { ...state, order: action.payload }
        case 'SET_PAYMENT_STATUS':
            return { ...state, paymentStatus: action.payload }
        case 'SET_IS_PAYMENT_LOADING':
            return { ...state, isPaymentLoading: action.payload }
        default:
            return state
    }
}

export default InsertPaymentReducer