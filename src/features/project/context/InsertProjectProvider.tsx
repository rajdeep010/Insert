'use client'
import { toast } from "@/components/ui/use-toast"
import type { Project } from "@/types/project"
import axios from "axios"
import { createContext, useCallback, useContext, useEffect, useReducer } from "react"
import InsertProjectReducer from "@/features/project/reducers/InsertProjectReducer"
import { useInsertUser } from "@/features/user/context/InsertUserProvider"
import { useSession } from "next-auth/react"
import { useParams, useRouter } from "next/navigation"
import { useWebSocket } from "@/hooks/use-web-socket"
import { toast as sonnerToast } from 'sonner'
import { externalServices } from "@/lib/config/services"
import type {
	GitHubRepo,
	ProjectPagination,
	ProjectState,
	ReleaseBlog,
	ReleaseSyncStatusEntry,
} from "@/types/project"

type ReleaseBlogDraft = Partial<ReleaseBlog> & {
	title?: string
	visibility?: string
}

interface InsertProjectProviderProps {
	curr_project: Project | null,
	all_projects: Project[],
	user_projects: Project[],
	githubRepos: GitHubRepo[],
	releaseBlogs: ReleaseBlog[],
	currReleaseBlog: ReleaseBlog | null,
	isCurrReleaseBlogLoading: boolean,
	isGithubReposLoading: boolean
	isAllProjectsLoading: boolean
	isUserProjectsLoading: boolean
	isProjectLoading: boolean
	isReleaseBlogLoading?: boolean
	pagination: ProjectPagination
	webSocketConnected: boolean
	releaseSyncStatus: Record<string, ReleaseSyncStatusEntry | undefined>
	isSyncingRelease: Record<string, boolean>
	fetchAllProjects: (options?: { cursor?: string | null, limit?: number, search?: string }) => void
	fetchProjectById: (_: string) => void,
	importReposByGithubUserId: (githubId: number) => void
	fetchProjectsByUsername: (username: string) => void
	addProject: (project: Partial<Project>) => void
	updateProject: (project: Project) => void
	removeProject: (projectId: string) => void
	setGithubRepos: (repos: GitHubRepo[]) => void
	addReleaseBlog: (projectId: string, blog: ReleaseBlogDraft) => void
	updateReleaseBlog: (projectId: string, releaseBlogId: string, blog: Partial<ReleaseBlog>) => void
	removeReleaseBlog: (projectId: string, blogId: string) => void
	syncRelease: (projectId: string) => Promise<void>
	fetchReleaseBlogForProject: (projectId: string) => Promise<void>
	fetchRepositoryBranches: (githubId: string, repoName: string) => Promise<string[]>
	clearReleaseSyncStatus: (projectId: string) => void
	fetchReleaseBlogById: (releaseBlogId: string, projectId: string) => void
	changeReleaseBlog: (blog: ReleaseBlog | null) => void
	loadMore: () => void,
	sendFeedback: (payload: { type: 'message' | 'suggestion'; text: string }) => Promise<void>
}

const initialState: ProjectState & Pick<InsertProjectProviderProps,
	| "fetchAllProjects"
	| "fetchProjectById"
	| "importReposByGithubUserId"
	| "fetchProjectsByUsername"
	| "addProject"
	| "updateProject"
	| "removeProject"
	| "setGithubRepos"
	| "addReleaseBlog"
	| "updateReleaseBlog"
	| "removeReleaseBlog"
	| "syncRelease"
	| "fetchReleaseBlogForProject"
	| "fetchRepositoryBranches"
	| "clearReleaseSyncStatus"
	| "fetchReleaseBlogById"
	| "changeReleaseBlog"
	| "loadMore"
	| "sendFeedback"
> = {
	curr_project: null,
	all_projects: [],
	user_projects: [],
	releaseBlogs: [],
	githubRepos: [],
	currReleaseBlog: null,
	pagination: { currentPage: 1, pageSize: 12, totalItems: 0, hasMore: false, nextCursor: null },
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
	setGithubRepos: (_: GitHubRepo[]) => { },
	addReleaseBlog: (_: string, __: ReleaseBlogDraft) => { },
	updateReleaseBlog: (_: string, __: string, ___: Partial<ReleaseBlog>) => { },
	removeReleaseBlog: (_: string, __: string) => { },
	syncRelease: async (_: string) => { },
	fetchReleaseBlogForProject: async (_: string) => { },
	fetchRepositoryBranches: async (_: string, __: string) => [],
	clearReleaseSyncStatus: (_: string) => { },
	fetchReleaseBlogById: (_: string, __: string) => { },
	changeReleaseBlog: (_: ReleaseBlog | null) => { },
	loadMore: () => { },
	sendFeedback: async (_: { type: 'message' | 'suggestion'; text: string }) => { },
}

