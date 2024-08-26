import { z } from "zod";
import { topicidValidation } from "./signUpSchema";



export const difficultyValidation = z
    .enum(['Easy', 'Easy-Med', 'Medium', 'Med-Hard', 'Hard', 'Advanced',])

export const qnameValidation = z
    .string()

export const urlValidation = z
    .string()


// QUESTION SCHEMA
export const questionSchema = z.object({
    qname: qnameValidation,
    url: urlValidation,
    difficulty: difficultyValidation,
})

export const suggestionSchema = z.object({
    problemname: topicidValidation,
    problemurl: urlValidation,
})

export const titleValidation = z
    .string()
    .min(3, 'Topic title must be atleast 3 characters')
    .max(18, 'Topic name must be not more than 18 characters')

export const aboutValidation = z
    .string()

export const topicVisibilityValidation = z
    .enum(['public', 'private'])


// TOPIC SCHEMA
export const topicSchema = z.object({
    title: titleValidation,
    about: aboutValidation,
    visibility: topicVisibilityValidation,
})