'use client'
import React, { useState } from 'react'
import {
    ExternalLink,
    Calendar,
    BookOpen,
    Clock,
    GitCommit,
    Loader2,
    Rocket,
    CheckCircle,
    XCircle,
    AlertCircle,
    Settings,
    FilePlus2,
    Trash2,
    Edit
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
import DeleteReleaseBlogModal from '@/components/DeleteReleaseBlogModal'
import { languageColors } from '@/types/master-data'
import { getLastModifiedText } from '@/helpers/last-modified'
import AddReleaseBlogModal from '@/components/AddReleaseBlogModal'

/* Shared style helpers */
const surface =
    'relative rounded-2xl border border-black/[0.08] dark:border-white/[0.08] bg-white/60 dark:bg-gray-900/40 supports-[backdrop-filter]:bg-white/40 transition-colors'
const surfaceMuted =
    'relative rounded-xl border border-black/[0.06] dark:border-white/[0.06] bg-white/50 dark:bg-gray-900/30'
const hoverable =
    'transition-colors hover:border-black/20 dark:hover:border-white/30'

export default function Page() {
    const { data: session } = useSession()
    const {
        curr_project,
        isProjectLoading,
        syncRelease,
        isSyncingRelease,
        releaseSyncStatus,
        webSocketConnected,
        clearReleaseSyncStatus,
    } = useInsertProjects()

    const params = useParams()
    const projectId = params.id as string

    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [isUpdatingProject, setIsUpdatingProject] = useState(false)
    const [isAddReleaseBlogModalOpen, setIsAddReleaseBlogModalOpen] = useState(false)
    const [isEditReleaseBlogModalOpen, setIsEditReleaseBlogModalOpen] = useState(false)
    const [selectedReleaseBlog, setSelectedReleaseBlog] = useState<any>(null)
    const [isUpdatingReleaseBlog, setIsUpdatingReleaseBlog] = useState(false)
    const [isDeleteReleaseBlogModalOpen, setIsDeleteReleaseBlogModalOpen] = useState(false)
    const [isDeletingReleaseBlog, setIsDeletingReleaseBlog] = useState(false)

    const isLoading = isSyncingRelease[projectId] || false
    const syncStatus = releaseSyncStatus[projectId]

    if (!curr_project) return null

    const formatDate = (dateString: string) =>
        !dateString
            ? ''
            : new Date(dateString).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            })

    const formatRelativeTime = (dateString: string) => {
        if (!dateString) return ''
        const date = new Date(dateString)
        const now = new Date()
        const diffInHours = Math.floor((now.getTime() - date.getTime()) / 36e5)
        if (diffInHours < 24) return `${diffInHours}h ago`
        const diffInDays = Math.floor(diffInHours / 24)
        return `${diffInDays}d ago`
    }

    const handleSyncRelease = async () => {
        await syncRelease(projectId)
    }

    const handleClearStatus = () => clearReleaseSyncStatus(projectId)

    const handleEditProject = () => setIsEditModalOpen(true)

    const handleCloseEditModal = () => {
        setIsEditModalOpen(false)
        setIsUpdatingProject(false)
    }

    const handleEditReleaseBlog = (blog: any) => {
        setSelectedReleaseBlog(blog)
        setIsEditReleaseBlogModalOpen(true)
    }
    const handleCloseEditReleaseBlogModal = () => {
        setIsEditReleaseBlogModalOpen(false)
        setSelectedReleaseBlog(null)
        setIsUpdatingReleaseBlog(false)
    }

    const handleDeleteReleaseBlog = (blog: any) => {
        setSelectedReleaseBlog(blog)
        setIsDeleteReleaseBlogModalOpen(true)
    }
    const handleCloseDeleteReleaseBlogModal = () => {
        setIsDeleteReleaseBlogModalOpen(false)
        setSelectedReleaseBlog(null)
        setIsDeletingReleaseBlog(false)
    }

    const blogCardBase =
        surfaceMuted +
        ' p-0 border rounded-xl overflow-hidden group ' +
        'before:absolute before:inset-0 before:opacity-0 hover:before:opacity-100 before:transition before:rounded-xl ' +
        'before:bg-[radial-gradient(circle_at_30%_20%,rgba(99,102,241,0.10),transparent_70%)]'

    const getStatusBadgeVariant = (s: string) =>
        s === 'READY' ? 'default' : s === 'ERROR' ? 'destructive' : 'secondary'

    return (
        <div className="flex flex-col gap-6 py-8 lg:py-12 px-6 lg:px-40">
            <InsertNavbar />

            {isProjectLoading && (
                <div className="flex justify-center pt-12">
                    <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
                </div>
            )}

            {!isProjectLoading && (
                <div className="flex flex-col gap-10">
                    {/* Project Header */}
                    <div className="relative">
                        <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-tr from-indigo-500/50 via-blue-500/40 to-purple-500/40 opacity-70" />
                        <Card
                            className={
                                surface +
                                ' shadow-none overflow-hidden rounded-2xl relative'
                            }
                        >
                            <div className="pointer-events-none absolute inset-0">
                                <div className="absolute -right-8 -top-10 h-44 w-44 rounded-full bg-indigo-400/10 blur-3xl" />
                                <div className="absolute left-0 bottom-0 h-32 w-40 rounded-full bg-purple-400/10 blur-3xl" />
                            </div>
                            <CardHeader className="relative p-7 pb-5">
                                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-8">
                                    <div className="flex items-start gap-6">
                                        <div className="relative">
                                            <Avatar className="h-20 w-20 ring-2 ring-white/40 dark:ring-white/10">
                                                <AvatarImage src={session?.user?.githubAvatarUrl} />
                                                <AvatarFallback className="font-semibold">
                                                    {curr_project?.username?.slice(0, 2).toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                            <span
                                                className={`absolute -bottom-[-2px] -right-[-2px] h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-semibold
                          ${webSocketConnected ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}
                                            >

                                            </span>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="flex flex-wrap items-center gap-3">
                                                <CardTitle className="text-3xl font-bold tracking-tight">
                                                    {curr_project?.name}
                                                </CardTitle>
                                                <Badge
                                                    variant={
                                                        curr_project?.visibility === 'private'
                                                            ? 'destructive'
                                                            : 'secondary'
                                                    }
                                                    className="uppercase tracking-wide text-[10px] px-2 py-1"
                                                >
                                                    {curr_project?.visibility}
                                                </Badge>
                                                <Badge
                                                    variant={
                                                        webSocketConnected ? 'default' : 'destructive'
                                                    }
                                                    className="flex items-center gap-1 text-[11px] font-medium px-2 py-1"
                                                >
                                                    <span
                                                        className={`h-2 w-2 rounded-full ${webSocketConnected
                                                            ? 'bg-green-400 animate-pulse'
                                                            : 'bg-red-400'
                                                            }`}
                                                    />
                                                    {webSocketConnected ? 'Connected' : 'Offline'}
                                                </Badge>
                                            </div>

                                            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
                                                <span className="font-medium">
                                                    @{curr_project?.username}
                                                </span>
                                                <span className="opacity-40">•</span>
                                                <span>Updated {formatRelativeTime(curr_project?.updatedAt)}</span>
                                                {curr_project?.language && (
                                                    <>
                                                        <span className="opacity-40 hidden sm:inline">
                                                            •
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <span
                                                                className="h-2.5 w-2.5 rounded-full"
                                                                style={{
                                                                    backgroundColor:
                                                                        languageColors[curr_project?.language] ||
                                                                        '#64748b'
                                                                }}
                                                            />
                                                            {curr_project?.language}
                                                        </span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex gap-3">
                                        <Link
                                            href={curr_project?.repoUrl || '/'}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="group"
                                        >
                                            <span className="inline-flex items-center gap-2 rounded-xl border border-black/10 dark:border-white/15 bg-white/60 dark:bg-gray-800/40 backdrop-blur px-4 py-2 text-sm font-medium hover:border-black/25 dark:hover:border-white/30 transition">
                                                <ExternalLink className="h-4 w-4 group-hover:scale-110 transition-transform" />
                                                Open Repo
                                            </span>
                                        </Link>
                                    </div>
                                </div>

                                {curr_project?.description ? (
                                    <CardDescription className="mt-5 text-sm leading-relaxed max-w-3xl">
                                        {curr_project.description}
                                    </CardDescription>
                                ) : (
                                    <CardDescription className="mt-5 italic text-gray-500 dark:text-gray-400">
                                        No description available.
                                    </CardDescription>
                                )}

                                <div className="mt-7 grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <div className={surfaceMuted + ' px-4 py-3 flex gap-3'}>
                                        <div className="h-9 w-9 flex items-center justify-center rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                                            <Calendar className="h-4 w-4" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400">
                                                Created
                                            </span>
                                            <span className="text-sm font-medium">
                                                {formatDate(curr_project?.createdAt)}
                                            </span>
                                        </div>
                                    </div>
                                    <div className={surfaceMuted + ' px-4 py-3 flex gap-3'}>
                                        <div className="h-9 w-9 flex items-center justify-center rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400">
                                            <GitCommit className="h-4 w-4" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400">
                                                Last Commit
                                            </span>
                                            <span className="text-sm font-medium">
                                                {curr_project?.lastMonitoredCommitSha
                                                    ? curr_project.lastMonitoredCommitSha.substring(
                                                        0,
                                                        7
                                                    )
                                                    : '—'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className={surfaceMuted + ' px-4 py-3 flex gap-3'}>
                                        <div className="h-9 w-9 flex items-center justify-center rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400">
                                            <Rocket className="h-4 w-4" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400">
                                                Release Blogs
                                            </span>
                                            <span className="text-sm font-medium">
                                                {curr_project?.releaseBlogs?.length || 0}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </CardHeader>
                        </Card>
                    </div>

                    {/* Sync Status */}
                    {syncStatus && (
                        <Card
                            className={
                                surface +
                                ' shadow-none border-dashed rounded-xl px-4 py-3'
                            }
                        >
                            <CardHeader className="pb-2 px-2">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        {syncStatus.status === 'BUILDING' && (
                                            <Loader2 className="h-4 w-4 animate-spin text-indigo-500" />
                                        )}
                                        {syncStatus.status === 'READY' && (
                                            <CheckCircle className="h-4 w-4 text-green-500" />
                                        )}
                                        {syncStatus.status === 'ERROR' && (
                                            <XCircle className="h-4 w-4 text-red-500" />
                                        )}
                                        <CardTitle className="text-base">
                                            Release Sync Status
                                        </CardTitle>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={handleClearStatus}
                                    >
                                        Clear
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="px-2 pt-0">
                                <div className="flex flex-wrap items-center gap-3 text-sm">
                                    <Badge variant={getStatusBadgeVariant(syncStatus.status)}>
                                        {syncStatus.status}
                                    </Badge>
                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                        {new Date(syncStatus.timestamp).toLocaleTimeString()}
                                    </span>
                                    <span className="text-gray-700 dark:text-gray-300">
                                        {syncStatus.message}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Main Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                        {/* Release Blogs */}
                        <div className="lg:col-span-2 space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="text-xl font-semibold flex items-center gap-2">
                                    <BookOpen className="h-5 w-5" />
                                    Release Blogs
                                    <Badge variant="outline" className="text-xs px-2 py-0.5">
                                        {curr_project?.releaseBlogs?.length || 0}
                                    </Badge>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Button
                                        onClick={handleSyncRelease}
                                        disabled={isLoading}
                                        size="sm"
                                        className="gap-2"
                                    >
                                        {isLoading ? (
                                            <>
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                Syncing
                                            </>
                                        ) : (
                                            <>
                                                <Rocket className="h-4 w-4" />
                                                Sync
                                            </>
                                        )}
                                    </Button>
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        className="gap-2"
                                        onClick={() => setIsAddReleaseBlogModalOpen(true)}
                                    >
                                        <FilePlus2 className="h-4 w-4" />
                                        Add
                                    </Button>
                                </div>
                            </div>

                            {curr_project?.releaseBlogs &&
                                curr_project?.releaseBlogs?.length > 0 ? (
                                <div className="space-y-4 overflow-y-auto custom-small-scrollbar max-h-[50vh] pr-1">
                                    {curr_project?.releaseBlogs?.map((blog: any, idx: number) => {
                                        const statusVariant = getStatusBadgeVariant(blog.status)
                                        return (
                                            <Link key={idx} className={`${blogCardBase} cursor-pointer`} href={`/project/${projectId}/edit/${blog._id}`}>
                                                <CardHeader className="px-5 pb-4 pt-5 relative">
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex flex-wrap items-center gap-3">
                                                                <CardTitle className="text-lg font-semibold truncate">
                                                                    {blog?.releaseTitle ||
                                                                        blog?.blogTitle ||
                                                                        'Untitled Release'}
                                                                </CardTitle>
                                                                {blog?.status && (
                                                                    <Badge
                                                                        variant={statusVariant}
                                                                        className="text-[10px] px-2 py-0.5 flex items-center gap-1"
                                                                    >
                                                                        {blog.status === 'BUILDING' && (
                                                                            <Loader2 className="h-3 w-3 animate-spin" />
                                                                        )}
                                                                        {blog.status === 'READY' && (
                                                                            <CheckCircle className="h-3 w-3" />
                                                                        )}
                                                                        {blog.status === 'ERROR' && (
                                                                            <AlertCircle className="h-3 w-3" />
                                                                        )}
                                                                        {blog.status}
                                                                    </Badge>
                                                                )}
                                                            </div>

                                                            <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 dark:text-gray-400 mt-3">
                                                                <div className="flex items-center gap-1">
                                                                    <Clock className="h-3 w-3" />
                                                                    {getLastModifiedText(
                                                                        blog?.createdAt || blog?.publishedAt
                                                                    )}
                                                                </div>
                                                                {blog?.commitId && (
                                                                    <div className="flex items-center gap-1">
                                                                        <GitCommit className="h-3 w-3" />
                                                                        <code className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-[10px]">
                                                                            {blog.commitId.substring(0, 7)}
                                                                        </code>
                                                                    </div>
                                                                )}
                                                            </div>

                                                            {blog?.blogContentText && (
                                                                <CardDescription className="mt-3 text-sm leading-relaxed line-clamp-3">
                                                                    {blog.blogContentText}
                                                                </CardDescription>
                                                            )}
                                                        </div>

                                                        <div className="flex items-start gap-2">
                                                            <Button
                                                                variant="outline"
                                                                size="icon"
                                                                onClick={(e) => {
                                                                    e.preventDefault()
                                                                    handleEditReleaseBlog(blog)
                                                                }}
                                                                className="h-8 w-8"
                                                            >
                                                                <Edit className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                variant="destructive"
                                                                size="icon"
                                                                onClick={(e) => {
                                                                    e.preventDefault()
                                                                    handleDeleteReleaseBlog(blog)
                                                                }}
                                                                className="h-8 w-8"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </CardHeader>
                                            </Link>
                                        )
                                    })}
                                </div>
                            ) : (
                                <Card className={surface + ' shadow-none p-0'}>
                                    <CardContent className="flex items-center justify-center h-48">
                                        <div className="text-center space-y-3">
                                            <BookOpen className="h-10 w-10 text-gray-400 mx-auto" />
                                            <h3 className="text-base font-semibold">
                                                No release blogs yet
                                            </h3>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
                                                Use Sync or Add to create the first release blog.
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            <Card className={surface + ' shadow-none'}>
                                <CardHeader>
                                    <CardTitle className="text-base">Project Info</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-5 text-sm">
                                    <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                                        <div>
                                            <span className="text-gray-500 dark:text-gray-400 block text-xs mb-1">
                                                Owner
                                            </span>
                                            <p className="font-medium break-all">
                                                {curr_project?.username}
                                            </p>
                                        </div>
                                        <div>
                                            <span className="text-gray-500 dark:text-gray-400 block text-xs mb-1">
                                                Keyword
                                            </span>
                                            <p className="font-medium capitalize">
                                                {curr_project?.releaseTriggerKeyword}
                                            </p>
                                        </div>
                                        <div>
                                            <span className="text-gray-500 dark:text-gray-400 block text-xs mb-1">
                                                Language
                                            </span>
                                            {curr_project?.language && (
                                                <div className="flex gap-2 items-center">
                                                    <span
                                                        className="w-2.5 h-2.5 rounded-full"
                                                        style={{
                                                            backgroundColor:
                                                                languageColors[curr_project?.language] ||
                                                                '#586069'
                                                        }}
                                                    />
                                                    <span>{curr_project?.language}</span>
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <span className="text-gray-500 dark:text-gray-400 block text-xs mb-1">
                                                Branch
                                            </span>
                                            <p className="font-medium">
                                                {curr_project?.defaultBranch}
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className={surface + ' shadow-none'}>
                                <CardHeader>
                                    <CardTitle className="text-base">Actions</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <Link href={curr_project?.repoUrl || '/'} target="_blank">
                                        <Button
                                            className="w-full justify-center"
                                            variant="outline"
                                        >
                                            <ExternalLink className="h-4 w-4 mr-2" />
                                            View Repo
                                        </Button>
                                    </Link>
                                    <Button
                                        className="w-full justify-center"
                                        variant="default"
                                        onClick={handleEditProject}
                                        disabled={isProjectLoading}
                                    >
                                        <Settings className="h-4 w-4 mr-2" />
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
            )}
        </div>
    )
}