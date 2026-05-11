'use client'

import { createContext, useCallback, useContext, useMemo, useReducer, useRef } from "react";
import axios from "axios";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import BlogReducer from "@/features/blog/reducers/BlogReducer";
import { uniqueId } from "@/helpers/unique-id";
import { useToast } from "@/components/ui/use-toast";
import type { BlogEntry, BlogState, BlogUpdatePayload, BlogVisibility } from "@/types/blog";
import type { BlogCollectionEntry } from "@/types/blog-collection";
import { createBlogSlug } from "@/lib/blog-slug";

interface BlogProviderProps {
	allBlogs: BlogEntry[];
	allBlogPosts: BlogEntry[];
	blogCollections: BlogCollectionEntry[];
	isAllBlogsLoading: boolean;
	isBlogCollectionsLoading: boolean;
	isCollectionMutating: boolean;
	isBlogAdding: boolean;
	isAddBlogModalOpen: boolean;
	currentBlog: BlogEntry | null;
	isBlogLoading: boolean;
	isAllBlogPostsLoading: boolean;
	isDeleting: boolean;
	deleteBlog: (blog_id: string) => void;
	updateBlogMetadata: (blogId: string, payload: { blogTitle: string; type: BlogVisibility }) => Promise<BlogEntry | null>;
	handleBlogUpdate: (content: BlogUpdatePayload) => void;
	handleAutoSaveBlog: (content: BlogUpdatePayload) => void;
	addBlog: (title: string, visibility: BlogVisibility) => void;
	setIsAddBlogModalOpen: (isOpen: boolean) => void;
	fetchBlogByUrl: (slug: string) => void;
	fetchAllBlogPosts: () => void;
	fetchBlogsByUsername: (username: string) => void;
	fetchBlogCollections: () => Promise<void>;
	createBlogCollection: (payload: { name: string; description?: string; visibility: BlogVisibility }) => Promise<void>;
	updateBlogCollection: (collectionId: string, payload: { name: string; description?: string; visibility: BlogVisibility; linkedTopicId?: string | null }) => Promise<void>;
	deleteBlogCollection: (collectionId: string) => Promise<void>;
	addBlogToCollection: (collectionId: string, blogId: string) => Promise<void>;
	removeBlogFromCollection: (collectionId: string, blogId: string) => Promise<void>;
}

