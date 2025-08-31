"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
    CommandShortcut,
} from "@/components/ui/command";
import {
    Sheet,
    SheetTrigger,
    SheetContent,
    SheetHeader,
    SheetFooter,
} from "@/components/ui/sheet";
import {
    Home,
    FolderPlus,
    FilePlus,
    Menu,
    Folder,
    Search,
    SquarePen,
    File,
    Share2,
    ArrowLeft,
    GitBranch,
    ExternalLink,
    GitCommit,
    Tag,
    Eye,
    EyeOff,
    Clock,
    FileEdit,
    BookOpen,
    Loader2,
    CheckCircle,
    AlertCircle,
    XCircle,
    Edit3,
    Plus,
    ArrowLeftFromLine,
    FilePlus2,
} from "lucide-react";
import { useInsertProjects } from "@/app/context/InsertProjectProvider";
import { QuestionMarkCircledIcon } from "@radix-ui/react-icons";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "./ui/badge";
import { cn } from "@/lib/utils";
import { getLastModifiedText } from "@/helpers/last-modified";
import InsertIcon from "./InsertIcon";
import AddReleaseBlogModal from "./AddReleaseBlogModal";
import { Button } from "./ui/button";




const ReleaseBlogItem = ({ blog, isCurrentBlog, onBlogSelect }: {
    blog: any;
    isCurrentBlog: boolean;
    onBlogSelect: (blogId: string) => void;
}) => {
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'UPLOADED':
                return 'bg-green-500 hover:bg-green-600'
            case 'DRAFT':
                return 'bg-yellow-500 hover:bg-yellow-600'
            case 'PROCESSING':
                return 'bg-blue-500 hover:bg-blue-600'
            case 'ERROR':
                return 'bg-red-500 hover:bg-red-600'
            default:
                return 'bg-gray-500 hover:bg-gray-600'
        }
    }

    const getBuildStatusIcon = (status: string) => {
        switch (status) {
            case 'BUILT':
                return <CheckCircle className="h-3 w-3 text-green-500 flex-shrink-0" />
            case 'BUILDING':
                return <Loader2 className="h-3 w-3 animate-spin text-blue-500 flex-shrink-0" />
            case 'ERROR':
                return <XCircle className="h-3 w-3 text-red-500 flex-shrink-0" />
            default:
                return <AlertCircle className="h-3 w-3 text-gray-500 flex-shrink-0" />
        }
    }

    const title = blog.blogTitle || blog.releaseTitle || 'Untitled Release'

    console.log(blog)

    return (
        <CommandItem
            value={title}
            onSelect={() => onBlogSelect(blog.id)}
            className={cn(
                "cursor-pointer p-2",
                isCurrentBlog && "bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800"
            )}
        >
            <div className="flex items-start gap-2 w-full min-w-0">
                <div className="flex-1 min-w-0 overflow-hidden">
                    <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="truncate text-sm font-medium flex-1 min-w-0">
                            {blog?.releaseTitle}
                        </span>
                        <Badge className={`${getStatusColor(blog.status)} text-white text-xs flex-shrink-0 whitespace-nowrap`}>
                            {blog.status}
                        </Badge>
                    </div>

                    {/* {blog.blogContentText && (
                        <p className="text-xs text-gray-600 dark:text-gray-400 truncate mb-1" title={blog.blogContentText}>
                            {blog.blogContentText.length > 60
                                ? `${blog.blogContentText.substring(0, 60)}...`
                                : blog.blogContentText
                            }
                        </p>
                    )} */}

                    <div className="flex items-center gap-3 text-xs text-gray-500 overflow-hidden">
                        {blog.commitId && (
                            <div className="flex items-center gap-1 flex-shrink-0">
                                <GitCommit className="h-3 w-3 flex-shrink-0" />
                                <code className="text-xs bg-gray-100 dark:bg-gray-800 px-1 rounded whitespace-nowrap">
                                    {blog.commitId.substring(0, 7)}
                                </code>
                            </div>
                        )}

                        <div className="flex items-center gap-1 flex-shrink-0">
                            <Clock className="h-3 w-3 flex-shrink-0" />
                            <span className="whitespace-nowrap">
                                {getLastModifiedText(blog.createdAt)}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </CommandItem>
    )
}

