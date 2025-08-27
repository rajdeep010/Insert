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

const API_BASE = "http://localhost:8080"

interface InsertProjectProviderProps {
    curr_project: any | null,
    all_projects: Project[],
    user_projects: Project[],
    githubRepos: any[],
    releaseBlogs: any[],

    isGithubReposLoading: boolean
    isAllProjectsLoading: boolean
    isUserProjectsLoading: boolean
    isProjectLoading: boolean
    isReleaseBlogLoading?: boolean

    webSocketConnected: boolean
    releaseSyncStatus: Record<string, {
        buildStatus: string
        message: string
        timestamp: string
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

    addReleaseBlog: (projectId: string, blog: ReleaseBlog) => void
    updateReleaseBlog: (projectId: string, blog: ReleaseBlog) => void
    removeReleaseBlog: (projectId: string, blogId: string) => void
    syncRelease: (projectId: string) => Promise<void>
    fetchReleaseBlogForProject: (projectId: string) => Promise<void>
    fetchRepositoryBranches: (githubId: string, repoName: string, token: string) => Promise<string[]>

    clearReleaseSyncStatus: (projectId: string) => void
}

const initialState = {
    curr_project: null,
    all_projects: [],
    user_projects: [],
    releaseBlogs: [],
    githubRepos: [],

    isGithubReposLoading: false,
    isAllProjectsLoading: false,
    isUserProjectsLoading: false,

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
    addReleaseBlog: (_: string, __: ReleaseBlog) => { },
    updateReleaseBlog: (_: string, __: ReleaseBlog) => { },
    removeReleaseBlog: (_: string, __: string) => { },
    syncRelease: (_: string) => Promise<void>,
    fetchReleaseBlogForProject: (projectId: string) => Promise<void>,
    fetchRepositoryBranches: (githubId: string, repoName: string, token: string) => Promise<string[]>,
    clearReleaseSyncStatus: (projectId: string) => { }
}

const InsertProjectContext = createContext<InsertProjectProviderProps | null>(null)

export const InsertProjectProvider = ({ children }: { children: React.ReactNode }) => {
    const [state, dispatch] = useReducer(InsertProjectReducer, initialState)

    const { data: session, status } = useSession()
    const { user } = useInsertUser()

    const params = useParams()
    const param_username = params.username as string
    const project_id = params.id as string;
    const router = useRouter()

    const importReposByGithubUserId = async (githubId: number) => {
        try {
            dispatch({ type: "SET_IS_GITHUB_REPOS_LOADING", payload: true })
            const res = await axios.get(`${API_BASE}/api/github/repos/${githubId}`,
                {
                    headers: {
                        Authorization: `Bearer ${session?.user?.githubAccessToken}`
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
            if(status == "unauthenticated"){
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

    const fetchAllProjects = async () => {
        try {
            dispatch({ type: "SET_IS_ALL_PROJECT_LOADING", payload: true })

            const res = await axios.get(`${API_BASE}/api/projects`, {
                headers: {
                    Authorization: `Bearer ${session?.accessToken}`
                }
            })

            dispatch({ type: "SET_ALL_PROJECTS", payload: {projects: res.data, user: session?.user} })
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

            const res = await axios.post(`${API_BASE}/api/projects`, project)
            dispatch({ type: "ADD_PROJECT", payload: res.data?.project })
            toast({
                title: "Success ✅",
                description: "Project added successfully",
                variant: "default",
            })


            if (res.data?.projectId && res.data?.needsWebhookSetup) {
                const hookRes = await setupWebhook(res.data.projectId);
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
                description: error?.response?.data?.message || "Failed to add project",
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
                        Authorization: `Bearer ${session?.user?.githubAccessToken}`
                    }
                }
            );

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
            const res = await axios.put(`${API_BASE}/api/projects/${project.id}`, project)
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
            await axios.delete(`${API_BASE}/api/projects/delete/${projectId}`, {
                headers: {
                    'Authorization': `Bearer ${session?.user?.githubAccessToken}`
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
    const addReleaseBlog = async (projectId: string, blog: ReleaseBlog) => {
        try {
            const res = await axios.post(`${API_BASE}/api/projects/${projectId}/release-blogs`, blog)
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
    const updateReleaseBlog = async (projectId: string, blog: ReleaseBlog) => {
        try {
            const res = await axios.put(`${API_BASE}/api/projects/${projectId}/release-blogs/${blog.id}`, blog)
            dispatch({ type: "UPDATE_RELEASE_BLOG", payload: { projectId, blog: res.data } })
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
            await axios.delete(`${API_BASE}/api/projects/${projectId}/release-blogs/${blogId}`)
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

            const res = await axios.post(`${API_BASE}/api/release/${projectId}/sync-release`)
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
            const res = await axios.get(`${API_BASE}/api/projects/${projectId}/release-blogs`)
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

    const fetchRepositoryBranches = async (githubId: string, repoName: string, token: string) => {
        try {
            const res = await axios.get(`${API_BASE}/api/github/repos/${githubId}/${repoName}/branches`, {
                headers: {
                    Authorization: `Bearer ${token}`
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
``
    const fetchProjectById = async (projectId: string) => {
        try {
            dispatch({ type: "SET_IS_PROJECT_LOADING", payload: true })
            const res = await axios.get(`${API_BASE}/api/projects/${projectId}`)
            dispatch({ type: "SET_PROJECT", payload: res.data })
        } catch (error: any) {
            toast({
                title: "Error ⭕",
                description: error?.response?.data?.message || "Failed to fetch project",
                variant: "destructive",
            })
        } finally {
            dispatch({ type: "SET_IS_PROJECT_LOADING", payload: false })
        }
    }

    const { connected, lastMessage } = useWebSocket(project_id)

    // Handle WebSocket connection status
    useEffect(() => {
        dispatch({ type: "SET_WEBSOCKET_STATUS", payload: connected })
    }, [connected])


    // Handle incoming WebSocket messages
    useEffect(() => {
        if (lastMessage) {

            dispatch({
                type: "SET_RELEASE_SYNC_STATUS",
                payload: {
                    projectId: lastMessage.projectId,
                    buildStatus: lastMessage.buildStatus,
                    message: lastMessage.message,
                    timestamp: lastMessage.timestamp
                }
            })

            // Handle sync completion - turn off loading state
            if (lastMessage?.buildStatus === 'READY' || lastMessage?.buildStatus === 'ERROR') {
                dispatch({
                    type: "SET_IS_SYNCING_RELEASE",
                    payload: { projectId: lastMessage.projectId, isLoading: false }
                })

                if (lastMessage.buildStatus === 'READY') {
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
                } else if (lastMessage.buildStatus === 'ERROR') {
                    toast({
                        title: "Release Failed ❌",
                        description: lastMessage.message,
                        variant: "destructive",
                    })
                }
            } else if (lastMessage.buildStatus === 'BUILDING') {
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

    useEffect(() => {
        if (status === "authenticated") {
            fetchAllProjects()
            // fetchProjectsByUsername(param_username)
        }
    }, [status])

    useEffect(() => {
        if (status === "authenticated" && project_id) {
            fetchProjectById(project_id)
        }
    }, [status, project_id])

    return (
        <InsertProjectContext.Provider
            value={{
                curr_project: state.curr_project,
                all_projects: state.all_projects,
                user_projects: state.user_projects,
                githubRepos: state.githubRepos,
                releaseBlogs: state.releaseBlogs,
                isGithubReposLoading: state.isGithubReposLoading,
                isAllProjectsLoading: state.isAllProjectsLoading,
                isUserProjectsLoading: state.isUserProjectsLoading,
                isProjectLoading: state.isProjectLoading,
                isReleaseBlogLoading: state.isReleaseBlogLoading,

                webSocketConnected: state.webSocketConnected,
                releaseSyncStatus: state.releaseSyncStatus,
                isSyncingRelease: state.isSyncingRelease,

                fetchProjectsByUsername,
                fetchProjectById,
                fetchAllProjects,
                importReposByGithubUserId,
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
                clearReleaseSyncStatus
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