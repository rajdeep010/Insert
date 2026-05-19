import { z } from "zod";

const SOCIAL_HANDLE_REGEX = /^[A-Za-z0-9._-]+$/;

const normalizeSocialHandle = (value: string) => {
    const trimmedValue = value.trim();

    if (!trimmedValue) return "";

    if (/^https?:\/\//i.test(trimmedValue)) {
        try {
            const url = new URL(trimmedValue);
            const pathSegments = url.pathname.split("/").filter(Boolean);
            return pathSegments[pathSegments.length - 1] ?? "";
        } catch {
            return trimmedValue;
        }
    }

    return trimmedValue;
};

const optionalHandleOrEmpty = z
    .string()
    .trim()
    .transform(normalizeSocialHandle)
    .refine(
        (value) => value === "" || SOCIAL_HANDLE_REGEX.test(value),
        "Must be a valid username or profile URL"
    );

export const updateMeSchema = z
    .object({
        name: z.string().trim().max(80, "Name is too long").optional(),
        about: z.string().trim().max(500, "About is too long").optional(),
        linkedin: optionalHandleOrEmpty.optional(),
        profile: optionalHandleOrEmpty.optional(),
        location: z.string().trim().max(120, "Location is too long").optional(),
        company: z.string().trim().max(120, "Company is too long").optional(),
        notificationSettings: z
            .object({
                pushEnabled: z.boolean().optional(),
                fcmToken: z
                    .string()
                    .trim()
                    .max(4096, "FCM token is too long")
                    .nullable()
                    .optional(),
            })
            .strict()
            .optional(),
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