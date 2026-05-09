export type PaymentStatus = 'IDLE' | 'PENDING' | 'SUCCESS' | 'FAILED'

export type PaymentPlan = 'monthly' | 'yearly'

export interface PaymentOrder {
	id?: string
	amount?: number
	currency?: string
	receipt?: string
	status?: string
	[key: string]: unknown
}

export interface PaymentVerificationPayload {
	orderId: string
	paymentId: string
	signature?: string
	gateway?: 'razorpay'
}

export interface UserPaymentUpdate {
	active?: boolean | null
	plan?: string | null
	startedAt?: string | Date | null
	expiresAt?: string | Date | null
	autoRenew?: boolean | null
	cancelledAt?: string | Date | null
}

export interface SessionPaymentUpdate {
	proAccess?: boolean
	proPlan?: string | null
	proStartedAt?: string | Date | null
	proExpiresAt?: string | Date | null
	autoRenew?: boolean | null
	proCancelledAt?: string | Date | null
}

export interface PaymentState {
	order: PaymentOrder | null
	paymentStatus: PaymentStatus
	isPaymentLoading: boolean
}