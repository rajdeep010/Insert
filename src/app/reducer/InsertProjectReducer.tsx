import { Project, ReleaseBlog } from "@/types/types"
import { all } from "axios"

export default function InsertProjectReducer(state: any, action: any) {
    switch (action.type) {
        case "SET_IS_USER_PROJECTS_LOADING":
            return { ...state, isUserProjectsLoading: action.payload }
        case "SET_IS_ALL_PROJECTS_LOADING":
            return { ...state, isAllProjectsLoading: action.payload }
        case "SET_USER_PROJECTS":
            return { ...state, user_projects: action.payload }
        case "SET_ALL_PROJECTS":
            return { ...state, all_projects: action.payload }
        case "SET_IS_RELEASE_BLOG_LOADING":
            return { ...state, isReleaseBlogLoading: action.payload }
        case "SET_IS_GITHUB_REPOS_LOADING":
            return { ...state, isGithubReposLoading: action.payload }
        case "SET_GITHUB_REPOS":
            return { ...state, githubRepos: action.payload }
        case "SET_PROJECT":
            return { ...state, project: action.payload }
        case "SET_IS_PROJECT_LOADING":
            return {...state, isProjectLoading: action.payload}
        // cover update, delete, and add project
        case "SET_IS_PROJECT_LOADING":
            return { ...state, isProjectLoading: action.payload }

        case "ADD_PROJECT":
            return { ...state, 
                user_projects: [...state.user_projects, action.payload] ,
                all_projects: [...state.all_projects, action.payload]
            }
        case "UPDATE_PROJECT":
            return {
                ...state,
                user_projects: state.user_projects.map((p: Project) =>
                    p.id === action.payload.id ? action.payload : p
                ),
                all_projects: state.all_projects.map((p: Project) =>
                    p.id === action.payload.id ? action.payload : p
                ),
            }
        case "REMOVE_PROJECT":
            return {
                ...state,
                user_projects: state.user_projects.filter((p: Project) => p.id !== action.payload),
                all_projects: state.all_projects.filter((p: Project) => p.id !== action.payload),
            }
        
        case "SET_GITHUB_REPOS":
            return { ...state, githubRepos: action.payload }
        
        case "ADD_RELEASE_BLOG":
            return {
                ...state,
                all_projects: state.all_projects.map((p: Project) =>
                    p.id === action.payload.projectId
                        ? { ...p, releaseBlogs: [...(p.releaseBlogs || []), action.payload.blog] }
                        : p
                ),
                user_projects: state.user_projects.map((p: Project) =>
                    p.id === action.payload.projectId
                        ? { ...p, releaseBlogs: [...(p.releaseBlogs || []), action.payload.blog] }
                        : p
                ),
            }

        case "UPDATE_RELEASE_BLOG":
            return {
                ...state,
                all_projects: state.all_projects.map((p: Project) =>
                    p.id === action.payload.projectId
                        ? {
                            ...p,
                            releaseBlogs: (p.releaseBlogs || []).map((b: ReleaseBlog) =>
                                b.id === action.payload.blog.id ? action.payload.blog : b
                            ),
                        }
                        : p
                ),
                user_projects: state.user_projects.map((p: Project) =>
                    p.id === action.payload.projectId
                        ? {
                            ...p,
                            releaseBlogs: (p.releaseBlogs || []).map((b: ReleaseBlog) =>
                                b.id === action.payload.blog.id ? action.payload.blog : b
                            ),
                        }
                        : p
                ),
            }

        case "REMOVE_RELEASE_BLOG":
            return {
                ...state,
                all_projects: state.all_projects.map((p: Project) =>
                    p.id === action.payload.projectId
                        ? {
                            ...p,
                            releaseBlogs: (p.releaseBlogs || []).filter(
                                (b: ReleaseBlog) => b.id !== action.payload.blogId
                            ),
                        }
                        : p
                ),
                user_projects: state.user_projects.map((p: Project) =>
                    p.id === action.payload.projectId
                        ? {
                            ...p,
                            releaseBlogs: (p.releaseBlogs || []).filter(
                                (b: ReleaseBlog) => b.id !== action.payload.blogId
                            ),
                        }
                        : p
                ),
            }
        default:
            return state
    }
}