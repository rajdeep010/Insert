'use client'
import { toast } from "@/components/ui/use-toast"
import { Project, ReleaseBlog } from "@/types/types"
import axios from "axios"
import { createContext, useContext, useEffect, useReducer } from "react"
import InsertProjectReducer from "../reducer/InsertProjectReducer"
import { useInsertUser } from "./InsertUserProvider"
import { useSession } from "next-auth/react"
import { sync } from "motion/react"
import { useParams, useRouter } from "next/navigation"
import { useWebSocket } from "@/hooks/use-web-socket"

const API_BASE = "http://localhost:4000/v1"

interface InsertProjectProviderProps {
    curr_project: any,
    all_projects: any[],
    user_projects: any[],
    githubRepos: any[],
    releaseBlogs: any[],

    currReleaseBlog: any,
    isCurrReleaseBlogLoading: boolean,

    isGithubReposLoading: boolean
    isAllProjectsLoading: boolean
    isUserProjectsLoading: boolean
    isProjectLoading: boolean
    isReleaseBlogLoading?: boolean

    pagination: any

    webSocketConnected: boolean
    releaseSyncStatus: Record<string, {
        message: string
        timestamp: string
        status: string
    }>
    isSyncingRelease: Record<string, boolean>

    fetchAllProjects: () => void
    fetchProjectById: (_: string) => void,
    importReposByGithubUserId: (githubId: number) => void
    fetchProjectsByUsername: (username: string) => void
    addProject: (project: Partial<Project>) => void
    updateProject: (project: Project) => void
    removeProject: (projectId: string) => void

    setGithubRepos: (repos: any[]) => void

    addReleaseBlog: (projectId: string, blog: any) => void
    updateReleaseBlog: (projectId: string, releaseBlogId: string, blog: any) => void
    removeReleaseBlog: (projectId: string, blogId: string) => void
    syncRelease: (projectId: string) => Promise<void>
    fetchReleaseBlogForProject: (projectId: string) => Promise<void>
    fetchRepositoryBranches: (githubId: string, repoName: string) => Promise<string[]>

    clearReleaseSyncStatus: (projectId: string) => void
    fetchReleaseBlogById: (releaseBlogId: string, projectId: string) => void
    changeReleaseBlog: (blog: any) => void
    loadMore: () => void
}

const initialState = {
    curr_project: {},
    all_projects: [],
    user_projects: [],
    releaseBlogs: [],
    githubRepos: [],
    currReleaseBlog: {},

    pagination: {
        currentPage: 1,
        pageSize: 12,
        totalItems: 0,
        hasMore: false,
        nextCursor: null
    },

    isGithubReposLoading: false,
    isAllProjectsLoading: false,
    isUserProjectsLoading: false,
    isCurrReleaseBlogLoading: false,

    isProjectLoading: false,
    isReleaseBlogLoading: false,

    webSocketConnected: false,
    releaseSyncStatus: {},
    isSyncingRelease: {},

    fetchAllProjects: () => { },
    fetchProjectById: (_: string) => { },
    importReposByGithubUserId: (_: number) => { },
    fetchProjectsByUsername: (_: string) => { },
    addProject: (_: Partial<Project>) => { },
    updateProject: (_: Project) => { },
    removeProject: (_: string) => { },
    setGithubRepos: (_: any[]) => { },
    addReleaseBlog: (_: string, __: any) => { },
    updateReleaseBlog: (_: string, releaseBlogId: string, __: any) => { },
    removeReleaseBlog: (_: string, __: string) => { },
    syncRelease: (_: string) => Promise<void>,
    fetchReleaseBlogForProject: (projectId: string) => Promise<void>,
    fetchRepositoryBranches: (githubId: string, repoName: string) => Promise<string[]>,
    clearReleaseSyncStatus: (projectId: string) => { },
    fetchReleaseBlogById: (releaseBlogId: string, projectId: string) => { },
    changeReleaseBlog: (blog: any) => { },
    loadMore: () => { }
}

const InsertProjectContext = createContext<InsertProjectProviderProps | null>(null)

