'use client'
import { useSession } from 'next-auth/react'
import { useParams } from 'next/navigation'
import React, { useMemo, useState } from 'react'
import { Button } from './ui/button';
import { Input } from './ui/input';
import Link from 'next/link';
import { FiExternalLink } from 'react-icons/fi';
import { Album, GitBranch, MoreHorizontal, Trash2, Search } from 'lucide-react'
import { Badge } from './ui/badge'
import {
    Card,
    CardDescription,
    CardHeader,
    CardTitle,
    CardContent,
} from "@/components/ui/card"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from './ui/separator'
import { GitHubLogoIcon } from '@radix-ui/react-icons'
import { useInsertProjects } from '@/features/project/context/InsertProjectProvider'
import GithubRepoModal from './GithubRepoModal'
import { languageColors } from '@/types/master-data'
import ConfirmDeleteProject from './ConfirmDeleteProject'
import { useInsertUser } from '@/features/user/context/InsertUserProvider';
import ProGate from './ProGate';
import { externalServices } from '@/lib/config/services';



const surface =
    'rounded-2xl border border-black/[0.08] dark:border-white/[0.08] bg-white/60 dark:bg-gray-900/40 supports-[backdrop-filter]:bg-white/40 transition-colors'
const hoverable =
    'transition-colors hover:border-black/20 dark:hover:border-white/30'

const NEXT_PROJECT_SERVICE_URL = externalServices.project.apiBaseUrl

