'use client'

import React, { useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
    BadgeCheck,
    Calendar,
    Crown,
    Info,
    Sparkles,
    Zap,
    User2
} from 'lucide-react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog'
import {
    Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Spinner } from '@/components/ui/spinner'
import { useInsertUser } from '@/features/user/context/InsertUserProvider'
import { useInsertPayment } from '@/features/payment/context/InsertPaymentProvider'
import ProBadgeIcon from '@/components/ProBadgeIcon'
import { getProStatusView } from '@/lib/pro-status'
import { useSession } from 'next-auth/react'
import { toast as sonnerToast } from 'sonner'

declare global { interface Window { Razorpay: any } }

type BillingPeriod = 'monthly' | 'yearly'

const shell = 'rounded-2xl border border-black/[0.08] dark:border-white/[0.08] bg-white/60 dark:bg-gray-900/40 supports-[backdrop-filter]:bg-white/40 backdrop-blur transition-colors'
const subtle = 'text-gray-600 dark:text-gray-400'
const pill = 'px-2.5 py-1 rounded-full text-xs border border-slate-200 dark:border-slate-700 bg-slate-100/60 dark:bg-slate-800/50'

const formatDate = (value?: string | Date | null) => {
    if (!value) return null

    const date = value instanceof Date ? value : new Date(value)
    if (Number.isNaN(date.getTime())) return null

    return date.toLocaleDateString()
}

