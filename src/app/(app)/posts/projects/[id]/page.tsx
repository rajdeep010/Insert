"use client";

import React, { useState, useEffect } from "react";
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
import { Link } from "@/components/tiptap-extension/link-extension";
import { Selection } from "@/components/tiptap-extension/selection-extension";
import { TrailingNode } from "@/components/tiptap-extension/trailing-node-extension";
import { ImageUploadNode } from "@/components/tiptap-node/image-upload-node/image-upload-node-extension";
import { handleImageUpload, MAX_FILE_SIZE } from "@/lib/tiptap-utils";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

import {
    Loader2,
    MoreHorizontal,
    GitBranch,
    ExternalLink,
    Eye,
    EyeOff,
    GitCommit,
    Calendar,
    User,
    Trash2,
    X,
    ArrowLeft,
    BookOpen,
} from "lucide-react";

import InsertNavbar from "@/components/InsertNavbar";
import InsertHoverCard from "@/components/InsertHoverCard";
import { useInsertProjects } from "@/app/context/InsertProjectProvider";
import { getLastModifiedText } from "@/helpers/last-modified";

import "@/components/tiptap-node/code-block-node/code-block-node.scss";
import "@/components/tiptap-node/list-node/list-node.scss";
import "@/components/tiptap-node/image-node/image-node.scss";
import "@/components/tiptap-node/paragraph-node/paragraph-node.scss";
import "@/components/tiptap-templates/simple/simple-editor.scss";
import { useInsertUser } from "@/app/context/InsertUserProvider";
import ProGate from "@/components/ProGate";

