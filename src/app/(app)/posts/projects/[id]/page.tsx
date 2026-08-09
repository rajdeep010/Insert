"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { EditorContent, EditorContext, useEditor } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";
import { Image } from "@tiptap/extension-image";
import { TaskItem } from "@tiptap/extension-task-item";
import { TaskList } from "@tiptap/extension-task-list";
import { TextAlign } from "@tiptap/extension-text-align";
import { Typography } from "@tiptap/extension-typography";
import { Highlight } from "@tiptap/extension-highlight";
import { Subscript } from "@tiptap/extension-subscript";
import { Superscript } from "@tiptap/extension-superscript";
import { Underline } from "@tiptap/extension-underline";
import {
    ArrowLeft,
    ArrowRight,
    BookOpen,
    CalendarDays,
    ExternalLink,
    Eye,
    EyeOff,
    FolderGit2,
    GitBranch,
    GitCommit,
    Loader2,
    X,
} from "lucide-react";

import InsertHoverCard from "@/components/InsertHoverCard";
import InsertNavbar from "@/components/InsertNavbar";
import ProGate from "@/components/ProGate";
import ShareLinkButton from "@/components/ShareLinkButton";
import { Link } from "@/components/tiptap-extension/link-extension";
import { Selection } from "@/components/tiptap-extension/selection-extension";
import { TrailingNode } from "@/components/tiptap-extension/trailing-node-extension";
import { ImageUploadNode } from "@/components/tiptap-node/image-upload-node/image-upload-node-extension";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useInsertProjects } from "@/features/project/context/InsertProjectProvider";
import { useInsertUser } from "@/features/user/context/InsertUserProvider";
import { getLastModifiedText } from "@/helpers/last-modified";
import { handleImageUpload, MAX_FILE_SIZE } from "@/lib/tiptap-utils";
import type { Project, ReleaseBlog } from "@/types/project";

import "@/components/tiptap-node/code-block-node/code-block-node.scss";
import "@/components/tiptap-node/list-node/list-node.scss";
import "@/components/tiptap-node/image-node/image-node.scss";
import "@/components/tiptap-node/paragraph-node/paragraph-node.scss";
import "@/components/tiptap-templates/simple/simple-editor.scss";

const getRepositoryName = (repoUrl?: string) => {
    if (!repoUrl) return "Repository not linked";
    try {
        return new URL(repoUrl).pathname.split("/").filter(Boolean).at(-1)?.replace(/\.git$/, "") || "Repository";
    } catch {
        return "Repository";
    }
};

const getCommitSha = (blog: ReleaseBlog) => {
    const value = blog.commitSha ?? blog.commitId;
    return typeof value === "string" && value ? value.slice(0, 7) : null;
};

