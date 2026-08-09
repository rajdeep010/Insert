'use client'

import React, { useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
    BadgeCheck,
    Calendar,
    Crown,
    FileText,
    FolderGit2,
    Info,
    Layers3,
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

const shell = 'rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/65 dark:bg-slate-950/55 shadow-sm backdrop-blur-xl transition'
const subtle = 'text-gray-600 dark:text-gray-400'
const pill = 'px-2.5 py-1 rounded-md text-xs border border-slate-200 dark:border-slate-700 bg-slate-100/60 dark:bg-slate-800/50'

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

    const proFeatures = [
        { icon: Layers3, title: 'Unlimited sheets', detail: 'Build as many structured topic workspaces as you need.' },
        { icon: FileText, title: 'Unlimited writing', detail: 'Create and organize technical blogs without limits.' },
        { icon: FolderGit2, title: 'Project workflows', detail: 'Connect repositories and manage release journals.' },
        { icon: Sparkles, title: 'Early access', detail: 'Use new Insert capabilities before general release.' },
    ]

    return (
        <div className="w-full space-y-4">
            <section className="relative overflow-hidden rounded-2xl border border-indigo-500/20 bg-slate-950 px-5 py-6 text-white shadow-xl shadow-indigo-950/10 sm:px-8 sm:py-8">
                <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(99,102,241,0.32),transparent_32%),radial-gradient(circle_at_85%_70%,rgba(6,182,212,0.18),transparent_35%)]" />
                <div aria-hidden="true" className="absolute inset-0 opacity-20 [background-image:linear-gradient(to_right,rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:36px_36px]" />
                <div className="relative grid gap-8 xl:grid-cols-[minmax(0,1fr)_360px] xl:items-end">
                    <div><div className="flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.2em] text-indigo-200"><Crown className="h-3.5 w-3.5" />Insert Pro</div><h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-[-0.05em] sm:text-5xl">One workspace.<br /><span className="text-slate-400">No creative limits.</span></h1><p className="mt-4 max-w-2xl text-sm leading-6 text-slate-300">Go from an idea to a coding sheet, technical article, or documented release without your tools getting in the way.</p></div>
                    <div className="rounded-xl border border-white/10 bg-white/[0.06] p-4 backdrop-blur-xl">
                        <div className="flex items-center gap-3">{currentUser?.avatar ? <Image src={currentUser.avatar} alt="avatar" width={48} height={48} className="h-12 w-12 rounded-md object-cover" /> : <span className="flex h-12 w-12 items-center justify-center rounded-md bg-white/10"><User2 className="h-5 w-5" /></span>}<div className="min-w-0"><div className="flex items-center font-medium">{currentUser?.name || 'Member'}<ProBadgeIcon state={proStatusView.badgeState} /></div><p className="truncate text-xs text-slate-400">@{currentUser?.username}</p></div><Badge className="ml-auto rounded-md bg-white text-slate-950 hover:bg-white">{hasPro ? 'PRO' : 'FREE'}</Badge></div>
                        <div className="mt-4 flex flex-wrap gap-2">{hasProHistory && hasPro ? <><span className="rounded-md border border-indigo-400/20 bg-indigo-400/10 px-2 py-1 text-xs text-indigo-200">{currentPlan?.toUpperCase()}</span>{renewAtLabel && <span className="rounded-md border border-white/10 px-2 py-1 text-xs text-slate-300">{proStatusView.autoRenew ? 'Renews' : 'Ends'} {renewAtLabel}</span>}</> : <span className="rounded-md border border-white/10 px-2 py-1 text-xs text-slate-300">Standard membership</span>}</div>
                    </div>
                </div>
            </section>

            <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white/65 p-4 shadow-sm backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/55 sm:flex-row sm:items-center sm:justify-between">
                <div><p className="text-sm font-medium">Choose your billing cycle</p><p className="mt-1 text-xs text-slate-500">Switch plans whenever your workflow changes.</p></div>
                <div className="grid grid-cols-2 rounded-md border border-slate-200 bg-slate-100/70 p-1 dark:border-slate-800 dark:bg-slate-900/70"><Button size="sm" variant={billing === 'monthly' ? 'default' : 'ghost'} className="rounded-md" onClick={() => setBilling('monthly')}>Monthly</Button><Button size="sm" variant={billing === 'yearly' ? 'default' : 'ghost'} className="rounded-md" onClick={() => setBilling('yearly')}>Yearly <span className="ml-1 text-[10px] opacity-70">Save {discountPercent}%</span></Button></div>
            </div>

            <section className="grid gap-4 xl:grid-cols-[0.72fr_1.28fr]">
                <div className={`${shell} flex flex-col p-6`}><div className="flex items-center justify-between"><span className="flex h-10 w-10 items-center justify-center rounded-md bg-slate-100 text-slate-500 dark:bg-slate-900"><Zap className="h-5 w-5" /></span><Badge variant="outline" className="rounded-md">Current foundation</Badge></div><p className="mt-7 text-xs font-medium uppercase tracking-[0.16em] text-slate-500">Free</p><div className="mt-2 flex items-baseline gap-2"><span className="text-4xl font-semibold tracking-tight">₹0</span><span className="text-sm text-slate-500">forever</span></div><p className="mt-3 text-sm leading-6 text-slate-500">A focused starting point for exploring Insert and publishing your first ideas.</p><ul className="mt-6 space-y-3 text-sm">{['Core topic workspace', 'Technical blog editor', 'Community publishing', 'Standard support'].map((feature) => <li key={feature} className="flex items-center gap-2.5"><BadgeCheck className="h-4 w-4 text-slate-400" />{feature}</li>)}</ul><Button asChild variant="outline" className="mt-auto rounded-md pt-6"><Link href={`/u/${currentUser?.username || ''}`}>Continue with Free</Link></Button></div>

                <div className="relative overflow-hidden rounded-2xl border border-indigo-500/35 bg-white/75 p-6 shadow-[0_20px_80px_-45px_rgba(79,70,229,0.75)] backdrop-blur-xl dark:bg-slate-950/65 sm:p-7"><div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-indigo-500 via-violet-500 to-cyan-400" /><div className="flex flex-wrap items-start justify-between gap-4"><div><div className="flex items-center gap-2"><span className="flex h-10 w-10 items-center justify-center rounded-md bg-indigo-500/10 text-indigo-500"><Crown className="h-5 w-5" /></span><Badge className="rounded-md bg-indigo-600 text-white">Recommended</Badge>{billing === 'yearly' && <Badge variant="secondary" className="rounded-md">{discountPercent}% off</Badge>}</div><p className="mt-6 text-xs font-medium uppercase tracking-[0.16em] text-indigo-600 dark:text-indigo-300">Insert Pro</p><div className="mt-2 flex items-end gap-2"><span className="text-5xl font-semibold tracking-[-0.05em]">₹{displayPrice}</span><span className="pb-1 text-sm text-slate-500">{unit}</span></div><p className="mt-2 text-sm text-slate-500">{subtext}</p></div><Button className="min-w-52 rounded-md bg-indigo-600 text-white hover:bg-indigo-500" onClick={handleUpgrade} disabled={isPaymentLoading || isCurrentActive}>{isPaymentLoading ? <span className="flex items-center gap-2"><Spinner className="h-4 w-4" />Processing</span> : isCurrentActive ? 'Your current plan' : `Choose ${billing === 'monthly' ? 'monthly' : 'annual'} Pro`}</Button></div>
                    <div className="mt-7 grid gap-2 sm:grid-cols-2">{proFeatures.map(({ icon: Icon, title, detail }) => <div key={title} className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-900/50"><Icon className="h-4 w-4 text-indigo-500" /><p className="mt-3 text-sm font-medium">{title}</p><p className="mt-1 text-xs leading-5 text-slate-500">{detail}</p></div>)}</div>
                </div>
            </section>

            {/* Manage membership */}
            {hasProHistory && (
                <section className={`${shell} p-6`}>
                        <div className="flex flex-col gap-4">
                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <div className="flex items-center gap-2">
                                    <Badge className={hasPro ? 'bg-indigo-600 text-white' : 'bg-slate-500 text-white'}>{hasPro ? 'Pro' : 'Pro expired'}</Badge>
                                    <span className="text-sm text-slate-600 dark:text-slate-300">
                                        {currentPlan?.toUpperCase()} • {hasPro ? `${proStatusView.autoRenew ? 'Renews' : 'Ends'} ${renewAtLabel ?? '—'}` : `Expired ${renewAtLabel ?? '—'}`}
                                    </span>
                                    {cancelledAtLabel && <span className={pill}>Cancelled {cancelledAtLabel}</span>}
                                </div>

                                <button type="button" onClick={() => setPolicyOpen(true)} className="inline-flex items-center justify-center rounded-md p-2 hover:bg-black/5 dark:hover:bg-white/10" aria-label="Policy" title="Policy">
                                    <Info className="h-4 w-4 text-slate-600 dark:text-slate-300" />
                                </button>
                            </div>

                            <div className="flex flex-wrap items-center gap-5 border-t border-slate-200 pt-4 dark:border-slate-800">
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
                </section>
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
                        <Button variant="default" onClick={() => setPolicyOpen(false)}>OK</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <div className={`${shell} shadow-none p-5 md:p-6 flex items-center gap-3 text-sm`}>
                <Sparkles className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                <p className={subtle}>Switch or cancel anytime. Annual plan gives you {discountPercent}% off (≈3 months free).</p>
            </div>
        </div>
    )
}
