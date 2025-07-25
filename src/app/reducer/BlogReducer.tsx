

export default function BlogReducer(state: any,action: any) {
    switch (action.type) {
        case "LOAD_BLOGS":
            return {
                ...state,
                allBlogs: action.payload,
            }

        case "SET_ALL_BLOGS_LOADING":
            return {
                ...state,
                isAllBlogsLoading: action.payload,
            }

        case "SET_IS_ADD_BLOG_MODAL_OPEN":
            return {
                ...state,
                isAddBlogModalOpen: action.payload,
            }

        case "SET_IS_BLOG_ADDING":
            return {
                ...state,
                isBlogAdding: action.payload,
            }

        case "ADD_BLOG":
            return {
                ...state,
                allBlogs: [action.payload,...state.allBlogs],
            }

        case "SET_IS_BLOG_LOADING":
            return {
                ...state,
                isBlogLoading: action.payload,
            }

        case "SET_CURRENT_BLOG":
            return {
                ...state,
                currentBlog: {...action.payload, blogContent: JSON.parse(action.payload.blogContent || "{}")},
            }
        
        case "SET_ALL_BLOG_POSTS_LOADING":
            return {
                ...state,
                isAllBlogPostsLoading: action.payload,
            }

        case "SET_ALL_BLOG_POSTS_CONTENT":
            return {
                ...state,
                allBlogPosts: action.payload,
            }

        default:
            return state;
    }
}