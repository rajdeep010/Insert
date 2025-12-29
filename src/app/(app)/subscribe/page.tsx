'use client'

import React, { useMemo } from 'react'
import Link from 'next/link'
import { Crown, BadgeCheck, Zap, CreditCard, Settings2, GitBranch, ShieldCheck } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Navbar } from '@/components/landing/Navbar'

const shell = 'rounded-2xl border border-black/[0.08] dark:border-white/[0.08] bg-white/60 dark:bg-gray-900/40 supports-[backdrop-filter]:bg-white/40 backdrop-blur transition-colors'

export default function SubscribePage() {
    const monthlyPrice = 11
    const yearlyPrice = 99
    const discountPercent = useMemo(() => Math.round((1 - yearlyPrice / (monthlyPrice * 12)) * 100), [])
    const approxMonthly = useMemo(() => Math.round((yearlyPrice / 12) * 100) / 100, [])

    const basicFeatures = ['Limited topics', 'Limited sheets', 'No project section access', 'Community support']
    const proFeatures = [
        'Unlimited topics',
        'Unlimited sheets',
        'Project handling & management',
        'Unlimited blogs (create & organize)',
        'Early feature access',
    ]

    return (
        <div className="relative">
            {/* Background — gradient base */}
            <div className="fixed inset-0 -z-10 bg-gradient-to-b from-indigo-50 via-white to-white dark:from-indigo-950 dark:via-gray-900 dark:to-gray-900" />
            {/* Background — subtle grid with edge fade */}
            <div className="fixed inset-0 -z-10 opacity-40 [mask-image:radial-gradient(ellipse_at_center,black,transparent)] [background-image:linear-gradient(to_right,rgba(99,102,241,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(99,102,241,0.08)_1px,transparent_1px)] [background-size:20px_20px] [background-position:center] dark:opacity-35 dark:[background-image:linear-gradient(to_right,rgba(99,102,241,0.12)_1px,transparent_1px),linear-gradient(to_bottom,rgba(99,102,241,0.12)_1px,transparent_1px)]" />
            {/* Background — glow accent */}
            <div className="pointer-events-none fixed left-1/2 top-[-12rem] -z-10 h-[32rem] w-[32rem] -translate-x-1/2 rounded-full bg-gradient-to-tr from-indigo-400/35 via-fuchsia-400/25 to-transparent blur-3xl dark:from-indigo-600/30 dark:via-fuchsia-600/25" />

            <section className="mx-auto max-w-7xl px-4 py-10 md:py-14">
                {/* Hero */}
                <div className="mx-auto max-w-3xl text-center">
                    <div className="inline-flex items-center justify-center gap-3">
                        <p className="text-4xl font-semibold text-indigo-700 dark:text-indigo-400">Insert</p>
                        <Badge className="bg-indigo-600 text-white text-xl">Pro</Badge>
                    </div>
                    <h1 className="mt-3 text-3xl font-bold tracking-tight text-black dark:text-white md:text-5xl">
                        Upgrade Pro — choose your plan
                    </h1>
                    <p className="mt-3 text-sm text-gray-700 dark:text-gray-300 md:text-base">
                        Upgrade once — Pro unlocks across Insert. Secure payments via Razorpay.
                    </p>
                </div>

                {/* Plans */}
                <div className="mt-10 grid gap-7 md:grid-cols-2">

                    {/* Pro — Monthly */}
                    <Card className={`${shell} shadow-none p-0 relative group transition-all duration-300 ease-out hover:-translate-y-0.5 hover:ring-1 hover:ring-indigo-500/25`}>
                        <div className="absolute top-4 right-4">
                            <Badge variant="secondary" className="text-[10px] uppercase">Pro</Badge>
                        </div>
                        <CardHeader className="p-6 pb-3">
                            <div className="flex items-center gap-2">
                                <Crown className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                                <span className="text-sm font-medium text-black dark:text-white">Pro Monthly</span>
                            </div>
                            <div className="mt-2 flex items-baseline gap-2">
                                <CardTitle className="text-3xl font-semibold">₹{monthlyPrice}</CardTitle>
                                <span className="text-gray-600 dark:text-gray-400">/mo</span>
                            </div>
                            <CardDescription className="text-gray-600 dark:text-gray-400">Billed monthly • Cancel anytime</CardDescription>
                        </CardHeader>
                        <CardContent className="px-6 pb-4">
                            <ul className="flex flex-col gap-2 text-sm">
                                {proFeatures.map(f => (
                                    <li key={f} className="flex items-center gap-2">
                                        <BadgeCheck className="h-4 w-4 text-emerald-500" /> {f}
                                    </li>
                                ))}
                            </ul>

                            {/* Pro extras */}
                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 mt-6">
                                <div className="flex items-start gap-3">
                                    <div className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-black text-white dark:bg-white dark:text-black">
                                        <CreditCard className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-black dark:text-white">Razorpay checkout</p>
                                        <p className="text-sm text-gray-600 dark:text-gray-300">Secure payments with instant Pro unlock.</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-black text-white dark:bg-white dark:text-black">
                                        <Settings2 className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-black dark:text-white">Projects service</p>
                                        <p className="text-sm text-gray-600 dark:text-gray-300">Edit projects, set keywords, manage releases.</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-black text-white dark:bg-white dark:text-black">
                                        <GitBranch className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-black dark:text-white">Release automation</p>
                                        <p className="text-sm text-gray-600 dark:text-gray-300">Keyworded commits → polished release drafts.</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-black text-white dark:bg-white dark:text-black">
                                        <BadgeCheck className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-black dark:text-white">Verified badge</p>
                                        <p className="text-sm text-gray-600 dark:text-gray-300">Pro users display a verified mark across Insert.</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="px-6 pb-6">
                            <Link href="/sign-in" className="w-full">
                                <Button className="w-full bg-indigo-600 hover:bg-indigo-500 text-white">
                                    Upgrade — Monthly
                                </Button>
                            </Link>
                        </CardFooter>
                    </Card>

                    {/* Pro — Yearly */}
                    <Card className={`${shell} shadow-none p-0 relative group ring-1 ring-indigo-500/20 hover:ring-indigo-500/40 transition-all duration-300 ease-out hover:-translate-y-0.5`}>
                        <div className="absolute top-4 right-4 flex flex-col items-end gap-2">
                            <Badge className="bg-indigo-600 text-white hover:bg-indigo-600/90">Best value</Badge>
                            <Badge variant="secondary" className="text-[10px] font-medium tracking-wide">{discountPercent}% OFF</Badge>
                        </div>
                        <CardHeader className="p-6 pb-3">
                            <div className="flex items-center gap-2">
                                <Crown className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                                <span className="text-sm font-medium text-black dark:text-white">Pro Yearly</span>
                            </div>
                            <div className="mt-2 flex items-baseline gap-2">
                                <CardTitle className="text-3xl font-semibold">₹{yearlyPrice}</CardTitle>
                                <span className="text-gray-600 dark:text-gray-400">/yr</span>
                            </div>
                            <CardDescription className="text-gray-600 dark:text-gray-400">
                                Billed annually • Save {discountPercent}% (≈3 months free) • ≈₹{approxMonthly}/mo effective
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="px-6 pb-4">
                            <ul className="flex flex-col gap-2 text-sm">
                                {proFeatures.map(f => (
                                    <li key={f} className="flex items-center gap-2">
                                        <BadgeCheck className="h-4 w-4 text-emerald-500" /> {f}
                                    </li>
                                ))}
                            </ul>

                            {/* Pro extras */}
                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 mt-6">
                                <div className="flex items-start gap-3">
                                    <div className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-black text-white dark:bg-white dark:text-black">
                                        <CreditCard className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-black dark:text-white">Razorpay checkout</p>
                                        <p className="text-sm text-gray-600 dark:text-gray-300">Secure payments with instant Pro unlock.</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-black text-white dark:bg-white dark:text-black">
                                        <Settings2 className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-black dark:text-white">Projects service</p>
                                        <p className="text-sm text-gray-600 dark:text-gray-300">Edit projects, set keywords, manage releases.</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-black text-white dark:bg-white dark:text-black">
                                        <GitBranch className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-black dark:text-white">Release automation</p>
                                        <p className="text-sm text-gray-600 dark:text-gray-300">Keyworded commits → polished release drafts.</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-black text-white dark:bg-white dark:text-black">
                                        <BadgeCheck className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-black dark:text-white">Verified badge</p>
                                        <p className="text-sm text-gray-600 dark:text-gray-300">Pro users display a verified mark across Insert.</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="px-6 pb-6">
                            <Link href="/sign-in" className="w-full">
                                <Button className="w-full bg-indigo-600 hover:bg-indigo-500 text-white">
                                    Upgrade — Yearly
                                </Button>
                            </Link>
                        </CardFooter>
                    </Card>
                </div>

                {/* Note */}
                <div className={`${shell} shadow-none mt-8 p-5 md:p-6 flex items-center gap-3 text-sm`}>
                    <ShieldCheck className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                    <p className="text-gray-600 dark:text-gray-400">
                        Switch or cancel anytime. Annual plan saves {discountPercent}% (≈3 months free).
                    </p>
                </div>

                {/* Footer CTA */}
                <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                    <Link href="/sign-up">
                        <Button variant="outline">Create account</Button>
                    </Link>
                    <Link href="/sign-in">
                        <Button className="bg-indigo-600 hover:bg-indigo-500 text-white">Sign in to upgrade</Button>
                    </Link>
                </div>
            </section>
        </div>
    )
}