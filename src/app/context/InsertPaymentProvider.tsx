'use client'
import { createContext, useContext, useReducer } from 'react'
import axios from 'axios'
import { toast } from '@/components/ui/use-toast'
import { useSession } from 'next-auth/react'
import InsertPaymentReducer from '../reducer/InsertPaymentReducer'
import { useInsertUser } from './InsertUserProvider'
import { toast as sonnerToast } from 'sonner'


interface InsertPaymentProviderProps {
    order: any
    paymentStatus: 'IDLE' | 'PENDING' | 'SUCCESS' | 'FAILED'
    isPaymentLoading: boolean

    createOrder: (payload: {
        type: string
    }) => Promise<any>

    verifyPayment: (payload: {
        orderId: string
        paymentId: string
        signature?: string
        gateway?: 'razorpay'
    }) => Promise<boolean>

    cancelSubscription: () => Promise<boolean>
    reactivateSubscription: (payload?: { plan?: 'monthly' | 'yearly' }) => Promise<boolean>
}

const initialState: InsertPaymentProviderProps = {
    order: null,
    paymentStatus: 'IDLE',
    isPaymentLoading: false,

    createOrder: async () => ({}),
    verifyPayment: async () => false,
    cancelSubscription: async () => false,
    reactivateSubscription: async () => false,
}

const InsertPaymentContext = createContext<InsertPaymentProviderProps | null>(null)

export const InsertPaymentProvider = ({ children }: { children: React.ReactNode }) => {
    const [state, dispatch] = useReducer(InsertPaymentReducer, initialState)
    const { data: session, update } = useSession()

    const API_BASE = 'https://insert-payment-service.onrender.com/v1';

    const { updateUserAfterPayment } = useInsertUser();


    const handleUpdateSessionProAccess = async (updatedUserData: any) => {
        update((prev: any) => ({
            ...prev,
            user: {
                ...prev?.user,
                proAccess: updatedUserData?.proAccess,
                proPlan: updatedUserData?.proPlan,
                proStartedAt: updatedUserData?.proStartedAt,
                proExpiresAt: updatedUserData?.proExpiresAt,
                autoRenew: updatedUserData?.autoRenew,
            }
        }))
    }

    const createOrder: InsertPaymentProviderProps['createOrder'] = async (payload) => {
        try {
            dispatch({ type: 'SET_IS_PAYMENT_LOADING', payload: true })

            const res = await axios.post(
                `${API_BASE}/api/payments/order`,
                {
                    type: payload.type,
                },
                {
                    headers: {
                        Authorization: `Bearer ${session?.accessToken}`,
                    },
                }
            )

            const order = res?.data?.data || res?.data?.order || res?.data
            if (!order) {
                throw new Error('Invalid order response')
            }

            dispatch({ type: 'SET_ORDER', payload: order })
            dispatch({ type: 'SET_PAYMENT_STATUS', payload: 'PENDING' })

            // toast({
            //     title: 'Order Created ✅',
            //     description: 'Proceed to complete the payment.',
            //     variant: 'default',
            // })

            return order
        } catch (error: any) {
            sonnerToast.error('Order creation failed', {
                description: error?.response?.data?.message || error?.message || 'Failed to create order',
            })
            dispatch({ type: 'SET_PAYMENT_STATUS', payload: 'FAILED' })
            throw error
        } finally {
            dispatch({ type: 'SET_IS_PAYMENT_LOADING', payload: false })
        }
    }

    const verifyPayment: InsertPaymentProviderProps['verifyPayment'] = async (payload) => {
        try {
            dispatch({ type: 'SET_IS_PAYMENT_LOADING', payload: true })

            const res = await axios.post(
                `${API_BASE}/api/payments/verify-payment`,
                {
                    orderId: payload.orderId,
                    paymentId: payload.paymentId,
                    signature: payload.signature,
                    gateway: payload.gateway ?? 'razorpay',
                },
                { headers: { Authorization: `Bearer ${session?.accessToken}` } }
            )

            const success = res?.data?.success
            if (success) {
                const updatedUser = res?.data?.updatedUser
                await handleUpdateSessionProAccess(updatedUser)

                // Drive UI solely from InsertUser context
                // updateUserAfterPayment({
                //     active: updatedUser?.proAccess,
                //     plan: updatedUser?.proPlan,
                //     startedAt: updatedUser?.proStartedAt,
                //     expiresAt: updatedUser?.proExpiresAt,
                //     autoRenew: updatedUser?.autoRenew,
                //     cancelledAt: null, // fresh payment => not cancelled
                // })

                dispatch({ type: "SET_USER_PAYMENT_UPDATE", payload: updatedUser })


                sonnerToast.success('Payment verified', { description: 'Your Pro plan is active.' })
                sonnerToast.info('Changes may require re-login', { description: 'Sign out and back in if Pro features are not visible.' })
            }

            dispatch({ type: 'SET_PAYMENT_STATUS', payload: success ? 'SUCCESS' : 'FAILED' })
            if (!success) {
                sonnerToast.error('Payment verification failed', { description: res?.data?.message || 'Verification failed' })
            }
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

            const res = await axios.post(
                `${API_BASE}/api/payments/cancel-membership`,
                {},
                { headers: { Authorization: `Bearer ${session?.accessToken}` } }
            )


            const success = !!res?.data?.success
            const updatedUser = res?.data?.subscription

            if (success && updatedUser) {
                // await handleUpdateSessionProAccess(updatedUser)
                updateUserAfterPayment({
                    active: updatedUser?.active,
                    plan: updatedUser?.plan,
                    startedAt: updatedUser?.startedAt,
                    expiresAt: updatedUser?.expiresAt,
                    autoRenew: updatedUser?.autoRenew,
                    cancelledAt: updatedUser?.cancelledAt || null,
                })

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

            const res = await axios.post(
                `${API_BASE}/api/payments/reactivate-membership`,
                { plan: payload?.plan },
                { headers: { Authorization: `Bearer ${session?.accessToken}` } }
            )


            const success = !!res?.data?.success
            const updatedUser = res?.data?.subscription

            if (success && updatedUser) {
                // await handleUpdateSessionProAccess(updatedUser)
                updateUserAfterPayment({
                    active: updatedUser?.active,
                    plan: updatedUser?.plan,
                    startedAt: updatedUser?.startedAt,
                    expiresAt: updatedUser?.expiresAt,
                    autoRenew: updatedUser?.autoRenew,
                    cancelledAt: updatedUser?.cancelledAt || null,
                })
                // dispatch({ type: "SET_USER_PAYMENT_UPDATE", payload: updatedUser })


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
        <InsertPaymentContext.Provider
            value={{
                ...state,
                createOrder,
                verifyPayment,
                cancelSubscription,
                reactivateSubscription
            }}
        >
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