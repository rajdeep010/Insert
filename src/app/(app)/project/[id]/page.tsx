'use client'
import React, { useState } from 'react'
import {
    GitBranch,
    ExternalLink,
    Calendar,
    BookOpen,
    Tag,
    Clock,
    Eye,
    GitCommit,
    Download,
    Loader2,
    Rocket,
    CheckCircle,
    XCircle,
    AlertCircle,
    Settings,
    FilePlus2,
    Trash2,
    Edit,
} from 'lucide-react'
import Link from 'next/link'
import { useInsertProjects } from '@/app/context/InsertProjectProvider'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import InsertNavbar from '@/components/InsertNavbar'
import { Button } from '@/components/ui/button'
import { useSession } from 'next-auth/react'
import { useParams } from 'next/navigation'
import EditProjectModal from '@/components/EditProjectModal'
import EditReleaseBlogModal from '@/components/EditReleaseBlog'
import DeleteReleaseBlogModal from '@/components/DeleteReleaseBlogModal' // Add this import
import { languageColors } from '@/types/master-data'
import { getLastModifiedText } from '@/helpers/last-modified'
import AddReleaseBlogModal from '@/components/AddReleaseBlogModal'

export default function page() {
    const { data: session, status } = useSession()
    const {
        curr_project,
        isProjectLoading,
        syncRelease,
        isSyncingRelease,
        releaseSyncStatus,
        webSocketConnected,
        clearReleaseSyncStatus
    } = useInsertProjects()

    const params = useParams()
    const projectId = params.id as string

    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [isUpdatingProject, setIsUpdatingProject] = useState(false)
    const [isAddReleaseBlogModalOpen, setIsAddReleaseBlogModalOpen] = useState(false);

    // State for edit release blog modal
    const [isEditReleaseBlogModalOpen, setIsEditReleaseBlogModalOpen] = useState(false)
    const [selectedReleaseBlog, setSelectedReleaseBlog] = useState<any>(null)
    const [isUpdatingReleaseBlog, setIsUpdatingReleaseBlog] = useState(false)

    // State for delete release blog modal
    const [isDeleteReleaseBlogModalOpen, setIsDeleteReleaseBlogModalOpen] = useState(false)
    const [isDeletingReleaseBlog, setIsDeletingReleaseBlog] = useState(false)

    const handleEditProject = () => {
        setIsEditModalOpen(true)
    }

    const handleCloseEditModal = () => {
        setIsEditModalOpen(false)
        setIsUpdatingProject(false)
    }

    // Handlers for edit release blog modal
    const handleEditReleaseBlog = (blog: any) => {
        setSelectedReleaseBlog(blog)
        setIsEditReleaseBlogModalOpen(true)
    }

    const handleCloseEditReleaseBlogModal = () => {
        setIsEditReleaseBlogModalOpen(false)
        setSelectedReleaseBlog(null)
        setIsUpdatingReleaseBlog(false)
    }

    // Handlers for delete release blog modal
    const handleDeleteReleaseBlog = (blog: any) => {
        setSelectedReleaseBlog(blog)
        setIsDeleteReleaseBlogModalOpen(true)
    }

    const handleCloseDeleteReleaseBlogModal = () => {
        setIsDeleteReleaseBlogModalOpen(false)
        setSelectedReleaseBlog(null)
        setIsDeletingReleaseBlog(false)
    }

    const isLoading = isSyncingRelease[projectId] || false
    const syncStatus = releaseSyncStatus[projectId]

    const formatDate = (dateString: string) => {
        if (!dateString) return ''
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
    }

    const formatRelativeTime = (dateString: string) => {
        if (!dateString) return ''
        const date = new Date(dateString)
        const now = new Date()
        const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
        if (diffInHours < 24) {
            return `${diffInHours} hours ago`
        } else {
            const diffInDays = Math.floor(diffInHours / 24)
            return `${diffInDays} days ago`
        }
    }

    const handleSyncRelease = async () => {
        await syncRelease(projectId)
    }

    const handleClearStatus = () => {
        clearReleaseSyncStatus(projectId)
    }

    const getBlogCardStyle = (blog: any) => {
        if (blog?.status === 'BUILDING' || blog?.status === 'PROCESSING') {
            return "opacity-60 cursor-not-allowed hover:shadow-none"
        }
        return "hover:shadow-md transition-shadow duration-200"
    }

    const isBlogClickable = (blog: any) => {
        return blog?.status === 'READY' && blog?.status === 'COMPLETED'
    }

    if (!curr_project) return null

    return (
        <div className="flex flex-col gap-6 py-8 lg:py-12 justify-center px-8 lg:px-56">
            <InsertNavbar />

            {isProjectLoading && <Loader2 className="h-4 w-4 animate-spin" />}

            {/* Project Header */}
            <Card className="shadow-md bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-950 dark:to-gray-900 mt-8">
                <CardHeader className="pb-6 border-2 border-gray-200 dark:border-gray-700 rounded-lg">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                            <Avatar className="h-16 w-16">
                                <AvatarImage src={session?.user?.githubAvatarUrl} />
                                <AvatarFallback>
                                    {curr_project?.project?.username?.slice(0, 2).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <div className="flex items-center gap-3">
                                    <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {curr_project?.project?.name}
                                    </CardTitle>
                                    <Badge variant={curr_project?.project?.visibility === 'private' ? 'destructive' : 'secondary'}>
                                        {curr_project?.project?.visibility}
                                    </Badge>
                                    <Badge variant={webSocketConnected ? "default" : "destructive"} className="text-xs">
                                        {webSocketConnected ? "🟢 Connected" : "🔴 Offline"}
                                    </Badge>
                                </div>
                                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                                    <span className='text-sm'>{curr_project?.project?.username}</span>
                                    <span>•</span>
                                    <span className='text-sm'>Updated {formatRelativeTime(curr_project?.project?.updatedAt)}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <Link href={curr_project?.project?.repoUrl || '/'} target="_blank" rel="noopener noreferrer">
                                <span className="inline-flex items-center px-3 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                                    <ExternalLink className="h-4 w-4 mr-2" />
                                    View
                                </span>
                            </Link>
                        </div>
                    </div>

                    <CardDescription className="text-sm text-gray-600 dark:text-gray-300 mt-4">
                        {curr_project?.project?.description || 'No description available for this project.'}
                    </CardDescription>

                    {/* Project Stats */}
                    <div className="flex items-center gap-6 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-500" />
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                Created {formatDate(curr_project?.project?.createdAt)}
                            </span>
                        </div>
                        {curr_project?.project?.lastMonitoredCommitSha && (
                            <div className="flex items-center gap-2">
                                <GitCommit className="h-4 w-4 text-gray-500" />
                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                    {curr_project?.project?.lastMonitoredCommitSha.substring(0, 7)}
                                </span>
                            </div>
                        )}
                    </div>
                </CardHeader>
            </Card>

            {/* Real-time Sync Status */}
            {syncStatus && (
                <Card className="border-2 border-dashed">
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                {syncStatus.status === 'BUILDING' && <Loader2 className="h-4 w-4 animate-spin text-blue-500" />}
                                {syncStatus.status === 'READY' && <CheckCircle className="h-4 w-4 text-green-500" />}
                                {syncStatus.status === 'ERROR' && <XCircle className="h-4 w-4 text-red-500" />}
                                <CardTitle className="text-lg">Release Sync Status</CardTitle>
                            </div>
                            <Button variant="ghost" size="sm" onClick={handleClearStatus}>
                                Clear
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <Badge
                                    variant={
                                        syncStatus.status === 'READY' ? 'default' :
                                            syncStatus.status === 'ERROR' ? 'destructive' :
                                                'secondary'
                                    }
                                >
                                    {syncStatus.status}
                                </Badge>
                                <span className="text-sm text-muted-foreground">
                                    {new Date(syncStatus.timestamp).toLocaleTimeString()}
                                </span>
                            </div>
                            <p className="text-sm">{syncStatus.message}</p>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Release Blogs */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <BookOpen className="h-6 w-6" />
                            Release Blogs

                            <Badge variant="outline" className="text-sm">
                                {curr_project?.releaseBlogs?.length || 0} blogs
                            </Badge>
                        </div>
                        <div className="flex items-center gap-3">
                            
                            <Button
                                onClick={handleSyncRelease}
                                disabled={isLoading}
                                size="sm"
                                className="relative"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Syncing...
                                    </>
                                ) : (
                                    <>
                                        <Rocket className="h-4 w-4" />
                                        Sync
                                    </>
                                )}
                            </Button>
                            <Button
                                className="w-full flex items-center"
                                variant="destructive"
                                onClick={() => setIsAddReleaseBlogModalOpen(true)}
                                disabled={isProjectLoading}
                            >
                                <FilePlus2 className="h-4 w-4" />
                                Add
                            </Button>
                        </div>
                    </div>

                    {curr_project?.releaseBlogs && curr_project?.releaseBlogs.length > 0 ? (
                        <div className="space-y-4 overflow-y-scroll custom-small-scrollbar max-h-[40vh]">
                            {curr_project?.releaseBlogs.map((blog: any, idx: number) => (
                                <Card
                                    key={idx}
                                    className={getBlogCardStyle(blog)}
                                    onClick={() => {
                                        if (isBlogClickable(blog)) {
                                            console.log('Navigate to blog:', blog.id)
                                        }
                                    }}
                                >
                                    <CardHeader className="pb-4">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between gap-3">
                                                    <div className='flex items-center gap-4'>
                                                        <CardTitle className="text-xl font-semibold">
                                                            {/* Updated to use releaseTitle */}
                                                            {blog?.releaseTitle || blog?.blogTitle || 'Untitled Release'}
                                                        </CardTitle>

                                                        {blog?.status && (
                                                            <Badge
                                                                variant={
                                                                    blog.status === 'READY' ? 'default' :
                                                                        blog.status === 'ERROR' ? 'destructive' :
                                                                            'secondary'
                                                                }
                                                                className="text-xs"
                                                            >
                                                                {blog.status === 'BUILDING' && <Loader2 className="h-3 w-3 mr-1 animate-spin" />}
                                                                {blog.status === 'READY' && <CheckCircle className="h-3 w-3 mr-1" />}
                                                                {blog.status === 'ERROR' && <AlertCircle className="h-3 w-3 mr-1" />}
                                                                {blog.status}
                                                            </Badge>
                                                        )}
                                                    </div>

                                                    <div className='flex items-center gap-2'>
                                                        {/* Edit Button */}
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={(e) => {
                                                                e.stopPropagation()
                                                                handleEditReleaseBlog(blog)
                                                            }}
                                                            className="rounded-md"
                                                        >
                                                            <Edit className="h-4 w-4" />
                                                        </Button>

                                                        {/* Delete Button */}
                                                        <Button
                                                            variant="destructive"
                                                            size="sm"
                                                            onClick={(e) => {
                                                                e.stopPropagation()
                                                                handleDeleteReleaseBlog(blog) // Updated handler
                                                            }}
                                                            className="rounded-md"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-4">
                                                    <div className="flex items-center gap-1">
                                                        <Clock className="h-4 w-4" />
                                                        {getLastModifiedText(blog?.createdAt || blog?.publishedAt)}
                                                    </div>
                                                    {blog?.commitId && (
                                                        <div className="flex items-center gap-1">
                                                            <GitCommit className="h-4 w-4" />
                                                            <code className="text-xs bg-gray-100 dark:bg-gray-800 px-1 rounded">
                                                                {blog.commitId.substring(0, 7)}
                                                            </code>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {blog?.blogContentText && (
                                            <CardDescription className="mt-3 text-gray-600 dark:text-gray-300 leading-relaxed">
                                                {blog?.blogContentText?.length > 200
                                                    ? `${blog?.blogContentText?.substring(0, 200)}...`
                                                    : blog?.blogContentText
                                                }
                                            </CardDescription>
                                        )}

                                        <Link href={`/project/${projectId}/edit/${blog.id}`} className="mt-4 text-xs text-blue-600 dark:text-blue-400">
                                            Click to view details →
                                        </Link>

                                    </CardHeader>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <Card>
                            <CardContent className="flex items-center justify-center h-48">
                                <div className="text-center">
                                    <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                        No release blogs yet
                                    </h3>
                                    <p className="text-gray-500 dark:text-gray-400 mt-2">
                                        Click "Sync Release" to create your first release blog.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Sidebar - existing code remains the same */}
                <div className="space-y-6">
                    {/* Project Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                Project Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="text-gray-500 dark:text-gray-400">Owner</span>
                                    <p className="font-medium">{curr_project?.project?.username}</p>
                                </div>
                                <div>
                                    <span className="text-gray-500 dark:text-gray-400">Keyword</span>
                                    <p className="font-medium capitalize">{curr_project?.project?.releaseTriggerKeyword}</p>
                                </div>
                                <div>
                                    <span className="text-gray-500 dark:text-gray-400">Language</span>
                                    {curr_project?.project?.language && (
                                        <div className="flex gap-1 items-center rounded-md text-sm">
                                            <div
                                                className="w-3 h-3 rounded-full"
                                                style={{ backgroundColor: languageColors[curr_project?.project?.language] || '#586069' }}
                                            />
                                            <span className='text-sm'>{curr_project?.project?.language}</span>
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <span className="text-gray-500 dark:text-gray-400">Branch</span>
                                    <p className="font-medium">{curr_project?.project?.defaultBranch}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Quick Actions */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Quick Actions</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <Link href={curr_project?.project?.repoUrl || '/'} target="_blank">
                                <Button className="w-full flex items-center" variant="outline">
                                    <ExternalLink className="h-4 w-4" />
                                    View Repo
                                </Button>
                            </Link>
                            <Button
                                className="w-full flex items-center"
                                variant="default"
                                onClick={handleEditProject}
                                disabled={isProjectLoading}
                            >
                                <Settings className="h-4 w-4" />
                                Edit Project
                            </Button>
                            
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Modals */}
            <EditProjectModal
                isOpen={isEditModalOpen}
                onClose={handleCloseEditModal}
                project={curr_project}
                isUpdating={isUpdatingProject}
            />

            <EditReleaseBlogModal
                isOpen={isEditReleaseBlogModalOpen}
                onClose={handleCloseEditReleaseBlogModal}
                releaseBlog={selectedReleaseBlog}
                projectId={projectId}
                isUpdating={isUpdatingReleaseBlog}
            />

            {/* Add DeleteReleaseBlogModal */}
            <DeleteReleaseBlogModal
                isOpen={isDeleteReleaseBlogModalOpen}
                onClose={handleCloseDeleteReleaseBlogModal}
                releaseBlog={selectedReleaseBlog}
                projectId={projectId}
                isDeleting={isDeletingReleaseBlog}
            />

            <AddReleaseBlogModal
                defaultVisibility={isAddReleaseBlogModalOpen}
                onClose={() => setIsAddReleaseBlogModalOpen(false)}
            />
        </div>
    )
}