'use client'
import React, { useEffect, useState } from 'react'
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import Link from 'next/link'
import { useDebounceCallback } from 'usehooks-ts'
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





export default function SignUpForm() {
    const router = useRouter()
    const [username, setUsername] = useState<string>('')
    const [usernameMessage, setUsernameMessage] = useState<string>()
    const [isCheckingUsername, setIsCheckingUsername] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [showPassword, setShowPassword] = useState(false)

    const debounced = useDebounceCallback(setUsername, 500)
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
            if (username) {
                setIsCheckingUsername(true)
                setUsernameMessage('')
                try {
                    const response = await axios.get(`/api/check-username-unique?username=${username}`)
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
    }, [username])

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
                    function(response) {
                        toast({
                            title: 'Enter Verify Code',
                            description: 'Verification code sent to your email'
                        })
                        router.replace(`/verify/${username}`)
                    },
                    function(error) {
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
        <div className='flex justify-center items-center min-h-screen'>
            <div className='w-full max-w-md p-8 space-y-8 rounded-lg shadow-md'>
                <div className='flex flex-col justify-center items-center'>
                    <div className='flex flex-col items-center gap-2'>
                        <span className='m-auto text-gray-300'>join</span>
                        <h1 className='flex gap-1 text-5xl font-sans tracking-wide lg:text-5xl mb-3'>
                             Insert
                        </h1>
                    </div>
                    <p className='mb-4'>Sign up to start </p>
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
                                                debounced(e.target.value)
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

                        <Button type='submit' disabled={isSubmitting}>
                            {isSubmitting ? (
                                <>
                                    <Loader2 className='mr-2 h-4 w-4 animate-spin' /> Please Wait
                                </>
                            ) : ('Signup')}
                        </Button>
                    </form>
                </Form>

                <div className='text-center mt-4'>
                    <div>
                        Already a member? {' '}
                        <Link href='/sign-in' className='underline text-blue-600 hover:text-blue-800'>
                            Sign In
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
