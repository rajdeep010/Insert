import type {
	Project,
	ProjectPagination,
	ProjectState,
	ReleaseBlog,
	ReleaseSyncStatusEntry,
} from "@/types/project"

type ProjectReducerAction =
	| { type: "SET_IS_USER_PROJECTS_LOADING"; payload: boolean }
	| { type: "SET_IS_CURR_RELEASE_BLOG_LOADING"; payload: boolean }
	| { type: "SET_CURR_RELEASE_BLOG"; payload: ReleaseBlog | null }
	| { type: "SET_IS_ALL_PROJECTS_LOADING"; payload: boolean }
	| { type: "SET_USER_PROJECTS"; payload: Project[] }
	| { type: "SET_ALL_PROJECTS"; payload: { projects: Project[]; meta: ProjectPagination; user?: { _id?: string | null } | null } }
	| { type: "APPEND_ALL_PROJECTS"; payload: { projects: Project[]; meta: ProjectPagination; user?: { _id?: string | null } | null } }
	| { type: "SET_IS_RELEASE_BLOG_LOADING"; payload: boolean }
	| { type: "SET_IS_GITHUB_REPOS_LOADING"; payload: boolean }
	| { type: "SET_GITHUB_REPOS"; payload: Array<Record<string, unknown>> }
	| { type: "SET_PROJECT"; payload: Project | null }
	| { type: "SET_IS_PROJECT_LOADING"; payload: boolean }
	| { type: "ADD_PROJECT"; payload: Project }
	| { type: "UPDATE_PROJECT"; payload: Partial<Project> & { id: string } }
	| { type: "REMOVE_PROJECT"; payload: string }
	| { type: "SET_RELEASE_BLOGS"; payload: { projectId: string; blogs: ReleaseBlog[] } }
	| { type: "ADD_RELEASE_BLOG"; payload: { projectId: string; blog: ReleaseBlog } }
	| { type: "UPDATE_RELEASE_BLOG"; payload: { projectId: string; releaseBlogId: string; blog: ReleaseBlog } }
	| { type: "REMOVE_RELEASE_BLOG"; payload: { projectId: string; blogId: string } }
	| { type: "SET_WEBSOCKET_STATUS"; payload: boolean }
	| { type: "SET_RELEASE_SYNC_STATUS"; payload: { projectId: string; message: string; timestamp: string; status: string } }
	| { type: "CLEAR_RELEASE_SYNC_STATUS"; payload: string }
	| { type: "SET_IS_SYNCING_RELEASE"; payload: { projectId: string; isLoading: boolean } }

