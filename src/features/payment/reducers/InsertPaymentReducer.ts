import type { PaymentOrder, PaymentState, PaymentStatus } from '@/types/payment'

type PaymentAction =
	| { type: 'SET_ORDER'; payload: PaymentOrder | null }
	| { type: 'SET_PAYMENT_STATUS'; payload: PaymentStatus }
	| { type: 'SET_IS_PAYMENT_LOADING'; payload: boolean }

const InsertPaymentReducer = (state: PaymentState, action: PaymentAction): PaymentState => {
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