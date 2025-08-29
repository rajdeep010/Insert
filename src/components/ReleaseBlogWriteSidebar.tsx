import { useInsertProjects } from '@/app/context/InsertProjectProvider'
import React, { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip'
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
    ArrowLeft,
    GitBranch,
    ExternalLink,
    Calendar,
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
    ChevronDown,
    ChevronUp,
    ChevronLeft,
    ChevronRight,
    PanelLeftClose,
    PanelLeftOpen,
} from 'lucide-react'
import { getLastModifiedText } from '@/helpers/last-modified'
import { useSession } from 'next-auth/react'
import { cn } from '@/lib/utils'
import { languageColors } from '@/types/master-data'

const ReleaseBlogWriteSidebar = () => {
    const { curr_project, isProjectLoading } = useInsertProjects()
    const { data: session } = useSession()
    const router = useRouter()
    const params = useParams()

    const projectId = params.id as string
    const currentReleaseBlogId = params.releaseBlogId as string

    // State for sidebar collapse/expand
    const [isMinimized, setIsMinimized] = useState(false)
    const [blogsExpanded, setBlogsExpanded] = useState(true)
    const [projectExpanded, setProjectExpanded] = useState(true)

    const handleBackToProject = () => {
        router.push(`/project/${projectId}`)
    }

    const handleEditReleaseBlog = (blogId: string) => {
        router.push(`/project/${projectId}/edit/${blogId}`)
    }

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

    const getBuildStatusIcon = (buildStatus: string) => {
        switch (buildStatus) {
            case 'BUILT':
                return <CheckCircle className="h-3 w-3 text-green-500" />
            case 'BUILDING':
                return <Loader2 className="h-3 w-3 animate-spin text-blue-500" />
            case 'ERROR':
                return <XCircle className="h-3 w-3 text-red-500" />
            default:
                return <AlertCircle className="h-3 w-3 text-gray-500" />
        }
    }

    const truncateText = (text: string, maxLength: number) => {
        if (!text) return ''
        return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text
    }

    // Minimized sidebar view
    if (isMinimized) {
        return (
            <TooltipProvider>
                <Card className="w-16 shadow-lg max-h-[90vh] flex flex-col">
                    <CardContent className="p-2 space-y-3">
                        {/* Expand button */}
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setIsMinimized(false)}
                                    className="w-full h-10"
                                >
                                    <PanelLeftOpen className="h-4 w-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="right">
                                <p>Expand sidebar</p>
                            </TooltipContent>
                        </Tooltip>

                        {/* Back button */}
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleBackToProject}
                                    className="w-full h-10"
                                >
                                    <ArrowLeft className="h-4 w-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="right">
                                <p>Back to project</p>
                            </TooltipContent>
                        </Tooltip>

                        {/* Project avatar */}
                        {curr_project && (
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <div className="flex justify-center">
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage src={session?.user?.githubAvatarUrl} />
                                            <AvatarFallback className="text-xs">
                                                {curr_project.project?.username?.slice(0, 2).toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                    </div>
                                </TooltipTrigger>
                                <TooltipContent side="right">
                                    <p>{curr_project.project?.name}</p>
                                </TooltipContent>
                            </Tooltip>
                        )}

                        {/* Blog count indicator */}
                        {curr_project?.releaseBlogs && (
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <div className="flex justify-center">
                                        <Badge variant="outline" className="text-xs">
                                            {curr_project.releaseBlogs.length}
                                        </Badge>
                                    </div>
                                </TooltipTrigger>
                                <TooltipContent side="right">
                                    <p>{curr_project.releaseBlogs.length} release blogs</p>
                                </TooltipContent>
                            </Tooltip>
                        )}
                    </CardContent>
                </Card>
            </TooltipProvider>
        )
    }

    if (isProjectLoading) {
        return (
            <Card className="w-90 shadow-lg">
                <CardContent className="p-6">
                    <div className="flex justify-center items-center h-40">
                        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
                    </div>
                </CardContent>
            </Card>
        )
    }

    if (!curr_project) {
        return (
            <Card className="w-90 shadow-lg">
                <CardContent className="p-6">
                    <div className="text-center text-gray-500">
                        <FileEdit className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p>Project not found</p>
                        <Button variant="outline" size="sm" onClick={handleBackToProject} className="mt-3">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back
                        </Button>
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <TooltipProvider>
            <Card className="w-90 shadow-lg max-h-[90vh] flex flex-col">
                <CardHeader className="pb-4 flex-shrink-0">
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <FileEdit className="h-5 w-5" />
                            <span className="truncate">Release Editor</span>
                        </CardTitle>
                        <div className="flex items-center gap-2">
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button variant="outline" size="sm" onClick={handleBackToProject}>
                                        <ArrowLeft className="h-4 w-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Back to project</p>
                                </TooltipContent>
                            </Tooltip>

                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="outline"
                                        size="default"
                                        onClick={() => setIsMinimized(true)}
                                        className="h-8 w-8"
                                    >
                                        <PanelLeftClose className="h-4 w-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Minimize sidebar</p>
                                </TooltipContent>
                            </Tooltip>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="flex-1 overflow-hidden space-y-4">
                    {/* Current Project Info - Collapsible */}
                    <Collapsible open={projectExpanded} onOpenChange={setProjectExpanded}>
                        <div className="space-y-3">
                            <CollapsibleTrigger className="flex items-center justify-between w-full group hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md p-2 transition-colors">
                                <div className="flex items-center gap-2 px-2">
                                    <h3 className="font-medium text-sm">Current Project</h3>
                                    <Badge variant="outline" className="text-xs">
                                        {curr_project.releaseBlogs?.length || 0} blogs
                                    </Badge>
                                </div>
                                <div className="h-6 w-6 p-0 flex items-center justify-center">
                                    {projectExpanded ? (
                                        <ChevronUp className="h-3 w-3" />
                                    ) : (
                                        <ChevronDown className="h-3 w-3" />
                                    )}
                                </div>
                            </CollapsibleTrigger>

                            <CollapsibleContent className="space-y-3">
                                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3">
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-10 w-10">
                                            <AvatarImage src={session?.user?.githubAvatarUrl} />
                                            <AvatarFallback>
                                                {curr_project.project?.username?.slice(0, 2).toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-medium text-sm truncate">
                                                {curr_project.project?.name}
                                            </h4>
                                            <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                                                @{curr_project.project?.username}
                                            </p>
                                        </div>
                                    </div>
                                    
                                    {curr_project.project?.description && (
                                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-2 line-clamp-2">
                                            {curr_project.project.description}
                                        </p>
                                    )}

                                    <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                                        {curr_project.project?.language && (
                                            <div className="flex items-center gap-1">
                                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: languageColors[curr_project.project.language] }} />
                                                <span>{curr_project.project.language}</span>
                                            </div>
                                        )}
                                        {curr_project.project?.visibility && (
                                            <Badge variant="outline" className="text-xs">
                                                {curr_project.project.visibility}
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            </CollapsibleContent>
                        </div>
                    </Collapsible>

                    <Separator />

                    {/* Release Blogs List - Collapsible */}
                    <Collapsible open={blogsExpanded} onOpenChange={setBlogsExpanded}>
                        <div className="space-y-3 flex-1 min-h-0">
                            <CollapsibleTrigger className="flex items-center justify-between w-full group hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md p-2 transition-colors">
                                <h3 className="font-medium text-sm flex items-center gap-2">
                                    <BookOpen className="h-4 w-4" />
                                    <span>Release Blogs</span>
                                </h3>
                                <div className="h-6 w-6 p-0 flex items-center justify-center">
                                    {blogsExpanded ? (
                                        <ChevronUp className="h-3 w-3" />
                                    ) : (
                                        <ChevronDown className="h-3 w-3" />
                                    )}
                                </div>
                            </CollapsibleTrigger>

                            <CollapsibleContent className="min-h-0 flex-1">
                                <ScrollArea className="h-[300px] w-full">
                                    <div className="space-y-2">
                                        {curr_project?.releaseBlogs && curr_project?.releaseBlogs.length > 0 ? (
                                            curr_project?.releaseBlogs?.map((blog: any, index: number) => {
                                                const isCurrentBlog = blog?.id === currentReleaseBlogId
                                                const titleText = blog.blogTitle || blog.releaseTitle || `Release #${index + 1}`
                                                const isTitleTruncated = titleText.length > 30
                                                const contentText = blog.blogContentText || ''
                                                const isContentTruncated = contentText.length > 60
                                                
                                                return (
                                                    <Tooltip key={blog?.id || index}>
                                                        <TooltipTrigger asChild>
                                                            <div
                                                                className={cn(
                                                                    "p-3 rounded-lg border transition-all duration-200",
                                                                    isCurrentBlog 
                                                                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20' 
                                                                        : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-gray-300 dark:hover:border-gray-700',
                                                                    blog?.buildStatus === 'BUILT' ? 'cursor-pointer' : 'cursor-default'
                                                                )}
                                                                onClick={() => {
                                                                    if (blog?.buildStatus === 'BUILT' && !isCurrentBlog) {
                                                                        handleEditReleaseBlog(blog?.id)
                                                                    }
                                                                }}
                                                            >
                                                                <div className="space-y-2">
                                                                    <div className="flex items-start justify-between gap-2">
                                                                        <div className="flex-1 min-w-0">
                                                                            {/* Title with gradient overlay for truncated text */}
                                                                            <div className="relative">
                                                                                <h4 className={cn(
                                                                                    "font-medium text-sm",
                                                                                    isTitleTruncated ? "" : "truncate"
                                                                                )}>
                                                                                    {isTitleTruncated ? titleText.substring(0, 30) + "..." : titleText}
                                                                                </h4>
                                                                                {isTitleTruncated && (
                                                                                    <div className="absolute right-0 top-0 w-8 h-full pointer-events-none" />
                                                                                )}
                                                                            </div>
                                                                            
                                                                            {/* Content preview with gradient overlay */}
                                                                            {blog.blogContentText && (
                                                                                <div className="relative mt-1">
                                                                                    <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                                                                                        {isContentTruncated ? 
                                                                                            contentText.substring(0, 60) + "..." : 
                                                                                            contentText
                                                                                        }
                                                                                    </p>
                                                                                    {isContentTruncated && (
                                                                                        <div className="absolute right-0 bottom-0 w-12 h-8 pointer-events-none" />
                                                                                    )}
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                        <div className="flex items-center gap-1 flex-shrink-0">
                                                                            {getBuildStatusIcon(blog.buildStatus)}
                                                                            {isCurrentBlog && (
                                                                                <Edit3 className="h-3 w-3 text-blue-500" />
                                                                            )}
                                                                        </div>
                                                                    </div>

                                                                    <div className="flex items-center justify-between">
                                                                        <div className="flex items-center gap-2 flex-1 min-w-0">
                                                                            <Badge 
                                                                                className={`${getStatusColor(blog.status)} text-white text-xs flex-shrink-0`}
                                                                            >
                                                                                {blog.status}
                                                                            </Badge>
                                                                            
                                                                            {blog.version && (
                                                                                <div className="relative flex-shrink-0">
                                                                                    <Badge variant="outline" className="text-xs">
                                                                                        <Tag className="h-2 w-2 mr-1" />
                                                                                        <span className={cn(
                                                                                            blog.version.length > 8 ? "truncate max-w-[60px]" : ""
                                                                                        )}>
                                                                                            {blog.version}
                                                                                        </span>
                                                                                    </Badge>
                                                                                    {blog.version.length > 8 && (
                                                                                        <div className="absolute right-0 top-0 w-4 h-full bg-gradient-to-l from-white to-transparent dark:from-gray-800 dark:to-transparent pointer-events-none rounded-r" />
                                                                                    )}
                                                                                </div>
                                                                            )}
                                                                        </div>

                                                                        <div className="flex items-center gap-1 text-xs text-gray-500 flex-shrink-0">
                                                                            <Clock className="h-3 w-3" />
                                                                            <span>{getLastModifiedText(blog.createdAt)}</span>
                                                                        </div>
                                                                    </div>

                                                                    {blog.commitId && (
                                                                        <div className="flex items-center gap-2 text-xs">
                                                                            <GitCommit className="h-3 w-3 text-gray-500 flex-shrink-0" />
                                                                            <div className="relative">
                                                                                <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded truncate">
                                                                                    {blog.commitId.substring(0, 7)}
                                                                                </code>
                                                                            </div>
                                                                        </div>
                                                                    )}

                                                                    {/* Error message with gradient overlay */}
                                                                    {blog.errorMessage && (
                                                                        <div className="relative text-xs text-red-600 bg-red-50 dark:bg-red-900/20 p-2 rounded">
                                                                            <span className="line-clamp-2">
                                                                                {blog.errorMessage.length > 100 ? 
                                                                                    blog.errorMessage.substring(0, 100) : 
                                                                                    blog.errorMessage
                                                                                }
                                                                            </span>
                                                                            {blog.errorMessage.length > 100 && (
                                                                                <div className="absolute right-2 bottom-2 w-8 h-4 bg-gradient-to-l from-red-50 to-transparent dark:from-red-900/20 dark:to-transparent pointer-events-none" />
                                                                            )}
                                                                        </div>
                                                                    )}

                                                                    {/* Status indicators */}
                                                                    {blog.buildStatus === 'BUILT' && !isCurrentBlog && (
                                                                        <div className="text-xs text-blue-600 dark:text-blue-400">
                                                                            Click to edit →
                                                                        </div>
                                                                    )}

                                                                    {isCurrentBlog && (
                                                                        <div className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                                                                            ✓ Currently editing
                                                                        </div>
                                                                    )}

                                                                    {/* Truncation indicator */}
                                                                    {(isTitleTruncated || isContentTruncated) && (
                                                                        <div className="text-xs text-blue-500 dark:text-blue-400 font-medium flex items-center gap-1">
                                                                            <Eye className="h-3 w-3" />
                                                                            <span>Hover to see more</span>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </TooltipTrigger>
                                                        <TooltipContent className="max-w-sm">
                                                            <div className="space-y-1">
                                                                <p className="font-medium">
                                                                    {blog.blogTitle || blog.releaseTitle || `Release #${index + 1}`}
                                                                </p>
                                                                {blog.blogContentText && (
                                                                    <p className="text-xs text-gray-300">
                                                                        {blog.blogContentText.substring(0, 200)}...
                                                                    </p>
                                                                )}
                                                                <p className="text-xs text-gray-400">
                                                                    Status: {blog.status} | Build: {blog.buildStatus}
                                                                </p>
                                                                {blog.buildStatus === 'BUILT' && !isCurrentBlog && (
                                                                    <p className="text-xs text-blue-400">Click to edit this blog</p>
                                                                )}
                                                            </div>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                )
                                            })
                                        ) : (
                                            <div className="text-center py-8 text-gray-500">
                                                <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                                <p className="text-sm">No release blogs yet</p>
                                                <p className="text-xs mt-1">
                                                    Sync your project to create release blogs
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </ScrollArea>
                            </CollapsibleContent>
                        </div>
                    </Collapsible>

                    {/* Quick Stats - Always visible */}
                    <div className="bg-gray-100 dark:bg-gray-900 rounded-lg p-3 flex-shrink-0">
                        <div className="grid grid-cols-3 gap-3 text-center">
                            <div>
                                <div className="text-lg font-bold text-blue-600">
                                    {curr_project.releaseBlogs?.filter((b: any) => b.status === 'UPLOADED').length || 0}
                                </div>
                                <div className="text-xs text-gray-600 dark:text-gray-400">Published</div>
                            </div>
                            <div>
                                <div className="text-lg font-bold text-yellow-600">
                                    {curr_project.releaseBlogs?.filter((b: any) => b.status === 'DRAFT' || b.status === 'COMPLETED').length || 0}
                                </div>
                                <div className="text-xs text-gray-600 dark:text-gray-400">Drafts</div>
                            </div>
                            <div>
                                <div className="text-lg font-bold text-gray-600">
                                    {curr_project.releaseBlogs?.filter((b: any) => b.status === 'PROCESSING').length || 0}
                                </div>
                                <div className="text-xs text-gray-600 dark:text-gray-400">Processing</div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </TooltipProvider>
    )
}

export default ReleaseBlogWriteSidebar