import { Project, ReleaseBlog } from "@/types/types"

export default function InsertProjectReducer(state: any, action: any) {
    switch (action.type) {
        case "SET_PROJECTS":
            return { ...state, projects: action.payload }
        case "SET_IS_PROJECT_LOADING":
            return { ...state, isProjectLoading: action.payload }
        case "ADD_PROJECT":
            return { ...state, projects: [...state.projects, action.payload] }
        case "UPDATE_PROJECT":
            return {
                ...state,
                projects: state.projects.map((p: Project) =>
                    p.id === action.payload.id ? action.payload : p
                ),
            }
        case "REMOVE_PROJECT":
            return {
                ...state,
                projects: state.projects.filter((p: Project) => p.id !== action.payload),
            }
        case "SET_GITHUB_REPOS":
            return { ...state, githubRepos: action.payload }
        case "ADD_RELEASE_BLOG":
            return {
                ...state,
                projects: state.projects.map((p: Project) =>
                    p.id === action.payload.projectId
                        ? { ...p, releaseBlogs: [...p.releaseBlogs, action.payload.blog] }
                        : p
                ),
            }
        case "UPDATE_RELEASE_BLOG":
            return {
                ...state,
                projects: state.projects.map((p: Project) =>
                    p.id === action.payload.projectId
                        ? {
                              ...p,
                              releaseBlogs: p.releaseBlogs.map((b: ReleaseBlog) =>
                                  b.id === action.payload.blog.id ? action.payload.blog : b
                              ),
                          }
                        : p
                ),
            }
        case "REMOVE_RELEASE_BLOG":
            return {
                ...state,
                projects: state.projects.map((p: Project) =>
                    p.id === action.payload.projectId
                        ? {
                              ...p,
                              releaseBlogs: p.releaseBlogs.filter(
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