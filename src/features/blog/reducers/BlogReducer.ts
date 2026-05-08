import type { BlogEntry, BlogState } from "@/types/blog";

type BlogAction =
	| { type: "LOAD_BLOGS"; payload: BlogEntry[] }
	| { type: "SET_ALL_BLOGS_LOADING"; payload: boolean }
	| { type: "SET_IS_ADD_BLOG_MODAL_OPEN"; payload: boolean }
	| { type: "SET_IS_BLOG_ADDING"; payload: boolean }
	| { type: "ADD_BLOG"; payload: BlogEntry }
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
		case "SET_ALL_BLOGS_LOADING":
			return { ...state, isAllBlogsLoading: action.payload }
		case "SET_IS_ADD_BLOG_MODAL_OPEN":
			return { ...state, isAddBlogModalOpen: action.payload }
		case "SET_IS_BLOG_ADDING":
			return { ...state, isBlogAdding: action.payload }
		case "ADD_BLOG":
			return { ...state, allBlogs: [action.payload, ...state.allBlogs] }
		case "REMOVE_BLOG":
			return { ...state, allBlogs: state.allBlogs.filter((blog) => blog._id !== action.payload) }
		case "SET_IS_BLOG_LOADING":
			return { ...state, isBlogLoading: action.payload }
		case "SET_CURRENT_BLOG": {
			if (!action.payload) {
				return { ...state, currentBlog: null }
			}
			let parsedBlogContent = {}
			try {
				parsedBlogContent = JSON.parse(action.payload.blogContent || "{}")
			} catch {
				parsedBlogContent = {}
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