const initialState: BlogState = {
	allBlogs: [],
	currentBlog: null,
	allBlogPosts: [],
	blogCollections: [],
	isBlogLoading: false,
	isAllBlogsLoading: false,
	isBlogCollectionsLoading: false,
	isCollectionMutating: false,
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
	const inflightBlogsByUsernameRef = useRef(new Map<string, Promise<void>>());
	const inflightBlogCollectionsRef = useRef<Promise<void> | null>(null);
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

	const updateBlogMetadata = useCallback(async (blogId: string, payload: { blogTitle: string; type: BlogVisibility }) => {
		if (!username || !blogId) return null;
		try {
			const response = await axios.patch(`/api/blogs/${blogId}`, payload);
			if (!response.data.success) {
				toast({ title: "Error ⭕", description: response.data.message || "Failed to update blog", variant: "destructive" });
				return null;
			}

			dispatch({ type: "UPDATE_BLOG", payload: response.data.blog });
			toast({ title: "Blog updated ✅", description: "Blog details updated successfully", variant: "default" });
			return response.data.blog ?? null;
		} catch (error: any) {
			toast({ title: "Error ⭕", description: error?.response?.data?.message || "Failed to update blog", variant: "destructive" });
			return null;
		}
	}, [toast, username]);

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

		const inflightRequest = inflightBlogsByUsernameRef.current.get(queryUsername);
		if (inflightRequest) {
			return inflightRequest;
		}

		dispatch({ type: "SET_ALL_BLOGS_LOADING", payload: true });
		const request = axios.get(`/api/users/${queryUsername}/blogs`)
			.then((response) => {
				dispatch({ type: "LOAD_BLOGS", payload: response.data.success ? response.data.blogs ?? [] : [] });
			})
			.catch(() => {
				dispatch({ type: "LOAD_BLOGS", payload: [] });
			})
			.finally(() => {
				inflightBlogsByUsernameRef.current.delete(queryUsername);
				dispatch({ type: "SET_ALL_BLOGS_LOADING", payload: false });
			});

		inflightBlogsByUsernameRef.current.set(queryUsername, request);
		return request;
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

	const fetchBlogCollections = useCallback(async () => {
		if (!username) return;

		if (inflightBlogCollectionsRef.current) {
			return inflightBlogCollectionsRef.current;
		}

		dispatch({ type: "SET_BLOG_COLLECTIONS_LOADING", payload: true });
		const request = axios.get("/api/blog-collections")
			.then((response) => {
				dispatch({ type: "SET_BLOG_COLLECTIONS", payload: response.data.success ? response.data.collections ?? [] : [] });
			})
			.catch(() => {
				dispatch({ type: "SET_BLOG_COLLECTIONS", payload: [] });
			})
			.finally(() => {
				inflightBlogCollectionsRef.current = null;
				dispatch({ type: "SET_BLOG_COLLECTIONS_LOADING", payload: false });
			});

		inflightBlogCollectionsRef.current = request;
		return request;
	}, [username]);

	const createBlogCollection = useCallback(async (payload: { name: string; description?: string; visibility: BlogVisibility }) => {
		if (!username) return;
		dispatch({ type: "SET_COLLECTION_MUTATING", payload: true });
		try {
			const response = await axios.post("/api/blog-collections", payload);
			if (!response.data.success) {
				toast({ title: "Error ⭕", description: response.data.message || "Failed to create collection", variant: "destructive" });
				return;
			}

			dispatch({ type: "ADD_BLOG_COLLECTION", payload: response.data.collection });
			toast({ title: "Collection created ✅", description: "Blog collection created successfully", variant: "default" });
		} catch (error: any) {
			toast({ title: "Error ⭕", description: error?.response?.data?.message || "Failed to create collection", variant: "destructive" });
		} finally {
			dispatch({ type: "SET_COLLECTION_MUTATING", payload: false });
		}
	}, [toast, username]);

	const deleteBlogCollection = useCallback(async (collectionId: string) => {
		if (!username || !collectionId) return;
		dispatch({ type: "SET_COLLECTION_MUTATING", payload: true });
		try {
			const response = await axios.delete(`/api/blog-collections/${collectionId}`);
			if (!response.data.success) {
				toast({ title: "Error ⭕", description: response.data.message || "Failed to delete collection", variant: "destructive" });
				return;
			}

			dispatch({ type: "REMOVE_BLOG_COLLECTION", payload: collectionId });
			toast({ title: "Collection deleted ✅", description: "Collection removed successfully", variant: "default" });
		} catch (error: any) {
			toast({ title: "Error ⭕", description: error?.response?.data?.message || "Failed to delete collection", variant: "destructive" });
		} finally {
			dispatch({ type: "SET_COLLECTION_MUTATING", payload: false });
		}
	}, [toast, username]);

	const updateBlogCollection = useCallback(async (
		collectionId: string,
		payload: { name: string; description?: string; visibility: BlogVisibility; linkedTopicId?: string | null }
	) => {
		if (!username || !collectionId) return;
		dispatch({ type: "SET_COLLECTION_MUTATING", payload: true });
		try {
			const response = await axios.patch(`/api/blog-collections/${collectionId}`, payload);
			if (!response.data.success) {
				toast({ title: "Error ⭕", description: response.data.message || "Failed to update collection", variant: "destructive" });
				return;
			}

			dispatch({ type: "UPDATE_BLOG_COLLECTION", payload: response.data.collection });
			toast({ title: "Collection updated ✅", description: "Collection details saved successfully", variant: "default" });
		} catch (error: any) {
			toast({ title: "Error ⭕", description: error?.response?.data?.message || "Failed to update collection", variant: "destructive" });
		} finally {
			dispatch({ type: "SET_COLLECTION_MUTATING", payload: false });
		}
	}, [toast, username]);

	const addBlogToCollection = useCallback(async (collectionId: string, blogId: string) => {
		if (!username || !collectionId || !blogId) return;
		dispatch({ type: "SET_COLLECTION_MUTATING", payload: true });
		try {
			const response = await axios.post(`/api/blog-collections/${collectionId}/blogs`, {
				blogIds: [blogId],
			});

			if (!response.data.success) {
				toast({ title: "Error ⭕", description: response.data.message || "Failed to add blog to collection", variant: "destructive" });
				return;
			}

			dispatch({ type: "UPDATE_BLOG_COLLECTION", payload: response.data.collection });
			toast({ title: "Added to collection ✅", description: "Blog added to collection successfully", variant: "default" });
		} catch (error: any) {
			toast({ title: "Error ⭕", description: error?.response?.data?.message || "Failed to add blog to collection", variant: "destructive" });
		} finally {
			dispatch({ type: "SET_COLLECTION_MUTATING", payload: false });
		}
	}, [toast, username]);

	const removeBlogFromCollection = useCallback(async (collectionId: string, blogId: string) => {
		if (!username || !collectionId || !blogId) return;
		dispatch({ type: "SET_COLLECTION_MUTATING", payload: true });
		try {
			const response = await axios.delete(`/api/blog-collections/${collectionId}/blogs`, {
				data: { blogIds: [blogId] },
			});

			if (!response.data.success) {
				toast({ title: "Error ⭕", description: response.data.message || "Failed to remove blog from collection", variant: "destructive" });
				return;
			}

			dispatch({ type: "UPDATE_BLOG_COLLECTION", payload: response.data.collection });
			toast({ title: "Removed from collection ✅", description: "Blog removed from collection successfully", variant: "default" });
		} catch (error: any) {
			toast({ title: "Error ⭕", description: error?.response?.data?.message || "Failed to remove blog from collection", variant: "destructive" });
		} finally {
			dispatch({ type: "SET_COLLECTION_MUTATING", payload: false });
		}
	}, [toast, username]);

	const contextValue = useMemo(() => ({
		...state,
		deleteBlog,
		updateBlogMetadata,
		handleBlogUpdate,
		addBlog,
		setIsAddBlogModalOpen,
		fetchBlogByUrl,
		fetchAllBlogPosts,
		fetchBlogsByUsername,
		fetchBlogCollections,
		createBlogCollection,
		updateBlogCollection,
		deleteBlogCollection,
		addBlogToCollection,
		removeBlogFromCollection,
		handleAutoSaveBlog,
	}), [
		state,
		deleteBlog,
		updateBlogMetadata,
		handleBlogUpdate,
		addBlog,
		setIsAddBlogModalOpen,
		fetchBlogByUrl,
		fetchAllBlogPosts,
		fetchBlogsByUsername,
		fetchBlogCollections,
		createBlogCollection,
		updateBlogCollection,
		deleteBlogCollection,
		addBlogToCollection,
		removeBlogFromCollection,
		handleAutoSaveBlog,
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