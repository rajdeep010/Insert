'use client'

import React, { useEffect, useRef, useState } from 'react'
import {
    AlertCircle,
    BookOpen,
    Calendar,
    CheckCircle,
    Clock,
    Edit,
    ExternalLink,
    FilePlus2,
    GitCommit,
    Loader2,
    FileText,
    RefreshCcw,
    Rocket,
    Settings,
    Trash2,
    XCircle,
} from 'lucide-react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { useParams } from 'next/navigation'

import { useInsertProjects } from '@/features/project/context/InsertProjectProvider'
import { languageColors } from '@/types/master-data'
import { getLastModifiedText } from '@/helpers/last-modified'

import InsertNavbar from '@/components/InsertNavbar'
import ShareLinkButton from '@/components/ShareLinkButton'
import EditProjectModal from '@/components/EditProjectModal'
import EditReleaseBlogModal from '@/components/EditReleaseBlog'
import DeleteReleaseBlogModal from '@/components/DeleteReleaseBlogModal'
import AddReleaseBlogModal from '@/components/AddReleaseBlogModal'
import ReleaseDraftTemplateModal from '@/components/ReleaseDraftTemplateModal'
import { toast } from '@/components/ui/use-toast'
import { toReleaseDraftTemplate } from '@/features/project/utils/releaseDraftTemplate'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import ReleaseBlogsSkeleton from '@/components/skeletons/ReleaseBlogsSkeleton'
import ProjectDetailSkeleton from '@/components/skeletons/ProjectDetailSkeleton'

const shellCard =
    'rounded-2xl border border-slate-200/80 bg-white/70 backdrop-blur-xl dark:border-slate-800/90 dark:bg-slate-950/55'
const metricCard =
    'rounded-xl border border-slate-200/75 bg-white/70 px-4 py-3 dark:border-slate-800/80 dark:bg-slate-950/45'
const blogCard =
    'rounded-2xl border border-slate-200/80 bg-white/75 transition-colors hover:border-indigo-400/40 dark:border-slate-800/80 dark:bg-slate-950/55 dark:hover:border-indigo-400/45'

const blogTone = [
    'border-indigo-200/80 bg-indigo-500/[0.04] dark:border-indigo-500/20 dark:bg-indigo-500/[0.08] hover:border-indigo-400/50',
    'border-cyan-200/80 bg-cyan-500/[0.04] dark:border-cyan-500/20 dark:bg-cyan-500/[0.08] hover:border-cyan-400/50',
    'border-emerald-200/80 bg-emerald-500/[0.04] dark:border-emerald-500/20 dark:bg-emerald-500/[0.08] hover:border-emerald-400/50',
    'border-amber-200/80 bg-amber-500/[0.04] dark:border-amber-500/20 dark:bg-amber-500/[0.08] hover:border-amber-400/50',
]

