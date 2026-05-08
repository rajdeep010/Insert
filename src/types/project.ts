export interface GitHubRepo {
    id: number;
    name: string;
    fullName: string;
    description: string | null;
    htmlUrl: string;
    cloneUrl: string;
    defaultBranch: string;
    language: string | null;
    isPrivate: boolean;
    fork: boolean;
    stargazersCount: number;
    forksCount: number;
    createdAt: string;
    updatedAt: string;
    pushedAt: string;
    repoUrl: string;
}

export interface ProjectPagination {
    currentPage: number;
    pageSize: number;
    totalItems: number;
    hasMore: boolean;
    nextCursor: string | null;
}

export interface ReleaseSyncStatusEntry {
    message: string;
    timestamp: string;
    status: string;
}

export interface ReleaseBlog {
    _id?: string;
    id?: string;
    title?: string;
    releaseTitle?: string;
    blogTitle?: string;
    content?: string;
    blogContent?: string | Record<string, unknown>;
    blogContentText?: string;
    version?: string;
    visibility?: string;
    status?: string;
    commitId?: string;
    publishedAt?: string;
    createdAt?: string;
    updatedAt?: string;
    author?: {
        name: string;
        avatar?: string;
    };
    tags?: string[];
    downloadCount?: number;
    viewCount?: number;
    [key: string]: unknown;
}

export interface Project {
    id: string;
    _id?: string;
    title?: string;
    name?: string;
    description?: string;
    repoUrl?: string;
    username?: string;
    userId?: string;
    defaultBranch?: string;
    visibility?: "public" | "private";
    language?: string;
    githubRepo?: GitHubRepo | null;
    releaseBlogs?: ReleaseBlog[];
    monitorCommits?: boolean;
    releaseTriggerKeyword?: string;
    createdAt?: string;
    updatedAt?: string;
    [key: string]: unknown;
}

export interface ProjectDetail {
    id: string;
    name: string;
    description?: string;
    repoUrl: string;
    username: string;
    defaultBranch: string;
    visibility: "public" | "private";
    language?: string;
    createdAt: string;
    updatedAt: string;
    lastMonitoredCommitSha?: string;
    starCount?: number;
    forkCount?: number;
    watcherCount?: number;
}

export interface ProjectResponse {
    project: ProjectDetail;
    releaseBlogs: ReleaseBlog[];
}

export interface ProjectState {
    curr_project: Project | null;
    all_projects: Project[];
    user_projects: Project[];
    githubRepos: GitHubRepo[];
    releaseBlogs: ReleaseBlog[];
    currReleaseBlog: ReleaseBlog | null;
    isCurrReleaseBlogLoading: boolean;
    isGithubReposLoading: boolean;
    isAllProjectsLoading: boolean;
    isUserProjectsLoading: boolean;
    isProjectLoading: boolean;
    isReleaseBlogLoading: boolean;
    pagination: ProjectPagination;
    webSocketConnected: boolean;
    releaseSyncStatus: Record<string, ReleaseSyncStatusEntry | undefined>;
    isSyncingRelease: Record<string, boolean>;
}