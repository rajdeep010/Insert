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
import { Loader2, Eye, EyeOff } from 'lucide-react'
import { signInSchema } from '@/schemas/signInSchema'
import { signIn } from 'next-auth/react'
import { BsHourglassSplit } from "react-icons/bs";
import { FiTarget } from "react-icons/fi";
import InsertIcon from '@/components/InsertIcon'



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

                const userData = await axios.get(`/api/sign-in?email=${data.email}`)
                const username = userData.data.userdata.username
                router.replace(`/u/${username}`)
            }
            setIsSubmitting(false)
        } catch (error) {
            const axiosError = error as AxiosError<ApiResponse>
            let errorMessage = axiosError.response?.data.message
            toast({
                title: 'Signin Failed',
                description: errorMessage,
                variant: 'destructive'
            })
            setIsSubmitting(false)
        }
    }

    return (
    <div className='flex min-h-screen'>
        {/* Left Section - Hidden on smaller screens */}
            <div className='hidden md:flex md:w-1/2 bg-gradient-to-br from-green-100 to-green-200 dark:from-green-600 dark:to-emerald-800 flex-col justify-center items-center p-12'>
            <div className='flex flex-col items-center text-center space-y-6'>
                <InsertIcon height={120} width={120} className='border-4 p-2 bg-white border-gray-900 dark:border-gray-800 shadow-xl' />
                <div className='space-y-4'>
                    <h2 className='text-4xl font-semibold font-sans'>
                        Welcome Back
                    </h2>
                    <p className='text-lg max-w-md leading-relaxed font-sans'>
                        Sign in to continue your development journey. Access your projects, collaborate with your team, and build amazing things.
                    </p>
                </div>
                <div className='flex flex-col space-y-2 text-sm'>
                    <div className='flex items-center space-x-2 font-sans'>
                        <div className='w-2 h-2 bg-green-500 rounded-full'></div>
                        <span>Quick Access</span>
                    </div>
                    <div className='flex items-center space-x-2 font-sans'>
                        <div className='w-2 h-2 bg-blue-500 rounded-full'></div>
                        <span>Project Management</span>
                    </div>
                    <div className='flex items-center space-x-2 font-sans'>
                        <div className='w-2 h-2 bg-purple-500 rounded-full'></div>
                        <span>Team Collaboration</span>
                    </div>
                </div>
            </div>
        </div>

        {/* Right Section - Always visible */}
        <div className='w-full md:w-1/2 flex justify-center items-center p-8'>
            <div className='w-full max-w-md space-y-8'>
                <div className='flex flex-col justify-center items-center'>
                    <div className='flex flex-col items-center gap-1'>
                        <span className='text-gray-400 dark:text-gray-600'>welcome back</span>
                        <div className='flex items-center gap-2 mb-3 md:hidden'>
                            <InsertIcon height={45} width={45} className='border-2 p-[4px] dark:bg-white border-gray-950 dark:border-gray-800' />
                            <h1 className='font-sans text-5xl tracking-wide'>
                                Insert
                            </h1>
                        </div>
                        <div className='hidden md:block'>
                            <h1 className='text-4xl tracking-wide text-center'>
                                Sign In
                            </h1>
                        </div>
                    </div>
                    <p className='mb-4 text-gray-600 dark:text-gray-400'>Start by signing in</p>
                </div>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Email" {...field} />
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
                                                placeholder="Password"
                                                {...field}
                                            />
                                            <div
                                                className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer"
                                                onClick={togglePasswordVisibility}
                                            >
                                                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                            </div>
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <Button type='submit' disabled={isSubmitting} className='w-full'>
                            {isSubmitting ? (
                                <>
                                    <Loader2 className='mr-2 h-4 w-4 animate-spin' /> Please Wait
                                </>
                            ) : ('Sign In')}
                        </Button>
                    </form>
                </Form>

                <div className='text-center mt-4'>
                    <div className='text-gray-600 dark:text-gray-400'>
                        Not registered yet? {' '}
                        <Link href='/sign-up' className='text-blue-600 hover:text-blue-800 font-medium transition-colors'>
                            Sign up
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    </div>
)
}