export default function PaymentPage() {
    const { data: session } = useSession()
    const { currentUser } = useInsertUser()
    const { createOrder, verifyPayment, cancelSubscription, reactivateSubscription, isPaymentLoading } = useInsertPayment()

    const RAZORPAY_KEY = process.env.NEXT_PUBLIC_RAZORPAY_API_KEY
    const [billing, setBilling] = useState<BillingPeriod>('monthly')
    const [isPolicyOpen, setPolicyOpen] = useState(false)

    // Prices
    const monthlyPrice = 11
    const yearlyPrice = 99
    const discountPercent = useMemo(() => Math.round((1 - yearlyPrice / (monthlyPrice * 12)) * 100), [monthlyPrice, yearlyPrice])
    const displayPrice = billing === 'monthly' ? monthlyPrice : yearlyPrice
    const unit = billing === 'monthly' ? '/mo' : '/yr'
    const subtext = billing === 'monthly' ? 'Billed monthly • Cancel anytime' : `Billed annually • Save ${discountPercent}% (≈3 months free)`

    // Read only from user context
    const proStatusView = useMemo(() => getProStatusView(currentUser?.proStatus), [currentUser?.proStatus])
    const hasPro = proStatusView.active
    const hasProHistory = proStatusView.hasHistory
    const isExpired = proStatusView.badgeState === 'expired'
    const currentPlan = proStatusView.plan as BillingPeriod | null
    const renewAtLabel = formatDate(proStatusView.expiresAt)
    const cancelledAtLabel = formatDate(proStatusView.cancelledAt)

    const isCurrentActive = hasPro && currentPlan === billing
    const showReactivate = hasPro && Boolean(proStatusView.cancelledAt)
    const showCancel = hasPro && !Boolean(proStatusView.cancelledAt)


    const handleUpgrade = async () => {
        try {
            if (!session?.accessToken) {
                sonnerToast.warning('Sign in required', { description: 'Please sign in to upgrade your plan.' })
                return
            }
            if (isCurrentActive) {
                sonnerToast.info('Already on this plan', { description: `You are already on the ${billing} Pro plan.` })
                return
            }

            const order = await createOrder({ type: billing.toUpperCase() })
            if (!order?.id) {
                sonnerToast.error('Order creation failed', { description: 'Missing payment order id' })
                return
            }
            const orderId = order.id

            const options = {
                key: RAZORPAY_KEY,
                amount: order?.amount || 1,
                currency: order?.currency || 'INR',
                name: 'Insert',
                description: `Upgrade to Pro (${billing})`,
                order_id: orderId,
                prefill: {
                    name: currentUser?.name || currentUser?.username || '',
                    email: currentUser?.email || '',
                },
                theme: { color: '#4f47e5' },
                image: 'https://insertshare.vercel.app/panda-bear.png',
                handler: async (response: any) => {
                    try {
                        const success = await verifyPayment({
                            orderId,
                            paymentId: response.razorpay_payment_id,
                            signature: response.razorpay_signature,
                            gateway: 'razorpay',
                        })
                        if (!success) {
                            sonnerToast.error('Payment verification failed', { description: 'Verification failed' })
                        }
                    } catch (err: any) {
                        sonnerToast.error('Verification error', { description: err?.response?.data?.message || err?.message || 'Payment verification failed' })
                    }
                },
                // config: {
                //     display: {
                //         blocks: {
                //             upi: {
                //                 name: 'Pay via UPI',
                //                 instruments: [
                //                     { method: 'upi' }, // UPI collect/intent
                //                 ],
                //             },
                //         },
                //         sequence: ['block.upi'],
                //         preferences: {
                //             show_default_blocks: false, // hide cards, netbanking, wallets, paylater, etc.
                //         },
                //     },
                // },
            }
            const rzp = new (window as any).Razorpay(options)
            rzp.open()
        } catch (e: any) {
            // sonnerToast.error('Order creation failed', { description: e?.response?.data?.message || e?.message || 'Failed to create order' })
        }
    }

    const handleCancel = async () => {
        if (!showCancel) return
        const ok = await cancelSubscription()
        if (!ok) return
    }

    const handleReactivate = async () => {
        if (!showReactivate) return
        const ok = await reactivateSubscription({ plan: currentPlan || undefined })
        if (!ok) return
    }

    return (
        <div className="mx-auto w-full max-w-6xl px-4 md:px-6 lg:px-8 py-6 md:py-8">
            {/* Membership overview */}
            <Card className={`${shell} shadow-none mb-8`}>
                <CardContent className="p-6 md:p-7">
                    <div className="flex flex-wrap items-center gap-5">
                        <div className="relative">
                            {currentUser?.avatar ? (
                                <Image src={currentUser.avatar} alt="avatar" width={72} height={72} className="rounded-full border border-slate-200 dark:border-slate-700" />
                            ) : (
                                <div className="h-[72px] w-[72px] rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center">
                                    <User2 className="h-6 w-6 text-slate-500" />
                                </div>
                            )}
                        </div>

                        <div className="flex flex-col">
                            <div className="flex items-center text-lg font-semibold">
                                {currentUser?.name || 'Member'}
                                <ProBadgeIcon state={proStatusView.badgeState} />
                            </div>
                            <div className="text-sm text-slate-500">@{currentUser?.username}</div>

                            <div className="mt-2 flex flex-wrap items-center gap-2">
                                {hasProHistory ? (
                                    <>
                                        <span className={`${pill} ${hasPro ? 'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-200 dark:border-indigo-700 text-indigo-700 dark:text-indigo-300' : 'bg-slate-100/80 dark:bg-slate-800/70 text-slate-600 dark:text-slate-300'}`}>
                                            {hasPro ? `Pro — ${currentPlan}` : 'Pro used'}
                                        </span>
                                        {hasPro && renewAtLabel && <span className={pill}>{proStatusView.autoRenew ? 'Renews' : 'Ends'} {renewAtLabel}</span>}
                                        {isExpired && renewAtLabel && <span className={pill}>Expired {renewAtLabel}</span>}
                                        {cancelledAtLabel && <span className={pill}>Cancelled {cancelledAtLabel}</span>}
                                    </>
                                ) : (
                                    <span className={pill}>Free</span>
                                )}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Plans */}
            <div className="grid gap-7 md:grid-cols-2 mb-8">
                <Card className={`${shell} shadow-none p-0 group transition-all duration-300 ease-out hover:-translate-y-0.5 hover:ring-1 hover:ring-indigo-500/20`}>
                    <CardHeader className="p-6 pb-3">
                        <div className="flex items-center gap-2">
                            <Zap className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                            <Badge variant="secondary" className="text-[10px] uppercase">Basic</Badge>
                        </div>
                        <div className="mt-2 flex items-baseline gap-2">
                            <CardTitle className="text-3xl font-semibold">₹0</CardTitle>
                            <span className={subtle}>/mo</span>
                        </div>
                        <CardDescription className={subtle}>Explore core features.</CardDescription>
                    </CardHeader>
                    <CardContent className="px-6 pb-4">
                        <ul className="mt-3 flex flex-col gap-2 text-sm">
                            {['Limited topics', 'Limited sheets', 'No project section access', 'Community support'].map(f => (
                                <li key={f} className="flex items-center gap-2">
                                    <BadgeCheck className="h-4 w-4 text-emerald-500" /> {f}
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                    <CardFooter className="px-6 pb-6">
                        <Link href={`/u/${currentUser?.username || ''}`} className="w-full">
                            <Button variant="outline" className="w-full">Continue Free</Button>
                        </Link>
                    </CardFooter>
                </Card>

                <Card className={`${shell} shadow-none p-0 relative group transition-all duration-300 ease-out hover:-translate-y-0.5 hover:ring-1 hover:ring-indigo-500/25`}>
                    <div className="absolute top-4 right-4 flex flex-col items-end gap-2">
                        <Badge className="bg-indigo-600 text-white hover:bg-indigo-600/90">Recommended</Badge>
                        {billing === 'yearly' && <Badge variant="secondary" className="text-[10px] font-medium tracking-wide">{discountPercent}% OFF</Badge>}
                    </div>

                    <CardHeader className="p-6 pb-3">
                        <div className="flex items-center gap-2">
                            <Crown className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                            <Badge variant="secondary" className="text-[10px] uppercase">Pro</Badge>
                        </div>
                        <div className="mt-2 flex items-baseline gap-2">
                            <CardTitle className="text-3xl font-semibold">₹{displayPrice}</CardTitle>
                            <span className={subtle}>{unit}</span>
                        </div>
                        <CardDescription className={subtle}>{subtext}</CardDescription>
                    </CardHeader>

                    <CardContent className="px-6 pb-4">
                        <div className="mb-4 flex items-center gap-2">
                            <Button size="sm" variant={billing === 'monthly' ? 'default' : 'ghost'} onClick={() => setBilling('monthly')}>
                                Monthly
                                {currentPlan === 'monthly' && hasPro && <Badge variant="secondary" className="ml-2 text-[10px]">Active</Badge>}
                            </Button>
                            <Button size="sm" variant={billing === 'yearly' ? 'default' : 'ghost'} onClick={() => setBilling('yearly')}>
                                Yearly
                                <Badge variant="secondary" className="ml-2 text-[10px]">Save {discountPercent}%</Badge>
                                {currentPlan === 'yearly' && hasPro && <Badge variant="secondary" className="ml-2 text-[10px]">Active</Badge>}
                            </Button>
                        </div>

                        <ul className="flex flex-col gap-2 text-sm">
                            {['Unlimited topics', 'Unlimited sheets', 'Project handling & management', 'Unlimited blogs (create & organize)', 'Early feature access'].map(f => (
                                <li key={f} className="flex items-center gap-2">
                                    <BadgeCheck className="h-4 w-4 text-emerald-500" /> {f}
                                </li>
                            ))}
                        </ul>
                    </CardContent>

                    <CardFooter className="px-6 pb-6">
                        <Button className="w-full bg-indigo-600 hover:bg-indigo-500 text-white" onClick={handleUpgrade} disabled={isPaymentLoading || isCurrentActive}>
                            {isPaymentLoading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <Spinner className="h-4 w-4" />
                                    Processing...
                                </span>
                            ) : (
                                <span>{isCurrentActive ? 'Currently active' : `Upgrade to Pro (${billing === 'monthly' ? 'Monthly' : 'Annual'})`}</span>
                            )}
                        </Button>
                    </CardFooter>
                </Card>
            </div>

            {/* Manage membership */}
            {hasProHistory && (
                <Card className={`${shell} shadow-none`}>
                    <CardContent className="p-6">
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Badge className={hasPro ? 'bg-indigo-600 text-white' : 'bg-slate-500 text-white'}>{hasPro ? 'Pro' : 'Pro expired'}</Badge>
                                    <span className="text-sm text-slate-600 dark:text-slate-300">
                                        {currentPlan?.toUpperCase()} • {hasPro ? `${proStatusView.autoRenew ? 'Renews' : 'Ends'} ${renewAtLabel ?? '—'}` : `Expired ${renewAtLabel ?? '—'}`}
                                    </span>
                                    {cancelledAtLabel && <span className={pill}>Cancelled {cancelledAtLabel}</span>}
                                </div>

                                <button type="button" onClick={() => setPolicyOpen(true)} className="inline-flex items-center justify-center rounded-full p-2 hover:bg-black/5 dark:hover:bg-white/10" aria-label="Policy" title="Policy">
                                    <Info className="h-4 w-4 text-slate-600 dark:text-slate-300" />
                                </button>
                            </div>

                            <div className="flex flex-wrap items-center gap-8">
                                <div className="flex items-center gap-2 text-sm">
                                    <Calendar className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                                    <span className={subtle}>
                                        {hasPro ? 'Renewal date:' : 'Expired on:'} <strong className="ml-1 text-slate-900 dark:text-slate-100">{renewAtLabel ?? '—'}</strong>
                                    </span>
                                </div>

                                <div className="ml-auto flex gap-3">
                                    {showReactivate && (
                                        <Button variant="default" onClick={handleReactivate} disabled={isPaymentLoading} className="min-w-[180px]">
                                            {isPaymentLoading ? (
                                                <span className="flex items-center gap-2"><Spinner className="h-4 w-4" /> Reactivating...</span>
                                            ) : (
                                                'Reactivate membership'
                                            )}
                                        </Button>
                                    )}

                                    {showCancel && (
                                        <Button variant="destructive" onClick={handleCancel} disabled={isPaymentLoading} className="min-w-[160px]">
                                            {isPaymentLoading ? (
                                                <span className="flex items-center gap-2"><Spinner className="h-4 w-4" /> Cancelling...</span>
                                            ) : (
                                                'Cancel membership'
                                            )}
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            <Dialog open={isPolicyOpen} onOpenChange={setPolicyOpen}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Cancellation & plan changes</DialogTitle>
                        <DialogDescription>What happens when you cancel or reactivate.</DialogDescription>
                    </DialogHeader>

                    <div className="space-y-3 text-sm">
                        <div>
                            <p className="font-medium">Cancellation</p>
                            <ul className="mt-1 list-disc pl-5 space-y-1">
                                <li>You’ll keep Pro access until the end of the current billing period.</li>
                                <li>Pro-only actions may be restricted after your plan ends.</li>
                            </ul>
                        </div>

                        <div>
                            <p className="font-medium">Reactivation</p>
                            <ul className="mt-1 list-disc pl-5 space-y-1">
                                <li>Your Pro plan becomes active again.</li>
                                <li>If changes aren’t visible, sign out and sign back in.</li>
                            </ul>
                        </div>

                        <div>
                            <p className="font-medium">Seeing changes</p>
                            <ul className="mt-1 list-disc pl-5 space-y-1">
                                <li>Sessions may cache status; re-login can refresh your access.</li>
                            </ul>
                        </div>

                        <div>
                            <p className="font-medium">Billing</p>
                            <ul className="mt-1 list-disc pl-5 space-y-1">
                                <li>Charges are typically non-refundable.</li>
                            </ul>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setPolicyOpen(false)}>Close</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <div className={`${shell} shadow-none mt-8 p-5 md:p-6 flex items-center gap-3 text-sm`}>
                <Sparkles className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                <p className={subtle}>Switch or cancel anytime. Annual plan gives you {discountPercent}% off (≈3 months free).</p>
            </div>
        </div>
    )
}
