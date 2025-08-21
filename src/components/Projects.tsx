'use client'
import { uniqueId } from '@/helpers/unique-id'
import { useSession } from 'next-auth/react'
import { useParams } from 'next/navigation'
import React, { useEffect, useMemo, useState } from 'react'
import { Tooltip, TooltipContent, TooltipTrigger } from '@radix-ui/react-tooltip';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue, } from "@/components/ui/select"
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from './ui/button';
import { Input } from './ui/input';
import Link from 'next/link';
import { FaTrash } from 'react-icons/fa';
import { FiExternalLink } from 'react-icons/fi';
// import { useTopics } from '@/app/context/TopicProvider';
import { useForm } from 'react-hook-form';
import { questionSchema, topicSchema } from '@/schemas/topicSchema';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from './ui/form';
import { toast } from './ui/use-toast';
import axios, { AxiosError } from 'axios';
import { ApiResponse } from '@/types/ApiResponse';
import { Album, Bookmark, Delete, GitBranch, ListFilter, Loader2, MoreHorizontal, Trash2 } from 'lucide-react'
import { useTopics } from '@/app/context/TopicProvider'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from './ui/badge'
import { useInsertTopics } from '@/app/context/InsertTopicProvider'
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


const Projects = () => {
    const { data: session, status } = useSession();
    const params = useParams();
    const username = params.username as string;

    const { user_projects } = useInsertProjects();
    const [isRepoModalOpen, setIsRepoModalOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')

    const filteredProjects = useMemo(() => {
        return user_projects?.filter(project =>
            project.title.toLowerCase().includes(searchQuery.toLowerCase())
        )
    }, [searchQuery, user_projects])

    // console.log('session: ', session)


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
                    <Button className='cursor-pointer' variant={'outline'}><ListFilter className="h-4 w-4" /> <span className="text-sm">Filter</span></Button>
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
                        onClick={() => window.location.href = `http://localhost:8080/oauth2/authorize/github?userId=${session?.user?._id}&username=${session?.user?.username}`}
                    >
                        <GitHubLogoIcon />
                        Authorize With Github
                    </Button>
                </div>
            </div>}

            {session?.user?.githubAccessToken && <div className="my-5 flex flex-col gap-3 w-full h-[70vh] overflow-y-scroll custom-small-scrollbar">
                {
                    filteredProjects && filteredProjects?.map(({ id, name, username, repoUrl, defaultBranch, userId, releaseTriggerKeyword, lastMonitoredCommitSha,  createdAt, updatedAt, visibility}, idx) => {
                        return <>
                            <div className='rounded-sm mb-4' key={idx}>
                                <CardHeader>

                                    <div className="flex justify-between">

                                        <div className="flex gap-4 items-center">
                                            <CardTitle className='text-xl font-semibold'>
                                                <Link href={`/posts/projects/${id}`} className='hover:text-blue-500 transition'>{name}</Link>
                                            </CardTitle>
                                            <div className="flex gap-2 items-center border-2 py-1 px-3 rounded-md">
                                                <GitBranch className="h-4 w-4 text-sm" />
                                                <p className="text-sm">master</p>
                                            </div>
                                            <Badge variant="destructive" className="flex items-center gap-2">10 release blogs</Badge>
                                        </div>

                                        {status === 'authenticated' && session?.user?.username === username && (
                                            <div className="z-100 hover:bg-gray-200 dark:hover:bg-gray-800 p-2 flex justify-end rounded-md">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent className="w-56" align="start">
                                                        <DropdownMenuGroup>
                                                            <DropdownMenuItem disabled>
                                                                Show less like this
                                                            </DropdownMenuItem>
                                                        </DropdownMenuGroup>
                                                        <DropdownMenuGroup>
                                                            <DropdownMenuItem
                                                                className="text-red-500"
                                                                disabled
                                                            >
                                                                Report post...
                                                            </DropdownMenuItem>
                                                        </DropdownMenuGroup>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        )}
                                    </div>

                                    <CardDescription>Lorem ipsum dolor sit amet, consectetur adipisicing elit. sint at voluptas. Ducimus dignissimos magni quam...<Link href={`/topic/${id}`} className='text-blue-500'>read more</Link> </CardDescription>
                                </CardHeader>

                                <Separator />
                            </div>
                        </>
                    })
                }
            </div>}
        </div>
    )
}

export default Projects