const InsertProjectContext = createContext<InsertProjectProviderProps | null>(null)

export const InsertProjectProvider = ({ children }: { children: React.ReactNode }) => {
	const API_BASE = externalServices.project.baseUrl
	const [state, dispatch] = useReducer(InsertProjectReducer, initialState)
	const { data: session, status } = useSession()
	useInsertUser()
	const params = useParams()
	const project_id = params.id as string;
	const router = useRouter()

	const importReposByGithubUserId = async (githubId: number) => {
		try {
			dispatch({ type: "SET_IS_GITHUB_REPOS_LOADING", payload: true })
			const res = await axios.get(`${API_BASE}/api/github/repos/${githubId}`, { headers: { 'Authorization': `Bearer ${session?.accessToken}`, 'X-GitHub-Token': `Bearer ${session?.user?.githubAccessToken}` } })
			dispatch({ type: "SET_GITHUB_REPOS", payload: res.data })
		} catch (error: any) {
			toast({ title: "Error ⭕", description: error?.response?.data?.message || "Failed to fetch projects", variant: "destructive" })
		} finally {
			dispatch({ type: "SET_IS_GITHUB_REPOS_LOADING", payload: false })
		}
	}

	const fetchProjectsByUsername = useCallback(async (username: string) => {
		try {
			if (status == "unauthenticated") {
				toast({ title: "Error ⭕", description: "You must be logged in to view your projects", variant: "destructive" })
				return
			}
			dispatch({ type: "SET_IS_USER_PROJECTS_LOADING", payload: true })
			const res = await axios.get(`${API_BASE}/api/projects/user/${username}`, { headers: { Authorization: `Bearer ${session?.accessToken}` } })
			const projects = Array.isArray(res.data?.data?.items)
				? res.data.data.items
				: Array.isArray(res.data?.data)
					? res.data.data
					: Array.isArray(res.data)
						? res.data
						: []
			dispatch({ type: "SET_USER_PROJECTS", payload: projects })
		} catch (error: any) {
			toast({ title: "Error ⭕", description: error?.response?.data?.message || "Failed to fetch projects", variant: "destructive" })
		} finally {
			dispatch({ type: "SET_IS_USER_PROJECTS_LOADING", payload: false })
		}
	}, [API_BASE, session?.accessToken, status])

	const fetchAllProjects = async ({ cursor, limit = 5, search }: { cursor?: string | null; limit?: number; search?: string } = {}) => {
		try {
			dispatch({ type: "SET_IS_ALL_PROJECTS_LOADING", payload: true })
			const res = await axios.get(`${API_BASE}/api/projects/list-projects`, { headers: { Authorization: `Bearer ${session?.accessToken}` }, params: { cursor, limit, search } })
			const { items, nextCursor, hasMore, count } = res.data.data;
			const payload = {
				projects: items,
				meta: {
					currentPage: cursor ? state.pagination.currentPage + 1 : 1,
					pageSize: limit,
					totalItems: count,
					hasMore,
					nextCursor: nextCursor ?? null,
				},
				user: session?.user ? { _id: session.user._id ?? null } : null,
			}
			if (cursor) {
				dispatch({ type: "APPEND_ALL_PROJECTS", payload })
			} else {
				dispatch({ type: "SET_ALL_PROJECTS", payload })
			}
		} catch (error: any) {
			toast({ title: "Error ⭕", description: error?.response?.data?.message || "Failed to fetch projects", variant: "destructive" })
		} finally {
			dispatch({ type: "SET_IS_ALL_PROJECTS_LOADING", payload: false })
		}
	}

	const setupWebhook = async (projectId: string) => {
		try {
			const result = await axios.post(`${API_BASE}/api/webhook/auto-setup/${projectId}`, {}, { headers: { 'Authorization': `Bearer ${session?.accessToken}`, 'X-GitHub-Token': `Bearer ${session?.user?.githubAccessToken}` } });
			if (result?.data?.webhookCreated) return true
			throw new Error('Webhook setup failed');
		} catch (error) {
			console.error('Webhook setup failed:', error);
			return false
		}
	};

	const addProject = async (project: Partial<Project>) => {
		try {
			dispatch({ type: "SET_IS_PROJECT_LOADING", payload: true })
			const res = await axios.post(`${API_BASE}/api/projects/create-project`, project, { headers: { 'Authorization': `Bearer ${session?.accessToken}`, 'X-GitHub-Token': `Bearer ${session?.user?.githubAccessToken}` } })
			dispatch({ type: "ADD_PROJECT", payload: res.data?.data })
			toast({ title: "Success ✅", description: "Project added successfully", variant: "default" })
			if (res.data?.data?.id && res.data?.data?.monitorCommits) {
				const hookRes = await setupWebhook(res.data.data.id);
				toast({ title: hookRes ? "Success ✅" : "Error ⭕", description: hookRes ? "Project will be monitored for changes." : "Failed to setup the monitoring, ask admin", variant: hookRes ? "default" : "destructive" });
			}
		} catch (error: any) {
			toast({ title: "Error ⭕", description: error?.response?.data || "Failed to add project", variant: "destructive" })
		} finally {
			dispatch({ type: "SET_IS_PROJECT_LOADING", payload: false })
		}
	}

	const updateProject = async (project: Project) => {
		try {
			dispatch({ type: "SET_IS_PROJECT_LOADING", payload: true })
			const res = await axios.put(`${API_BASE}/api/projects/update-project/${project.id}`, project, { headers: { 'Authorization': `Bearer ${session?.accessToken}`, 'X-GitHub-Token': `Bearer ${session?.user?.githubAccessToken}` } })
			dispatch({ type: "UPDATE_PROJECT", payload: res.data.data })
			toast({ title: "Success ✅", description: "Project updated successfully", variant: "default" })
		} catch (error: any) {
			toast({ title: "Error ⭕", description: error?.response?.data?.message || "Failed to update project", variant: "destructive" })
		} finally {
			dispatch({ type: "SET_IS_PROJECT_LOADING", payload: false })
		}
	}

	const removeProject = async (projectId: string) => {
		try {
			dispatch({ type: "SET_IS_PROJECT_LOADING", payload: true })
			await axios.delete(`${API_BASE}/api/projects/delete-project/${projectId}`, { headers: { 'Authorization': `Bearer ${session?.accessToken}`, 'X-GitHub-Token': `Bearer ${session?.user?.githubAccessToken}` } })
			dispatch({ type: "REMOVE_PROJECT", payload: projectId })
			toast({ title: "Success ✅", description: "Project removed successfully", variant: "default" })
		} catch (error: any) {
			toast({ title: "Error ⭕", description: error?.response?.data?.message || "Failed to remove project", variant: "destructive" })
		} finally {
			dispatch({ type: "SET_IS_PROJECT_LOADING", payload: false })
		}
	}

	const setGithubRepos = (repos: GitHubRepo[]) => dispatch({ type: "SET_GITHUB_REPOS", payload: repos })

	const addReleaseBlog = async (projectId: string, blog: ReleaseBlogDraft) => {
		try {
			const res = await axios.post(`${API_BASE}/api/release-blogs/create-release-blog/${projectId}`, { releaseTitle: blog.title, visibility: blog.visibility, status: "DRAFT", blogContent: JSON.stringify({ type: "doc", content: [{ type: "heading", attrs: { textAlign: null, level: 1 }, content: [{ type: "text", text: String(blog.title ?? "") }] }, { type: "paragraph", attrs: { textAlign: null } }] }) }, { headers: { 'Authorization': `Bearer ${session?.accessToken}`, 'X-GitHub-Token': `Bearer ${session?.user?.githubAccessToken}` } })
			dispatch({ type: "ADD_RELEASE_BLOG", payload: { projectId, blog: res.data.data } })
			toast({ title: "Success ✅", description: "Release blog added successfully", variant: "default" })
		} catch (error: any) {
			toast({ title: "Error ⭕", description: error?.response?.data?.message || "Failed to add release blog", variant: "destructive" })
		}
	}

	const updateReleaseBlog = async (projectId: string, releaseBlogId: string, blog: Partial<ReleaseBlog>) => {
		try {
			const res = await axios.put(`${API_BASE}/api/release-blogs/update-release-blog/${projectId}/${releaseBlogId}`, blog, { headers: { 'Authorization': `Bearer ${session?.accessToken}`, 'X-GitHub-Token': `Bearer ${session?.user?.githubAccessToken}` } })
			dispatch({ type: "UPDATE_RELEASE_BLOG", payload: { projectId, releaseBlogId, blog: res.data.data } })
			toast({ title: "Success ✅", description: "Release blog updated successfully", variant: "default" })
		} catch (error: any) {
			toast({ title: "Error ⭕", description: error?.response?.data?.message || "Failed to update release blog", variant: "destructive" })
		}
	}

	const removeReleaseBlog = async (projectId: string, blogId: string) => {
		try {
			await axios.delete(`${API_BASE}/api/release-blogs/delete-release-blog/${projectId}/${blogId}`, { headers: { 'Authorization': `Bearer ${session?.accessToken}`, 'X-GitHub-Token': `Bearer ${session?.user?.githubAccessToken}` } })
			dispatch({ type: "REMOVE_RELEASE_BLOG", payload: { projectId, blogId } })
			toast({ title: "Success ✅", description: "Release blog removed successfully", variant: "default" })
		} catch (error: any) {
			toast({ title: "Error ⭕", description: error?.response?.data?.message || "Failed to remove release blog", variant: "destructive" })
		}
	}

	const sendFeedback = async (payload: { type: 'message' | 'suggestion'; text: string }) => {
		try {
			const text = payload?.text?.trim() || ''
			if (!text) {
				toast({ title: "Nothing to send", description: "Please write a message before sending.", variant: "destructive" })
				return
			}
			const res = await axios.post(`${API_BASE}/api/feedback/send-message`, { ...payload }, { headers: { Authorization: `Bearer ${session?.accessToken}` } })
			if (res.data.success) sonnerToast.success('Sent successfully', { description: `Your ${payload.type === 'suggestion' ? 'suggestion' : 'message'} has been sent.` })
			else sonnerToast.error('Failed to send feedback', { description: res.data.message || "Failed to send feedback" })
		} catch (error: any) {
			sonnerToast.error('Failed to send feedback', { description: error?.response?.data?.message || "Failed to send feedback" })
		}
	}

	const syncRelease = async (projectId: string) => {
		try {
			dispatch({ type: "SET_IS_SYNCING_RELEASE", payload: { projectId, isLoading: true } })
			clearReleaseSyncStatus(projectId)
			const res = await axios.post(`${API_BASE}/api/release/${projectId}/sync-release`, {}, { headers: { 'Authorization': `Bearer ${session?.accessToken}`, 'X-GitHub-Token': `Bearer ${session?.user?.githubAccessToken}` } })
			dispatch({ type: "SET_IS_SYNCING_RELEASE", payload: { projectId, isLoading: false } })
			if (res.data?.releaseBlog) dispatch({ type: "ADD_RELEASE_BLOG", payload: { projectId, blog: res.data.releaseBlog } })
			toast({ title: "Release Sync Started 🚀", description: "Release sync has been triggered. You'll receive real-time updates.", variant: "default" })
		} catch (error: any) {
			dispatch({ type: "SET_IS_SYNCING_RELEASE", payload: { projectId, isLoading: false } })
			toast({ title: "Error ⭕", description: error?.response?.data?.message || "Failed to sync release", variant: "destructive" })
		}
	}

	const fetchReleaseBlogForProject = async (projectId: string) => {
		try {
			dispatch({ type: "SET_IS_RELEASE_BLOG_LOADING", payload: true })
			const res = await axios.get(`${API_BASE}/api/release-blogs/get-release-blogs/${projectId}`, { headers: { 'Authorization': `Bearer ${session?.accessToken}`, 'X-GitHub-Token': `Bearer ${session?.user?.githubAccessToken}` } })
			dispatch({ type: "SET_RELEASE_BLOGS", payload: { projectId, blogs: res.data } })
		} catch (error: any) {
			toast({ title: "Error ⭕", description: error?.response?.data?.message || "Failed to fetch release blogs", variant: "destructive" })
		} finally {
			dispatch({ type: "SET_IS_RELEASE_BLOG_LOADING", payload: false })
		}
	}

	const fetchRepositoryBranches = async (githubId: string, repoName: string) => {
		try {
			const res = await axios.get(`${API_BASE}/api/github/repos/${githubId}/${repoName}/branches`, { headers: { 'Authorization': `Bearer ${session?.accessToken}`, 'X-GitHub-Token': `Bearer ${session?.user?.githubAccessToken}` } })
			return res.data
		} catch (error: any) {
			toast({ title: "Error ⭕", description: error?.response?.data?.message || "Failed to fetch repository branches", variant: "destructive" })
			return []
		}
	}

	const fetchProjectById = async (projectId: string) => {
		try {
			dispatch({ type: "SET_IS_PROJECT_LOADING", payload: true })
			const res = await axios.get(`${API_BASE}/api/projects/get-project/${projectId}`, { headers: { 'Authorization': `Bearer ${session?.accessToken}`, 'X-GitHub-Token': `Bearer ${session?.user?.githubAccessToken}` } })
			dispatch({ type: "SET_PROJECT", payload: res.data.data })
		} catch (error: any) {
			toast({ title: "Error ⭕", description: error?.response?.data?.message || "Failed to fetch project", variant: "destructive" })
			router.push(`/u/${session?.user?.username}?tab=projects`)
		} finally {
			dispatch({ type: "SET_IS_PROJECT_LOADING", payload: false })
		}
	}

	const fetchReleaseBlogById = async (releaseBlogId: string, projectId: string) => {
		try {
			dispatch({ type: "SET_IS_CURR_RELEASE_BLOG_LOADING", payload: true })
			const res = await axios.get(`${API_BASE}/api/release-blogs/get-release-blog/${projectId}/${releaseBlogId}`, { headers: { 'Authorization': `Bearer ${session?.accessToken}`, 'X-GitHub-Token': `Bearer ${session?.user?.githubAccessToken}` } })
			dispatch({ type: "SET_CURR_RELEASE_BLOG", payload: res.data.data })
		} catch (error: any) {
			toast({ title: "Error ⭕", description: error?.response?.data?.message || "Failed to fetch release blog", variant: "destructive" })
			router.push(`/u/${session?.user?.username}?tab=projects`)
		} finally {
			dispatch({ type: "SET_IS_CURR_RELEASE_BLOG_LOADING", payload: false })
		}
	}

	const changeReleaseBlog = (blog: ReleaseBlog | null) => dispatch({ type: "SET_CURR_RELEASE_BLOG", payload: blog })
	const { connected, lastMessage } = useWebSocket(project_id)

	useEffect(() => {
		dispatch({ type: "SET_WEBSOCKET_STATUS", payload: connected })
	}, [connected])

	useEffect(() => {
		if (lastMessage) {
			dispatch({ type: "SET_RELEASE_SYNC_STATUS", payload: { projectId: lastMessage.projectId, message: lastMessage.message, timestamp: lastMessage.timestamp, status: lastMessage.status } })
			if (lastMessage?.status === 'READY' || lastMessage?.status === 'ERROR') {
				dispatch({ type: "SET_IS_SYNCING_RELEASE", payload: { projectId: lastMessage.projectId, isLoading: false } })
				if (lastMessage.status === 'READY') {
					if (lastMessage?.releaseBlog) dispatch({ type: "ADD_RELEASE_BLOG", payload: { projectId: lastMessage?.projectId, blog: lastMessage?.releaseBlog } })
					toast({ title: "Release Ready ✅", description: lastMessage.message, variant: "default" })
				} else {
					toast({ title: "Release Failed ❌", description: lastMessage.message, variant: "destructive" })
				}
			} else if (lastMessage.status === 'BUILDING') {
				toast({ title: "Building Release 🔄", description: lastMessage.message, variant: "default" })
			}
		}
	}, [lastMessage])

	const clearReleaseSyncStatus = (projectId: string) => dispatch({ type: "CLEAR_RELEASE_SYNC_STATUS", payload: projectId })
	const loadMore = () => {
		if (!state.pagination?.hasMore) return;
		fetchAllProjects({ cursor: state.pagination.nextCursor, limit: 5 });
	};

	return (
		<InsertProjectContext.Provider value={{ ...state, changeReleaseBlog, fetchProjectsByUsername, fetchProjectById, fetchAllProjects, importReposByGithubUserId, loadMore, addProject, updateProject, removeProject, setGithubRepos, addReleaseBlog, updateReleaseBlog, removeReleaseBlog, syncRelease, fetchReleaseBlogForProject, fetchRepositoryBranches, clearReleaseSyncStatus, fetchReleaseBlogById, sendFeedback }}>
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