import { z } from "zod";

import { blogVisibilitySchema } from "@/schemas/blogSchema";

const mongoObjectIdSchema = z
	.string()
	.trim()
	.regex(/^[a-f\d]{24}$/i, "Invalid id");

export const collectionIdParamsSchema = z.object({
	collectionId: mongoObjectIdSchema,
});

export const blogReferenceKindSchema = z.enum(["solution", "reference", "note"]);

export const createBlogCollectionSchema = z.object({
	name: z.string().trim().min(1, "Collection name is required").max(120, "Collection name is too long"),
	description: z.string().trim().max(1000, "Description is too long").optional().default(""),
	visibility: blogVisibilitySchema.optional().default("private"),
	linkedTopicId: z.string().trim().min(1).max(100).optional().nullable(),
	blogIds: z.array(mongoObjectIdSchema).optional().default([]),
});

export const updateBlogCollectionSchema = z
	.object({
		name: z.string().trim().min(1).max(120).optional(),
		description: z.string().trim().max(1000).optional(),
		visibility: blogVisibilitySchema.optional(),
		linkedTopicId: z.string().trim().min(1).max(100).optional().nullable(),
	})
	.strict()
	.refine((data) => Object.keys(data).length > 0, {
		message: "At least one field is required",
	});

export const updateCollectionBlogsSchema = z.object({
	blogIds: z.array(mongoObjectIdSchema).min(1, "At least one blog id is required"),
});

export const attachBlogReferenceSchema = z.object({
	blogId: mongoObjectIdSchema,
	collectionId: mongoObjectIdSchema.optional().nullable(),
	kind: blogReferenceKindSchema.optional().default("reference"),
	label: z.string().trim().max(120, "Label is too long").optional().default(""),
});

export const updateBlogReferenceSchema = z
	.object({
		blogId: mongoObjectIdSchema.optional(),
		collectionId: mongoObjectIdSchema.optional().nullable(),
		kind: blogReferenceKindSchema.optional(),
		label: z.string().trim().max(120, "Label is too long").optional(),
	})
	.strict()
	.refine((data) => Object.keys(data).length > 0, {
		message: "At least one field is required",
	});

export const referenceIdParamSchema = z.object({
	referenceId: mongoObjectIdSchema,
});