const ReleaseBlogWriteSidebar = () => {
    const { data: session } = useSession();
    const { curr_project, isProjectLoading } = useInsertProjects();
    const router = useRouter();
    const params = useParams();

    const projectId = params.id as string;
    const currentReleaseBlogId = params.releaseBlogId as string;
    const username = session?.user?.username;

    const [isAddReleaseBlogModalOpen, setIsAddReleaseBlogModalOpen] = React.useState(false);

    const handleBlogSelect = (blogId: string) => {
        if (blogId !== currentReleaseBlogId) {
            router.push(`/project/${projectId}/edit/${blogId}`);
        }
    };

    const handleBackToProject = () => {
        router.push(`/project/${projectId}`);
    };

    const draftBlogs = useMemo(
        () => curr_project?.releaseBlogs?.filter((blog: any) =>
            blog.status === "DRAFT" || blog.status === "COMPLETED"
        ) || [],
        [curr_project?.releaseBlogs]
    );

    const publishedBlogs = useMemo(
        () => curr_project?.releaseBlogs?.filter((blog: any) =>
            blog.status === "UPLOADED"
        ) || [],
        [curr_project?.releaseBlogs]
    );

    const processingBlogs = useMemo(
        () => curr_project?.releaseBlogs?.filter((blog: any) =>
            blog.status === "PROCESSING"
        ) || [],
        [curr_project?.releaseBlogs]
    );

    return (
        <>
            <AddReleaseBlogModal
                defaultVisibility={isAddReleaseBlogModalOpen}
                onClose={() => setIsAddReleaseBlogModalOpen(false)}
            />

            <Sheet>
                <SheetTrigger className="p-2 z-[2000]">
                    <Menu className="w-10 h-10 p-2 border-2 rounded-md" />
                </SheetTrigger>

                <SheetContent side="left" className="flex flex-col gap-4 px-4 max-w-[400px] w-full">
                    <SheetHeader className="flex justify-between gap-4">

                        <div className="flex items-center gap-2 w-fit">
                            <InsertIcon className="p-[4px] border-2 bg-white" />
                            <span className="font-sans truncate text-2xl">Insert</span>
                        </div>

                    </SheetHeader>



                    {/* Project Info */}
                    {curr_project && (
                        <>
                            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3 flex-shrink-0 mb-2">
                                <h4 className="font-medium text-md flex items-center gap-4 mb-1">
                                    {/* <Briefcase className="h-4 w-4 flex-shrink-0" /> */}
                                    <span className="truncate" title={curr_project.project?.name}>
                                        {curr_project.project?.name}
                                    </span>
                                </h4>

                                {curr_project.project?.description && (
                                    <p
                                        className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 break-words"
                                        title={curr_project.project.description}
                                    >
                                        {curr_project.project.description}
                                    </p>
                                )}
                            </div>

                            <div className="flex justify-between items-center gap-2">
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            className="flex items-center"
                                            variant="outline"
                                            onClick={handleBackToProject}
                                        >
                                            <ArrowLeftFromLine className="h-4 w-4" />
                                            <span>Back</span>
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Return to project overview</p>
                                    </TooltipContent>
                                </Tooltip>

                                <Button
                                    className="flex items-center"
                                    variant="default"
                                    onClick={() => setIsAddReleaseBlogModalOpen(true)}
                                    disabled={isProjectLoading}
                                >
                                    <FilePlus className="h-4 w-4" />
                                    <p>Add Blog</p>
                                </Button>
                            </div>
                        </>
                    )}


                    <div className="flex-1 overflow-hidden">
                        <div className="flex flex-col gap-6 h-full overflow-y-auto custom-small-scrollbar">
                            {/* Processing Blogs */}
                            {processingBlogs.length > 0 && (
                                <div className="flex flex-col">
                                    <div className="flex items-center justify-between mb-2 px-2 flex-shrink-0">
                                        <span className="font-semibold flex items-center gap-2 truncate">
                                            <Loader2 className="h-4 w-4 animate-spin text-blue-500 flex-shrink-0" />
                                            <span className="truncate">Processing</span>
                                        </span>
                                        <Badge variant="outline" className="text-xs flex-shrink-0">
                                            {processingBlogs.length}
                                        </Badge>
                                    </div>

                                    <Command className="rounded-lg border shadow-md flex-1 h-80 min-h-80">
                                        <CommandInput placeholder="Search processing..." className="text-sm" />
                                        <CommandList className="max-h-none overflow-y-auto">
                                            <CommandEmpty>No processing blogs found</CommandEmpty>
                                            <CommandGroup>
                                                {processingBlogs.map((blog: any) => (
                                                    <ReleaseBlogItem
                                                        key={blog.id}
                                                        blog={blog}
                                                        isCurrentBlog={blog.id === currentReleaseBlogId}
                                                        onBlogSelect={handleBlogSelect}
                                                    />
                                                ))}
                                            </CommandGroup>
                                        </CommandList>
                                    </Command>
                                </div>
                            )}

                            {/* Draft Blogs */}
                            <div className="flex flex-col">
                                <div className="flex items-center justify-between mb-2 px-2 flex-shrink-0">
                                    <span className="font-semibold flex items-center gap-2 truncate">
                                        <FileEdit className="h-4 w-4 flex-shrink-0" />
                                        <span className="truncate">Drafts</span>
                                    </span>
                                    <Badge variant="outline" className="text-xs flex-shrink-0">
                                        {draftBlogs.length}
                                    </Badge>
                                </div>

                                <Command className="rounded-lg border shadow-md flex-1 h-80 min-h-80">
                                    <CommandInput placeholder="Search drafts..." className="text-sm" />
                                    <CommandList className="max-h-none overflow-y-auto">
                                        <CommandEmpty>No draft blogs found</CommandEmpty>
                                        {draftBlogs.length > 0 && (
                                            <CommandGroup>
                                                {draftBlogs.map((blog: any) => (
                                                    <ReleaseBlogItem
                                                        key={blog.id}
                                                        blog={blog}
                                                        isCurrentBlog={blog.id === currentReleaseBlogId}
                                                        onBlogSelect={handleBlogSelect}
                                                    />
                                                ))}
                                            </CommandGroup>
                                        )}
                                    </CommandList>
                                </Command>
                            </div>

                            {/* Published Blogs */}
                            <div className="flex flex-col">
                                <div className="flex items-center justify-between mb-2 px-2 flex-shrink-0">
                                    <span className="font-semibold flex items-center gap-2 truncate">
                                        <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                                        <span className="truncate">Published</span>
                                    </span>
                                    <Badge variant="outline" className="text-xs flex-shrink-0">
                                        {publishedBlogs.length}
                                    </Badge>
                                </div>

                                <Command className="rounded-lg border shadow-md flex-1 min-h-40">
                                    <CommandInput placeholder="Search published..." className="text-sm" />
                                    <CommandList className="max-h-none overflow-y-auto">
                                        <CommandEmpty>No published blogs found</CommandEmpty>
                                        {publishedBlogs.length > 0 && (
                                            <CommandGroup>
                                                {publishedBlogs.map((blog: any) => (
                                                    <ReleaseBlogItem
                                                        key={blog.id}
                                                        blog={blog}
                                                        isCurrentBlog={blog.id === currentReleaseBlogId}
                                                        onBlogSelect={handleBlogSelect}
                                                    />
                                                ))}
                                            </CommandGroup>
                                        )}
                                    </CommandList>
                                </Command>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="py-2 flex items-center justify-between flex-shrink-0">
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Share2 className="h-4 w-4 cursor-pointer flex-shrink-0" />
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Share Project</p>
                            </TooltipContent>
                        </Tooltip>

                        <Tooltip>
                            <TooltipTrigger asChild>
                                <QuestionMarkCircledIcon className="h-4 w-4 cursor-pointer flex-shrink-0" />
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Help & Support</p>
                            </TooltipContent>
                        </Tooltip>
                    </div>
                </SheetContent>
            </Sheet>
        </>
    );
};

export default ReleaseBlogWriteSidebar;