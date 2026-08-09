'use client'
import React, { useState } from 'react'
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import Link from 'next/link'
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from 'next/navigation'
import axios, { AxiosError } from 'axios'
import { ApiResponse } from '@/types/ApiResponse'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Loader2, Eye, EyeOff, LockKeyhole, Mail } from 'lucide-react'
import { signInSchema } from '@/schemas/signInSchema'
import { signIn } from 'next-auth/react'
import AuthShell from '@/components/auth/AuthShell'



export default function SignInForm() {

    const [isSubmitting, setIsSubmitting] = useState(false)
    const { toast } = useToast()
    const router = useRouter()

    const [showPassword, setShowPassword] = useState(false)
    const togglePasswordVisibility = () => setShowPassword(!showPassword)

    const form = useForm<z.infer<typeof signInSchema>>({
        resolver: zodResolver(signInSchema),
        defaultValues: {
            email: '',
            password: ''
        }
    })

    const onSubmit = async (data: z.infer<typeof signInSchema>) => {
        setIsSubmitting(true)
        try {
            const response = await signIn('credentials', {
                redirect: false,
                identifier: data.email,
                password: data.password
            })

            if (response?.error) {
                toast({
                    title: 'Signin Failed',
                    description: 'Incorrect credentials',
                    variant: 'destructive'
                })
                router.replace('/sign-in')
            }

            if (response?.url) {
                toast({
                    title: '👋 Hello',
                    description: 'Welcome from team insert'
                })

                const userData = await axios.get(`/api/me`)
                const username = userData.data.userdata.username
                const requestedPath = new URLSearchParams(window.location.search).get('callbackUrl')
                const safePath = requestedPath?.startsWith('/') && !requestedPath.startsWith('//') ? requestedPath : `/u/${username}`
                router.replace(safePath)
            }
            setIsSubmitting(false)
        } catch (error) {
            const axiosError = error as AxiosError<ApiResponse>
            const errorMessage = axiosError.response?.data.message
            toast({
                title: 'Signin Failed',
                description: errorMessage,
                variant: 'destructive'
            })
            setIsSubmitting(false)
        }
    }

    return (
        <AuthShell mode="sign-in" title="Sign in to Insert" description="Continue to your topics, writing, collections, projects, and shared workspaces." footer={<>New to Insert? <Link href='/sign-up' className='font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-300'>Create an account</Link></>}>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-5'>
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <div className="relative"><Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><Input type="email" autoComplete="email" placeholder="you@example.com" {...field} className='h-11 rounded-md border-slate-200 bg-white/60 pl-10 dark:border-slate-800 dark:bg-slate-950/60' /></div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Password</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Input
                                                    type={showPassword ? 'text' : 'password'}
                                                placeholder="Enter your password"
                                                autoComplete="current-password"
                                                    {...field}
                                                className='h-11 rounded-md border-slate-200 bg-white/60 pl-10 pr-11 dark:border-slate-800 dark:bg-slate-950/60'
                                                />
                                                <LockKeyhole className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                                <button type="button" aria-label={showPassword ? "Hide password" : "Show password"}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 hover:text-slate-900 dark:hover:text-white"
                                                    onClick={togglePasswordVisibility}
                                                >
                                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                </button>
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <Button type='submit' disabled={isSubmitting} className='h-11 w-full rounded-md bg-indigo-600 text-white hover:bg-indigo-500'>
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className='mr-2 h-4 w-4 animate-spin' /> Please Wait
                                    </>
                                ) : ('Sign In')}
                            </Button>
                        </form>
                    </Form>

        </AuthShell>
    )
}
