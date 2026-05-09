import type { BlogVisibility } from "@/types/blog";

export type BlogReferenceKind = "solution" | "reference" | "note";

export interface ProblemBlogReference {
	_id?: string;
	blogId: string;
	collectionId?: string | null;
	kind: BlogReferenceKind;
	label?: string;
	blogTitle?: string;
	blogUrl?: string;
	collectionName?: string;
	addedBy: string;
	addedAt: string | Date;
}

export interface BlogCollectionEntry {
	_id?: string;
	name: string;
	description?: string;
	ownerUsername: string;
	visibility: BlogVisibility;
	linkedTopicId?: string | null;
	blogIds: string[];
	createdAt?: string | Date;
	updatedAt?: string | Date;
}