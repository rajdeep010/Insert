'use client'
import { createContext, useContext, useReducer } from 'react'
import axios from 'axios'
import { toast } from '@/components/ui/use-toast'
import { useSession } from 'next-auth/react'
import InsertPaymentReducer from '../reducer/InsertPaymentReducer'


interface InsertPaymentProviderProps {
    order: any
    paymentStatus: 'IDLE' | 'PENDING' | 'SUCCESS' | 'FAILED'
    isPaymentLoading: boolean

    // Function 1: Create an order
    createOrder: (payload: {
        amount: number
        currency?: string
        notes?: Record<string, string>
        metadata?: Record<string, any>
    }) => Promise<any>

    // Function 2: Verify/Capture the payment after checkout
    verifyPayment: (payload: {
        orderId: string
        paymentId: string
        signature?: string
        gateway?: 'razorpay' | 'stripe' | 'custom'
    }) => Promise<boolean>
}

const initialState: InsertPaymentProviderProps = {
    order: null,
    paymentStatus: 'IDLE',
    isPaymentLoading: false,

    createOrder: async () => ({}),
    verifyPayment: async () => false,
}

const InsertPaymentContext = createContext<InsertPaymentProviderProps | null>(null)

export const InsertPaymentProvider = ({ children }: { children: React.ReactNode }) => {
    const [state, dispatch] = useReducer(InsertPaymentReducer, initialState)
    const { data: session } = useSession()

    // Reuse same base as other services for consistency
    const API_BASE = 'http://localhost:8080/v1'

    const createOrder: InsertPaymentProviderProps['createOrder'] = async (payload) => {
        try {
            dispatch({ type: 'SET_IS_PAYMENT_LOADING', payload: true })

            const res = await axios.post(
                `http://localhost:4000/v1/api/payments/order`,
                {
                    amount: 1001,
                    currency: payload.currency ?? 'INR',
                    notes: payload.notes ?? {},
                    metadata: payload.metadata ?? {},
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

            toast({
                title: 'Order Created ✅',
                description: 'Proceed to complete the payment.',
                variant: 'default',
            })

            return order
        } catch (error: any) {
            toast({
                title: 'Error ⭕',
                description: error?.response?.data?.message || error?.message || 'Failed to create order',
                variant: 'destructive',
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
                {
                    headers: {
                        'Authorization': `Bearer ${session?.accessToken}`,
                    },
                }
            )

            const success = !!(res?.data?.success ?? res?.data?.verified ?? false)

            dispatch({ type: 'SET_PAYMENT_STATUS', payload: success ? 'SUCCESS' : 'FAILED' })

            toast({
                title: success ? 'Payment Successful ✅' : 'Payment Failed ⭕',
                description: success ? 'Your payment has been verified.' : (res?.data?.message || 'Verification failed'),
                variant: success ? 'default' : 'destructive',
            })

            return success
        } catch (error: any) {
            dispatch({ type: 'SET_PAYMENT_STATUS', payload: 'FAILED' })
            toast({
                title: 'Error ⭕',
                description: error?.response?.data?.message || error?.message || 'Payment verification failed',
                variant: 'destructive',
            })
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