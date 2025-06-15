'use client'
import { useContext, useState } from "react"
import { createContext } from "react"



interface BlogProviderProps{
    blogContent: any
    allBlogs: any[]

    isAllBlogsLoading: boolean

    saveContent: () => void
    deleteBlog: (blog_id: string) => void
    updateBlog: (blog_id: string) => void
    handleBlogUpdate: (content: any) => void
}


const BlogContext = createContext<BlogProviderProps|null>(null)

export const BlogProvider = ({children}: { children: React.ReactNode }) => {

    const [blogContent, setBlogContent] = useState({})
    const [allBlogs, setAllBlogs] = useState([])
    const [isAllBlogsLoading, setIsAllBlogsLoading] = useState(false)

    const saveContent = () => {

    }

    const deleteBlog = (blog_id: string) => {

    }

    const updateBlog = (blog_id: string) => {

    }

    const handleBlogUpdate = (content: any) => {
        setBlogContent(content)
    }

    const getAllBlogs = () => {

    }

    return (
        <BlogContext.Provider 
            value={{
                blogContent, 
                allBlogs,
                isAllBlogsLoading,

                saveContent, 
                deleteBlog, 
                updateBlog,
                handleBlogUpdate
            }}>
            {children}
        </BlogContext.Provider>
    )
}

export const useBlog = () => {
    const context = useContext(BlogContext)
    if(!context){
        throw new Error('useBlog must be used with a blog provider')
    }
    return context
}