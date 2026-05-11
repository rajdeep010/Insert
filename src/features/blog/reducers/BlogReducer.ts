import type { BlogCollectionEntry } from "@/types/blog-collection";
import type { BlogEntry, BlogState } from "@/types/blog";

type BlogAction =
	| { type: "LOAD_BLOGS"; payload: BlogEntry[] }
	| { type: "SET_BLOG_COLLECTIONS"; payload: BlogCollectionEntry[] }
	| { type: "ADD_BLOG_COLLECTION"; payload: BlogCollectionEntry }
	| { type: "UPDATE_BLOG_COLLECTION"; payload: BlogCollectionEntry }
	| { type: "REMOVE_BLOG_COLLECTION"; payload: string }
	| { type: "SET_BLOG_COLLECTIONS_LOADING"; payload: boolean }
	| { type: "SET_COLLECTION_MUTATING"; payload: boolean }
	| { type: "SET_ALL_BLOGS_LOADING"; payload: boolean }
	| { type: "SET_IS_ADD_BLOG_MODAL_OPEN"; payload: boolean }
	| { type: "SET_IS_BLOG_ADDING"; payload: boolean }
	| { type: "ADD_BLOG"; payload: BlogEntry }
	| { type: "UPDATE_BLOG"; payload: BlogEntry }
	| { type: "REMOVE_BLOG"; payload: string }
	| { type: "SET_IS_BLOG_LOADING"; payload: boolean }
	| { type: "SET_CURRENT_BLOG"; payload: BlogEntry | null }
	| { type: "SET_ALL_BLOG_POSTS_LOADING"; payload: boolean }
	| { type: "SET_ALL_BLOG_POSTS_CONTENT"; payload: BlogEntry[] }
	| { type: "SET_IS_DELETING"; payload: boolean };

export default function BlogReducer(state: BlogState, action: BlogAction): BlogState {
	switch (action.type) {
		case "LOAD_BLOGS":
			return { ...state, allBlogs: action.payload }
		case "SET_BLOG_COLLECTIONS":
			return { ...state, blogCollections: action.payload }
		case "ADD_BLOG_COLLECTION":
			return { ...state, blogCollections: [action.payload, ...state.blogCollections] }
		case "UPDATE_BLOG_COLLECTION":
			return {
				...state,
				blogCollections: state.blogCollections.map((collection) =>
					collection._id === action.payload._id ? action.payload : collection
				),
			}
		case "REMOVE_BLOG_COLLECTION":
			return {
				...state,
				blogCollections: state.blogCollections.filter((collection) => collection._id !== action.payload),
			}
		case "SET_BLOG_COLLECTIONS_LOADING":
			return { ...state, isBlogCollectionsLoading: action.payload }
		case "SET_COLLECTION_MUTATING":
			return { ...state, isCollectionMutating: action.payload }
		case "SET_ALL_BLOGS_LOADING":
			return { ...state, isAllBlogsLoading: action.payload }
		case "SET_IS_ADD_BLOG_MODAL_OPEN":
			return { ...state, isAddBlogModalOpen: action.payload }
		case "SET_IS_BLOG_ADDING":
			return { ...state, isBlogAdding: action.payload }
		case "ADD_BLOG":
			return { ...state, allBlogs: [action.payload, ...state.allBlogs] }
		case "UPDATE_BLOG":
			return {
				...state,
				allBlogs: state.allBlogs.map((blog) =>
					blog._id === action.payload._id ? { ...blog, ...action.payload } : blog
				),
				allBlogPosts: state.allBlogPosts.map((blog) =>
					blog._id === action.payload._id ? { ...blog, ...action.payload } : blog
				),
				currentBlog:
					state.currentBlog?._id === action.payload._id
						? { ...state.currentBlog, ...action.payload }
						: state.currentBlog,
			}
		case "REMOVE_BLOG":
			return {
				...state,
				allBlogs: state.allBlogs.filter((blog) => blog._id !== action.payload),
				blogCollections: state.blogCollections.map((collection) => ({
					...collection,
					blogIds: collection.blogIds.filter((blogId) => blogId !== action.payload),
				})),
			}
		case "SET_IS_BLOG_LOADING":
			return { ...state, isBlogLoading: action.payload }
		case "SET_CURRENT_BLOG": {
			if (!action.payload) {
				return { ...state, currentBlog: null }
			}
			let parsedBlogContent = {}
			if (typeof action.payload.blogContent === "string") {
				try {
					parsedBlogContent = JSON.parse(action.payload.blogContent || "{}")
				} catch {
					parsedBlogContent = {}
				}
			} else if (action.payload.blogContent && typeof action.payload.blogContent === "object") {
				parsedBlogContent = action.payload.blogContent
			}
			return { ...state, currentBlog: { ...action.payload, blogContent: parsedBlogContent } }
		}
		case "SET_ALL_BLOG_POSTS_LOADING":
			return { ...state, isAllBlogPostsLoading: action.payload }
		case "SET_ALL_BLOG_POSTS_CONTENT":
			return { ...state, allBlogPosts: action.payload }
		case "SET_IS_DELETING":
			return { ...state, isDeleting: action.payload }
		default:
			return state;
	}
}