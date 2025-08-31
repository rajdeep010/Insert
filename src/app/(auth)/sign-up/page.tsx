'use client'
import React, { useEffect, useState } from 'react'
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import Link from 'next/link'
import { useDebounceCallback, useDebounceValue } from 'usehooks-ts'
import { useToast } from "@/components/ui/use-toast"
import { signUpSchema } from '@/schemas/signUpSchema'
import axios, { AxiosError } from 'axios'
import { ApiResponse } from '@/types/ApiResponse'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Loader2, Eye, EyeOff } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { FiTarget } from "react-icons/fi"
import emailjs from 'emailjs-com'
import InsertIcon from '@/components/InsertIcon'





export default function SignUpForm() {
    const router = useRouter()
    const [debouncedUsername, setUsername] = useDebounceValue<string>('', 500)
    const [usernameMessage, setUsernameMessage] = useState<string>()
    const [isCheckingUsername, setIsCheckingUsername] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [showPassword, setShowPassword] = useState(false)

    // const debouncedUsername = useDebounceValue(setUsername, 500)
    const { toast } = useToast()

    const togglePasswordVisibility = () => setShowPassword(!showPassword)

    const form = useForm<z.infer<typeof signUpSchema>>({
        resolver: zodResolver(signUpSchema),
        defaultValues: {
            username: '',
            email: '',
            password: ''
        }
    })

    useEffect(() => {
        const checkUsernameUnique = async () => {
            if (debouncedUsername) {
                setIsCheckingUsername(true)
                setUsernameMessage('')
                try {
                    const response = await axios.get(`/api/check-username-unique?username=${debouncedUsername}`)
                    setUsernameMessage(response.data.message)
                } catch (error) {
                    const axiosError = error as AxiosError<ApiResponse>
                    setUsernameMessage(
                        axiosError.response?.data.message ?? "Error checking Username"
                    )
                } finally {
                    setIsCheckingUsername(false)
                }
            }
        }

        checkUsernameUnique()
    }, [debouncedUsername])

    const onSubmit = async (data: z.infer<typeof signUpSchema>) => {
        setIsSubmitting(true)
        try {
            const uname = data.username
            const em = data.email

            const response = await axios.post<ApiResponse>('/api/sign-up', data)

            if (response.data.success) {
                const vcode = response.data.verifyCode

                const templateParams = {
                    reply_to: em,
                    to_name: uname,
                    message: vcode,
                }

                emailjs.send(
                    process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID ?? "",
                    process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID ?? "",
                    templateParams,
                    process.env.NEXT_PUBLIC_EMAILJS_USER_ID ?? ""
                ).then(
                    function (response) {
                        toast({
                            title: 'Enter Verify Code',
                            description: 'Verification code sent to your email'
                        })
                        router.replace(`/verify/${debouncedUsername}`)
                    },
                    function (error) {
                        // console.log(error)
                        toast({
                            title: 'Error',
                            description: 'Could not send verification email'
                        })
                    }
                )
            } else {
                toast({
                    title: 'Error',
                    description: response.data.message,
                })
            }
            setIsSubmitting(false)
        } catch (error) {
            const axiosError = error as AxiosError<ApiResponse>
            let errorMessage = axiosError.response?.data.message
            toast({
                title: 'Signup Failed',
                description: errorMessage,
                variant: 'destructive'
            })
            setIsSubmitting(false)
        }
    }

    return (
        <div className='flex min-h-screen'>
            {/* Left Section - Hidden on smaller screens */}
            <div className='hidden md:flex md:w-1/2 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-700 dark:to-blue-900  flex-col justify-center items-center p-12'>
                <div className='flex flex-col items-center text-center space-y-6'>
                    <InsertIcon height={120} width={120} className='border-4 p-2 bg-white border-gray-900 dark:border-gray-800 shadow-xl' />
                    <div className='space-y-4'>
                        <h2 className='text-4xl font-semibold font-sans'>
                            Welcome to Insert
                        </h2>
                        <p className='text-lg max-w-md leading-relaxed font-sans'>
                            Join our community and start building amazing projects. Connect, collaborate, and create something extraordinary together.
                        </p>
                    </div>
                    <div className='flex flex-col space-y-2 text-sm'>
                        <div className='flex items-center space-x-2 font-sans'>
                            <div className='w-2 h-2 bg-green-500 rounded-full'></div>
                            <span>Secure & Private</span>
                        </div>
                        <div className='flex items-center space-x-2 font-sans'>
                            <div className='w-2 h-2 bg-blue-500 rounded-full'></div>
                            <span>Easy Collaboration</span>
                        </div>
                        <div className='flex items-center space-x-2 font-sans'>
                            <div className='w-2 h-2 bg-purple-500 rounded-full'></div>
                            <span>Built for Developers</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Section - Always visible */}
            <div className='w-full md:w-1/2 flex justify-center items-center p-8'>
                <div className='w-full max-w-md space-y-8'>
                    <div className='flex flex-col justify-center items-center'>
                        <div className='flex flex-col items-center gap-2'>
                            <span className='text-gray-400 dark:text-gray-600'>join</span>
                            <div className='flex items-center gap-2 mb-3 md:hidden'>
                                <InsertIcon height={45} width={45} className='border-2 p-[4px] dark:bg-white border-gray-950 dark:border-gray-800' />
                                <h1 className='font-sans text-5xl tracking-wide'>
                                    Insert
                                </h1>
                            </div>
                            <div className='hidden md:block'>
                                <h1 className='font-sans text-4xl tracking-wide text-center'>
                                    Create Account
                                </h1>
                            </div>
                        </div>
                        <p className='mb-4 text-gray-600 dark:text-gray-400'>Sign up to start your journey</p>
                    </div>

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
                            <FormField
                                control={form.control}
                                name="username"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Username</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Username"
                                                {...field}
                                                onChange={(e) => {
                                                    field.onChange(e)
                                                    setUsername(e.target.value)
                                                }}
                                            />
                                        </FormControl>
                                        {isCheckingUsername && <Loader2 className='animate-spin' />}
                                        <p className={`text-sm ${usernameMessage === "Username is unique" ? 'text-green-500' : 'text-red-500'}`}>
                                            {usernameMessage}
                                        </p>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

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
                                ) : ('Create Account')}
                            </Button>
                        </form>
                    </Form>

                    <div className='text-center mt-4'>
                        <div className='text-gray-600 dark:text-gray-400'>
                            Already have an account? {' '}
                            <Link href='/sign-in' className='text-blue-600 hover:text-blue-800 font-medium transition-colors'>
                                Sign in
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
