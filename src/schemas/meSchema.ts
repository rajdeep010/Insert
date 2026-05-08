import { z } from "zod";

const optionalUrlOrEmpty = z.union([
    z.literal(""),
    z.string().trim().url("Must be a valid URL"),
]);

export const updateMeSchema = z
    .object({
        name: z.string().trim().max(80, "Name is too long").optional(),
        about: z.string().trim().max(500, "About is too long").optional(),
        linkedin: optionalUrlOrEmpty.optional(),
        profile: optionalUrlOrEmpty.optional(),
        location: z.string().trim().max(120, "Location is too long").optional(),
        company: z.string().trim().max(120, "Company is too long").optional(),
    })
    .strict()
    .refine((data) => Object.keys(data).length > 0, {
        message: "At least one field is required",
    });

export const updateAvatarSchema = z.object({
    avatarURL: z
        .string()
        .trim()
        .url("Avatar URL must be a valid URL")
        .max(500, "Avatar URL is too long"),
});