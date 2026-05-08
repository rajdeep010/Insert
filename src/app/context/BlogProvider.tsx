'use client'

import { createContext, useContext, useEffect, useReducer } from "react";
import axios from "axios";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";

import BlogReducer from "../reducer/BlogReducer";
import { uniqueId } from "@/helpers/unique-id";
import { useToast } from "@/components/ui/use-toast";

interface BlogProviderProps {
    allBlogs: any[];
    allBlogPosts: any[];
    isAllBlogsLoading: boolean;
    isBlogAdding: boolean;
    isAddBlogModalOpen: boolean;
    currentBlog: any;
    isBlogLoading: boolean;
    isAllBlogPostsLoading: boolean;
    isDeleting: boolean;

    deleteBlog: (blog_id: string) => void;
    handleBlogUpdate: (content: any) => void;
    handleAutoSaveBlog: (content: any) => void;
    addBlog: (title: string, visibility: string) => void;
    setIsAddBlogModalOpen: (isOpen: boolean) => void;
    fetchAllBlogPosts: () => void;
    removeBlogFromState: (blogId: string) => void;
}

const initialState: BlogProviderProps = {
    allBlogs: [],
    currentBlog: {},
    allBlogPosts: [],
    isBlogLoading: false,
    isAllBlogsLoading: false,
    isBlogAdding: false,
    isAddBlogModalOpen: false,
    isAllBlogPostsLoading: false,
    isDeleting: false,
    deleteBlog: () => { },
    handleBlogUpdate: () => { },
    handleAutoSaveBlog: () => { },
    addBlog: () => { },
    setIsAddBlogModalOpen: () => { },
    fetchAllBlogPosts: () => { },
    removeBlogFromState: () => { },
};

const BlogContext = createContext<BlogProviderProps | null>(null);

