'use client'
import { useContext,useEffect,useReducer,useState } from "react"
import { createContext } from "react"
import BlogReducer from "../reducer/BlogReducer"
import axios from "axios"
import { uniqueId } from "@/helpers/unique-id"
import { useSession } from "next-auth/react"
import { useToast } from "@/components/ui/use-toast"
import { useParams,useRouter } from "next/navigation"



interface BlogProviderProps {
    blogContent: any
    allBlogs: any[]
    allBlogPosts: any[]
    isAllBlogsLoading: boolean
    isBlogAdding: boolean,
    isAddBlogModalOpen: boolean
    currentBlog: any
    isBlogLoading: boolean
    isAllBlogPostsLoading: boolean

    deleteBlog: (blog_id: string) => void
    handleBlogUpdate: (content: any) => void
    addBlog: (title: string,visibility: string) => void
    setIsAddBlogModalOpen: (isOpen: boolean) => void
    fetchAllBlogPosts: () => void
}

const initialState: BlogProviderProps = {
    blogContent: {},
    allBlogs: [],
    currentBlog: {},
    allBlogPosts: [],

    isBlogLoading: false,
    isAllBlogsLoading: false,
    isBlogAdding: false,
    isAddBlogModalOpen: false,
    isAllBlogPostsLoading: false,

    deleteBlog: (blog_id: string) => { },
    handleBlogUpdate: (content: any) => { },
    addBlog: (title: string,visibility: string) => { },
    setIsAddBlogModalOpen: (isOpen: boolean) => { },
    fetchAllBlogPosts: () => {}
}

const BlogContext = createContext<BlogProviderProps | null>(null)

