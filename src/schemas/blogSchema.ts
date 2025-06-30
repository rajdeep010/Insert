import { z } from "zod";

export const titleValidation = z
    .string()
    .min(5, 'Blog title must be at least 5 characters')
    .max(50, 'Blog title must not be more than 50 characters');

export const visibilityValidation = z
    .enum(['public', 'private'], {
        errorMap: () => ({ message: 'Visibility must be either public or private' }),
    });

export const blogSchema = z.object({
    title: titleValidation,
    visibility: visibilityValidation
})