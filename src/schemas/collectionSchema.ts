import { z } from "zod";

export const collectionTypeSchema = z.enum(["BLOG", "TOPIC"]);
export const collectionVisibilitySchema = z.enum(["public", "private"]);

const mongoObjectIdSchema = z
    .string()
    .trim()
    .regex(/^[a-f\d]{24}$/i, "Invalid blog id");

const topicIdSchema = z.string().trim().min(1, "Invalid topic id").max(100, "Invalid topic id");

export const collectionIdParamsSchema = z.object({
    collectionId: mongoObjectIdSchema,
});

export const createCollectionSchema = z
    .object({
        name: z.string().trim().min(1, "Collection name is required").max(120, "Collection name is too long"),
        description: z.string().trim().max(1000, "Description is too long").optional().default(""),
        collectionType: collectionTypeSchema,
        visibility: collectionVisibilitySchema.optional().default("private"),
        itemIds: z.array(z.string().trim().min(1)).max(100, "A collection can contain at most 100 items").optional().default([]),
    })
    .strict()
    .superRefine((data, context) => {
        const itemSchema = data.collectionType === "BLOG" ? mongoObjectIdSchema : topicIdSchema;
        data.itemIds.forEach((itemId, index) => {
            const result = itemSchema.safeParse(itemId);
            if (!result.success) {
                context.addIssue({
                    code: z.ZodIssueCode.custom,
                    path: ["itemIds", index],
                    message: result.error.issues[0]?.message ?? "Invalid item id",
                });
            }
        });
    });

export const updateCollectionMetadataSchema = z
    .object({
        name: z.string().trim().min(1, "Collection name is required").max(120, "Collection name is too long").optional(),
        description: z.string().trim().max(1000, "Description is too long").optional(),
        visibility: collectionVisibilitySchema.optional(),
    })
    .strict()
    .refine((data) => Object.keys(data).length > 0, {
        message: "At least one metadata field is required",
    });

export const updateCollectionItemsSchema = z
    .object({
        itemIds: z.array(z.string().trim().min(1)).min(1, "At least one item id is required").max(100),
    })
    .strict();

export const collectionListQuerySchema = z.object({
    page: z.coerce.number().int().min(1).optional().default(1),
    limit: z.coerce.number().int().min(1).max(50).optional().default(20),
    type: collectionTypeSchema.optional(),
    visibility: collectionVisibilitySchema.optional(),
    owner: z.string().trim().min(1).max(100).optional(),
});