export const BlogProvider = ({ children }: { children: React.ReactNode }) => {
    const { data: session,status } = useSession()

    const { toast } = useToast()
    const router = useRouter()

    const params = useParams()
    const param_username = params.username as string   

    const blogUrl = params.blogUrl as string
    // console.log("Blog URL from params:",blogUrl,params)

    const [state,dispatch] = useReducer(BlogReducer,initialState)

    const username = session?.user?.username || null

    const deleteBlog = (blog_id: string) => {

    }

    const getBlogByUrl = async (blogUrl: string) => {
        if (!username || !blogUrl) return
        dispatch({ type: "SET_IS_BLOG_LOADING",payload: true })
        try {

            const response = await axios.get(`/api/get-blog-by-url?blogUrl=${blogUrl}`)
            console.log("Response from getBlogByUrl:",response.data)

            if (response.data.success) {
                dispatch({ type: "SET_CURRENT_BLOG",payload: response.data.blog })
                // console.log("Blog fetched successfully:",state.currentBlog)

            } else {
                toast({
                    title: "Error ⭕",
                    description: response.data.message,
                    variant: "destructive",
                })
                router.replace('/write')
            }

        } catch (error) {
            toast({
                title: "Error ⭕",
                description: "Failed to fetch blog",
                variant: "destructive",
            })
            router.replace('/write')
        } finally {
            dispatch({ type: "SET_IS_BLOG_LOADING",payload: false })
        }
    }

    // when creating blog with only title and visibility
    const addBlog = async (title: string,visibility: string) => {
        dispatch({ type: "SET_IS_BLOG_ADDING",payload: true })
        try {
            if (!username) return

            const formattedTitle = title.trim().split(' ').join('-')

            const blogData = {
                blogTitle: title,
                type: visibility,
                blogUrl: formattedTitle + '-' + uniqueId,
                blogContent: JSON.stringify
                    ({
                        type: "doc",
                        content: [
                            {
                                type: "heading",
                                attrs: {
                                    textAlign: null,
                                    level: 1
                                },
                                content: [
                                    {
                                        type: "text",
                                        text: title
                                    }
                                ]
                            }
                        ]
                    }),
            }

            const response = await axios.post('/api/save-blog',{
                ...blogData,
                creator: username
            })

            if (!response.data.success) {
                toast({
                    title: "Error ⭕",
                    description: response.data.message || "Failed to add blog",
                    variant: "destructive",
                })
            }

            const data = response.data
            // console.log("Blog added successfully : ",data)
            if (data) {
                dispatch({ type: "ADD_BLOG",payload: data.blog })
                toast({
                    title: 'Blog Created ✅',
                    description: 'Blog has been created successfully',
                    variant: 'default'
                })

                router.replace(`/blog/${data.blog.blogUrl}`)
            }
        }
        catch (error) {
            console.error("Error in adding blog:",error)
            toast({
                title: 'Error ⭕',
                description: 'Error in adding blog',
                variant: 'destructive'
            })

        } finally {
            dispatch({ type: "SET_IS_BLOG_ADDING",payload: false })
            dispatch({ type: "SET_IS_ADD_BLOG_MODAL_OPEN",payload: false })
        }
    }

    // this is updating the blog content
    const handleBlogUpdate = async (blogData: any) => {
        if (!username) return

        // console.log("Saving blog with content:",blogData)
        const blogContent = blogData?.blogContent
        const blogContentText = blogData?.blogContentText || ""
        const blogBannerImage = blogData?.blogBannerImage || ""

        const response = await axios.put('/api/update-blog',{
            blogContent,
            blogUrl,
            creator: username,
            blogContentText,
            blogBannerImage
        })

        if (response.data.success) {
            const data = response.data
            // console.log("Blog saved successfully:",data)

            dispatch({ type: "SET_CURRENT_BLOG",payload: data.blog })

            // if (data.blog?.autosave === false) {
            //     console.log('this is toast: ', data.blog?.autosave)
            //     toast({
            //         title: 'Blog Updated ✅',
            //         description: 'Blog has been updated successfully',
            //         variant: 'default'
            //     })
            // }

            toast({
                title: 'Blog Saved ✅',
                description: 'Blog has been saved successfully',
                variant: 'default'
            })

        } else {
            toast({
                title: "Error ⭕",
                description: response.data.message || "Failed to save blog",
                variant: "destructive",
            })
        }
    }

    const getBlogsByUsername = async (query_username: string) => {
        if (!username) return
        dispatch({ type: "SET_ALL_BLOGS_LOADING",payload: true })
        try {
            const response = await axios.get(`/api/get-blog-by-username?username=${query_username}`)
            if (response.data.success) {
                dispatch({ type: "LOAD_BLOGS",payload: response.data.blog })
            }
        }
        catch (error) {
            console.error("Error fetching blogs:",error)
        } finally {
            dispatch({ type: "SET_ALL_BLOGS_LOADING",payload: false })
        }
    }

    const setIsAddBlogModalOpen = (isOpen: boolean) => {
        dispatch({ type: "SET_IS_ADD_BLOG_MODAL_OPEN",payload: isOpen })
    }

    const fetchAllBlogPosts = async () => {
        dispatch({ type: "SET_ALL_BLOG_POSTS_LOADING",payload: true })
        try {
            const response = await axios.get('/api/get-all-blogs')
            if (response.data.success) {
                dispatch({ type: "SET_ALL_BLOG_POSTS_CONTENT",payload: response.data.blogs })
            }else{
                dispatch({ type: "SET_ALL_BLOG_POSTS_CONTENT",payload: [] })
            }
        } catch (error) {
            console.error("Error fetching blogs:",error)
        } finally {
            dispatch({ type: "SET_ALL_BLOG_POSTS_LOADING",payload: false })
        }
    }

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.replace('/sign-in')
            return
        }
        if (param_username) {
            getBlogsByUsername(param_username)
        }

        if(!param_username && session && session?.user && session?.user?.username){
            getBlogsByUsername(session?.user?.username)
        }

        if (blogUrl) {
            getBlogByUrl(blogUrl)
        }

    },[state.allblogs,status,blogUrl])


    return (
        <BlogContext.Provider
            value={{
                ...state,
                deleteBlog,
                handleBlogUpdate,
                addBlog,
                setIsAddBlogModalOpen,
                fetchAllBlogPosts
            }}>
            {children}
        </BlogContext.Provider>
    )
}

export const useBlog = () => {
    const context = useContext(BlogContext)
    if (!context) {
        throw new Error('useBlog must be used with a blog provider')
    }
    return context
}