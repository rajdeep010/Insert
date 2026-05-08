'use client'

import { createContext, useCallback, useContext, useMemo, useReducer } from "react";
import axios from "axios";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import BlogReducer from "@/features/blog/reducers/BlogReducer";
import { uniqueId } from "@/helpers/unique-id";
import { useToast } from "@/components/ui/use-toast";
import type { BlogEntry, BlogState, BlogUpdatePayload, BlogVisibility } from "@/types/blog";
import { createBlogSlug } from "@/lib/blog-slug";

interface BlogProviderProps {
	allBlogs: BlogEntry[];
	allBlogPosts: BlogEntry[];
	isAllBlogsLoading: boolean;
	isBlogAdding: boolean;
	isAddBlogModalOpen: boolean;
	currentBlog: BlogEntry | null;
	isBlogLoading: boolean;
	isAllBlogPostsLoading: boolean;
	isDeleting: boolean;
	deleteBlog: (blog_id: string) => void;
	handleBlogUpdate: (content: BlogUpdatePayload) => void;
	handleAutoSaveBlog: (content: BlogUpdatePayload) => void;
	addBlog: (title: string, visibility: BlogVisibility) => void;
	setIsAddBlogModalOpen: (isOpen: boolean) => void;
	fetchBlogByUrl: (slug: string) => void;
	fetchAllBlogPosts: () => void;
	fetchBlogsByUsername: (username: string) => void;
	removeBlogFromState: (blogId: string) => void;
}

const initialState: BlogState = {
	allBlogs: [],
	currentBlog: null,
	allBlogPosts: [],
	isBlogLoading: false,
	isAllBlogsLoading: false,
	isBlogAdding: false,
	isAddBlogModalOpen: false,
	isAllBlogPostsLoading: false,
	isDeleting: false,
};

const BlogContext = createContext<BlogProviderProps | null>(null);

