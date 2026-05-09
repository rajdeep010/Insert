'use client'
import { createContext, useContext, useReducer } from 'react'
import axios from 'axios'
import { useSession } from 'next-auth/react'
import type { Session } from 'next-auth'
import InsertPaymentReducer from '@/features/payment/reducers/InsertPaymentReducer'
import { useInsertUser } from '@/features/user/context/InsertUserProvider'
import { toast as sonnerToast } from 'sonner'
import { externalServices } from '@/lib/config/services'
import type {
	PaymentOrder,
	PaymentPlan,
	PaymentState,
	PaymentStatus,
	PaymentVerificationPayload,
	SessionPaymentUpdate,
	UserPaymentUpdate,
} from '@/types/payment'

interface InsertPaymentProviderProps {
	order: PaymentOrder | null
	paymentStatus: PaymentStatus
	isPaymentLoading: boolean
	createOrder: (payload: { type: string }) => Promise<PaymentOrder>
	verifyPayment: (payload: PaymentVerificationPayload) => Promise<boolean>
	cancelSubscription: () => Promise<boolean>
	reactivateSubscription: (payload?: { plan?: PaymentPlan }) => Promise<boolean>
}

const initialState: PaymentState = {
	order: null,
	paymentStatus: 'IDLE',
	isPaymentLoading: false,
}

const InsertPaymentContext = createContext<InsertPaymentProviderProps | null>(null)