const sortByCreatedAt = (blogs: ReleaseBlog[] = []) => {
	return [...blogs].sort((a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime())
}

const mergeDefined = <T extends object>(prev: T, patch: Partial<T>): T => {
	const next = { ...prev }
	;(Object.keys(patch || {}) as Array<keyof T>).forEach((key) => {
		const value = patch[key]
		if (value !== undefined) next[key] = value
	})
	return next
}

export default function InsertProjectReducer(state: ProjectState, action: ProjectReducerAction): ProjectState {
	switch (action.type) {
		case "SET_IS_USER_PROJECTS_LOADING":
			return { ...state, isUserProjectsLoading: action.payload }
		case "SET_IS_CURR_RELEASE_BLOG_LOADING":
			return { ...state, isCurrReleaseBlogLoading: action.payload }
		case "SET_CURR_RELEASE_BLOG": {
			const raw = action.payload
			if (!raw) return { ...state, currReleaseBlog: null }
			let blogContent = raw?.blogContent
			if (typeof blogContent === "string") {
				try { blogContent = JSON.parse(blogContent || "{}") } catch { blogContent = {} }
			} else if (blogContent == null) {
				blogContent = {}
			}
			return { ...state, currReleaseBlog: { ...raw, blogContent } }
		}
		case "SET_IS_ALL_PROJECTS_LOADING":
			return { ...state, isAllProjectsLoading: action.payload }
		case "SET_USER_PROJECTS":
			return { ...state, user_projects: action.payload }
		case "SET_ALL_PROJECTS": {
			const { projects, meta, user } = action.payload
			const sorted = sortByCreatedAt(projects)
			return { ...state, all_projects: sorted, user_projects: sorted.filter((project) => project.userId === user?._id), pagination: meta }
		}
		case "APPEND_ALL_PROJECTS": {
			const { projects, meta, user } = action.payload
			const mergedMap = new Map([...state.all_projects, ...projects].map((project) => [project.id, project]))
			const sorted = sortByCreatedAt(Array.from(mergedMap.values()))
			return { ...state, all_projects: sorted, user_projects: sorted.filter((project) => project.userId === user?._id), pagination: meta }
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
		case "ADD_PROJECT":
			return { ...state, user_projects: [...state.user_projects, action.payload], all_projects: [...state.all_projects, action.payload] }
		case "UPDATE_PROJECT": {
			const patch: Partial<Project> = action.payload
			const updatedState = {
				...state,
				user_projects: state.user_projects.map((p: Project) => p.id === patch.id ? mergeDefined<Project>(p, patch) : p),
				all_projects: state.all_projects.map((p: Project) => p.id === patch.id ? mergeDefined<Project>(p, patch) : p),
			}
			if (state.curr_project?.id === patch.id) updatedState.curr_project = mergeDefined<Project>(state.curr_project, patch)
			return updatedState
		}
		case "REMOVE_PROJECT":
			return { ...state, user_projects: state.user_projects.filter((p: Project) => p.id !== action.payload), all_projects: state.all_projects.filter((p: Project) => p.id !== action.payload) }
		case "SET_RELEASE_BLOGS": {
			const sortedBlogs = sortByCreatedAt(action.payload.blogs || [])
			const newState = {
				...state,
				all_projects: state.all_projects.map((project) => project.id === action.payload.projectId ? { ...project, releaseBlogs: sortedBlogs } : project),
				user_projects: state.user_projects.map((project) => project.id === action.payload.projectId ? { ...project, releaseBlogs: sortedBlogs } : project),
			}
			if (state.curr_project?.id === action.payload.projectId) newState.curr_project = { ...state.curr_project, releaseBlogs: sortedBlogs }
			return newState
		}
		case "ADD_RELEASE_BLOG": {
			const newState = {
				...state,
				all_projects: state.all_projects.map((project) => project.id === action.payload.projectId ? { ...project, releaseBlogs: sortByCreatedAt([...(project.releaseBlogs || []), action.payload.blog]) } : project),
				user_projects: state.user_projects.map((project) => project.id === action.payload.projectId ? { ...project, releaseBlogs: sortByCreatedAt([...(project.releaseBlogs || []), action.payload.blog]) } : project),
			}
			if (state.curr_project?.id === action.payload.projectId) newState.curr_project = { ...state.curr_project, releaseBlogs: sortByCreatedAt([...(state.curr_project.releaseBlogs || []), action.payload.blog]) }
			return newState
		}
		case "UPDATE_RELEASE_BLOG": {
			const updateBlogs = (blogs: ReleaseBlog[] = []) => sortByCreatedAt(blogs.map((blog) => blog._id === action.payload.blog._id ? action.payload.blog : blog))
			const newState = {
				...state,
				all_projects: state.all_projects.map((project) => project.id === action.payload.projectId ? { ...project, releaseBlogs: updateBlogs(project.releaseBlogs || []) } : project),
				user_projects: state.user_projects.map((project) => project.id === action.payload.projectId ? { ...project, releaseBlogs: updateBlogs(project.releaseBlogs || []) } : project),
			}
			if (state.curr_project?.id === action.payload.projectId) newState.curr_project = { ...state.curr_project, releaseBlogs: updateBlogs(state.curr_project.releaseBlogs || []) }
			return newState
		}
		case "REMOVE_RELEASE_BLOG": {
			const removeBlogs = (blogs: ReleaseBlog[] = []) => blogs.filter((blog) => blog._id !== action.payload.blogId)
			const newState = {
				...state,
				all_projects: state.all_projects.map((project) => project.id === action.payload.projectId ? { ...project, releaseBlogs: removeBlogs(project.releaseBlogs || []) } : project),
				user_projects: state.user_projects.map((project) => project.id === action.payload.projectId ? { ...project, releaseBlogs: removeBlogs(project.releaseBlogs || []) } : project),
			}
			if (state.curr_project?.id === action.payload.projectId) newState.curr_project = { ...state.curr_project, releaseBlogs: removeBlogs(state.curr_project.releaseBlogs || []) }
			return newState
		}
		case "SET_WEBSOCKET_STATUS":
			return { ...state, webSocketConnected: action.payload }
		case "SET_RELEASE_SYNC_STATUS":
			return { ...state, releaseSyncStatus: { ...state.releaseSyncStatus, [action.payload.projectId]: { message: action.payload.message, timestamp: action.payload.timestamp, status: action.payload.status } satisfies ReleaseSyncStatusEntry } }
		case "CLEAR_RELEASE_SYNC_STATUS":
			return { ...state, releaseSyncStatus: { ...state.releaseSyncStatus, [action.payload]: undefined } }
		case "SET_IS_SYNCING_RELEASE":
			return { ...state, isSyncingRelease: { ...state.isSyncingRelease, [action.payload.projectId]: action.payload.isLoading } }
		default:
			return state
	}
}