export const BlogProvider = ({ children }: { children: React.ReactNode }) => {
	const { data: session, status } = useSession();
	const { toast } = useToast();
	const router = useRouter();
	const [state, dispatch] = useReducer(BlogReducer, initialState);
	const username = session?.user?.username || null;

	const deleteBlog = useCallback(async (blog_id: string) => {
		try {
			if (!username || !blog_id) return;
			dispatch({ type: "SET_IS_DELETING", payload: true });
			const response = await axios.delete(`/api/blogs/${blog_id}`);
			if (!response.data.success) throw new Error(response.data.message || "Failed to delete blog");
			toast({ title: "Blog Deleted ✅", description: "Blog has been deleted successfully", variant: "default" });
			dispatch({ type: "REMOVE_BLOG", payload: blog_id });
		} catch (error: any) {
			toast({ title: "Delete Failed ❌", description: error?.response?.data?.message || error?.message || "Failed to delete blog", variant: "destructive" });
		} finally {
			dispatch({ type: "SET_IS_DELETING", payload: false });
		}
	}, [toast, username]);

	const removeBlogFromState = useCallback((blogId: string) => {
		dispatch({ type: "REMOVE_BLOG", payload: blogId });
	}, []);

	const fetchBlogByUrl = useCallback(async (slug: string) => {
		if (!slug) return;
		dispatch({ type: "SET_IS_BLOG_LOADING", payload: true });
		try {
			const response = await axios.get(`/api/blogs/slug/${slug}`);
			if (!response.data.success) {
				toast({ title: "Error ⭕", description: response.data.message || "Failed to fetch blog", variant: "destructive" });
				router.replace("/write");
				return;
			}
			dispatch({ type: "SET_CURRENT_BLOG", payload: response.data.blog });
		} catch (error: any) {
			toast({ title: "Error ⭕", description: error?.response?.data?.message || "Failed to fetch blog", variant: "destructive" });
			router.replace("/write");
		} finally {
			dispatch({ type: "SET_IS_BLOG_LOADING", payload: false });
		}
	}, [router, toast]);

	const addBlog = useCallback(async (title: string, visibility: BlogVisibility) => {
		dispatch({ type: "SET_IS_BLOG_ADDING", payload: true });
		try {
			if (!username) return;
			const slug = createBlogSlug(title, uniqueId);
			const response = await axios.post("/api/blogs", {
				blogTitle: title,
				type: visibility,
				slug,
				autosave: false,
				blogContent: JSON.stringify({ type: "doc", content: [{ type: "heading", attrs: { textAlign: null, level: 1 }, content: [{ type: "text", text: title }] }] }),
				blogContentText: title,
				blogBannerImage: "",
			});
			if (!response.data.success) {
				toast({ title: "Error ⭕", description: response.data.message || "Failed to add blog", variant: "destructive" });
				return;
			}
			dispatch({ type: "ADD_BLOG", payload: response.data.blog });
			toast({ title: "Blog Created ✅", description: "Blog has been created successfully", variant: "default" });
			router.replace(`/blog/${response.data.blog.blogUrl}`);
		} catch (error: any) {
			toast({ title: "Error ⭕", description: error?.response?.data?.message || "Error in adding blog", variant: "destructive" });
		} finally {
			dispatch({ type: "SET_IS_BLOG_ADDING", payload: false });
			dispatch({ type: "SET_IS_ADD_BLOG_MODAL_OPEN", payload: false });
		}
	}, [router, toast, username]);

	const handleBlogUpdate = useCallback(async (blogData: BlogUpdatePayload) => {
		if (!username || !state.currentBlog?._id) return;
		try {
			const response = await axios.patch(`/api/blogs/${state.currentBlog._id}`, {
				blogContent: blogData?.blogContent,
				blogContentText: blogData?.blogContentText || "",
				blogBannerImage: blogData?.blogBannerImage || "",
			});
			if (!response.data.success) {
				toast({ title: "Error ⭕", description: response.data.message || "Failed to save blog", variant: "destructive" });
				return;
			}
			dispatch({ type: "SET_CURRENT_BLOG", payload: response.data.blog });
			toast({ title: "Blog Saved ✅", description: "Blog has been saved successfully", variant: "default" });
		} catch (error: any) {
			toast({ title: "Error ⭕", description: error?.response?.data?.message || "Failed to save blog", variant: "destructive" });
		}
	}, [state.currentBlog?._id, toast, username]);

	const handleAutoSaveBlog = useCallback(async (blogData: BlogUpdatePayload) => {
		if (!username || !state.currentBlog?._id) return;
		try {
			await axios.patch(`/api/blogs/${state.currentBlog._id}`, {
				blogContent: blogData?.blogContent,
				blogContentText: blogData?.blogContentText || "",
				blogBannerImage: blogData?.blogBannerImage || "",
				autosave: blogData?.autosave || false,
			});
		} catch { }
	}, [state.currentBlog?._id, username]);

	const fetchBlogsByUsername = useCallback(async (queryUsername: string) => {
		if (!queryUsername) return;
		dispatch({ type: "SET_ALL_BLOGS_LOADING", payload: true });
		try {
			const response = await axios.get(`/api/users/${queryUsername}/blogs`);
			dispatch({ type: "LOAD_BLOGS", payload: response.data.success ? response.data.blogs ?? [] : [] });
		} catch {
			dispatch({ type: "LOAD_BLOGS", payload: [] });
		} finally {
			dispatch({ type: "SET_ALL_BLOGS_LOADING", payload: false });
		}
	}, []);

	const setIsAddBlogModalOpen = useCallback((isOpen: boolean) => {
		dispatch({ type: "SET_IS_ADD_BLOG_MODAL_OPEN", payload: isOpen });
	}, []);

	const fetchAllBlogPosts = useCallback(async () => {
		dispatch({ type: "SET_ALL_BLOG_POSTS_LOADING", payload: true });
		try {
			const response = await axios.get("/api/blogs");
			dispatch({ type: "SET_ALL_BLOG_POSTS_CONTENT", payload: response.data.success ? response.data.blogs ?? [] : [] });
		} catch {
			dispatch({ type: "SET_ALL_BLOG_POSTS_CONTENT", payload: [] });
		} finally {
			dispatch({ type: "SET_ALL_BLOG_POSTS_LOADING", payload: false });
		}
	}, []);

	const contextValue = useMemo(() => ({
		...state,
		deleteBlog,
		handleBlogUpdate,
		addBlog,
		setIsAddBlogModalOpen,
		fetchBlogByUrl,
		fetchAllBlogPosts,
		fetchBlogsByUsername,
		handleAutoSaveBlog,
		removeBlogFromState,
	}), [
		state,
		deleteBlog,
		handleBlogUpdate,
		addBlog,
		setIsAddBlogModalOpen,
		fetchBlogByUrl,
		fetchAllBlogPosts,
		fetchBlogsByUsername,
		handleAutoSaveBlog,
		removeBlogFromState,
	]);

	return (
		<BlogContext.Provider value={contextValue}>
			{children}
		</BlogContext.Provider>
	);
};

export const useBlog = () => {
	const context = useContext(BlogContext);
	if (!context) throw new Error("useBlog must be used with a blog provider");
	return context;
};