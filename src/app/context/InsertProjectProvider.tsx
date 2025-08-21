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

const API_BASE = "http://localhost:8080"

interface InsertProjectProviderProps {
    all_projects: Project[]
    user_projects: Project[],
    githubRepos: any[],
    releaseBlogs: any[],

    isGithubReposLoading: boolean
    isAllProjectsLoading: boolean
    isUserProjectsLoading: boolean
    isProjectLoading: boolean
    isReleaseBlogLoading?: boolean

    fetchAllProjects: () => void
    fetchProjectsByUserGithubId: (githubId: number) => void
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
}

const initialState = {
    all_projects: [],
    user_projects: [],
    releaseBlogs: [],
    githubRepos: [],

    isGithubReposLoading: false,
    isAllProjectsLoading: false,
    isUserProjectsLoading: false,

    isProjectLoading: false,
    isReleaseBlogLoading: false,

    fetchAllProjects: () => {},
    fetchProjectsByUserGithubId: (_: number) => {},
    fetchProjectsByUsername: (_: string) => {},
    addProject: (_: Partial<Project>) => {},
    updateProject: (_: Project) => {},
    removeProject: (_: string) => {},
    setGithubRepos: (_: any[]) => {},
    addReleaseBlog: (_: string, __: ReleaseBlog) => {},
    updateReleaseBlog: (_: string, __: ReleaseBlog) => {},
    removeReleaseBlog: (_: string, __: string) => {},
    syncRelease: (_: string) => Promise<void>,
    fetchReleaseBlogForProject: (projectId: string) => Promise<void>
}

const InsertProjectContext = createContext<InsertProjectProviderProps|null>(null)