const Projects = () => {
    const { data: session, status } = useSession();
    const params = useParams();
    const username = params.username as string;

    const { currentUser } = useInsertUser();

    const showSubscribeModal = currentUser?.proStatus?.active === false;

    const { user_projects, removeProject, updateProject, pagination, isAllProjectsLoading, loadMore } = useInsertProjects();
    const [isRepoModalOpen, setIsRepoModalOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')

    const filteredProjects = useMemo(() => {
        return user_projects?.filter(project =>
            project?.name?.toLowerCase().includes(searchQuery.toLowerCase())
        )
    }, [searchQuery, user_projects])

    const [deleteConfirm, setDeleteConfirm] = useState({
        isOpen: false,
        projectId: '',
        projectName: '',
        isDeleting: false
    })

    const handleDeleteProject = (id: string, name: string) => {
        setDeleteConfirm({
            isOpen: true,
            projectId: id,
            projectName: name,
            isDeleting: false
        })
    }

    // Confirm delete action
    const confirmDelete = async () => {
        try {
            setDeleteConfirm(prev => ({ ...prev, isDeleting: true }))
            await removeProject(deleteConfirm.projectId)
            setDeleteConfirm({
                isOpen: false,
                projectId: '',
                projectName: '',
                isDeleting: false
            })
        } catch (error) {
            setDeleteConfirm(prev => ({ ...prev, isDeleting: false }))
        }
    }

    // Cancel delete action
    const cancelDelete = () => {
        setDeleteConfirm({
            isOpen: false,
            projectId: '',
            projectName: '',
            isDeleting: false
        })
    }

    
    return (
        <div className="flex flex-col gap-6">
            <ProGate show={showSubscribeModal} />

            {session?.user?.githubAccessToken && (
                <>
                    <div className="flex items-center justify-between flex-wrap gap-3">
                        <span className="flex items-center gap-2 text-[13px] uppercase tracking-wider font-semibold px-2 py-1 rounded bg-purple-200/70 dark:bg-purple-800/60 text-purple-900 dark:text-purple-200">
                            Projects
                            {filteredProjects && (
                                <Badge variant="secondary" className="text-xs">
                                    {filteredProjects?.length || 0}
                                </Badge>
                            )}
                        </span>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                            {filteredProjects?.length ?? 0} shown{searchQuery ? ` of ${user_projects?.length ?? 0}` : ""}
                        </div>
                    </div>

                    <div className="flex gap-3 items-center justify-between">
                        <div className={`${surface} ${hoverable} shadow-none p-2 pr-3 flex items-center gap-2 w-full`}>
                            <div className="pl-2 pr-1 text-gray-500">
                                <Search className="h-4 w-4" />
                            </div>
                            <Input
                                type="text"
                                placeholder="Search by project name…"
                                className="border-0 focus-visible:ring-0 bg-transparent"
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                            />
                        </div>

                        <Button
                            className="gap-2 flex items-center px-4 py-2 rounded-md cursor-pointer bg-green-700 text-white hover:bg-green-800"
                            onClick={() => setIsRepoModalOpen(true)}
                        >
                            <Album className="h-4 w-4" /> <span className="text-sm">New</span>
                        </Button>
                    </div>
                </>
            )}

            <GithubRepoModal
                isOpen={isRepoModalOpen}
                onClose={() => setIsRepoModalOpen(false)}
            />

            <Separator />

            {!session?.user?.githubAccessToken && (
                <Card className={`${surface} shadow-none`}>
                    <CardContent className="h-[50vh] flex justify-center items-center flex-col gap-4 p-8">
                        <div className="text-gray-500 dark:text-gray-400 text-center">
                            You don’t have any projects yet.
                        </div>
                        <Button
                            className="flex gap-2 items-center bg-green-700 text-white hover:bg-green-800"
                            onClick={() =>
                                window.location.href = `${NEXT_PROJECT_SERVICE_URL}/oauth2/authorize/github?userId=${session?.user?._id}&username=${session?.user?.username}`
                            }
                        >
                            <GitHubLogoIcon />
                            Authorize With Github
                        </Button>
                    </CardContent>
                </Card>
            )}

            {session?.user?.githubAccessToken && filteredProjects && filteredProjects.length === 0 && (
                <Card className={`${surface} shadow-none`}>
                    <CardContent className="h-[40vh] flex justify-center items-center text-gray-500 dark:text-gray-400">
                        No projects match “{searchQuery}”. Try a different search, or click New to add one.
                    </CardContent>
                </Card>
            )}

            {session?.user?.githubAccessToken && filteredProjects && filteredProjects.length > 0 && (
                <div className="my-1 flex flex-col gap-3 w-full max-h-[70vh] overflow-y-auto pr-1 custom-small-scrollbar">
                    {filteredProjects.map(({
                        id,
                        name,
                        username,
                        repoUrl,
                        defaultBranch,
                        userId,
                        releaseTriggerKeyword,
                        lastMonitoredCommitSha,
                        createdAt,
                        updatedAt,
                        visibility,
                        description,
                        language
                    }) => {
                        const formatDate = (dateString: string) => {
                            return new Date(dateString).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                            })
                        }

                        return (
                            <Card
                                key={id}
                                className={`${surface} ${hoverable} shadow-none p-0`}
                            >
                                <CardHeader className="p-5 pb-4">
                                    <div className="flex justify-between items-start gap-4">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-3 mb-2">
                                                <CardTitle className="text-xl font-semibold leading-tight truncate">
                                                    <Link
                                                        href={`/project/${id}`}
                                                        className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                                                    >
                                                        {name}
                                                    </Link>
                                                </CardTitle>

                                                <Badge
                                                    variant={visibility === 'private' ? 'destructive' : 'secondary'}
                                                    className="text-xs capitalize"
                                                >
                                                    {visibility}
                                                </Badge>
                                            </div>

                                            <div className="flex flex-wrap items-center gap-3 mb-3 text-xs">
                                                <div className="flex gap-1.5 items-center bg-gray-100 dark:bg-gray-800 py-1 px-2 rounded-md border">
                                                    <GitBranch className="h-3.5 w-3.5" />
                                                    <span>{defaultBranch}</span>
                                                </div>

                                                {language && (
                                                    <div className="flex items-center gap-2">
                                                        <span
                                                            className="inline-block w-2.5 h-2.5 rounded-full"
                                                            style={{ backgroundColor: languageColors[language] || '#586069' }}
                                                        />
                                                        <span className="text-gray-600 dark:text-gray-300">{language}</span>
                                                    </div>
                                                )}

                                                {repoUrl && (
                                                    <Link
                                                        href={repoUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex items-center gap-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                                                    >
                                                        <FiExternalLink className="h-4 w-4" />
                                                        <span>Repository</span>
                                                    </Link>
                                                )}
                                            </div>

                                            <CardDescription className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-2">
                                                {description && description.length > 0
                                                    ? description
                                                    : 'No description available for this project.'}
                                                <Link
                                                    href={`/project/${id}`}
                                                    className="text-indigo-600 dark:text-indigo-400 hover:underline ml-1"
                                                >
                                                    Learn more →
                                                </Link>
                                            </CardDescription>
                                        </div>

                                        {status === 'authenticated' && session?.user?.username === username && (
                                            <div className="ml-2 shrink-0">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="outline" size="icon" className="h-8 w-8 p-0">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent className="w-56" align="end" side="bottom">
                                                        <DropdownMenuGroup>
                                                            {/* reserved for future actions */}
                                                        </DropdownMenuGroup>
                                                        <DropdownMenuGroup>
                                                            <DropdownMenuItem
                                                                className="text-red-500 focus:text-red-600"
                                                                onClick={() => handleDeleteProject(id, name)}
                                                            >
                                                                <Trash2 className="h-4 w-4 mr-2" />
                                                                Delete Project
                                                            </DropdownMenuItem>
                                                        </DropdownMenuGroup>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex items-center justify-between pt-4 mt-4 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400">
                                        <div className="flex items-center gap-3">
                                            <span>Created {formatDate(createdAt)}</span>
                                            <span className="opacity-40">•</span>
                                            <span>Updated {formatDate(updatedAt)}</span>
                                            {lastMonitoredCommitSha && (
                                                <>
                                                    <span className="opacity-40">•</span>
                                                    <span>Last commit: {lastMonitoredCommitSha.substring(0, 7)}</span>
                                                </>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {/* placeholder for future quick actions */}
                                        </div>
                                    </div>
                                </CardHeader>
                            </Card>
                        )
                    })}

                    {pagination?.hasMore && (
                        <div className="pt-2">
                            <Button className='w-full' disabled={isAllProjectsLoading} onClick={loadMore}>
                                {isAllProjectsLoading ? "Loading..." : "Load more"}
                            </Button>
                        </div>
                    )}
                </div>
            )}

            <ConfirmDeleteProject
                deleteConfirm={deleteConfirm}
                onConfirm={confirmDelete}
                onCancel={cancelDelete}
            />
        </div>
    )
}

export default Projects