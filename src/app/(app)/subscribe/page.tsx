'use client'

import React, { useMemo, useState } from 'react'
import Link from 'next/link'
import { Check, Crown, Sparkles, Zap } from 'lucide-react'
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
    CardFooter
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useInsertUser } from '@/app/context/InsertUserProvider'
import { useSession } from 'next-auth/react'

const surface =
    'rounded-2xl border border-black/[0.08] dark:border-white/[0.08] bg-white/60 dark:bg-gray-900/40 supports-[backdrop-filter]:bg-white/40 transition-colors'
const hoverable =
    'transition-colors hover:border-black/20 dark:hover:border-white/30'
const subtle = 'text-gray-600 dark:text-gray-400'

const freeFeatures = [
    'Limited topics',
    'Limited sheets',
    'No project section access',
    'Community support'
]

const proFeatures = [
    'Unlimited topics',
    'Unlimited sheets',
    'Project handling & management',
    'Unlimited blogs (create & organize)',
    'Early feature access'
]

type BillingPeriod = 'monthly' | 'yearly'

const PaymentPage = () => {
    const { data: session } = useSession()
    useInsertUser() // ensures user context loads if needed (remove if unused)

    const [billing, setBilling] = useState<BillingPeriod>('monthly')

    const monthlyPrice = 11
    const yearlyPrice = 99
    const discountPercent = useMemo(
        () => Math.round((1 - yearlyPrice / (monthlyPrice * 12)) * 100),
        [monthlyPrice, yearlyPrice]
    )

    const displayPrice = billing === 'monthly' ? monthlyPrice : yearlyPrice
    const unit = billing === 'monthly' ? '/mo' : '/yr'
    const subtext =
        billing === 'monthly'
            ? 'Billed monthly • Cancel anytime'
            : `Billed annually • Save ${discountPercent}% (≈3 months free)`

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-10 w-full max-w-6xl">
                {/* Header */}
                <div className="flex items-start justify-between gap-6 flex-wrap animate-in slide-in-from-top-2">
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-2">
                            <span className="flex items-center gap-2 text-[13px] uppercase tracking-wider font-semibold px-2.5 py-1.5 rounded bg-purple-200/70 dark:bg-purple-800/60 text-purple-900 dark:text-purple-200">
                                Membership
                                <Badge variant="secondary" className="text-xs">
                                    Insert
                                </Badge>
                            </span>
                        </div>
                    </div>

                    {/* Billing Toggle */}
                    <div
                        className={`${surface} ${hoverable} relative shadow-none px-2 py-2 flex items-center gap-2 rounded-2xl overflow-hidden animate-in fade-in-50`}
                    >
                        <div className="relative flex items-center gap-1">
                            {/* Animated pill */}
                            <div
                                className="absolute inset-y-0 left-0 flex"
                                style={{
                                    width: '100%',
                                    pointerEvents: 'none'
                                }}
                            />
                            <Button
                                size="sm"
                                variant={billing === 'monthly' ? 'default' : 'ghost'}
                                onClick={() => setBilling('monthly')}
                                className={`px-4 py-2 transition-all duration-200 relative ${billing === 'monthly'
                                        ? 'shadow-sm'
                                        : 'hover:bg-black/5 dark:hover:bg-white/10'
                                    }`}
                                aria-pressed={billing === 'monthly'}
                            >
                                Monthly
                            </Button>
                            <Button
                                size="sm"
                                variant={billing === 'yearly' ? 'default' : 'ghost'}
                                onClick={() => setBilling('yearly')}
                                className={`px-4 py-2 transition-all duration-200 relative ${billing === 'yearly'
                                        ? 'shadow-sm'
                                        : 'hover:bg-black/5 dark:hover:bg-white/10'
                                    }`}
                                aria-pressed={billing === 'yearly'}
                            >
                                Yearly
                                <Badge
                                    variant="secondary"
                                    className="ml-2 text-[10px] tracking-wide"
                                >
                                    Save {discountPercent}%
                                </Badge>
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Plans */}
                <div className="grid gap-7 md:grid-cols-2">
                    {/* Free */}
                    <Card
                        className={`${surface} ${hoverable} shadow-none p-0 group transition-all duration-300 ease-out hover:-translate-y-0.5 hover:ring-1 hover:ring-indigo-500/20 hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] animate-in fade-in-50 slide-in-from-bottom-2`}
                        style={{ animationDelay: '60ms' }}
                    >
                        <CardHeader className="p-8 pb-5">
                            <div className="flex items-center gap-2">
                                <Zap className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                                <Badge variant="secondary" className="text-[10px] uppercase">
                                    Basic
                                </Badge>
                            </div>
                            <div className="mt-3 flex items-baseline gap-2">
                                <CardTitle className="text-4xl font-semibold">₹0</CardTitle>
                                <span className={subtle}>/mo</span>
                            </div>
                            <CardDescription className={subtle}>
                                Get started and explore core Insert features.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="px-8 pb-6">
                            <ul className="mt-5 flex flex-col gap-2.5 text-sm">
                                {freeFeatures.map(f => (
                                    <li key={f} className="flex items-center gap-2">
                                        <Check className="h-4 w-4 text-emerald-500" /> {f}
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                        <CardFooter className="px-8 pb-8">
                            <Link
                                href={`/u/${session?.user?.username || ''}`}
                                className="w-full"
                            >
                                <Button
                                    variant="outline"
                                    className="w-full transition-transform duration-200 group-hover:translate-y-[-1px]"
                                >
                                    Continue Free
                                </Button>
                            </Link>
                        </CardFooter>
                    </Card>

                    {/* Pro */}
                    <Card
                        className={`${surface} ${hoverable} shadow-none p-0 relative group transition-all duration-300 ease-out hover:-translate-y-0.5 hover:ring-1 hover:ring-indigo-500/25 hover:shadow-[0_10px_35px_rgba(67,56,202,0.15)] animate-in fade-in-50 slide-in-from-bottom-2`}
                        style={{ animationDelay: '120ms' }}
                    >
                        <div className="absolute top-4 right-4 flex flex-col items-end gap-2">
                            <Badge className="bg-indigo-600 text-white hover:bg-indigo-600/90">
                                Recommended
                            </Badge>
                            {billing === 'yearly' && (
                                <Badge
                                    variant="secondary"
                                    className="text-[10px] font-medium tracking-wide"
                                >
                                    {discountPercent}% OFF
                                </Badge>
                            )}
                        </div>
                        <CardHeader className="p-8 pb-5">
                            <div className="flex items-center gap-2">
                                <Crown className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                                <Badge variant="secondary" className="text-[10px] uppercase">
                                    Pro
                                </Badge>
                            </div>
                            <div className="mt-3 flex items-baseline gap-2">
                                <CardTitle className="text-4xl font-semibold">
                                    ₹{displayPrice}
                                </CardTitle>
                                <span className={subtle}>{unit}</span>
                            </div>
                            <CardDescription className={subtle}>{subtext}</CardDescription>
                        </CardHeader>
                        <CardContent className="px-8 pb-6">
                            <ul className="mt-3 flex flex-col gap-2.5 text-sm">
                                {proFeatures.map(f => (
                                    <li key={f} className="flex items-center gap-2">
                                        <Check className="h-4 w-4 text-emerald-500" /> {f}
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                        <CardFooter className="px-8 pb-8">
                            <Button className="w-full group/button transition-all duration-200 bg-indigo-600 hover:bg-indigo-500 text-white">
                                <span className="transition-transform duration-200 group-hover:translate-y-[-1px]">
                                    Upgrade to Pro ({billing === 'monthly' ? 'Monthly' : 'Annual'})
                                </span>
                            </Button>
                        </CardFooter>
                    </Card>
                </div>

                {/* Reassurance */}
                <div
                    className={`${surface} ${hoverable} shadow-none p-5 md:p-6 flex items-center gap-3 text-sm animate-in fade-in-50 slide-in-from-bottom-2`}
                    style={{ animationDelay: '180ms' }}
                >
                    <Sparkles className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                    <p className={subtle}>
                        Switch or cancel anytime. Annual plan gives you {discountPercent}% off (≈3 months free).
                    </p>
                </div>
            </div>
        </div>
    )
}

export default PaymentPage