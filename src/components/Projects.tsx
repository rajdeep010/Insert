'use client'
import { useSession } from 'next-auth/react'
import { useParams } from 'next/navigation'
import React, { useMemo, useState } from 'react'
import { Button } from './ui/button';
import { Input } from './ui/input';
import Link from 'next/link';
import { FiExternalLink } from 'react-icons/fi';
import { toast } from './ui/use-toast';
import { Album, GitBranch, MoreHorizontal, Trash2 } from 'lucide-react'
import { Badge } from './ui/badge'
import {
    Card,
    CardDescription,
    CardHeader,
    CardTitle,
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
import { useInsertProjects } from '@/app/context/InsertProjectProvider'
import GithubRepoModal from './GithubRepoModal'
import { languageColors } from '@/types/master-data'
import ConfirmDeleteProject from './ConfirmDeleteProject'



const API_BASE_URL = 'http://localhost:8081'


const Projects = () => {
    const { data: session, status } = useSession();
    const params = useParams();
    const username = params.username as string;

    const { user_projects, removeProject, updateProject } = useInsertProjects();
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
            toast({
                title: "Project Deleted ✅",
                description: `${deleteConfirm.projectName} has been successfully deleted.`,
                variant: "default",
            })
        } catch (error) {
            setDeleteConfirm(prev => ({ ...prev, isDeleting: false }))
            toast({
                title: "Delete Failed ❌",
                description: "Failed to delete the project. Please try again.",
                variant: "destructive",
            })
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
        <div>
            {session?.user?.githubAccessToken && <div className='flex gap-4 justify-between mb-4'>
                <Input type="text" placeholder='Search Project...' className='w-[60vw] lg:w-[40vw]' value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />

                <div className="flex justify-between gap-2 items-center py-[-1rem]">
                    <Button
                        className="gap-2 flex items-center px-4 py-2 rounded-md cursor-pointer bg-green-700 text-white hover:bg-green-800"
                        onClick={() => setIsRepoModalOpen(true)}
                    >
                        <Album className="h-4 w-4" /> <span className="text-sm">New</span>
                    </Button>
                    {/* <Button className='cursor-pointer' variant={'outline'}><ListFilter className="h-4 w-4" /> <span className="text-sm">Filter</span></Button> */}
                </div>

            </div>}

            <GithubRepoModal
                isOpen={isRepoModalOpen}
                onClose={() => setIsRepoModalOpen(false)}
            />

            <Separator />

            {!session?.user?.githubAccessToken && <div className='h-[50vh] flex justify-center items-center flex-col gap-4'>
                <div className='text-gray-400'>You don't have any projects as of now</div>
                <div className=''>
                    <Button
                        className='flex gap-2 items-center bg-green-700 text-white hover:bg-green-800'
                        onClick={() => window.location.href = `http://localhost:8081/oauth2/authorize/github?userId=${session?.user?._id}&username=${session?.user?.username}`}
                    >
                        <GitHubLogoIcon />
                        Authorize With Github
                    </Button>
                </div>
            </div>}

            {session?.user?.githubAccessToken && filteredProjects && filteredProjects.length === 0 && <div className='h-[50vh] flex justify-center items-center flex-col gap-4'>
                <div className='text-gray-400'>You don't have any projects as of now. Click on the <span className='font-bold'>New</span> button to create one.</div>
            </div>}

            {session?.user?.githubAccessToken && <div className="my-5 flex flex-col gap-3 w-full h-[70vh] overflow-y-scroll custom-small-scrollbar">
                {
                    filteredProjects && filteredProjects?.map(({ id, name, username, repoUrl, defaultBranch, userId, releaseTriggerKeyword, lastMonitoredCommitSha, createdAt, updatedAt, visibility, description, language }, idx) => {
                        const formatDate = (dateString: string) => {
                            return new Date(dateString).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                            })
                        }

                        return (
                            <Card key={id} className='mb-4 hover:shadow-md transition-shadow duration-200'>
                                <CardHeader className="pb-4">
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-3">
                                                <CardTitle className='text-xl font-semibold'>
                                                    <Link
                                                        href={`/project/${id}`}
                                                        className='hover:text-blue-600 dark:hover:text-blue-400 transition-colors'
                                                    >
                                                        {name}
                                                    </Link>
                                                </CardTitle>

                                                {/* Visibility Badge */}
                                                <Badge variant={visibility === 'private' ? 'destructive' : 'secondary'} className="text-xs">
                                                    {visibility}
                                                </Badge>
                                            </div>

                                            <div className="flex flex-wrap items-center gap-3 mb-3">
                                                {/* Default Branch */}
                                                <div className="flex gap-1 items-center bg-gray-100 dark:bg-gray-800 py-1 px-2 rounded-md text-sm border-[1px]">
                                                    <GitBranch className="h-3 w-3" />
                                                    <span>{defaultBranch}</span>
                                                </div>

                                                {/* Language */}
                                                {language && (
                                                    <div className="flex gap-1 items-center bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 py-1 px-2 rounded-md text-sm">
                                                        <div
                                                            className="w-3 h-3 rounded-full"
                                                            style={{ backgroundColor: languageColors[language] || '#586069' }}
                                                        />
                                                        <span className='text-sm'>{language}</span>
                                                    </div>
                                                )}

                                                {/* Repository URL */}
                                                {repoUrl && (
                                                    <Link
                                                        href={repoUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex items-center gap-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-sm transition-colors"
                                                    >
                                                        <FiExternalLink className="h-4 w-4" />
                                                        <span>View Repository</span>
                                                    </Link>
                                                )}
                                            </div>

                                            <CardDescription className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                                                {description || 'No description available for this project.'}
                                                <Link href={`/project/${id}`} className='text-blue-500 hover:text-blue-700 ml-1'>
                                                    Learn more →
                                                </Link>
                                            </CardDescription>
                                        </div>

                                        {/* Actions Menu */}
                                        {status === 'authenticated' && session?.user?.username === username && (
                                            <div className="ml-4">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent className="w-56" align="end">
                                                        <DropdownMenuGroup>
                                                            {/* <DropdownMenuItem>
                                                                <Edit className="h-4 w-4 mr-2" />
                                                                Edit Project
                                                            </DropdownMenuItem> */}
                                                        </DropdownMenuGroup>
                                                        <DropdownMenuGroup>
                                                            <DropdownMenuItem className="text-red-500" onClick={() => handleDeleteProject(id, name)}>
                                                                <Trash2 className="h-4 w-4 mr-2" />
                                                                Delete Project
                                                            </DropdownMenuItem>
                                                        </DropdownMenuGroup>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        )}
                                    </div>

                                    {/* Project Meta Information */}
                                    <div className="flex items-center justify-between pt-3 mt-3 border-t border-gray-200 dark:border-gray-700">
                                        <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                                            <span>Created {formatDate(createdAt)}</span>
                                            <span>•</span>
                                            <span>Updated {formatDate(updatedAt)}</span>
                                            {lastMonitoredCommitSha && (
                                                <>
                                                    <span>•</span>
                                                    <span>Last commit: {lastMonitoredCommitSha.substring(0, 7)}</span>
                                                </>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-2">
                                            {/* <Button variant="outline" size="sm" className="h-7 px-3 text-xs">
                                                <Bookmark className="h-3 w-3 mr-1" />
                                                Monitor
                                            </Button> */}
                                        </div>
                                    </div>
                                </CardHeader>
                            </Card>
                        )
                    })
                }
            </div>}

            <ConfirmDeleteProject
                deleteConfirm={deleteConfirm}
                onConfirm={confirmDelete}
                onCancel={cancelDelete}
            />
        </div>
    )
}

export default Projects