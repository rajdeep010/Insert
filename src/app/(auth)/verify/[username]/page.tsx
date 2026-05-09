'use client'
import React, { useState } from 'react'
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { useParams, useRouter } from 'next/navigation'
import axios, { AxiosError } from 'axios'
import { ApiResponse } from '@/types/ApiResponse'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import { verifySchema } from '@/schemas/verifySchema'
import InsertIcon from '@/components/InsertIcon'
import { WobbleCard } from '@/components/ui/wobble-card'
import { Spotlight } from '@/components/ui/spotlight-new'
import Link from 'next/link'
import { toast as sonnerToast } from 'sonner'


export default function VerifyAccount() {
    const router = useRouter()
    const params = useParams()
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
    const [isResending, setIsResending] = useState<boolean>(false)

    const form = useForm<z.infer<typeof verifySchema>>({
        resolver: zodResolver(verifySchema)
    })

    const onSubmit = async (data: z.infer<typeof verifySchema>) => {
        setIsSubmitting(true)
        try {
            const response = await axios.post<ApiResponse>(`/api/users/${params.username}/verification`, {
                code: data.code,
            })

            sonnerToast.success(response.data.message)
            router.replace('/sign-in')

        } catch (error) {
            const axiosError = error as AxiosError<ApiResponse>
            let errorMessage = axiosError.response?.data.message
            sonnerToast.error(errorMessage || 'Something went wrong')
        } finally {
            setIsSubmitting(false)
        }
    }

    const resendVerifyCode = async () => {
        setIsResending(true)
        try {
            const response = await axios.post<ApiResponse>(`/api/users/${params.username}/verification/resend`)
            sonnerToast.success(response.data.message)
        } catch (error) {
            const axiosError = error as AxiosError<ApiResponse>
            sonnerToast.error(axiosError.response?.data.message || 'Something went wrong')
        } finally {
            setIsResending(false)
        }
    }

    return (
        <>
            <div className="relative min-h-screen overflow-hidden">
                <Spotlight />
                <div className="fixed inset-0 -z-10 bg-gradient-to-b from-indigo-50 via-white to-white dark:from-indigo-950 dark:via-gray-900 dark:to-gray-900" />
                {/* tone down the background grid */}
                <div className="fixed inset-0 -z-10 opacity-20 [mask-image:radial-gradient(ellipse_at_center,black,transparent)] [background-image:linear-gradient(to_right,rgba(99,102,241,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(99,102,241,0.06)_1px,transparent_1px)] [background-size:22px_22px] [background-position:center] dark:opacity-15 dark:[background-image:linear-gradient(to_right,rgba(99,102,241,0.1)_1px,transparent_1px),linear-gradient(to_bottom,rgba(99,102,241,0.1)_1px,transparent_1px)]" />
                <div className="pointer-events-none fixed left-1/2 top-[-12rem] -z-10 h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-gradient-to-tr from-indigo-400/25 via-fuchsia-400/20 to-transparent blur-3xl dark:from-indigo-600/20 dark:via-fuchsia-600/20" />

                {/* Content */}
                <div className='flex flex-col items-center justify-center min-h-screen px-4 py-20'>
                    <span className='text-gray-300'>join</span>
                    <h1 className='flex gap-1 font-sans text-5xl tracking-wide lg:text-5xl mb-3'>
                        Insert
                    </h1>

                    <div className="grid gap-8 md:grid-cols-2 md:items-start">
                        {/* Verify form card */}
                        <div className="md:col-span-2 mx-auto w-full max-w-md">
                            <div className="relative rounded-2xl border border-black/10 bg-white/80 p-6 shadow-lg ring-1 ring-black/5 backdrop-blur-sm dark:border-white/10 dark:bg-white/5 dark:ring-white/10 md:p-8">
                                <div className="flex items-center gap-2">
                                    <div className="text-xl font-semibold tracking-tight">Verify your account</div>
                                </div>
                                <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                                    Enter the 6‑digit code sent to @{String(params.username || '')}.
                                </p>

                                <Form {...form}>
                                    <form onSubmit={form.handleSubmit(onSubmit)} className="mt-6 space-y-6">
                                        <FormField
                                            control={form.control}
                                            name="code"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-sm">Verification Code</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            placeholder="••••••"
                                                            autoComplete="off"
                                                            {...field}
                                                            className="h-12 rounded-xl text-center font-mono text-lg tracking-[0.45em] focus:ring-2 focus:ring-black/10 dark:focus:ring-white/20"
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <Button type="submit" disabled={isSubmitting} className="h-11 w-full rounded-xl">
                                            {isSubmitting ? (
                                                <>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Verifying…
                                                </>
                                            ) : (
                                                'Verify'
                                            )}
                                        </Button>

                                        <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-300">
                                            <button
                                                type="button"
                                                onClick={resendVerifyCode}
                                                disabled={isResending || isSubmitting}
                                                className="underline underline-offset-2 hover:text-black dark:hover:text-white"
                                            >
                                                {isResending ? 'Resending…' : 'Resend code'}
                                            </button>
                                            <Link href="/sign-in" className="underline underline-offset-2 hover:text-black dark:hover:text-white">
                                                Back to sign in
                                            </Link>
                                        </div>
                                    </form>
                                </Form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}