import type { Project, ReleaseBlog } from "@/types/project"

const sortByCreatedAt = (blogs: any[] = []) => {
    if (!Array.isArray(blogs)) {
        blogs = [];
    }
    return [...blogs].sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime()
        const dateB = new Date(b.createdAt).getTime()
        return dateB - dateA
    })
}

const mergeDefined = <T extends object>(prev: T, patch: Partial<T>): T => {
    const next: any = { ...prev }
    Object.keys(patch || {}).forEach((k) => {
        const v = (patch as any)[k]
        if (v !== undefined) next[k] = v // apply only defined values; allow null to intentionally clear
    })
    return next
}

export default function InsertProjectReducer(state: any, action: any) {

    switch (action.type) {
        case "SET_IS_USER_PROJECTS_LOADING":
            return { ...state, isUserProjectsLoading: action.payload }
        case "SET_IS_CURR_RELEASE_BLOG_LOADING":
            return { ...state, isCurrReleaseBlogLoading: action.payload }
        case "SET_CURR_RELEASE_BLOG":
            const raw = action.payload
            let blogContent = raw?.blogContent

            if (typeof blogContent === "string") {
                try {
                    blogContent = JSON.parse(blogContent || "{}")
                } catch {
                    blogContent = {}
                }
            } else if (blogContent == null) {
                blogContent = {}
            }

            return { ...state, currReleaseBlog: { ...raw, blogContent } }
        case "SET_IS_ALL_PROJECTS_LOADING":
            return { ...state, isAllProjectsLoading: action.payload }
        case "SET_USER_PROJECTS":
            return { ...state, user_projects: action.payload }
        case "SET_ALL_PROJECTS": {
            const { projects, meta, user } = action.payload;
            const sorted = sortByCreatedAt(projects);
            return {
                ...state,
                all_projects: sorted,
                user_projects: sorted.filter(p => p.userId === user?._id),
                pagination: meta
            };
        }
        case "APPEND_ALL_PROJECTS": {
            const { projects, meta, user } = action.payload;
            const mergedMap = new Map(
                [...state.all_projects, ...projects].map(p => [p.id, p])
            );
            const merged = Array.from(mergedMap.values());
            const sorted = sortByCreatedAt(merged);
            return {
                ...state,
                all_projects: sorted,
                user_projects: sorted.filter(p => p.userId === user?._id),
                pagination: meta
            };
        }
        case "SET_IS_RELEASE_BLOG_LOADING":
            return { ...state, isReleaseBlogLoading: action.payload }
        case "SET_IS_GITHUB_REPOS_LOADING":
            return { ...state, isGithubReposLoading: action.payload }
        case "SET_GITHUB_REPOS":
            return { ...state, githubRepos: action.payload }
        case "SET_PROJECT":
            return { ...state, curr_project: action.payload }
        case "SET_IS_PROJECT_LOADING":
            return { ...state, isProjectLoading: action.payload }
        // cover update, delete, and add project
        case "SET_IS_PROJECT_LOADING":
            return { ...state, isProjectLoading: action.payload }

        case "ADD_PROJECT":
            return {
                ...state,
                user_projects: [...state.user_projects, action.payload],
                all_projects: [...state.all_projects, action.payload]
            }

        case "UPDATE_PROJECT": {
            const patch: Partial<Project> = action.payload

            const updatedState = {
                ...state,
                user_projects: state.user_projects.map((p: Project) =>
                    p.id === patch.id ? mergeDefined<Project>(p, patch) : p
                ),
                all_projects: state.all_projects.map((p: Project) =>
                    p.id === patch.id ? mergeDefined<Project>(p, patch) : p
                ),
            }

            if (state.curr_project?.id === patch.id) {
                updatedState.curr_project = mergeDefined<Project>(state.curr_project, patch)
            }

            return updatedState
        }

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
            {
                const sortedBlogs = sortByCreatedAt(action.payload.blogs || [])
                const newState = {
                    ...state,
                    all_projects: state.all_projects.map((p: Project) =>
                        p.id === action.payload.projectId
                            ? { ...p, releaseBlogs: sortedBlogs }
                            : p
                    ),
                    user_projects: state.user_projects.map((p: Project) =>
                        p.id === action.payload.projectId
                            ? { ...p, releaseBlogs: sortedBlogs }
                            : p
                    ),
                };
                // Update curr_project.releaseBlogs if this is the current project
                if (state.curr_project?.id === action.payload.projectId) {
                    newState.curr_project = {
                        ...state.curr_project,
                        releaseBlogs: sortedBlogs
                    };
                }
                return newState;
            }

        case "ADD_RELEASE_BLOG":
            {
                const newState = {
                    ...state,
                    all_projects: state.all_projects.map((p: Project) =>
                        p.id === action.payload.projectId
                            ? {
                                ...p,
                                releaseBlogs: sortByCreatedAt([...(p.releaseBlogs || []), action.payload.blog])
                            }
                            : p
                    ),
                    user_projects: state.user_projects.map((p: Project) =>
                        p.id === action.payload.projectId
                            ? {
                                ...p,
                                releaseBlogs: sortByCreatedAt([...(p.releaseBlogs || []), action.payload.blog])
                            }
                            : p
                    ),
                };
                if (state.curr_project?.id === action.payload.projectId) {
                    newState.curr_project = {
                        ...state.curr_project,
                        releaseBlogs: sortByCreatedAt([...(state.curr_project.releaseBlogs || []), action.payload.blog])
                    };
                }
                return newState;
            }

        case "UPDATE_RELEASE_BLOG":
            {
                const newState = {
                    ...state,
                    all_projects: state.all_projects.map((p: Project) =>
                        p.id === action.payload.projectId
                            ? {
                                ...p,
                                releaseBlogs: sortByCreatedAt(
                                    (p.releaseBlogs || []).map((b: any) =>
                                        b._id === action.payload.blog._id ? action.payload.blog : b
                                    )
                                ),
                            }
                            : p
                    ),
                    user_projects: state.user_projects.map((p: Project) =>
                        p.id === action.payload.projectId
                            ? {
                                ...p,
                                releaseBlogs: sortByCreatedAt(
                                    (p.releaseBlogs || []).map((b: any) =>
                                        b._id === action.payload.blog._id ? action.payload.blog : b
                                    )
                                ),
                            }
                            : p
                    ),
                };
                if (state.curr_project?.id === action.payload.projectId) {
                    newState.curr_project = {
                        ...state.curr_project,
                        releaseBlogs: sortByCreatedAt(
                            (state.curr_project.releaseBlogs || []).map((b: any) =>
                                b._id === action.payload.blog._id ? action.payload.blog : b
                            )
                        )
                    };
                }
                return newState;
            }

        case "REMOVE_RELEASE_BLOG":
            {
                const newState = {
                    ...state,
                    all_projects: state.all_projects.map((p: Project) =>
                        p.id === action.payload.projectId
                            ? {
                                ...p,
                                releaseBlogs: (p.releaseBlogs || []).filter(
                                    (b: any) => b._id !== action.payload.blogId
                                ),
                            }
                            : p
                    ),
                    user_projects: state.user_projects.map((p: Project) =>
                        p.id === action.payload.projectId
                            ? {
                                ...p,
                                releaseBlogs: (p.releaseBlogs || []).filter(
                                    (b: any) => b._id !== action.payload.blogId
                                ),
                            }
                            : p
                    ),
                };
                if (state.curr_project?.id === action.payload.projectId) {
                    newState.curr_project = {
                        ...state.curr_project,
                        releaseBlogs: (state.curr_project.releaseBlogs || []).filter(
                            (b: any) => b._id !== action.payload.blogId
                        )
                    };
                }
                return newState;
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
                        message: action.payload.message,
                        timestamp: action.payload.timestamp,
                        status: action.payload.status
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