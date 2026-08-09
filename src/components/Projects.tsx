'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { GitHubLogoIcon } from '@radix-ui/react-icons'
import { Album, ArrowRight, ExternalLink, FolderGit2, GitBranch, GitCommit, Loader2, MoreHorizontal, Search, Trash2 } from 'lucide-react'

import ConfirmDeleteProject from '@/components/ConfirmDeleteProject'
import GithubRepoModal from '@/components/GithubRepoModal'
import ProGate from '@/components/ProGate'
import ProjectsListSkeleton from '@/components/skeletons/ProjectsListSkeleton'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { useInsertProjects } from '@/features/project/context/InsertProjectProvider'
import { useInsertUser } from '@/features/user/context/InsertUserProvider'
import { getLastModifiedText } from '@/helpers/last-modified'
import { externalServices } from '@/lib/config/services'
import { languageColors } from '@/types/master-data'

export default function Projects() {
    const { data: session, status } = useSession()
    const { username } = useParams()
    const { currentUser } = useInsertUser()
    const { user_projects, removeProject, pagination, isAllProjectsLoading, isUserProjectsLoading, loadMore } = useInsertProjects()
    const [isRepoModalOpen, setIsRepoModalOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, projectId: '', projectName: '', isDeleting: false })
    const isOwner = status === 'authenticated' && session?.user?.username === username
    const hasGithub = Boolean(session?.user?.githubAccessToken)

    const filteredProjects = useMemo(() => {
        const query = searchQuery.trim().toLowerCase()
        if (!query) return user_projects || []
        return (user_projects || []).filter((project) => [project.name, project.description, project.language].filter(Boolean).some((value) => String(value).toLowerCase().includes(query)))
    }, [searchQuery, user_projects])

    const initialLoading = hasGithub && (isUserProjectsLoading || (isAllProjectsLoading && user_projects.length === 0))
    const confirmDelete = async () => {
        try {
            setDeleteConfirm((value) => ({ ...value, isDeleting: true }))
            await removeProject(deleteConfirm.projectId)
            setDeleteConfirm({ isOpen: false, projectId: '', projectName: '', isDeleting: false })
        } catch {
            setDeleteConfirm((value) => ({ ...value, isDeleting: false }))
        }
    }

    return (
        <div className="space-y-6">
            <ProGate show={currentUser?.proStatus?.active === false} />
            <GithubRepoModal isOpen={isRepoModalOpen} onClose={() => setIsRepoModalOpen(false)} />

            <section className="rounded-2xl border border-slate-200 bg-white/65 p-5 shadow-sm backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/55 sm:p-7">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                    <div><p className="text-[10px] font-medium uppercase tracking-[0.18em] text-emerald-600 dark:text-emerald-300">Project workspace</p><h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em]">Repositories & releases</h1><p className="mt-2 text-sm text-slate-500">Connect GitHub projects and document every important release.</p></div>
                    {hasGithub && <div className="flex w-full items-center gap-3 lg:w-auto"><label className="flex h-11 flex-1 items-center gap-2 rounded-xl border border-slate-200 bg-white/70 px-3 dark:border-slate-800 dark:bg-slate-950/60 lg:min-w-80"><Search className="h-4 w-4 text-slate-400" /><Input value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Search projects, stacks..." className="h-auto border-0 bg-transparent p-0 shadow-none focus-visible:ring-0" /></label>{isOwner && <Button className="h-11 rounded-xl" onClick={() => setIsRepoModalOpen(true)}><Album className="mr-2 h-4 w-4" />New project</Button>}</div>}
                </div>
                <div className="mt-5 border-t border-slate-200 pt-4 text-xs text-slate-500 dark:border-slate-800">{filteredProjects.length} project{filteredProjects.length === 1 ? '' : 's'}{searchQuery ? ` matching “${searchQuery}”` : ''}</div>
            </section>

            {!hasGithub ? <div className="flex min-h-80 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white/45 p-8 text-center dark:border-slate-700 dark:bg-slate-950/35"><span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-900"><GitHubLogoIcon className="h-6 w-6" /></span><h2 className="mt-5 text-lg font-semibold">Connect your GitHub workspace</h2><p className="mt-2 max-w-md text-sm leading-6 text-slate-500">Authorize GitHub to import repositories and generate release journals from monitored projects.</p>{isOwner && <Button className="mt-6" onClick={() => { window.location.href = `${externalServices.project.apiBaseUrl}/oauth2/authorize/github?userId=${session?.user?._id}&username=${session?.user?.username}` }}><GitHubLogoIcon className="mr-2" />Authorize with GitHub</Button>}</div> : initialLoading ? <ProjectsListSkeleton count={4} /> : filteredProjects.length ? (
                <div className="grid auto-rows-fr gap-3 md:grid-cols-2 xl:grid-cols-3">
                    {filteredProjects.map((project) => <article key={project.id} className="group flex min-h-72 flex-col rounded-2xl border border-slate-200 bg-white/65 p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-400/40 dark:border-slate-800 dark:bg-slate-950/55">
                        <div className="flex items-start justify-between gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500"><FolderGit2 className="h-5 w-5" /></span><div className="flex items-center gap-2"><Badge variant={project.visibility === 'private' ? 'destructive' : 'secondary'} className="text-[9px] uppercase">{project.visibility || 'public'}</Badge>{isOwner && <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuItem className="text-red-600" onClick={() => setDeleteConfirm({ isOpen: true, projectId: project.id, projectName: project.name || 'Project', isDeleting: false })}><Trash2 className="mr-2 h-4 w-4" />Delete project</DropdownMenuItem></DropdownMenuContent></DropdownMenu>}</div></div>
                        <Link href={`/project/${project.id}`} className="mt-6 flex items-start justify-between gap-3"><h2 className="line-clamp-2 text-xl font-semibold tracking-tight group-hover:text-emerald-600 dark:group-hover:text-emerald-300">{project.name || 'Untitled project'}</h2><ArrowRight className="mt-1 h-4 w-4 shrink-0 transition-transform group-hover:translate-x-1" /></Link>
                        <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-500">{project.description || 'A connected Insert project with release-ready notes.'}</p>
                        <div className="mt-auto flex flex-wrap items-center gap-2 border-t border-slate-200 pt-4 text-xs text-slate-500 dark:border-slate-800">{project.language && <span className="inline-flex items-center gap-2"><span className="h-2 w-2 rounded-full" style={{ backgroundColor: languageColors[project.language] || '#64748b' }} />{project.language}</span>}{project.defaultBranch && <span className="inline-flex items-center gap-1"><GitBranch className="h-3.5 w-3.5" />{project.defaultBranch}</span>}{project.lastMonitoredCommitSha && <span className="inline-flex items-center gap-1 font-mono"><GitCommit className="h-3.5 w-3.5" />{project.lastMonitoredCommitSha.slice(0, 7)}</span>}<span className="ml-auto">{getLastModifiedText(project.updatedAt || project.createdAt)}</span>{project.repoUrl && <Link href={project.repoUrl} target="_blank" rel="noopener noreferrer" aria-label="Open repository"><ExternalLink className="h-4 w-4" /></Link>}</div>
                    </article>)}
                </div>
            ) : <div className="flex min-h-72 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white/45 text-center dark:border-slate-700 dark:bg-slate-950/35"><FolderGit2 className="h-7 w-7 text-slate-400" /><h3 className="mt-3 font-medium">No projects found</h3><p className="mt-1 text-sm text-slate-500">{searchQuery ? 'Try a different project name or technology.' : 'Imported repositories will appear here.'}</p></div>}

            {pagination?.hasMore && !searchQuery && <div className="flex justify-center"><Button variant="outline" className="rounded-xl" disabled={isAllProjectsLoading} onClick={loadMore}>{isAllProjectsLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Load more projects</Button></div>}
            <ConfirmDeleteProject deleteConfirm={deleteConfirm} onConfirm={confirmDelete} onCancel={() => setDeleteConfirm({ isOpen: false, projectId: '', projectName: '', isDeleting: false })} />
        </div>
    )
}
