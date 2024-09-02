'use client'
import React, { useState } from 'react'
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { useToast } from "@/components/ui/use-toast"
import { useParams, useRouter } from 'next/navigation'
import axios, { AxiosError } from 'axios'
import { ApiResponse } from '@/types/ApiResponse'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import { verifySchema } from '@/schemas/verifySchema'



export default function VerifyAccount() {
    const router = useRouter()
    const params = useParams()
    const { toast } = useToast()
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false)

    const form = useForm<z.infer<typeof verifySchema>>({
        resolver: zodResolver(verifySchema)
    })

    const onSubmit = async (data: z.infer<typeof verifySchema>) => {
        setIsSubmitting(true)
        try {
            const response = await axios.post<ApiResponse>(`/api/verify-code`, {
                username: params.username,
                code: data.code,
            })

            toast({
                title: 'Verified',
                description: response.data.message
            })
            router.replace('/sign-in')

        } catch (error) {
            const axiosError = error as AxiosError<ApiResponse>
            let errorMessage = axiosError.response?.data.message
            toast({
                title: 'Verification Failed',
                description: errorMessage,
                variant: 'destructive'
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className='flex justify-center items-center min-h-screen'>
            <div className='w-full max-w-md p-8 space-y-8 rounded-lg shadow-md'>
                <div className='flex flex-col justify-center items-center'>
                    <div className='flex flex-col items-center gap-2'>
                        <span className='m-auto text-gray-300'>join</span>
                        <h1 className='text-5xl font-extrabold tracking-tight lg:text-5xl mb-3'>
                            INSERT
                        </h1>
                    </div>
                    <p className='mb-4'>Enter the verification Code </p>
                </div>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
                        <FormField
                            control={form.control}
                            name="code"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Verification Code</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Enter Code" {...field} />
                                    </FormControl>
                                </FormItem>
                            )}
                        />

                        <Button type='submit' disabled={isSubmitting} >
                            {
                                isSubmitting ? (
                                    <>
                                        <Loader2 className='mr-2 h-4 w-4 animate-spin' /> Please Wait
                                    </>
                                ) : ('Verify')
                            }
                        </Button>
                    </form>
                </Form>
            </div>
        </div>
    )
}

