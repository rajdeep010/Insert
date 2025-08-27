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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
    Settings,
    Trash2,
    RefreshCw,
    X,
    ArrowLeft,
    Clock,
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

export default function ProjectDetailsPage() {
    const { id } = useParams();
    const { data: session } = useSession();
    const router = useRouter();

    const {
        curr_project,
        releaseBlogs,
        isProjectLoading,
        isReleaseBlogLoading,
        fetchProjectById,
        fetchReleaseBlogForProject,
        syncRelease,
        isSyncingRelease,
        removeProject,
    } = useInsertProjects();

    const [selectedBlog, setSelectedBlog] = useState<any>(null);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // TipTap editor for blog content
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

    // Fetch project data on mount
    useEffect(() => {
        if (id) {
            fetchProjectById(id as string);
            fetchReleaseBlogForProject(id as string);
        }
    }, [id]);

    // Update editor content when blog is selected
    useEffect(() => {
        if (blogEditor && selectedBlog?.content) {
            try {
                const content = typeof selectedBlog.content === 'string'
                    ? JSON.parse(selectedBlog.content)
                    : selectedBlog.content;
                blogEditor.commands.setContent(content);
            } catch (error) {
                console.error("Failed to parse blog content:", error);
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

    const handleSyncRelease = async () => {
        if (curr_project?.project?.id) {
            await syncRelease(curr_project.project.id);
        }
    };

    const handleDeleteProject = async () => {
        if (curr_project?.project?.id) {
            await removeProject(curr_project.project.id);
            router.push('/posts/projects');
        }
    };

    const getLanguageColor = (language: string) => {
        const colors: { [key: string]: string } = {
            'JavaScript': 'bg-yellow-500',
            'TypeScript': 'bg-blue-500',
            'Python': 'bg-green-500',
            'Java': 'bg-red-500',
            'Go': 'bg-cyan-500',
            'Rust': 'bg-orange-500',
            'C++': 'bg-purple-500',
            'C#': 'bg-indigo-500',
        };
        return colors[language] || 'bg-gray-500';
    };

    const getRepoName = (repoUrl: string) => {
        try {
            const url = new URL(repoUrl);
            const pathParts = url.pathname.split('/');
            return pathParts[pathParts.length - 1].replace('.git', '');
        } catch {
            return 'Repository';
        }
    };

    if (isProjectLoading) {
        return (
            <div className="min-h-screen bg-background">
                {/* Fixed Navbar */}
                <div className="fixed top-0 left-0 right-0 z-40 bg-background border-b">
                    <div className="flex flex-col gap-6 py-4 lg:py-6 justify-center px-4 lg:px-8 xl:px-64">
                        <InsertNavbar />
                    </div>
                </div>
                {/* Content with top padding to account for fixed navbar */}
                <div className="pt-24 lg:pt-28 flex justify-center items-center h-[60vh]">
                    <Loader2 className="h-12 w-12 animate-spin text-gray-500" />
                </div>
            </div>
        );
    }

    if (!curr_project?.project) {
        return (
            <div className="min-h-screen bg-background">
                {/* Fixed Navbar */}
                <div className="fixed top-0 left-0 right-0 z-40 bg-background border-b">
                    <div className="flex flex-col gap-6 py-4 lg:py-6 justify-center px-4 lg:px-8 xl:px-64">
                        <InsertNavbar />
                    </div>
                </div>
                {/* Content with top padding */}
                <div className="pt-24 lg:pt-28 text-center py-12">
                    <div className="text-gray-500 text-lg mb-2">Project not found</div>
                    <Button onClick={() => router.push('/posts/projects')}>
                        Back to Projects
                    </Button>
                </div>
            </div>
        );
    }

    const project = curr_project.project;

    return (
        <div className="min-h-screen bg-background transition-colors duration-300">
            {/* Fixed Navbar */}
            <div className="fixed top-0 left-0 right-0 z-40 bg-background">
                <div className="flex flex-col gap-6 py-4 lg:py-6 justify-center px-4 lg:px-8 xl:px-64">
                    <InsertNavbar />
                </div>
            </div>

            {/* Main Container - No transform when sidebar opens */}
            <div className="pt-24 lg:pt-28">
                <div className="px-4 lg:px-8 xl:px-64 pb-8">
                    {/* Project Header */}
                    <div className="mb-8">
                        <Card className="shadow-lg dark:shadow-gray-800">
                            <CardHeader className="pb-4">
                                <div className="flex flex-row justify-between items-start gap-4">
                                    <div className="flex items-center gap-4 w-full lg:w-auto">
                                        <div className="flex flex-col gap-2 flex-1">
                                            <div className="flex flex-row items-center gap-3 flex-wrap ">
                                                <CardTitle className="text-2xl lg:text-3xl font-bold">
                                                    {project.name}
                                                </CardTitle>

                                                {/* Visibility Badge */}
                                                <div className="flex flex-row lg:flex-row gap-2">
                                                    {project.visibility === "private" ? (
                                                        <Badge variant="destructive" className="flex items-center gap-1">
                                                            <EyeOff className="w-3 h-3" />
                                                            Private
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="default" className="bg-green-500 text-white flex items-center gap-1">
                                                            <Eye className="w-3 h-3" />
                                                            Public
                                                        </Badge>
                                                    )}

                                                    {/* Language Badge */}
                                                    {project.language && (
                                                        <Badge variant="outline">
                                                            {project.language}
                                                        </Badge>
                                                    )}

                                                    {/* Monitoring Badge */}
                                                    {project.monitorCommits && (
                                                        <Badge variant="outline" className="flex items-center gap-1">
                                                            <GitCommit className="w-3 h-3" />
                                                            Monitored
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>

                                            {/* User Info */}
                                            <div className="flex items-center gap-2">
                                                <InsertHoverCard
                                                    username={project.username}
                                                    type="avatar"
                                                    avatarSize="small"
                                                />
                                                <div className="text-sm text-gray-600 hover:text-blue-500 hover:underline">
                                                    <InsertHoverCard
                                                        username={project.username}
                                                        type="username"
                                                        avatarSize="small"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex items-center gap-2 w-full lg:w-auto justify-end">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={handleSyncRelease}
                                            disabled={isSyncingRelease[project.id]}
                                            className="text-xs lg:text-sm"
                                        >
                                            {isSyncingRelease[project.id] ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <RefreshCw className="h-4 w-4" />
                                            )}
                                            <span className="hidden sm:inline ml-2">Sync Release</span>
                                        </Button>

                                        <Button variant="outline" size="sm" asChild>
                                            <a href={project.repoUrl} target="_blank" rel="noopener noreferrer">
                                                <ExternalLink className="h-4 w-4" />
                                            </a>
                                        </Button>

                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="outline" size="sm">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuGroup>
                                                    <DropdownMenuItem>
                                                        <Settings className="h-4 w-4 mr-2" />
                                                        Settings
                                                    </DropdownMenuItem>
                                                </DropdownMenuGroup>
                                                <DropdownMenuGroup>
                                                    <DropdownMenuItem
                                                        className="text-red-500"
                                                        onClick={handleDeleteProject}
                                                    >
                                                        <Trash2 className="h-4 w-4 mr-2" />
                                                        Delete Project
                                                    </DropdownMenuItem>
                                                </DropdownMenuGroup>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </div>
                            </CardHeader>

                            <CardContent className="pt-0">
                                {/* Project Description */}
                                <div className="mb-4">
                                    <p className="text-gray-600 dark:text-gray-400 text-sm lg:text-base">
                                        {project.description || "No description available for this project."}
                                    </p>
                                </div>

                                {/* Project Metadata */}
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 text-sm">
                                    <div className="flex items-center gap-2">
                                        <GitBranch className="w-4 h-4 text-gray-500 flex-shrink-0" />
                                        <span className="font-medium">Branch:</span>
                                        <span className="font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-xs truncate">
                                            {project.defaultBranch}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-gray-500 flex-shrink-0" />
                                        <span className="font-medium">Created:</span>
                                        <span className="text-gray-600 dark:text-gray-400 truncate">
                                            {getLastModifiedText(project.createdAt)}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <User className="w-4 h-4 text-gray-500 flex-shrink-0" />
                                        <span className="font-medium">Repository:</span>
                                        <span className="text-gray-600 dark:text-gray-400 truncate">
                                            {getRepoName(project.repoUrl)}
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <Separator className="mb-8" />

                    {/* Release Blogs Section */}
                    <div className="mb-8">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                            <div className="flex items-center gap-2 text-xl lg:text-2xl font-bold">
                                <BookOpen />
                                <span>Release Blogs</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Badge variant="outline">
                                    {curr_project?.releaseBlogs?.length || 0} blogs
                                </Badge>
                            </div>
                        </div>

                        {/* Release Blogs List */}
                        {isReleaseBlogLoading ? (
                            <div className="space-y-4">
                                {[...Array(3)].map((_, i) => (
                                    <Card key={i} className="p-4 lg:p-6">
                                        <div className="space-y-3">
                                            <Skeleton className="h-6 w-3/4" />
                                            <Skeleton className="h-4 w-full" />
                                            <Skeleton className="h-4 w-2/3" />
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        ) : curr_project?.releaseBlogs && curr_project?.releaseBlogs.length > 0 ? (
                            <div className="space-y-4">
                                {curr_project.releaseBlogs.map((blog: any, index: number) => (
                                    <Card
                                        key={blog.id || index}
                                        className="hover:shadow-lg dark:hover:shadow-gray-800 transition-all duration-200 cursor-pointer group"
                                        onClick={() => handleBlogSelect(blog)}
                                    >
                                        <CardContent className="p-4 lg:p-6">
                                            <div className="flex flex-col sm:flex-row justify-between items-start mb-3 gap-2">
                                                <h3 className="text-lg lg:text-xl font-semibold group-hover:text-blue-600 transition-colors flex-1">
                                                    {blog?.blogTitle || `Release Blog #${index + 1}`}
                                                </h3>
                                                <Badge variant="outline" className="text-xs flex-shrink-0">
                                                    v{blog?.version || '1.0.0'}
                                                </Badge>
                                            </div>

                                            <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2 text-sm lg:text-base">
                                                {blog?.blogContentText || "No description available for this release blog."}
                                            </p>

                                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between text-sm text-gray-500 gap-2">
                                                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                                                    <Calendar className="w-4 h-4 text-gray-500 flex-shrink-0" />

                                                    <span className="text-xs lg:text-sm">
                                                        Created {getLastModifiedText(blog.createdAt)}
                                                    </span>
                                                    {blog.commitSha && (
                                                        <span className="font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-xs">
                                                            {blog.commitSha.substring(0, 7)}
                                                        </span>
                                                    )}
                                                </div>
                                                <ArrowLeft className="h-4 w-4 rotate-180 group-hover:translate-x-1 transition-transform flex-shrink-0" />
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <Card className="p-8 lg:p-12 text-center">
                                <div className="text-gray-500 mb-4">
                                    <GitCommit className="h-8 lg:h-12 w-8 lg:w-12 mx-auto mb-3 opacity-50" />
                                    <h3 className="text-base lg:text-lg font-medium mb-2">No Release Blogs</h3>
                                    <p className="text-sm">
                                        Sync your project to generate release blogs automatically.
                                    </p>
                                </div>
                                <Button onClick={handleSyncRelease} disabled={isSyncingRelease[project.id]}>
                                    {isSyncingRelease[project.id] ? (
                                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                    ) : (
                                        <RefreshCw className="h-4 w-4 mr-2" />
                                    )}
                                    Sync Release
                                </Button>
                            </Card>
                        )}
                    </div>
                </div>
            </div>

            {/* Overlay Sidebar for Blog Content - High Z-Index */}
            <div className={`fixed top-0 right-0 h-full bg-background border-l shadow-2xl transition-transform duration-500 ease-in-out z-[100] ${sidebarOpen ? 'translate-x-0' : 'translate-x-full'
                } w-full sm:w-[500px] lg:w-[600px] xl:w-[700px]`}>

                {selectedBlog && (
                    <div className="h-full flex flex-col">
                        {/* Sidebar Header */}
                        <div className="p-4 lg:p-6 border-b bg-gray-50 dark:bg-gray-900/50 flex-shrink-0">
                            <div className="flex justify-between items-start">
                                <div className="flex-1 mr-4">
                                    <h3 className="text-lg lg:text-xl font-bold mb-2 line-clamp-2">
                                        {selectedBlog.blogTitle || "Release Blog"}
                                    </h3>
                                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 flex-wrap">
                                        <Badge variant="outline" className="text-xs">
                                            v{selectedBlog.version || '1.0.0'}
                                        </Badge>
                                        <span>•</span>
                                        <span className="text-xs lg:text-sm">
                                            {getLastModifiedText(selectedBlog.createdAt)}
                                        </span>
                                    </div>
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={closeBlogView}
                                    className="flex-shrink-0"
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>

                        {/* Blog Content */}
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

            {/* Background Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[90] transition-opacity duration-500"
                    onClick={closeBlogView}
                />
            )}
        </div>
    );
}