'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import axios, { AxiosError } from 'axios'
import { CheckCircle2, Clock, Eye, EyeOff, Loader2, LockKeyhole, Mail, UserRound } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { useDebounceValue } from 'usehooks-ts'
import * as z from 'zod'

import AuthShell from '@/components/auth/AuthShell'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { signUpSchema } from '@/schemas/signUpSchema'
import type { ApiResponse } from '@/types/ApiResponse'

export default function SignUpForm() {
    const router = useRouter()
    const [debouncedUsername, setUsername] = useDebounceValue<string>('', 500)
    const [usernameMessage, setUsernameMessage] = useState<string>()
    const [isCheckingUsername, setIsCheckingUsername] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [showPassword, setShowPassword] = useState(false)

    const form = useForm<z.infer<typeof signUpSchema>>({
        resolver: zodResolver(signUpSchema),
        defaultValues: { username: '', email: '', password: '' },
    })

    useEffect(() => {
        const checkUsernameUnique = async () => {
            if (!debouncedUsername) {
                setUsernameMessage(undefined)
                return
            }

            setIsCheckingUsername(true)
            setUsernameMessage(undefined)
            try {
                const response = await axios.get(`/api/users/availability?username=${encodeURIComponent(debouncedUsername)}`)
                setUsernameMessage(response.data.message)
            } catch (error) {
                const axiosError = error as AxiosError<ApiResponse>
                setUsernameMessage(axiosError.response?.data.message ?? 'Unable to check this username')
            } finally {
                setIsCheckingUsername(false)
            }
        }

        void checkUsernameUnique()
    }, [debouncedUsername])

    const onSubmit = async (data: z.infer<typeof signUpSchema>) => {
        setIsSubmitting(true)
        try {
            const response = await axios.post<ApiResponse>('/api/users', data)
            if (response.data.success) {
                toast.success('Verification code sent to your email')
                router.replace(`/verify/${data.username}`)
            } else {
                toast.error('Signup failed. Please try again.')
            }
        } catch (error) {
            const axiosError = error as AxiosError<ApiResponse>
            toast.error(axiosError.response?.data.message || 'Something went wrong during signup')
        } finally {
            setIsSubmitting(false)
        }
    }

    const usernameAvailable = usernameMessage === 'Username is unique'

    return (
        <AuthShell mode="sign-up" title="Create your Insert account" description="Start with the free workspace. Verify your email, then build and publish at your own pace." footer={<>Already have an account? <Link href="/sign-in" className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-300">Sign in</Link></>}>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                    <FormField control={form.control} name="username" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                                <div className="relative">
                                    <UserRound className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                    <Input autoComplete="username" placeholder="Choose a username" {...field} onChange={(event) => { field.onChange(event); setUsername(event.target.value) }} className="h-11 rounded-md border-slate-200 bg-white/60 pl-10 pr-10 dark:border-slate-800 dark:bg-slate-950/60" />
                                    {isCheckingUsername ? <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-slate-400" /> : usernameAvailable ? <CheckCircle2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-500" /> : null}
                                </div>
                            </FormControl>
                            {usernameMessage ? <p className={`text-xs ${usernameAvailable ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>{usernameMessage}</p> : null}
                            <FormMessage />
                        </FormItem>
                    )} />

                    <FormField control={form.control} name="email" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl><div className="relative"><Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><Input type="email" autoComplete="email" placeholder="you@example.com" {...field} className="h-11 rounded-md border-slate-200 bg-white/60 pl-10 dark:border-slate-800 dark:bg-slate-950/60" /></div></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />

                    <FormField control={form.control} name="password" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                                <div className="relative">
                                    <LockKeyhole className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                    <Input type={showPassword ? 'text' : 'password'} autoComplete="new-password" placeholder="Create a secure password" {...field} className="h-11 rounded-md border-slate-200 bg-white/60 pl-10 pr-11 dark:border-slate-800 dark:bg-slate-950/60" />
                                    <button type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword((current) => !current)} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 hover:text-slate-900 dark:hover:text-white">{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
                                </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />

                    <div className="rounded-md border border-indigo-500/15 bg-indigo-500/[0.06] p-3 text-xs text-slate-600 dark:text-slate-300">
                        <div className="flex items-center gap-2"><Mail className="h-3.5 w-3.5 text-indigo-500" />We send a six-digit verification code by email.</div>
                        <div className="mt-2 flex items-center gap-2"><Clock className="h-3.5 w-3.5 text-indigo-500" />The code remains valid for five minutes.</div>
                    </div>

                    <Button type="submit" disabled={isSubmitting || isCheckingUsername} className="h-11 w-full rounded-md bg-indigo-600 text-white hover:bg-indigo-500">
                        {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Creating your account</> : 'Create account'}
                    </Button>
                </form>
            </Form>
        </AuthShell>
    )
}
