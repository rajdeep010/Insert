'use client'

import React, { useEffect } from 'react'
import Link from 'next/link'
import { BadgeCheck, Crown, Sparkles, ShieldCheck, Zap } from 'lucide-react'
import {
    Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

type ProGateProps = {
    show: boolean
    onClose?: () => void
}

export default function ProGate({ show, onClose }: ProGateProps) {
    useEffect(() => {
        if (!show) return
        const prev = document.body.style.overflow
        document.body.style.overflow = 'hidden'
        return () => { document.body.style.overflow = prev }
    }, [show])

    if (!show) return null

    const shell =
        'rounded-2xl border border-black/[0.08] dark:border-white/[0.08] bg-white/60 dark:bg-gray-900/40 supports-[backdrop-filter]:bg-white/40 backdrop-blur transition-colors'

    return (
        <>
            {/* Blur background */}
            <div
                className="fixed inset-0 z-40 bg-black/35 supports-[backdrop-filter]:backdrop-blur-md"
                aria-hidden="true"
            />

            {/* Upsell modal */}
            <div
                className="fixed inset-0 z-50 flex items-center justify-center p-4"
                role="dialog"
                aria-modal="true"
                aria-labelledby="pro-gate-title"
            >
                <Card className={`${shell} shadow-lg w-full max-w-[38rem]`}>
                    <CardHeader className="pb-3">
                        <div className="flex items-center gap-2">
                            <Crown className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                            <Badge className="bg-indigo-600 text-white">Pro</Badge>
                        </div>
                        <CardTitle id="pro-gate-title" className="text-2xl">
                            Upgrade to Pro for a faster, limitless experience
                        </CardTitle>
                        <CardDescription>
                            Remove the blur and unlock premium features designed for builders and learners.
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-3">
                        <ul className="flex flex-col gap-2 text-sm">
                            {[
                                'Unlimited topics and sheets',
                                'Projects: manage, monitor, and release',
                                'Unlimited blogs (create & organize)',
                                'Early access to new features',
                                'Priority support',
                            ].map((f) => (
                                <li key={f} className="flex items-center gap-2">
                                    <BadgeCheck className="h-4 w-4 text-emerald-500" /> {f}
                                </li>
                            ))}
                        </ul>

                        <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                            <Zap className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                            <span>Faster workflow, zero limits.</span>
                            <span className="mx-2">•</span>
                            <ShieldCheck className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                            <span>Secure payments. Cancel anytime.</span>
                        </div>
                    </CardContent>

                    <CardFooter className="flex gap-2">
                        <Link href="/subscribe" className="w-full">
                            <Button className="w-full bg-indigo-600 hover:bg-indigo-500 text-white">
                                View plans & upgrade
                            </Button>
                        </Link>
                        {onClose && (
                            <Button variant="outline" onClick={onClose}>
                                Maybe later
                            </Button>
                        )}
                    </CardFooter>
                </Card>
            </div>
        </>
    )
}