export const InsertPaymentProvider = ({ children }: { children: React.ReactNode }) => {
	const [state, dispatch] = useReducer(InsertPaymentReducer, initialState)
	const { data: session, update } = useSession()
	const API_BASE = externalServices.payment.baseUrl
	const { updateUserAfterPayment } = useInsertUser();

	const handleUpdateSessionProAccess = async (updatedUserData: SessionPaymentUpdate | undefined) => {
		update((prev: Session | null) => ({
			...prev,
			user: {
				...prev?.user,
				proAccess: updatedUserData?.proAccess,
				proPlan: updatedUserData?.proPlan,
				proStartedAt: updatedUserData?.proStartedAt,
				proExpiresAt: updatedUserData?.proExpiresAt,
				autoRenew: updatedUserData?.autoRenew ?? undefined,
				proCancelledAt: updatedUserData?.proCancelledAt,
			}
		}))
	}

	const createOrder: InsertPaymentProviderProps['createOrder'] = async (payload) => {
		try {
			dispatch({ type: 'SET_IS_PAYMENT_LOADING', payload: true })
			const res = await axios.post(`${API_BASE}/api/payments/order`, { type: payload.type }, { headers: { Authorization: `Bearer ${session?.accessToken}` } })
			const order = res?.data?.data || res?.data?.order || res?.data
			if (!order) throw new Error('Invalid order response')
			dispatch({ type: 'SET_ORDER', payload: order })
			dispatch({ type: 'SET_PAYMENT_STATUS', payload: 'PENDING' })
			return order
		} catch (error: any) {
			sonnerToast.error('Order creation failed', { description: error?.response?.data?.message || error?.message || 'Failed to create order' })
			dispatch({ type: 'SET_PAYMENT_STATUS', payload: 'FAILED' })
			throw error
		} finally {
			dispatch({ type: 'SET_IS_PAYMENT_LOADING', payload: false })
		}
	}

	const verifyPayment: InsertPaymentProviderProps['verifyPayment'] = async (payload) => {
		try {
			dispatch({ type: 'SET_IS_PAYMENT_LOADING', payload: true })
			const res = await axios.post(`${API_BASE}/api/payments/verify-payment`, { orderId: payload.orderId, paymentId: payload.paymentId, signature: payload.signature, gateway: payload.gateway ?? 'razorpay' }, { headers: { Authorization: `Bearer ${session?.accessToken}` } })
			const success = res?.data?.success
			if (success) {
				const updatedUser = res?.data?.updatedUser as SessionPaymentUpdate | undefined
				await handleUpdateSessionProAccess(updatedUser)
				sonnerToast.success('Payment verified', { description: 'Your Pro plan is active.' })
				sonnerToast.info('Changes may require re-login', { description: 'Sign out and back in if Pro features are not visible.' })
			}
			dispatch({ type: 'SET_PAYMENT_STATUS', payload: success ? 'SUCCESS' : 'FAILED' })
			if (!success) sonnerToast.error('Payment verification failed', { description: res?.data?.message || 'Verification failed' })
			return success
		} catch (error: any) {
			dispatch({ type: 'SET_PAYMENT_STATUS', payload: 'FAILED' })
			sonnerToast.error('Payment verification error', { description: error?.response?.data?.message || error?.message || 'Payment verification failed' })
			return false
		} finally {
			dispatch({ type: 'SET_IS_PAYMENT_LOADING', payload: false })
		}
	}

	const cancelSubscription: InsertPaymentProviderProps['cancelSubscription'] = async () => {
		try {
			dispatch({ type: 'SET_IS_PAYMENT_LOADING', payload: true })
			const res = await axios.post(`${API_BASE}/api/payments/cancel-membership`, {}, { headers: { Authorization: `Bearer ${session?.accessToken}` } })
			const success = !!res?.data?.success
			const updatedUser = res?.data?.subscription as UserPaymentUpdate | undefined
			if (success && updatedUser) {
				updateUserAfterPayment({ active: updatedUser?.active, plan: updatedUser?.plan, startedAt: updatedUser?.startedAt, expiresAt: updatedUser?.expiresAt, autoRenew: updatedUser?.autoRenew, cancelledAt: updatedUser?.cancelledAt || null })
				sonnerToast.success('Membership cancelled', { description: res?.data?.message || 'You will keep Pro until the end of the current period.' })
			} else {
				sonnerToast.error('Cancellation failed', { description: res?.data?.message || 'Could not cancel membership' })
			}
			dispatch({ type: 'SET_PAYMENT_STATUS', payload: success ? 'SUCCESS' : 'FAILED' })
			return success
		} catch (error: any) {
			dispatch({ type: 'SET_PAYMENT_STATUS', payload: 'FAILED' })
			sonnerToast.error('Cancellation error', { description: error?.response?.data?.message || error?.message || 'Could not cancel membership' })
			return false
		} finally {
			dispatch({ type: 'SET_IS_PAYMENT_LOADING', payload: false })
		}
	}

	const reactivateSubscription: InsertPaymentProviderProps['reactivateSubscription'] = async (payload) => {
		try {
			dispatch({ type: 'SET_IS_PAYMENT_LOADING', payload: true })
			const res = await axios.post(`${API_BASE}/api/payments/reactivate-membership`, { plan: payload?.plan }, { headers: { Authorization: `Bearer ${session?.accessToken}` } })
			const success = !!res?.data?.success
			const updatedUser = res?.data?.subscription as UserPaymentUpdate | undefined
			if (success && updatedUser) {
				updateUserAfterPayment({ active: updatedUser?.active, plan: updatedUser?.plan, startedAt: updatedUser?.startedAt, expiresAt: updatedUser?.expiresAt, autoRenew: updatedUser?.autoRenew, cancelledAt: updatedUser?.cancelledAt || null })
				sonnerToast.success('Membership reactivated', { description: res?.data?.message || 'Your Pro plan is active again.' })
			} else {
				sonnerToast.error('Reactivation failed', { description: res?.data?.message || 'Could not reactivate membership' })
			}
			dispatch({ type: 'SET_PAYMENT_STATUS', payload: success ? 'SUCCESS' : 'FAILED' })
			return success
		} catch (error: any) {
			dispatch({ type: 'SET_PAYMENT_STATUS', payload: 'FAILED' })
			sonnerToast.error('Reactivation error', { description: error?.response?.data?.message || error?.message || 'Could not reactivate membership' })
			return false
		} finally {
			dispatch({ type: 'SET_IS_PAYMENT_LOADING', payload: false })
		}
	}

	return (
		<InsertPaymentContext.Provider value={{ ...state, createOrder, verifyPayment, cancelSubscription, reactivateSubscription }}>
			{children}
		</InsertPaymentContext.Provider>
	)
}

export const useInsertPayment = () => {
	const context = useContext(InsertPaymentContext)
	if (!context) {
		throw new Error('InsertPaymentProvider must be wrapped properly')
	}
	return context
}