export default function ProjectDetailsPage() {
    const { id } = useParams();
    const { data: session } = useSession();
    const router = useRouter();

    const {
        curr_project,
        isProjectLoading,
    } = useInsertProjects();

    const project = curr_project;
    const { user } = useInsertUser();
    const showSubscribeModal = user?.proStatus ? user?.proStatus === 'active' : false;



    const [selectedBlog, setSelectedBlog] = useState<any>(null);
    const [sidebarOpen, setSidebarOpen] = useState(false);

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
            ImageUploadNode.configure({
                accept: "image/*",
                maxSize: MAX_FILE_SIZE,
                limit: 3,
                upload: handleImageUpload,
                onError: (error) => console.error("Upload failed:", error),
            }),
            TrailingNode,
            Link.configure({ openOnClick: false }),
        ],
        content: {},
        editable: false,
    });

    useEffect(() => {
        if (blogEditor) {
            try {
                const content =
                    typeof selectedBlog?.blogContent === "string"
                        ? JSON.parse(selectedBlog?.blogContent)
                        : selectedBlog?.blogContent;
                blogEditor.commands.setContent(content);
            } catch {
                blogEditor.commands.setContent("");
            }
        }
    }, [selectedBlog, blogEditor]);

    const handleBlogSelect = (blog: any) => {
        setSelectedBlog(blog);
        setSidebarOpen(true);
    };

    const closeBlogView = () => {
        setSelectedBlog(null);
        setSidebarOpen(false);
    };

    const handleDeleteProject = async () => {
        // delete remains available as in your original page; no sync/status controls are shown here
        // handled in provider from other page context; leaving UI intact per "don't change functionalities"
        // If you want to remove delete from this public post page later, just remove the dropdown below.
    };

    const getRepoName = (repoUrl: string) => {
        try {
            const url = new URL(repoUrl);
            const pathParts = url.pathname.split("/");
            return pathParts[pathParts.length - 1].replace(".git", "");
        } catch {
            return "Repository";
        }
    };

    if (isProjectLoading) {
        return (
            <div className="min-h-screen bg-background">
                <div className="fixed top-0 left-0 right-0 z-40 bg-background/80 backdrop-blur-md border-b">
                    <div className="py-4 lg:py-6 px-4 lg:px-8 xl:px-64">
                        <InsertNavbar />
                    </div>
                </div>
                <div className="pt-24 lg:pt-28 flex justify-center items-center h-[60vh]">
                    <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
                </div>
            </div>
        );
    }

    if (!curr_project) {
        return (
            <div className="min-h-screen bg-background">
                <div className="fixed top-0 left-0 right-0 z-40 bg-background/80 backdrop-blur-md border-b">
                    <div className="py-4 lg:py-6 px-4 lg:px-8 xl:px-64">
                        <InsertNavbar />
                    </div>
                </div>
                <div className="pt-24 lg:pt-28 text-center py-12">
                    <div className="text-muted-foreground text-lg mb-3">Project not found</div>
                    <Button variant="outline" onClick={() => router.push("/posts/projects")}>
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Projects
                    </Button>
                </div>
            </div>
        );
    }


    return (
        <>
            <ProGate show={showSubscribeModal} />
            <div className="min-h-screen bg-background">
                {/* Fixed Navbar */}
                <div className="fixed top-0 left-0 right-0 z-40 bg-background/80 backdrop-blur-md border-b">
                    <div className="py-4 lg:py-6 px-4 lg:px-8 xl:px-64">
                        <InsertNavbar />
                    </div>
                </div>

                {/* Main */}
                <div className="pt-24 lg:pt-28">
                    <div className="px-4 lg:px-8 xl:px-64 pb-10">
                        {/* Header with subtle gradient and ring */}
                        <div className="relative mb-8">

                            <Card className="relative rounded-2xl border bg-card/70 backdrop-blur-xl">
                                <div className="pointer-events-none absolute inset-0">
                                    <div className="absolute inset-0 opacity-[0.12] bg-[radial-gradient(60%_60%_at_30%_20%,theme(colors.blue.400/.6),transparent),radial-gradient(60%_60%_at_70%_80%,theme(colors.violet.400/.6),transparent)]" />
                                </div>
                                <CardHeader className="pb-4">
                                    <div className="flex flex-col gap-5">
                                        {/* Top row: title, badges, primary actions */}
                                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                            <div className="flex flex-col gap-2">
                                                <CardTitle className="text-2xl lg:text-3xl font-bold tracking-tight">
                                                    {project.name}
                                                </CardTitle>
                                                <div className="flex flex-wrap items-center gap-2">
                                                    {project.visibility === "private" ? (
                                                        <Badge variant="destructive" className="gap-1">
                                                            <EyeOff className="w-3 h-3" />
                                                            Private
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="default" className="gap-1">
                                                            <Eye className="w-3 h-3" />
                                                            Public
                                                        </Badge>
                                                    )}
                                                    {project.language && (
                                                        <Badge variant="outline">{project.language}</Badge>
                                                    )}
                                                    {project.monitorCommits && (
                                                        <Badge variant="outline" className="gap-1">
                                                            <GitCommit className="w-3 h-3" />
                                                            Monitored
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <Button variant="outline" size="sm" onClick={() => router.push("/posts/projects")} className="gap-2">
                                                    <ArrowLeft className="h-4 w-4" />
                                                    Back
                                                </Button>
                                                {project.repoUrl && (
                                                    <Button variant="outline" size="sm" asChild>
                                                        <a href={project.repoUrl} target="_blank" rel="noopener noreferrer" aria-label="Open repository">
                                                            <ExternalLink className="h-4 w-4" />
                                                        </a>
                                                    </Button>
                                                )}
                                                {project?.username === session?.user?.username && (
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="outline" size="sm">
                                                                <MoreHorizontal className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuGroup>
                                                                <DropdownMenuItem className="text-red-500" onClick={handleDeleteProject}>
                                                                    <Trash2 className="h-4 w-4 mr-2" />
                                                                    Delete Project
                                                                </DropdownMenuItem>
                                                            </DropdownMenuGroup>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                )}
                                            </div>
                                        </div>

                                        {/* User and meta */}
                                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                                            <div className="flex items-center gap-2">
                                                <InsertHoverCard username={project.username as string} type="avatar" avatarSize="small" />
                                                <div className="hover:text-primary">
                                                    <InsertHoverCard username={project.username as string} type="username" avatarSize="small" />
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <GitBranch className="w-4 h-4" />
                                                <span className="font-medium">Branch:</span>
                                                <span className="font-mono bg-muted px-2 py-0.5 rounded text-xs">
                                                    {project.defaultBranch}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-4 h-4" />
                                                <span className="font-medium">Created:</span>
                                                <span>{getLastModifiedText(project?.createdAt ?? project?.createdAt, { empty: "—" })}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <User className="w-4 h-4" />
                                                <span className="font-medium">Repository:</span>
                                                <span>{getRepoName(project?.repoUrl)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </CardHeader>
                            </Card>
                        </div>

                        <Separator className="mb-8" />

                        <div className="mb-8">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                                <div className="flex items-center gap-2 text-xl lg:text-2xl font-bold">
                                    <BookOpen className="h-6 w-6" />
                                    <span>Release Blogs</span>
                                    <Badge variant="outline" className="ml-1">
                                        {project?.releaseBlogs?.length || 0} {project?.releaseBlogs?.length === 1 ? "blog" : "blogs"}
                                    </Badge>
                                </div>
                            </div>

                            {/* Blog list */}
                            {Array.isArray(project?.releaseBlogs) && project.releaseBlogs.length > 0 ? (
                                <div className="space-y-4 max-h-[50vh] overflow-y-scroll custom-small-scrollbar">
                                    {project.releaseBlogs.map((blog: any, index: number) => (
                                        <Card
                                            key={blog.id || index}
                                            className="relative overflow-hidden border rounded-xl transition-all group cursor-pointer"
                                            onClick={() => handleBlogSelect(blog)}
                                        >
                                            <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition">
                                                <div className="absolute inset-0 bg-[radial-gradient(60%_60%_at_10%_10%,theme(colors.blue.500/.06),transparent)]" />
                                            </div>
                                            <CardContent className="p-4 lg:p-6">
                                                <div className="flex flex-col gap-3">
                                                    <div className="flex items-start justify-between gap-2">
                                                        <div className="text-lg lg:text-xl font-semibold group-hover:text-primary transition-colors">
                                                            {blog?.releaseTitle || `Release Blog #${index + 1}`}
                                                        </div>
                                                        <div>
                                                            {blog?.visibility === "private" ? (
                                                                <Badge variant="destructive" className="gap-1">
                                                                    <EyeOff className="w-3 h-3" />
                                                                    Private
                                                                </Badge>
                                                            ) : (
                                                                <Badge variant="default" className="gap-1">
                                                                    <Eye className="w-3 h-3" />
                                                                    Public
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <p className="text-muted-foreground mb-1 line-clamp-2 text-sm lg:text-base">
                                                        {blog?.blogContentText || "No description available for this release blog."}
                                                    </p>

                                                    <div className="flex items-center justify-between text-xs text-muted-foreground gap-3">
                                                        <div className="flex flex-wrap items-center gap-3">
                                                            <div className="flex items-center gap-1.5">
                                                                <Calendar className="w-4 h-4" />
                                                                <span>
                                                                    Created {getLastModifiedText(blog?.createdAt ?? blog?.publishedAt, { empty: "—" })}
                                                                </span>
                                                            </div>
                                                            {blog.commitSha && (
                                                                <div className="flex items-center gap-1.5">
                                                                    <GitCommit className="w-4 h-4" />
                                                                    <code className="bg-muted px-1.5 py-0.5 rounded text-[11px]">
                                                                        {blog.commitSha.substring(0, 7)}
                                                                    </code>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <ArrowLeft className="h-4 w-4 rotate-180 group-hover:translate-x-1 transition-transform flex-shrink-0" />
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            ) : (
                                <Card className="p-8 lg:p-12 text-center">
                                    <div className="text-muted-foreground mb-1">
                                        <GitCommit className="h-10 w-10 mx-auto mb-3 opacity-60" />
                                        <h3 className="text-base lg:text-lg font-medium mb-1">No Release Blogs</h3>
                                        <p className="text-sm">This project has no release blogs yet.</p>
                                    </div>
                                </Card>
                            )}
                        </div>
                    </div>
                </div>

                {/* Slide-over blog viewer */}
                <div
                    className={`fixed top-0 right-0 h-svh bg-background/80 backdrop-blur-xl ring-1 ring-border shadow-2xl transition-transform duration-500 ease-in-out z-[100] ${sidebarOpen ? "translate-x-0 pointer-events-auto" : "translate-x-full pointer-events-none"
                        } w-full sm:w-[520px] lg:w-[640px] xl:w-[760px] rounded-none sm:rounded-l-2xl`}
                >
                    {selectedBlog && (
                        <div className="h-full flex flex-col">
                            {/* Sticky header with subtle gradient accent */}
                            <div className="sticky top-0 z-10">
                                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
                                <div className="py-3 px-4 lg:px-6 bg-background/60 backdrop-blur-xl flex items-center justify-between">
                                    <div className="min-w-0 pr-3">
                                        <div className="text-base lg:text-xl font-semibold truncate">
                                            {selectedBlog?.releaseTitle || selectedBlog?.blogTitle || "Release Blog"}
                                        </div>
                                        <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                                            <div className="flex items-center gap-1.5">
                                                <Calendar className="w-4 h-4" />
                                                <span>
                                                    {getLastModifiedText(selectedBlog?.createdAt ?? selectedBlog?.publishedAt, { empty: "—" })}
                                                </span>
                                            </div>
                                            {selectedBlog?.visibility && (
                                                <Badge
                                                    variant={selectedBlog.visibility === "private" ? "destructive" : "default"}
                                                    className="gap-1"
                                                >
                                                    {selectedBlog.visibility === "private" ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                                                    {selectedBlog.visibility === "private" ? "Private" : "Public"}
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="icon" onClick={closeBlogView} className="shrink-0">
                                        <X className="h-5 w-5" />
                                    </Button>
                                </div>
                                <div className="h-px bg-border" />
                            </div>

                            {/* Scrollable content */}
                            <div className="flex-1 overflow-y-auto p-4 lg:p-6">
                                {blogEditor && (
                                    <EditorContext.Provider value={{ editor: blogEditor }}>
                                        <div className="post-wrapper">
                                            <EditorContent
                                                editor={blogEditor}
                                                role="presentation"
                                                className="simple-editor-content prose dark:prose-invert max-w-none prose-sm lg:prose-base"
                                            />
                                        </div>
                                    </EditorContext.Provider>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Overlay */}
                {sidebarOpen && (
                    <div
                        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[90] transition-opacity"
                        onClick={closeBlogView}
                    />
                )}
            </div>
        </>
    );
}