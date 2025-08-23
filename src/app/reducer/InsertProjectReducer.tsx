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
            return { ...state, curr_project: action.payload }
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
            const updatedState = {
                ...state,
                user_projects: state.user_projects.map((p: Project) =>
                    p.id === action.payload.id ? action.payload : p
                ),
                all_projects: state.all_projects.map((p: Project) =>
                    p.id === action.payload.id ? action.payload : p
                ),
            }

            // If this is the current project, also update curr_project
            if (action.payload.id === state.curr_project?.project?.id) {
                updatedState.curr_project = {
                    ...state.curr_project,
                    project: action.payload
                }
            }

            return updatedState

        case "REMOVE_PROJECT":
            return {
                ...state,
                user_projects: state.user_projects.filter((p: Project) => p.id !== action.payload),
                all_projects: state.all_projects.filter((p: Project) => p.id !== action.payload),
            }
        
        case "SET_GITHUB_REPOS":
            return { ...state, githubRepos: action.payload }
        
        // New action for setting release blogs for a specific project
        case "SET_RELEASE_BLOGS":
            return {
                ...state,
                all_projects: state.all_projects.map((p: Project) =>
                    p.id === action.payload.projectId
                        ? { ...p, releaseBlogs: action.payload.blogs }
                        : p
                ),
                user_projects: state.user_projects.map((p: Project) =>
                    p.id === action.payload.projectId
                        ? { ...p, releaseBlogs: action.payload.blogs }
                        : p
                ),
            }
        
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

        // New WebSocket and real-time tracking actions
        case "SET_WEBSOCKET_STATUS":
            return { ...state, webSocketConnected: action.payload }
        
        case "SET_RELEASE_SYNC_STATUS":
            return { 
                ...state, 
                releaseSyncStatus: {
                    ...state.releaseSyncStatus,
                    [action.payload.projectId]: {
                        buildStatus: action.payload.buildStatus,
                        message: action.payload.message,
                        timestamp: action.payload.timestamp
                    }
                }
            }

        case "CLEAR_RELEASE_SYNC_STATUS":
            return {
                ...state,
                releaseSyncStatus: {
                    ...state.releaseSyncStatus,
                    [action.payload]: undefined
                }
            }

        case "SET_IS_SYNCING_RELEASE":
            return { 
                ...state, 
                isSyncingRelease: {
                    ...state.isSyncingRelease,
                    [action.payload.projectId]: action.payload.isLoading
                }
            }
            
        default:
            return state
    }
}