export default function Page() {
    const { status } = useSession()
    const {
        curr_project,
        isProjectLoading,
        fetchProjectById,
        fetchReleaseBlogForProject,
        updateReleaseDraftTemplate,
        syncRelease,
        isSyncingRelease,
        isReleaseBlogLoading,
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
    const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false)
    const [isSavingTemplate, setIsSavingTemplate] = useState(false)
    const lastRequestedProjectRef = useRef<string | null>(null)

    useEffect(() => {
        if (status !== 'authenticated' || !projectId) return
        if (curr_project?.id === projectId) return
        if (lastRequestedProjectRef.current === projectId && isProjectLoading) return

        lastRequestedProjectRef.current = projectId
        fetchProjectById(projectId)
    }, [curr_project?.id, fetchProjectById, isProjectLoading, projectId, status])

    const project = curr_project?.id === projectId ? curr_project : null
    const isLoading = isSyncingRelease[projectId] || false
    const syncStatus = releaseSyncStatus[projectId]

    const formatDate = (dateString?: string) =>
        !dateString
            ? ''
            : new Date(dateString).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
            })

    const formatRelativeTime = (dateString?: string) => {
        if (!dateString) return ''
        const date = new Date(dateString)
        const now = new Date()
        const diffInHours = Math.floor((now.getTime() - date.getTime()) / 36e5)
        if (diffInHours < 24) return `${diffInHours}h ago`
        const diffInDays = Math.floor(diffInHours / 24)
        return `${diffInDays}d ago`
    }

    const lastCommitSha =
        typeof project?.lastMonitoredCommitSha === 'string' ? project.lastMonitoredCommitSha : ''

    const handleSyncRelease = async () => {
        await syncRelease(projectId)
    }

    const handleRefreshReleaseBlogs = async () => {
        if (!projectId) return
        await fetchReleaseBlogForProject(projectId)
    }

    const handleClearStatus = () => clearReleaseSyncStatus(projectId)

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

    const getStatusBadgeVariant = (value: string) =>
        value === 'READY' ? 'default' : value === 'ERROR' ? 'destructive' : 'secondary'

    const handleSaveDraftTemplate = async (template: string) => {
        if (!project) return

        try {
            setIsSavingTemplate(true)
            const nextTemplate = template.trim()
            await updateReleaseDraftTemplate(project.id, nextTemplate)
            toast({
                title: 'Template saved',
                description: 'Release draft template has been updated.',
            })
            setIsTemplateModalOpen(false)
        } catch {
            toast({
                title: 'Save failed',
                description: 'Could not update the release draft template.',
                variant: 'destructive',
            })
        } finally {
            setIsSavingTemplate(false)
        }
    }

    if (status === 'authenticated' && !project) {
        return (
            isProjectLoading ? <ProjectDetailSkeleton /> : (
                <main className="relative min-h-screen overflow-hidden bg-slate-50 text-slate-950 dark:bg-[#020817] dark:text-slate-50">
                    <div
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-0 opacity-60 dark:opacity-100 [background-image:linear-gradient(to_right,rgba(100,116,139,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(100,116,139,0.08)_1px,transparent_1px)] [background-size:48px_48px]"
                    />
                    <div className="relative mx-auto w-full max-w-[1560px] px-4 py-5 sm:px-8 lg:px-12 lg:py-8">
                        <InsertNavbar />
                        <div className="flex min-h-[58vh] items-center justify-center">
                            <Card className={shellCard + ' w-full max-w-xl'}>
                                <CardContent className="p-8 text-center">
                                    <p className="text-lg font-semibold">Project not available</p>
                                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                                        This project may have been removed or you may not have access.
                                    </p>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </main>
            )
        )
    }

    if (!project) return null

    return (
        <>
            <main className="relative min-h-screen overflow-hidden bg-slate-50 text-slate-950 dark:bg-[#020817] dark:text-slate-50">
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 opacity-60 dark:opacity-100 [background-image:linear-gradient(to_right,rgba(100,116,139,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(100,116,139,0.08)_1px,transparent_1px)] [background-size:48px_48px] [mask-image:linear-gradient(to_bottom,black,transparent_95%)]"
                />
                <div aria-hidden="true" className="pointer-events-none absolute left-[8%] top-0 h-72 w-72 rounded-full bg-indigo-500/10 blur-[120px]" />
                <div aria-hidden="true" className="pointer-events-none absolute right-[8%] top-52 h-72 w-72 rounded-full bg-cyan-500/10 blur-[120px]" />

                <div className="relative mx-auto w-full max-w-[1560px] px-4 py-2 sm:px-8 lg:px-12 lg:py-2">
                    <InsertNavbar />

                    <section className="mt-5 grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(330px,0.52fr)] lg:items-end lg:py-12">
                        <div>
                            <h1 className="max-w-4xl text-2xl font-semibold tracking-[-0.04em] sm:text-5xl lg:text-5xl">
                                {project.name}
                            </h1>
                            <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                                <span className="font-medium text-slate-900 dark:text-slate-100">@{project.username}</span>
                                <span>•</span>
                                <span>Updated {formatRelativeTime(project.updatedAt)}</span>
                                {project.language && (
                                    <>
                                        <span>•</span>
                                        <span className="inline-flex items-center gap-1.5">
                                            <span
                                                className="h-2.5 w-2.5 rounded-full"
                                                style={{ backgroundColor: languageColors[project.language] || '#64748b' }}
                                            />
                                            {project.language}
                                        </span>
                                    </>
                                )}
                                <Badge
                                    variant={project.visibility === 'private' ? 'destructive' : 'secondary'}
                                    className="uppercase tracking-wide text-[10px]"
                                >
                                    {project.visibility}
                                </Badge>
                                <Badge variant={webSocketConnected ? 'default' : 'destructive'} className="text-[11px]">
                                    {webSocketConnected ? 'Connected' : 'Offline'}
                                </Badge>
                            </div>
                            <p className="mt-5 max-w-2xl text-sm leading-7 text-slate-600 dark:text-slate-400">
                                {project.description?.trim() || 'No description available for this project yet.'}
                            </p>
                        </div>

                        <div className={shellCard + ' p-4'}>
                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-14 w-14 border border-slate-200 dark:border-slate-800">
                                        <AvatarImage src={typeof project.avatar === 'string' ? project.avatar : undefined} />
                                        <AvatarFallback className="font-semibold">
                                            {project.username?.slice(0, 2).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="text-sm font-semibold">{project.defaultBranch}</p>
                                        <p className="text-xs text-slate-600 dark:text-slate-400">Default branch</p>
                                    </div>
                                </div>

                                <div className="flex flex-wrap items-center gap-2">
                                    <ShareLinkButton
                                        path={`/project/${projectId}`}
                                        title={project.name || 'Insert project'}
                                        text={`Check out this project on Insert: ${project.name || 'Untitled project'}`}
                                        className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm dark:border-slate-800 dark:bg-slate-950"
                                    />
                                    <Link href={project.repoUrl || '/'} target="_blank" rel="noopener noreferrer">
                                        <span className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm dark:border-slate-800 dark:bg-slate-950">
                                            <ExternalLink className="h-4 w-4" />
                                            Open Repo
                                        </span>
                                    </Link>
                                </div>
                            </div>

                            <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
                                <div className={metricCard}>
                                    <p className="text-[11px] uppercase tracking-wide text-slate-500 dark:text-slate-400">Created</p>
                                    <p className="mt-1 text-sm font-medium">{formatDate(project.createdAt)}</p>
                                </div>
                                <div className={metricCard}>
                                    <p className="text-[11px] uppercase tracking-wide text-slate-500 dark:text-slate-400">Last Commit</p>
                                    <p className="mt-1 text-sm font-medium">{lastCommitSha ? lastCommitSha.substring(0, 7) : '—'}</p>
                                </div>
                                <div className={metricCard}>
                                    <p className="text-[11px] uppercase tracking-wide text-slate-500 dark:text-slate-400">Release Blogs</p>
                                    <p className="mt-1 text-sm font-medium">{project.releaseBlogs?.length || 0}</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {syncStatus && (
                        <section className="py-6">
                            <Card className={shellCard}>
                                <CardHeader className="pb-2">
                                    <div className="flex items-center justify-between gap-3">
                                        <div className="flex items-center gap-2">
                                            {syncStatus.status === 'BUILDING' && (
                                                <Loader2 className="h-4 w-4 animate-spin text-indigo-500" />
                                            )}
                                            {syncStatus.status === 'READY' && (
                                                <CheckCircle className="h-4 w-4 text-emerald-500" />
                                            )}
                                            {syncStatus.status === 'ERROR' && (
                                                <XCircle className="h-4 w-4 text-rose-500" />
                                            )}
                                            <CardTitle className="text-base">Release Sync Status</CardTitle>
                                        </div>
                                        <Button variant="ghost" size="sm" onClick={handleClearStatus}>
                                            Clear
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex flex-wrap items-center gap-3 text-sm">
                                        <Badge variant={getStatusBadgeVariant(syncStatus.status)}>{syncStatus.status}</Badge>
                                        <span className="text-xs text-slate-500 dark:text-slate-400">
                                            {new Date(syncStatus.timestamp).toLocaleTimeString()}
                                        </span>
                                        <span className="text-slate-700 dark:text-slate-300">{syncStatus.message}</span>
                                    </div>
                                </CardContent>
                            </Card>
                        </section>
                    )}

                    <section className="grid gap-6 pb-10 lg:grid-cols-[minmax(0,1fr)_340px]">
                        <div className="space-y-4">
                            <Card className={shellCard}>
                                <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
                                    <div className="flex items-center gap-2 text-xl font-semibold tracking-tight">
                                        <BookOpen className="h-5 w-5" />
                                        Release Blogs
                                        {/* <Badge variant="outline" className="text-xs px-2 py-0.5">
                                            {project.releaseBlogs?.length || 0}
                                        </Badge> */}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="gap-2"
                                            onClick={() => setIsTemplateModalOpen(true)}
                                        >
                                            <FileText className="h-4 w-4" />
                                            {project.releaseDraftTemplate ? 'Update Template' : 'Add Template'}
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="gap-2"
                                            onClick={handleRefreshReleaseBlogs}
                                            disabled={isReleaseBlogLoading}
                                        >
                                            <RefreshCcw className={`h-4 w-4 ${isReleaseBlogLoading ? 'animate-spin' : ''}`} />
                                            Refresh
                                        </Button>
                                        <Button onClick={handleSyncRelease} disabled={isLoading} size="sm" className="gap-2">
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
                                </CardContent>
                            </Card>

                            {isReleaseBlogLoading ? (
                                <ReleaseBlogsSkeleton count={4} />
                            ) : project.releaseBlogs && project.releaseBlogs.length > 0 ? (
                                <div className="custom-small-scrollbar max-h-[58vh] space-y-3 overflow-y-auto pr-1">
                                    {project.releaseBlogs.map((blog: any, idx: number) => {
                                        const statusVariant = getStatusBadgeVariant(blog.status)
                                        return (
                                            <Link key={idx} className="block" href={`/project/${projectId}/edit/${blog._id}`}>
                                                <Card className={blogCard}>
                                                    <CardHeader className="px-5 pb-4 pt-5">
                                                        <div className="flex items-start justify-between gap-4">
                                                            <div className="min-w-0 flex-1">
                                                                <div className="flex flex-wrap items-center gap-2">
                                                                    <CardTitle className="truncate text-lg font-semibold">
                                                                        {blog?.releaseTitle || blog?.blogTitle || 'Untitled Release'}
                                                                    </CardTitle>
                                                                    {blog?.status && (
                                                                        <Badge
                                                                            variant={statusVariant}
                                                                            className="flex items-center gap-1 px-2 py-0.5 text-[10px]"
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

                                                                <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                                                                    <span className="inline-flex items-center gap-1.5 rounded border border-slate-200 px-2 py-1 dark:border-slate-800">
                                                                        <Clock className="h-3 w-3" />
                                                                        {getLastModifiedText(blog?.createdAt || blog?.publishedAt)}
                                                                    </span>
                                                                    {blog?.commitId && (
                                                                        <span className="inline-flex items-center gap-1.5 rounded border border-slate-200 px-2 py-1 dark:border-slate-800">
                                                                            <GitCommit className="h-3 w-3" />
                                                                            <code className="text-[10px]">{blog.commitId.substring(0, 7)}</code>
                                                                        </span>
                                                                    )}
                                                                </div>

                                                                {blog?.blogContentText && (
                                                                    <CardDescription className="mt-3 line-clamp-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
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
                                                </Card>
                                            </Link>
                                        )
                                    })}
                                </div>
                            ) : (
                                <Card className={shellCard}>
                                    <CardContent className="flex h-48 items-center justify-center">
                                        <div className="space-y-2 text-center">
                                            <BookOpen className="mx-auto h-8 w-8 text-slate-400" />
                                            <h3 className="text-base font-semibold">No release blogs yet</h3>
                                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                                Use Sync or Add to create the first release blog.
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </div>

                        <div className="space-y-4">
                            <Card className={shellCard + ' border-violet-200/80 bg-violet-500/[0.05] dark:border-violet-500/20 dark:bg-violet-500/[0.08]'}>
                                <CardHeader>
                                    <CardTitle className="text-base">Release Draft Template</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3 text-sm">
                                    <p className="text-slate-600 dark:text-slate-400 mt-[-15px]">
                                        Configure the default draft content used when adding a new release blog.
                                    </p>
                                    <Button
                                        variant="outline"
                                        className="w-full justify-center"
                                        onClick={() => setIsTemplateModalOpen(true)}
                                    >
                                        <FileText className="mr-2 h-4 w-4" />
                                        {(project.releaseDraftTemplate || '').trim() ? 'Update Template' : 'Add Template'}
                                    </Button>
                                </CardContent>
                            </Card>

                            <Card className={shellCard + ' border-sky-200/80 bg-sky-500/[0.05] dark:border-sky-500/20 dark:bg-sky-500/[0.08]'}>
                                <CardHeader>
                                    <CardTitle className="text-base">Project Info</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-5 text-sm">
                                    <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                                        <div>
                                            <span className="mb-1 block text-xs text-slate-500 dark:text-slate-400">Owner</span>
                                            <p className="break-all font-medium">{project.username}</p>
                                        </div>
                                        <div>
                                            <span className="mb-1 block text-xs text-slate-500 dark:text-slate-400">Keyword</span>
                                            <p className="font-medium capitalize">{project.releaseTriggerKeyword}</p>
                                        </div>
                                        <div>
                                            <span className="mb-1 block text-xs text-slate-500 dark:text-slate-400">Language</span>
                                            {project.language && (
                                                <div className="flex items-center gap-2">
                                                    <span
                                                        className="h-2.5 w-2.5 rounded-full"
                                                        style={{ backgroundColor: languageColors[project.language] || '#586069' }}
                                                    />
                                                    <span>{project.language}</span>
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <span className="mb-1 block text-xs text-slate-500 dark:text-slate-400">Branch</span>
                                            <p className="font-medium">{project.defaultBranch}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className={shellCard + ' border-emerald-200/80 bg-emerald-500/[0.05] dark:border-emerald-500/20 dark:bg-emerald-500/[0.08]'}>
                                <CardHeader>
                                    <CardTitle className="text-base">Actions</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <Link href={project.repoUrl || '/'} target="_blank">
                                        <Button className="w-full justify-center" variant="outline">
                                            <ExternalLink className="mr-2 h-4 w-4" />
                                            View Repo
                                        </Button>
                                    </Link>
                                    <Button
                                        className="w-full justify-center"
                                        variant="default"
                                        onClick={() => setIsEditModalOpen(true)}
                                        disabled={isProjectLoading}
                                    >
                                        <Settings className="mr-2 h-4 w-4" />
                                        Edit Project
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                    </section>
                </div>
            </main>

            <EditProjectModal
                isOpen={isEditModalOpen}
                onClose={handleCloseEditModal}
                project={project}
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
            <ReleaseDraftTemplateModal
                open={isTemplateModalOpen}
                currentTemplate={project.releaseDraftTemplate as string | undefined}
                isSaving={isSavingTemplate}
                onClose={() => setIsTemplateModalOpen(false)}
                onSave={handleSaveDraftTemplate}
            />
        </>
    )
}
