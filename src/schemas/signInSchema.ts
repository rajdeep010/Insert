import { z } from 'zod'

export const emailValidation = z
    .string()
    .email()

export const passwordValidation = z
    .string()
    .min(6, 'Password must be atleast 6 characters')
    .max(16, 'Password must be no more than 16 characters')

export const signInSchema = z.object({
    email: emailValidation,
    password: passwordValidation
})