import { toast } from "@/components/ui/use-toast"
import { Project, ReleaseBlog } from "@/types/types"
import axios from "axios"
import { createContext, useContext, useReducer } from "react"
import InsertProjectReducer from "../reducer/InsertProjectReducer"



interface InsertProjectProviderProps {
    projects: Project[]
    githubRepos: any[]
    isProjectLoading: boolean

    fetchProjects: (username: string) => void
    addProject: (project: Partial<Project>) => void
    updateProject: (project: Project) => void
    removeProject: (projectId: string) => void

    setGithubRepos: (repos: any[]) => void

    addReleaseBlog: (projectId: string, blog: ReleaseBlog) => void
    updateReleaseBlog: (projectId: string, blog: ReleaseBlog) => void
    removeReleaseBlog: (projectId: string, blogId: string) => void
}

const initialState: InsertProjectProviderProps = {
    projects: [],
    githubRepos: [],
    isProjectLoading: false,

    fetchProjects: (username: string) => {},
    addProject: (project: Partial<Project>) => {},
    updateProject: (project: Project) => {},
    removeProject: (projectId: string) => {},

    setGithubRepos: (repos: any[]) => {},

    addReleaseBlog: (projectId: string, blog: ReleaseBlog) => {},
    updateReleaseBlog: (projectId: string, blog: ReleaseBlog) => {},
    removeReleaseBlog: (projectId: string, blogId: string) => {},
}

const InsertProjectContext = createContext<InsertProjectProviderProps | null>(null)

// Provider
export const InsertProjectProvider = ({ children }: { children: React.ReactNode }) => {
    const [state, dispatch] = useReducer(InsertProjectReducer, initialState)

    // Fetch projects for a user
    const fetchProjects = async (username: string) => {
        try {
            dispatch({ type: "SET_IS_PROJECT_LOADING", payload: true })
            const res = await axios.get(`/api/get-projects?username=${username}`)
            if (res.data.success) {
                dispatch({ type: "SET_PROJECTS", payload: res.data.projects })
            } else {
                toast({
                    title: "Error",
                    description: res.data.message,
                    variant: "destructive",
                })
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to fetch projects",
                variant: "destructive",
            })
        } finally {
            dispatch({ type: "SET_IS_PROJECT_LOADING", payload: false })
        }
    }

    // Add a new project
    const addProject = async (project: Partial<Project>) => {
        try {
            dispatch({ type: "SET_IS_PROJECT_LOADING", payload: true })
            const res = await axios.post(`/api/add-project`, project)
            if (res.data.success) {
                dispatch({ type: "ADD_PROJECT", payload: res.data.project })
                toast({
                    title: "Success",
                    description: "Project added successfully",
                    variant: "default",
                })
            } else {
                toast({
                    title: "Error",
                    description: res.data.message,
                    variant: "destructive",
                })
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to add project",
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
            const res = await axios.put(`/api/update-project/${project.id}`, project)
            if (res.data.success) {
                dispatch({ type: "UPDATE_PROJECT", payload: res.data.project })
                toast({
                    title: "Success",
                    description: "Project updated successfully",
                    variant: "default",
                })
            } else {
                toast({
                    title: "Error",
                    description: res.data.message,
                    variant: "destructive",
                })
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to update project",
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
            const res = await axios.delete(`/api/delete-project/${projectId}`)
            if (res.data.success) {
                dispatch({ type: "REMOVE_PROJECT", payload: projectId })
                toast({
                    title: "Success",
                    description: "Project removed successfully",
                    variant: "default",
                })
            } else {
                toast({
                    title: "Error",
                    description: res.data.message,
                    variant: "destructive",
                })
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to remove project",
                variant: "destructive",
            })
        } finally {
            dispatch({ type: "SET_IS_PROJECT_LOADING", payload: false })
        }
    }

    // Set GitHub repos
    const setGithubRepos = (repos: any[]) => {
        dispatch({ type: "SET_GITHUB_REPOS", payload: repos })
    }

    // Add a release blog to a project
    const addReleaseBlog = (projectId: string, blog: ReleaseBlog) => {
        dispatch({ type: "ADD_RELEASE_BLOG", payload: { projectId, blog } })
    }

    // Update a release blog in a project
    const updateReleaseBlog = (projectId: string, blog: ReleaseBlog) => {
        dispatch({ type: "UPDATE_RELEASE_BLOG", payload: { projectId, blog } })
    }

    // Remove a release blog from a project
    const removeReleaseBlog = (projectId: string, blogId: string) => {
        dispatch({ type: "REMOVE_RELEASE_BLOG", payload: { projectId, blogId } })
    }

    return (
        <InsertProjectContext.Provider
            value={{
                projects: state.projects,
                githubRepos: state.githubRepos,
                isProjectLoading: state.isProjectLoading,

                fetchProjects,
                addProject,
                updateProject,
                removeProject,

                setGithubRepos,

                addReleaseBlog,
                updateReleaseBlog,
                removeReleaseBlog,
            }}
        >
            {children}
        </InsertProjectContext.Provider>
    )
}

// Custom hook
export const useInsertProjects = () => {
    const context = useContext(InsertProjectContext)
    if (!context) {
        throw new Error("InsertProjectProvider must be wrapped properly")
    }
    return context
}