function ProjectPageShell({ children }: { children: React.ReactNode }) {
    return (
        <main className="relative min-h-screen overflow-hidden bg-slate-50 text-slate-950 dark:bg-[#020817] dark:text-slate-50">
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-60 [background-image:linear-gradient(to_right,rgba(100,116,139,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(100,116,139,0.08)_1px,transparent_1px)] [background-size:48px_48px] [mask-image:linear-gradient(to_bottom,black,transparent_92%)]" />
            <div aria-hidden="true" className="pointer-events-none absolute left-[10%] top-16 h-72 w-72 rounded-full bg-indigo-500/10 blur-[120px]" />
            <div aria-hidden="true" className="pointer-events-none absolute right-[8%] top-80 h-72 w-72 rounded-full bg-cyan-500/10 blur-[120px]" />
            <div className="relative mx-auto w-full max-w-[1560px] px-4 py-5 sm:px-8 lg:px-12 lg:py-8">
                <InsertNavbar />
                {children}
            </div>
        </main>
    );
}

function ProjectMeta({ project }: { project: Project }) {
    const items = [
        { icon: GitBranch, label: "Default branch", value: project.defaultBranch || "—", mono: true },
        { icon: FolderGit2, label: "Repository", value: getRepositoryName(project.repoUrl) },
        { icon: CalendarDays, label: "Created", value: getLastModifiedText(project.createdAt, { empty: "—" }) },
        { icon: GitCommit, label: "Release tracking", value: project.monitorCommits ? "Monitored" : "Manual" },
    ];

    return (
        <div className="grid border-t border-slate-200/80 dark:border-slate-800/80 sm:grid-cols-2 xl:grid-cols-4">
            {items.map(({ icon: Icon, label, value, mono }, index) => (
                <div key={label} className={`flex items-center gap-3 px-5 py-4 ${index > 0 ? "border-t border-slate-200/80 dark:border-slate-800/80 sm:border-t-0 sm:border-l" : ""} ${index === 2 ? "sm:border-l-0 xl:border-l" : ""}`}>
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500 dark:bg-slate-900 dark:text-slate-400"><Icon className="h-4 w-4" /></span>
                    <div className="min-w-0">
                        <p className="text-[10px] uppercase tracking-[0.14em] text-slate-500">{label}</p>
                        <p className={`mt-1 truncate text-sm font-medium ${mono ? "font-mono" : ""}`}>{value}</p>
                    </div>
                </div>
            ))}
        </div>
    );
}

function ReleaseCard({ blog, index, onOpen }: { blog: ReleaseBlog; index: number; onOpen: () => void }) {
    const isPrivate = blog.visibility === "private";
    const commitSha = getCommitSha(blog);
    const title = blog.releaseTitle || blog.blogTitle || blog.title || `Release ${String(index + 1).padStart(2, "0")}`;

    return (
        <button type="button" onClick={onOpen} className="group flex min-h-64 w-full flex-col rounded-2xl border border-slate-200 bg-white/65 p-5 text-left shadow-sm backdrop-blur-xl transition duration-300 hover:-translate-y-0.5 hover:border-indigo-400/45 hover:bg-white dark:border-slate-800 dark:bg-slate-950/55 dark:hover:bg-slate-950/85">
            <div className="flex items-start justify-between gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-500"><BookOpen className="h-5 w-5" /></span>
                <Badge variant={isPrivate ? "destructive" : "secondary"} className="gap-1 text-[10px] uppercase">{isPrivate ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}{isPrivate ? "Private" : "Public"}</Badge>
            </div>
            <div className="mt-2 flex items-start justify-between gap-3">
                <h3 className="line-clamp-2 text-xl font-semibold tracking-tight transition-colors group-hover:text-indigo-600 dark:group-hover:text-indigo-300">{title}</h3>
                <ArrowRight className="mt-1 h-4 w-4 shrink-0 transition-transform group-hover:translate-x-1" />
            </div>
            <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600 dark:text-slate-400">{blog.blogContentText || "Open this release to read the project update."}</p>
            <div className="mt-auto flex flex-wrap items-center gap-2 border-t border-slate-200/80 pt-4 text-xs text-slate-500 dark:border-slate-800/80 dark:text-slate-400">
                <span>{getLastModifiedText(blog.createdAt ?? blog.publishedAt, { empty: "—" })}</span>
                {blog.version && <span className="rounded-md bg-slate-100 px-2 py-1 font-mono dark:bg-slate-900">{blog.version}</span>}
                {commitSha && <span className="ml-auto inline-flex items-center gap-1 font-mono"><GitCommit className="h-3.5 w-3.5" />{commitSha}</span>}
            </div>
        </button>
    );
}

export default function ProjectDetailsPage() {
    const { id } = useParams();
    const router = useRouter();
    const { data: session, status } = useSession();
    const { curr_project, isProjectLoading, fetchProjectById } = useInsertProjects();
    const { currentUser } = useInsertUser();
    const projectId = id as string;
    const [selectedBlog, setSelectedBlog] = useState<ReleaseBlog | null>(null);

    const blogEditor = useEditor({
        immediatelyRender: false,
        extensions: [
            StarterKit,
            TextAlign.configure({ types: ["heading", "paragraph"] }),
            Underline,
            TaskList,
            TaskItem.configure({ nested: true }),
            Highlight.configure({ multicolor: true }),
            Image,
            Typography,
            Superscript,
            Subscript,
            Selection,
            ImageUploadNode.configure({ accept: "image/*", maxSize: MAX_FILE_SIZE, limit: 3, upload: handleImageUpload, onError: (error) => console.error("Upload failed:", error) }),
            TrailingNode,
            Link.configure({ openOnClick: false }),
        ],
        content: {},
        editable: false,
    });

    useEffect(() => {
        if (!blogEditor) return;
        try {
            const content = typeof selectedBlog?.blogContent === "string" ? JSON.parse(selectedBlog.blogContent) : selectedBlog?.blogContent;
            blogEditor.commands.setContent(content || "");
        } catch {
            blogEditor.commands.setContent("");
        }
    }, [blogEditor, selectedBlog]);

    useEffect(() => {
        if (status === "authenticated" && session?.user?.githubAccessToken && projectId) fetchProjectById(projectId);
    }, [fetchProjectById, projectId, session?.user?.githubAccessToken, status]);

    const releases = useMemo(() => Array.isArray(curr_project?.releaseBlogs) ? curr_project.releaseBlogs : [], [curr_project?.releaseBlogs]);

    if (isProjectLoading) {
        return <ProjectPageShell><div className="flex min-h-[65vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-slate-400" /></div></ProjectPageShell>;
    }

    if (!curr_project) {
        return (
            <ProjectPageShell>
                <div className="flex min-h-[65vh] flex-col items-center justify-center text-center">
                    <span className="flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950"><FolderGit2 className="h-6 w-6 text-slate-400" /></span>
                    <h1 className="mt-5 text-xl font-semibold">Project not found</h1>
                    <p className="mt-2 text-sm text-slate-500">This project may have been removed or is unavailable.</p>
                    <Button variant="outline" className="mt-6" onClick={() => router.push("/posts/projects")}><ArrowLeft className="mr-2 h-4 w-4" />Back to projects</Button>
                </div>
            </ProjectPageShell>
        );
    }

    const project = curr_project;
    const isPrivate = project.visibility === "private";

    return (
        <>
            <ProGate show={currentUser?.proStatus?.active === false} />
            <ProjectPageShell>
                <section className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white/65 shadow-sm backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/55">
                    <div className="grid gap-8 p-5 sm:p-7 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
                        <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                                <Badge variant={isPrivate ? "destructive" : "secondary"} className="gap-1 text-[10px] uppercase">{isPrivate ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}{isPrivate ? "Private" : "Public"}</Badge>
                                {project.language && <Badge variant="outline">{project.language}</Badge>}
                            </div>
                            <h1 className="mt-5 break-words text-3xl font-semibold tracking-[-0.04em] sm:text-5xl">{project.name || "Untitled project"}</h1>
                            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600 dark:text-slate-400">{project.description?.trim() || "Explore this project, its repository, and the release notes documenting how it is evolving."}</p>
                            <div className="mt-5 flex min-w-0 items-center gap-2 text-sm text-slate-500"><InsertHoverCard username={project.username || ""} type="avatar" avatarSize="small" /><span>Built by</span><InsertHoverCard username={project.username || ""} type="username" avatarSize="small" /></div>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                            <Button variant="outline" size="sm" onClick={() => router.push("/posts/projects")}><ArrowLeft className="mr-2 h-4 w-4" />Projects</Button>
                            <ShareLinkButton path={`/posts/projects/${projectId}`} title={project.name || "Insert project"} text={`Check out this project on Insert: ${project.name || "Untitled project"}`} className="gap-2" />
                            {project.repoUrl && <Button size="sm" asChild><a href={project.repoUrl} target="_blank" rel="noopener noreferrer">Repository<ExternalLink className="ml-2 h-4 w-4" /></a></Button>}
                        </div>
                    </div>
                    <ProjectMeta project={project} />
                </section>

                <section className="py-7 lg:py-9">
                    <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
                        <div><p className="text-[10px] uppercase tracking-[0.18em] text-indigo-600 dark:text-indigo-300">Project journal</p><h2 className="mt-1 text-2xl font-semibold tracking-tight">Release updates</h2><p className="mt-1 text-sm text-slate-500">Read the milestones and engineering notes published for this project.</p></div>
                        <Badge variant="outline">{releases.length} {releases.length === 1 ? "release" : "releases"}</Badge>
                    </div>
                    {releases.length ? (
                        <div className="grid auto-rows-fr gap-3 md:grid-cols-2 xl:grid-cols-3">{releases.map((blog, index) => <ReleaseCard key={blog.id || blog._id || index} blog={blog} index={index} onOpen={() => setSelectedBlog(blog)} />)}</div>
                    ) : (
                        <div className="flex min-h-72 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white/45 px-6 text-center dark:border-slate-700 dark:bg-slate-950/35"><span className="flex h-12 w-12 items-center justify-center rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950"><GitCommit className="h-5 w-5 text-slate-400" /></span><h3 className="mt-4 font-semibold">No release updates yet</h3><p className="mt-2 text-sm text-slate-500">Published project milestones will appear here.</p></div>
                    )}
                </section>
            </ProjectPageShell>

            <div className={`fixed inset-0 z-[100] overflow-x-hidden overflow-y-auto bg-slate-50 transition duration-300 dark:bg-[#020817] ${selectedBlog ? "visible opacity-100" : "invisible pointer-events-none opacity-0"}`}>
                {selectedBlog && (
                    <div className="min-h-screen">
                        <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-slate-50/90 backdrop-blur-xl dark:border-slate-800/80 dark:bg-[#020817]/90">
                            <div className="mx-auto flex w-full max-w-[1560px] items-start justify-between gap-5 px-4 py-4 sm:px-8 lg:px-12">
                                <div className="min-w-0">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <p className="text-[10px] uppercase tracking-[0.18em] text-indigo-600 dark:text-indigo-300">Release update</p>
                                        <span className="text-slate-300 dark:text-slate-700">/</span>
                                        <p className="text-xs text-slate-500">{project.name}</p>
                                    </div>
                                    <h2 className="mt-1 text-lg font-semibold leading-snug sm:text-xl">{selectedBlog.releaseTitle || selectedBlog.blogTitle || selectedBlog.title || "Release"}</h2>
                                    <p className="mt-1 text-xs text-slate-500">{getLastModifiedText(selectedBlog.createdAt ?? selectedBlog.publishedAt, { empty: "—" })}</p>
                                </div>
                                <Button variant="outline" size="sm" className="shrink-0" onClick={() => setSelectedBlog(null)}><X className="h-4 w-4" /></Button>
                            </div>
                        </header>

                        <main className="mx-auto w-full max-w-[1560px] px-4 py-5 sm:px-8 sm:py-8 lg:px-12">
                            <div className="mx-auto w-full max-w-6xl overflow-hidden rounded-2xl border border-slate-200 bg-white/70 shadow-sm dark:border-slate-800 dark:bg-slate-950/55">
                                {blogEditor && (
                                    <EditorContext.Provider value={{ editor: blogEditor }}>
                                        <div className="post-wrapper !min-h-0 !max-h-none !overflow-visible !border-0 !bg-transparent !shadow-none">
                                            <EditorContent editor={blogEditor} role="presentation" className="release-reader-content simple-editor-content prose dark:prose-invert" />
                                        </div>
                                    </EditorContext.Provider>
                                )}
                            </div>
                        </main>
                    </div>
                )}
            </div>
        </>
    );
}