export const InsertProjectProvider = ({ children }: { children: React.ReactNode }) => {
    const [state, dispatch] = useReducer(InsertProjectReducer, initialState)

    const { data: session, status } = useSession()
    const { user } = useInsertUser()

    const params = useParams()
    const param_username = params.username as string
    const project_id = params.id as string;
    const releaseBlogId = params.releaseBlogId as string;

    const router = useRouter()

    const importReposByGithubUserId = async (githubId: number) => {
        try {
            dispatch({ type: "SET_IS_GITHUB_REPOS_LOADING", payload: true })
            const res = await axios.get(`${API_BASE}/api/github/repos/${githubId}`,
                {
                    headers: {
                        'Authorization': `Bearer ${session?.accessToken}`,
                        'X-GitHub-Token': `Bearer ${session?.user?.githubAccessToken}`,
                    }
                }
            )
            dispatch({ type: "SET_GITHUB_REPOS", payload: res.data })
        } catch (error: any) {
            toast({
                title: "Error ⭕",
                description: error?.response?.data?.message || "Failed to fetch projects",
                variant: "destructive",
            })
        } finally {
            dispatch({ type: "SET_IS_GITHUB_REPOS_LOADING", payload: false })
        }
    }

    const fetchProjectsByUsername = async (username: string) => {
        try {
            if (status == "unauthenticated") {
                toast({
                    title: "Error ⭕",
                    description: "You must be logged in to view your projects",
                    variant: "destructive",
                })
                return
            }
            dispatch({ type: "SET_IS_USER_PROJECTS_LOADING", payload: true })
            const res = await axios.get(`${API_BASE}/api/projects/user/${username}`, {
                headers: {
                    Authorization: `Bearer ${session?.accessToken}`
                }
            })
            dispatch({ type: "SET_USER_PROJECTS", payload: res.data })
        } catch (error: any) {
            toast({
                title: "Error ⭕",
                description: error?.response?.data?.message || "Failed to fetch projects",
                variant: "destructive",
            })
        } finally {
            dispatch({ type: "SET_IS_USER_PROJECTS_LOADING", payload: false })
        }
    }

    const fetchAllProjects = async ({ cursor, limit = 5, search }: any) => {
        try {
            dispatch({ type: "SET_IS_ALL_PROJECT_LOADING", payload: true })

            const res = await axios.get(`${API_BASE}/api/projects/list-projects`, {
                headers: {
                    Authorization: `Bearer ${session?.accessToken}`,
                },
                params: { cursor, limit, search }
            })

            const { items, nextCursor, hasMore, count } = res.data.data;
            dispatch({
                type: cursor ? "APPEND_ALL_PROJECTS" : "SET_ALL_PROJECTS",
                payload: {
                    projects: items,
                    meta: { nextCursor, hasMore, count },
                    user: session?.user
                }
            });
        } catch (error: any) {
            toast({
                title: "Error ⭕",
                description: error?.response?.data?.message || "Failed to fetch projects",
                variant: "destructive",
            })
        } finally {
            dispatch({ type: "SET_IS_ALL_PROJECTS_LOADING", payload: false })
        }
    }

    // Add a new project
    const addProject = async (project: Partial<Project>) => {
        try {
            dispatch({ type: "SET_IS_PROJECT_LOADING", payload: true })

            const res = await axios.post(`${API_BASE}/api/projects/create-project`, project, {
                headers: {
                    'Authorization': `Bearer ${session?.accessToken}`,
                    'X-GitHub-Token': `Bearer ${session?.user?.githubAccessToken}`,
                }
            })
            dispatch({ type: "ADD_PROJECT", payload: res.data?.data })
            toast({
                title: "Success ✅",
                description: "Project added successfully",
                variant: "default",
            })

            // console.log('new project: ', res.data?.data)

            if (res.data?.data?.id && res.data?.data?.monitorCommits) {
                const hookRes = await setupWebhook(res.data.data.id);
                if (hookRes) {
                    toast({
                        title: "Success ✅",
                        description: "Project will be monitored for changes.",
                        variant: "default",
                    });
                } else {
                    toast({
                        title: "Error ⭕",
                        description: "Failed to setup the monitoring, ask admin",
                        variant: "destructive",
                    });
                }
            }


        } catch (error: any) {
            toast({
                title: "Error ⭕",
                description: error?.response?.data || "Failed to add project",
                variant: "destructive",
            })
        } finally {
            dispatch({ type: "SET_IS_PROJECT_LOADING", payload: false })
        }
    }

    const setupWebhook = async (projectId: string) => {
        try {
            const result = await axios.post(
                `${API_BASE}/api/webhook/auto-setup/${projectId}`,
                {},
                {
                    headers: {
                        'Authorization': `Bearer ${session?.accessToken}`,
                        'X-GitHub-Token': `Bearer ${session?.user?.githubAccessToken}`,
                    }
                }
            );

            // console.log('result data: ', result.data);

            if (result?.data?.webhookCreated) {
                return true
            } else {
                throw new Error('Webhook setup failed');
            }
        } catch (error) {
            console.error('Webhook setup failed:', error);
            return false
        }
    };

    // Update a project
    const updateProject = async (project: Project) => {
        try {
            dispatch({ type: "SET_IS_PROJECT_LOADING", payload: true })
            const res = await axios.put(`${API_BASE}/api/projects/update-project/${project.id}`, project, {
                headers: {
                    'Authorization': `Bearer ${session?.accessToken}`,
                    'X-GitHub-Token': `Bearer ${session?.user?.githubAccessToken}`,
                }
            })
            dispatch({ type: "UPDATE_PROJECT", payload: res.data })
            toast({
                title: "Success ✅",
                description: "Project updated successfully",
                variant: "default",
            })
        } catch (error: any) {
            toast({
                title: "Error ⭕",
                description: error?.response?.data?.message || "Failed to update project",
                variant: "destructive",
            })
        } finally {
            dispatch({ type: "SET_IS_PROJECT_LOADING", payload: false })
        }
    }

    const removeProject = async (projectId: string) => {
        try {
            dispatch({ type: "SET_IS_PROJECT_LOADING", payload: true })

            // Fix the endpoint URL - add '/delete' before the projectId
            await axios.delete(`${API_BASE}/api/projects/delete-project/${projectId}`, {
                headers: {
                    'Authorization': `Bearer ${session?.accessToken}`,
                    'X-GitHub-Token': `Bearer ${session?.user?.githubAccessToken}`,
                }
            })

            dispatch({ type: "REMOVE_PROJECT", payload: projectId })
            toast({
                title: "Success ✅",
                description: "Project removed successfully",
                variant: "default",
            })
        } catch (error: any) {
            toast({
                title: "Error ⭕",
                description: error?.response?.data?.message || "Failed to remove project",
                variant: "destructive",
            })
        } finally {
            dispatch({ type: "SET_IS_PROJECT_LOADING", payload: false })
        }
    }

    // Set GitHub repos (local only)
    const setGithubRepos = (repos: any[]) => {
        dispatch({ type: "SET_GITHUB_REPOS", payload: repos })
    }

    // Add a release blog to a project (API)
    const addReleaseBlog = async (projectId: string, blog: any) => {
        try {
            const res = await axios.post(`${API_BASE}/api/release-blogs/create-release-blog/${projectId}`, {
                releaseTitle: blog.title,
                visibility: blog.visibility,
                status: "DRAFT"
            }, {
                headers: {
                    'Authorization': `Bearer ${session?.accessToken}`,
                    'X-GitHub-Token': `Bearer ${session?.user?.githubAccessToken}`,
                }
            })
            dispatch({ type: "ADD_RELEASE_BLOG", payload: { projectId, blog: res.data } })
            toast({
                title: "Success ✅",
                description: "Release blog added successfully",
                variant: "default",
            })
        } catch (error: any) {
            toast({
                title: "Error ⭕",
                description: error?.response?.data?.message || "Failed to add release blog",
                variant: "destructive",
            })
        }
    }

    // Update a release blog in a project (API)
    const updateReleaseBlog = async (projectId: string, releaseBlogId: string, blog: any) => {
        try {
            const res = await axios.put(
                `${API_BASE}/api/release-blogs/update-release-blog/${projectId}/${releaseBlogId}`,
                blog,
                {
                    headers: {
                        'Authorization': `Bearer ${session?.accessToken}`,
                        'X-GitHub-Token': `Bearer ${session?.user?.githubAccessToken}`,
                    }
                }
            )
            console.log('update release blog res: ', res.data.data);
            dispatch({ type: "UPDATE_RELEASE_BLOG", payload: { projectId, releaseBlogId, blog: res.data.data } })
            toast({
                title: "Success ✅",
                description: "Release blog updated successfully",
                variant: "default",
            })
        } catch (error: any) {
            toast({
                title: "Error ⭕",
                description: error?.response?.data?.message || "Failed to update release blog",
                variant: "destructive",
            })
        }
    }

    // Remove a release blog from a project (API)
    const removeReleaseBlog = async (projectId: string, blogId: string) => {
        try {
            await axios.delete(`${API_BASE}/api/release-blogs/delete-release-blog/${projectId}/${blogId}`, {
                headers: {
                    'Authorization': `Bearer ${session?.accessToken}`,
                    'X-GitHub-Token': `Bearer ${session?.user?.githubAccessToken}`,
                }
            })
            dispatch({ type: "REMOVE_RELEASE_BLOG", payload: { projectId, blogId } })
            toast({
                title: "Success ✅",
                description: "Release blog removed successfully",
                variant: "default",
            })
        } catch (error: any) {
            toast({
                title: "Error ⭕",
                description: error?.response?.data?.message || "Failed to remove release blog",
                variant: "destructive",
            })
        }
    }



    // Update syncRelease to handle real-time tracking
    const syncRelease = async (projectId: string) => {
        try {
            // Set syncing status
            dispatch({
                type: "SET_IS_SYNCING_RELEASE",
                payload: { projectId, isLoading: true }
            })

            // Clear any existing status
            clearReleaseSyncStatus(projectId)

            const res = await axios.post(`${API_BASE}/api/release/${projectId}/sync-release`, {}, {
                headers: {
                    'Authorization': `Bearer ${session?.accessToken}`,
                    'X-GitHub-Token': `Bearer ${session?.user?.githubAccessToken}`,
                }
            })
            dispatch({
                type: "SET_IS_SYNCING_RELEASE",
                payload: { projectId, isLoading: false }
            })

            // console.log('res data: ', res.data)

            if (res.data?.releaseBlog) {
                dispatch({
                    type: "ADD_RELEASE_BLOG",
                    payload: { projectId, blog: res.data.releaseBlog }
                })
            }

            toast({
                title: "Release Sync Started 🚀",
                description: "Release sync has been triggered. You'll receive real-time updates.",
                variant: "default",
            })
        } catch (error: any) {
            dispatch({
                type: "SET_IS_SYNCING_RELEASE",
                payload: { projectId, isLoading: false }
            })

            toast({
                title: "Error ⭕",
                description: error?.response?.data?.message || "Failed to sync release",
                variant: "destructive",
            })
        }
    }

    const fetchReleaseBlogForProject = async (projectId: string) => {
        try {
            dispatch({ type: "SET_IS_RELEASE_BLOG_LOADING", payload: true })
            const res = await axios.get(`${API_BASE}/api/release-blogs/get-release-blogs/${projectId}`, {
                headers: {
                    'Authorization': `Bearer ${session?.accessToken}`,
                    'X-GitHub-Token': `Bearer ${session?.user?.githubAccessToken}`,
                }
            })
            dispatch({
                type: "SET_RELEASE_BLOGS",
                payload: {
                    projectId,
                    blogs: res.data
                }
            })
        } catch (error: any) {
            toast({
                title: "Error ⭕",
                description: error?.response?.data?.message || "Failed to fetch release blogs",
                variant: "destructive",
            })
        } finally {
            dispatch({ type: "SET_IS_RELEASE_BLOG_LOADING", payload: false })
        }
    }

    const fetchRepositoryBranches = async (githubId: string, repoName: string) => {
        try {
            const res = await axios.get(`${API_BASE}/api/github/repos/${githubId}/${repoName}/branches`, {
                headers: {
                    'Authorization': `Bearer ${session?.accessToken}`,
                    'X-GitHub-Token': `Bearer ${session?.user?.githubAccessToken}`,
                }
            })
            return res.data
        } catch (error: any) {
            toast({
                title: "Error ⭕",
                description: error?.response?.data?.message || "Failed to fetch repository branches",
                variant: "destructive",
            })
            return []
        }
    }

    const fetchProjectById = async (projectId: string) => {
        try {
            dispatch({ type: "SET_IS_PROJECT_LOADING", payload: true })
            const res = await axios.get(`${API_BASE}/api/projects/get-project/${projectId}`, {
                headers: {
                    'Authorization': `Bearer ${session?.accessToken}`,
                    'X-GitHub-Token': `Bearer ${session?.user?.githubAccessToken}`,
                }
            })
            dispatch({ type: "SET_PROJECT", payload: res.data.data })
            console.log('current project: ', res.data.data)
        } catch (error: any) {
            toast({
                title: "Error ⭕",
                description: error?.response?.data?.message || "Failed to fetch project",
                variant: "destructive",
            })
            router.push(`/u/${session?.user?.username}?tab=projects`)
        } finally {
            dispatch({ type: "SET_IS_PROJECT_LOADING", payload: false })
        }
    }

    const fetchReleaseBlogById = async (releaseBlogId: string, projectId: string) => {
        try {
            dispatch({ type: "SET_IS_CURR_RELEASE_BLOG_LOADING", payload: true })
            // console.log('fetching release blog by id: ', releaseBlogId, projectId);

            const res = await axios.get(`${API_BASE}/api/release-blogs/get-release-blog/${projectId}/${releaseBlogId}`,
                {
                    headers: {
                        'Authorization': `Bearer ${session?.accessToken}`,
                        'X-GitHub-Token': `Bearer ${session?.user?.githubAccessToken}`,
                    }
                }
            )
            dispatch({ type: "SET_CURR_RELEASE_BLOG", payload: res.data.data })
        } catch (error: any) {
            toast({
                title: "Error ⭕",
                description: error?.response?.data?.message || "Failed to fetch release blog",
                variant: "destructive",
            })
            router.push(`/u/${session?.user?.username}?tab=projects`);
        } finally {
            dispatch({ type: "SET_IS_CURR_RELEASE_BLOG_LOADING", payload: false });
        }
    }

    const changeReleaseBlog = (blog: any) => {
        dispatch({ type: "SET_CURR_RELEASE_BLOG", payload: blog })
    }

    const { connected, lastMessage } = useWebSocket(project_id)

    // Handle WebSocket connection status
    useEffect(() => {
        // console.log('WebSocket connected: ', connected)
        dispatch({ type: "SET_WEBSOCKET_STATUS", payload: connected })
    }, [connected])


    // Handle incoming WebSocket messages
    useEffect(() => {
        if (lastMessage) {

            dispatch({
                type: "SET_RELEASE_SYNC_STATUS",
                payload: {
                    projectId: lastMessage.projectId,
                    message: lastMessage.message,
                    timestamp: lastMessage.timestamp,
                    status: lastMessage.status
                }
            })

            // Handle sync completion - turn off loading state
            if (lastMessage?.status === 'READY' || lastMessage?.status === 'ERROR') {
                dispatch({
                    type: "SET_IS_SYNCING_RELEASE",
                    payload: { projectId: lastMessage.projectId, isLoading: false }
                })

                if (lastMessage.status === 'READY') {
                    if (lastMessage?.releaseBlog) {
                        dispatch({
                            type: "ADD_RELEASE_BLOG",
                            payload: {
                                projectId: lastMessage?.projectId,
                                blog: lastMessage?.releaseBlog
                            }
                        })
                    } else {
                        fetchReleaseBlogForProject(lastMessage?.projectId)
                    }

                    toast({
                        title: "Release Ready ✅",
                        description: lastMessage.message,
                        variant: "default",
                    })
                } else if (lastMessage.status === 'ERROR') {
                    toast({
                        title: "Release Failed ❌",
                        description: lastMessage.message,
                        variant: "destructive",
                    })
                }
            } else if (lastMessage.status === 'BUILDING') {
                // Show building status as info toast
                toast({
                    title: "Building Release 🔄",
                    description: lastMessage.message,
                    variant: "default",
                })
            }
        }
    }, [lastMessage])


    // Add clearReleaseSyncStatus function
    const clearReleaseSyncStatus = (projectId: string) => {
        dispatch({ type: "CLEAR_RELEASE_SYNC_STATUS", payload: projectId })
    }

    const loadMore = () => {
        if (!state.pagination?.hasMore) return;
        fetchAllProjects({ cursor: state.pagination.nextCursor, limit: 5 });
    };


    useEffect(() => {
        if (status === "authenticated") {
            fetchAllProjects({ limit: 5 });

            if (project_id && session?.user?.githubAccessToken) {
                fetchProjectById(project_id);

                if (releaseBlogId && session?.user?.githubAccessToken) {
                    fetchReleaseBlogById(releaseBlogId, project_id)
                }
            }
        }
    }, [status, project_id, releaseBlogId])

    return (
        <InsertProjectContext.Provider
            value={{
                ...state,
                changeReleaseBlog,
                fetchProjectsByUsername,
                fetchProjectById,
                fetchAllProjects,
                importReposByGithubUserId,
                loadMore,
                addProject,
                updateProject,
                removeProject,
                setGithubRepos,
                addReleaseBlog,
                updateReleaseBlog,
                removeReleaseBlog,
                syncRelease,
                fetchReleaseBlogForProject,
                fetchRepositoryBranches,
                clearReleaseSyncStatus,
                fetchReleaseBlogById,
            }}
        >
            {children}
        </InsertProjectContext.Provider>
    )
}

export const useInsertProjects = () => {
    const context = useContext(InsertProjectContext)
    if (!context) {
        throw new Error("InsertProjectProvider must be wrapped properly")
    }
    return context
}