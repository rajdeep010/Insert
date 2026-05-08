import { z } from "zod";

export const topicIdParamSchema = z.object({
    topicId: z.string().trim().min(1, "Topic id is required"),
});

export const problemIdParamSchema = z.object({
    problemId: z.string().trim().min(1, "Problem id is required"),
});

export const difficultyValidation = z.enum([
    "Easy",
    "Easy-Med",
    "Medium",
    "Med-Hard",
    "Hard",
    "Advanced",
]);

export const qnameValidation = z
    .string()
    .trim()
    .min(1, "Problem name is required")
    .max(300, "Problem name is too long");

export const urlValidation = z
    .string()
    .trim()
    .url("Problem URL must be valid");

export const questionSchema = z.object({
    qname: qnameValidation,
    url: urlValidation,
    difficulty: difficultyValidation,
});

export const createProblemSchema = z.object({
    question: questionSchema,
});

export const updateProblemSchema = z
    .object({
        qname: qnameValidation.optional(),
        url: urlValidation.optional(),
        difficulty: difficultyValidation.optional(),
    })
    .strict()
    .refine((data) => Object.keys(data).length > 0, {
        message: "At least one field is required",
    });

export const collaboratorSchema = z.object({
    username: z
        .string()
        .trim()
        .min(6, "Username must be atleast 6 character")
        .max(14, "Username must be not more than 14 characters")
        .regex(/^[a-zA-Z0-9]+$/, "Username must not contain special character")
        .regex(/^\S*$/, "Username must not contain white spaces"),
    name: z.string().trim().max(100, "Name is too long").optional().default(""),
});

export const addCollaboratorSchema = z.object({
    collaborator: collaboratorSchema,
});

export const titleValidation = z
    .string()
    .trim()
    .min(3, "Topic title must be atleast 3 characters")
    .max(60, "Topic name must be not more than 60 characters");

export const aboutValidation = z
    .string()
    .trim()
    .max(1000, "About is too long")
    .optional()
    .default("");

export const topicVisibilityValidation = z.enum(["public", "private"]);

export const createTopicSchema = z.object({
    title: titleValidation,
    about: aboutValidation,
    visibility: topicVisibilityValidation,
});

export const updateTopicSchema = z
    .object({
        title: titleValidation.optional(),
        about: aboutValidation.optional(),
        visibility: topicVisibilityValidation.optional(),
    })
    .strict()
    .refine((data) => Object.keys(data).length > 0, {
        message: "At least one field is required",
    });