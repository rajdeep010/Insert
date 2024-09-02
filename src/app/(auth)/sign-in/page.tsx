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
                    title: 'Hello',
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
        <div className='flex justify-center items-center min-h-screen'>
            <div className='w-full max-w-md p-8 space-y-8 rounded-lg shadow-md'>
                <div className='flex flex-col justify-center items-center'>
                    <div className='flex flex-col items-center gap-2'>
                        <span className='m-auto text-gray-300'>join</span>
                        <h1 className='flex gap-1 font-sans text-5xl tracking-wide lg:text-5xl mb-3'>
                            Insert
                        </h1>
                    </div>
                    <p className='mb-4'>Start by signing in </p>
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

                        <Button type='submit' disabled={isSubmitting}>
                            {isSubmitting ? (
                                <>
                                    <Loader2 className='mr-2 h-4 w-4 animate-spin' /> Please Wait
                                </>
                            ) : ('Sign In')}
                        </Button>
                    </form>
                </Form>

                <div className='text-center mt-4'>
                    <div>
                        Not Registered Yet? {' '}
                        <Link href='/sign-up' className='underline text-blue-600 hover:text-blue-800'>
                            Sign Up
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
