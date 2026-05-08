import { z } from "zod";

export const blogVisibilitySchema = z.enum(["public", "private"]);

export const blogSlugSchema = z
    .string()
    .trim()
    .min(1, "Slug is required")
    .max(150, "Slug is too long")
    .regex(/^[a-z0-9-]+$/, "Slug must contain only lowercase letters, numbers, and hyphens");

export const createBlogSchema = z.object({
    blogTitle: z.string().trim().min(1, "Blog title is required").max(200, "Blog title is too long"),
    blogContent: z.string().min(1, "Blog content is required"),
    blogContentText: z.string().trim().max(5000, "Blog text is too long").optional().default(""),
    blogBannerImage: z.string().trim().url("Banner image must be a valid URL").optional().or(z.literal("")),
    slug: blogSlugSchema,
    type: blogVisibilitySchema,
    autosave: z.boolean().optional().default(false),
});

export const updateBlogSchema = z
    .object({
        blogTitle: z.string().trim().min(1).max(200).optional(),
        blogContent: z.string().min(1).optional(),
        blogContentText: z.string().trim().max(5000).optional(),
        blogBannerImage: z.string().trim().url().optional().or(z.literal("")),
        type: blogVisibilitySchema.optional(),
        autosave: z.boolean().optional(),
        status: z.enum(["active", "archived"]).optional(),
    })
    .strict()
    .refine((data) => Object.keys(data).length > 0, {
        message: "At least one field is required",
    });

export const blogSlugParamsSchema = z.object({
    slug: blogSlugSchema,
});

export const blogIdParamsSchema = z.object({
    blogId: z.string().trim().min(1, "Blog id is required"),
});