export const InsertProjectProvider = ({ children }: { children: React.ReactNode }) => {
    const [state, dispatch] = useReducer(InsertProjectReducer, initialState)

    const { data: session, status } = useSession()
    const { user } = useInsertUser()

    const params = useParams()
    const param_username = params.username as string
    const project_id = params.id as string;
    const router = useRouter()

    const fetchProjectsByUserGithubId = async (githubId: number) => {
        try {
            dispatch({ type: "SET_IS_GITHUB_REPOS_LOADING", payload: true })
            const res = await axios.get(`${API_BASE}/github/repos/${githubId}`,
                {
                    headers: {
                        Authorization: `Bearer ${session?.user?.githubAccessToken}`
                    }
                }
            )
            dispatch({ type: "SET_GITHUB_REPOS", payload: res.data })
        } catch (error: any) {
            toast({
                title: "Error",
                description: error?.response?.data?.message || "Failed to fetch projects",
                variant: "destructive",
            })
        } finally {
            dispatch({ type: "SET_IS_GITHUB_REPOS_LOADING", payload: false })
        }
    }

    const fetchProjectsByUsername = async (username: string) => {
        try {
            dispatch({ type: "SET_IS_USER_PROJECTS_LOADING", payload: true })
            const res = await axios.get(`${API_BASE}/projects/user/${username}`)
            dispatch({ type: "SET_USER_PROJECTS", payload: res.data })
        } catch (error: any) {
            toast({
                title: "Error",
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
            const githubId = user?.githubId
            if (!githubId) throw new Error("No githubId found in user")
            const res = await axios.get(`${API_BASE}/projects`)
            dispatch({ type: "SET_ALL_PROJECTS", payload: res.data })
        } catch (error: any) {
            toast({
                title: "Error",
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
            const res = await axios.post(`${API_BASE}/projects`, project)
            dispatch({ type: "ADD_PROJECT", payload: res.data })
            toast({
                title: "Success",
                description: "Project added successfully",
                variant: "default",
            })
        } catch (error: any) {
            toast({
                title: "Error",
                description: error?.response?.data?.message || "Failed to add project",
                variant: "destructive",
            })
        } finally {
            dispatch({ type: "SET_IS_PROJECT_LOADING", payload: false })
        }
    }

    // Update a project
    const updateProject = async (project: Project) => {
        try {
            dispatch({ type: "SET_IS_PROJECT_LOADING", payload: true })
            const res = await axios.put(`${API_BASE}/projects/${project.id}`, project)
            dispatch({ type: "UPDATE_PROJECT", payload: res.data })
            toast({
                title: "Success",
                description: "Project updated successfully",
                variant: "default",
            })
        } catch (error: any) {
            toast({
                title: "Error",
                description: error?.response?.data?.message || "Failed to update project",
                variant: "destructive",
            })
        } finally {
            dispatch({ type: "SET_IS_PROJECT_LOADING", payload: false })
        }
    }

    // Remove a project
    const removeProject = async (projectId: string) => {
        try {
            dispatch({ type: "SET_IS_PROJECT_LOADING", payload: true })
            await axios.delete(`${API_BASE}/projects/${projectId}`)
            dispatch({ type: "REMOVE_PROJECT", payload: projectId })
            toast({
                title: "Success",
                description: "Project removed successfully",
                variant: "default",
            })
        } catch (error: any) {
            toast({
                title: "Error",
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
            const res = await axios.post(`${API_BASE}/projects/${projectId}/release-blogs`, blog)
            dispatch({ type: "ADD_RELEASE_BLOG", payload: { projectId, blog: res.data } })
            toast({
                title: "Success",
                description: "Release blog added successfully",
                variant: "default",
            })
        } catch (error: any) {
            toast({
                title: "Error",
                description: error?.response?.data?.message || "Failed to add release blog",
                variant: "destructive",
            })
        }
    }

    // Update a release blog in a project (API)
    const updateReleaseBlog = async (projectId: string, blog: ReleaseBlog) => {
        try {
            const res = await axios.put(`${API_BASE}/projects/${projectId}/release-blogs/${blog.id}`, blog)
            dispatch({ type: "UPDATE_RELEASE_BLOG", payload: { projectId, blog: res.data } })
            toast({
                title: "Success",
                description: "Release blog updated successfully",
                variant: "default",
            })
        } catch (error: any) {
            toast({
                title: "Error",
                description: error?.response?.data?.message || "Failed to update release blog",
                variant: "destructive",
            })
        }
    }

    // Remove a release blog from a project (API)
    const removeReleaseBlog = async (projectId: string, blogId: string) => {
        try {
            await axios.delete(`${API_BASE}/projects/${projectId}/release-blogs/${blogId}`)
            dispatch({ type: "REMOVE_RELEASE_BLOG", payload: { projectId, blogId } })
            toast({
                title: "Success",
                description: "Release blog removed successfully",
                variant: "default",
            })
        } catch (error: any) {
            toast({
                title: "Error",
                description: error?.response?.data?.message || "Failed to remove release blog",
                variant: "destructive",
            })
        }
    }

    // Optionally: Sync releases for a project
    const syncRelease = async (projectId: string) => {
        try {
            await axios.post(`${API_BASE}/release/${projectId}/sync-release`)
            toast({
                title: "Success",
                description: "Release sync triggered",
                variant: "default",
            })
        } catch (error: any) {
            toast({
                title: "Error",
                description: error?.response?.data?.message || "Failed to sync release",
                variant: "destructive",
            })
        }
    }

    const fetchReleaseBlogForProject = async (projectId: string) => {
        try {
            dispatch({ type: "SET_IS_RELEASE_BLOG_LOADING", payload: true })
            const res = await axios.get(`${API_BASE}/projects/${projectId}/release-blogs`)
            dispatch({ type: "SET_RELEASE_BLOGS", payload: { projectId, blogs: res.data } })
        } catch (error: any) {
            toast({
                title: "Error",
                description: error?.response?.data?.message || "Failed to fetch release blogs",
                variant: "destructive",
            })
        } finally {
            dispatch({ type: "SET_IS_RELEASE_BLOG_LOADING", payload: false })
        }
    }

    useEffect(() => {
        if (status === "authenticated") {
            // Fetch projects for the logged-in user's GitHub ID
            if (session?.user?.username && session.user.githubId) {
                fetchProjectsByUsername(session.user.username)
                fetchProjectsByUserGithubId(session.user.githubId)
            }
            // If no username param in route, fetch by session username
            if (!param_username && session?.user?.username) {
                // You need to define getProjectsByUsername or use fetchProjectsByUserGithubId if appropriate
                //fetchProjectsByUserGithubId(session.user.githubId)
                // fetchProjectsByUsername(session.user.username)
            }
        }
    }, [status, session?.user?.githubId, param_username])

    useEffect(() => {
        if (status === "authenticated" && project_id) {
            // You need to define fetchProjectById if you want to fetch a single project
            fetchReleaseBlogForProject(project_id)
        }
    }, [status, project_id])

    return (
        <InsertProjectContext.Provider
            value={{
                all_projects: state.all_projects,
                user_projects: state.user_projects,
                githubRepos: state.githubRepos,
                releaseBlogs: state.releaseBlogs,
                isGithubReposLoading: state.isGithubReposLoading,
                isAllProjectsLoading: state.isAllProjectsLoading,
                isUserProjectsLoading: state.isUserProjectsLoading,
                isProjectLoading: state.isProjectLoading,
                isReleaseBlogLoading: state.isReleaseBlogLoading,
                fetchProjectsByUsername,
                fetchAllProjects,
                fetchProjectsByUserGithubId,
                addProject,
                updateProject,
                removeProject,
                setGithubRepos,
                addReleaseBlog,
                updateReleaseBlog,
                removeReleaseBlog,
                syncRelease,
                fetchReleaseBlogForProject
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