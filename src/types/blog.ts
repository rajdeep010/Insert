import type { BlogCollectionEntry } from "@/types/blog-collection"

export type BlogVisibility = 'public' | 'private'

export interface BlogComment {
	commentor: string
	description: string
	timestamp: string | Date
}

export interface BlogEntry {
	_id?: string
	id?: string
	blogTitle: string
	blogContent: string | Record<string, unknown>
	blogContentText?: string
	blogUrl: string
	status?: string
	type: BlogVisibility | string
	likes?: string[]
	comments?: BlogComment[]
	creator?: string
	autosave?: boolean
	blogBannerImage?: string
	createdAt?: string | Date
	lastEdited?: string | Date
	[key: string]: unknown
}

export interface BlogUpdatePayload {
	blogContent: string
	blogContentText?: string
	blogBannerImage?: string
	autosave?: boolean
}

export interface BlogState {
	allBlogs: BlogEntry[]
	allBlogPosts: BlogEntry[]
	blogCollections: BlogCollectionEntry[]
	isAllBlogsLoading: boolean
	isBlogCollectionsLoading: boolean
	isCollectionMutating: boolean
	isBlogAdding: boolean
	isAddBlogModalOpen: boolean
	currentBlog: BlogEntry | null
	isBlogLoading: boolean
	isAllBlogPostsLoading: boolean
	isDeleting: boolean
}