export const BlogProvider = ({ children }: { children: React.ReactNode }) => {
    const { data: session, status } = useSession();
    const { toast } = useToast();
    const router = useRouter();
    const params = useParams();

    const paramUsername = params.username as string | undefined;
    const blogUrl = params.blogUrl as string | undefined;

    const [state, dispatch] = useReducer(BlogReducer, initialState);

    const username = session?.user?.username || null;

    const deleteBlog = async (blog_id: string) => {
        try {
            if (!username || !blog_id) return;

            dispatch({ type: "SET_IS_DELETING", payload: true });

            const response = await axios.delete(`/api/blogs/${blog_id}`);
            const data = response.data;

            if (!data.success) {
                throw new Error(data.message || "Failed to delete blog");
            }

            toast({
                title: "Blog Deleted ✅",
                description: "Blog has been deleted successfully",
                variant: "default",
            });

            dispatch({ type: "REMOVE_BLOG", payload: blog_id });
        } catch (error: any) {
            toast({
                title: "Delete Failed ❌",
                description:
                    error?.response?.data?.message || error?.message || "Failed to delete blog",
                variant: "destructive",
            });
        } finally {
            dispatch({ type: "SET_IS_DELETING", payload: false });
        }
    };

    const removeBlogFromState = (blogId: string) => {
        dispatch({ type: "REMOVE_BLOG", payload: blogId });
    };

    const getBlogByUrl = async (slug: string) => {
        if (!slug) return;

        dispatch({ type: "SET_IS_BLOG_LOADING", payload: true });

        try {
            const response = await axios.get(`/api/blogs/slug/${slug}`);

            if (!response.data.success) {
                toast({
                    title: "Error ⭕",
                    description: response.data.message || "Failed to fetch blog",
                    variant: "destructive",
                });
                router.replace("/write");
                return;
            }

            dispatch({ type: "SET_CURRENT_BLOG", payload: response.data.blog });
        } catch (error: any) {
            toast({
                title: "Error ⭕",
                description:
                    error?.response?.data?.message || "Failed to fetch blog",
                variant: "destructive",
            });
            router.replace("/write");
        } finally {
            dispatch({ type: "SET_IS_BLOG_LOADING", payload: false });
        }
    };

    const addBlog = async (title: string, visibility: string) => {
        dispatch({ type: "SET_IS_BLOG_ADDING", payload: true });

        try {
            if (!username) return;

            const slug = `${title.trim().toLowerCase().replace(/\s+/g, "-")}-${uniqueId}`;

            const response = await axios.post("/api/blogs", {
                blogTitle: title,
                type: visibility,
                slug,
                autosave: false,
                blogContent: JSON.stringify({
                    type: "doc",
                    content: [
                        {
                            type: "heading",
                            attrs: {
                                textAlign: null,
                                level: 1,
                            },
                            content: [
                                {
                                    type: "text",
                                    text: title,
                                },
                            ],
                        },
                    ],
                }),
                blogContentText: title,
                blogBannerImage: "",
            });

            if (!response.data.success) {
                toast({
                    title: "Error ⭕",
                    description: response.data.message || "Failed to add blog",
                    variant: "destructive",
                });
                return;
            }

            const data = response.data;
            dispatch({ type: "ADD_BLOG", payload: data.blog });

            toast({
                title: "Blog Created ✅",
                description: "Blog has been created successfully",
                variant: "default",
            });

            router.replace(`/blog/${data.blog.blogUrl}`);
        } catch (error: any) {
            toast({
                title: "Error ⭕",
                description:
                    error?.response?.data?.message || "Error in adding blog",
                variant: "destructive",
            });
        } finally {
            dispatch({ type: "SET_IS_BLOG_ADDING", payload: false });
            dispatch({ type: "SET_IS_ADD_BLOG_MODAL_OPEN", payload: false });
        }
    };

    const handleBlogUpdate = async (blogData: any) => {
        if (!username || !state.currentBlog?._id) return;

        const blogContent = blogData?.blogContent;
        const blogContentText = blogData?.blogContentText || "";
        const blogBannerImage = blogData?.blogBannerImage || "";

        try {
            const response = await axios.patch(`/api/blogs/${state.currentBlog._id}`, {
                blogContent,
                blogContentText,
                blogBannerImage,
            });

            if (!response.data.success) {
                toast({
                    title: "Error ⭕",
                    description: response.data.message || "Failed to save blog",
                    variant: "destructive",
                });
                return;
            }

            dispatch({ type: "SET_CURRENT_BLOG", payload: response.data.blog });

            toast({
                title: "Blog Saved ✅",
                description: "Blog has been saved successfully",
                variant: "default",
            });
        } catch (error: any) {
            toast({
                title: "Error ⭕",
                description:
                    error?.response?.data?.message || "Failed to save blog",
                variant: "destructive",
            });
        }
    };

    const handleAutoSaveBlog = async (blogData: any) => {
        if (!username || !state.currentBlog?._id) return;

        const blogContent = blogData?.blogContent;
        const blogContentText = blogData?.blogContentText || "";
        const blogBannerImage = blogData?.blogBannerImage || "";
        const autosave = blogData?.autosave || false;

        try {
            await axios.patch(`/api/blogs/${state.currentBlog._id}`, {
                blogContent,
                blogContentText,
                blogBannerImage,
                autosave,
            });
        } catch {
            // Silent autosave failure for now
        }
    };

    const getBlogsByUsername = async (queryUsername: string) => {
        if (!queryUsername) return;

        dispatch({ type: "SET_ALL_BLOGS_LOADING", payload: true });

        try {
            const response = await axios.get(`/api/users/${queryUsername}/blogs`);

            if (response.data.success) {
                dispatch({ type: "LOAD_BLOGS", payload: response.data.blogs ?? [] });
            } else {
                dispatch({ type: "LOAD_BLOGS", payload: [] });
            }
        } catch {
            dispatch({ type: "LOAD_BLOGS", payload: [] });
        } finally {
            dispatch({ type: "SET_ALL_BLOGS_LOADING", payload: false });
        }
    };

    const setIsAddBlogModalOpen = (isOpen: boolean) => {
        dispatch({ type: "SET_IS_ADD_BLOG_MODAL_OPEN", payload: isOpen });
    };

    const fetchAllBlogPosts = async () => {
        dispatch({ type: "SET_ALL_BLOG_POSTS_LOADING", payload: true });

        try {
            const response = await axios.get("/api/blogs");

            if (response.data.success) {
                dispatch({
                    type: "SET_ALL_BLOG_POSTS_CONTENT",
                    payload: response.data.blogs ?? [],
                });
            } else {
                dispatch({ type: "SET_ALL_BLOG_POSTS_CONTENT", payload: [] });
            }
        } catch {
            dispatch({ type: "SET_ALL_BLOG_POSTS_CONTENT", payload: [] });
        } finally {
            dispatch({ type: "SET_ALL_BLOG_POSTS_LOADING", payload: false });
        }
    };

    useEffect(() => {
        if (!blogUrl) return;
        getBlogByUrl(blogUrl);
    }, [blogUrl, status]);

    useEffect(() => {
        const usernameToLoad = paramUsername || session?.user?.username;
        if (!usernameToLoad) return;

        getBlogsByUsername(usernameToLoad);
    }, [status, paramUsername, session?.user?.username]);

    return (
        <BlogContext.Provider
            value={{
                ...state,
                deleteBlog,
                handleBlogUpdate,
                addBlog,
                setIsAddBlogModalOpen,
                fetchAllBlogPosts,
                handleAutoSaveBlog,
                removeBlogFromState,
            }}
        >
            {children}
        </BlogContext.Provider>
    );
};

export const useBlog = () => {
    const context = useContext(BlogContext);

    if (!context) {
        throw new Error("useBlog must be used with a blog provider");
    }

    return context;
};