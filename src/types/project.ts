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

export interface ReleaseBlog {
    id: string;
    title?: string;
    content?: string;
    version?: string;
    publishedAt?: string;
    author?: {
        name: string;
        avatar?: string;
    };
    tags?: string[];
    downloadCount?: number;
    viewCount?: number;
    [key: string]: any;
}

export interface Project {
    id: string;
    title: string;
    githubRepo: any;
    releaseBlogs: ReleaseBlog[];
    [key: string]: any;
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