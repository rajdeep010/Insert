'use client'
import { uniqueId } from '@/helpers/unique-id'
import { useSession } from 'next-auth/react'
import { useParams } from 'next/navigation'
import React,{ useEffect,useMemo,useState } from 'react'
import { Tooltip,TooltipContent,TooltipTrigger } from '@radix-ui/react-tooltip';
import { Select,SelectContent,SelectGroup,SelectItem,SelectLabel,SelectTrigger,SelectValue,} from "@/components/ui/select"
import { Accordion,AccordionItem,AccordionTrigger,AccordionContent } from '@/components/ui/accordion';
import { Dialog,DialogContent,DialogHeader,DialogFooter,DialogTitle,DialogDescription } from "@/components/ui/dialog";
import { Button } from './ui/button';
import { Input } from './ui/input';
import Link from 'next/link';
import { FaTrash } from 'react-icons/fa';
import { FiExternalLink } from 'react-icons/fi';
// import { useTopics } from '@/app/context/TopicProvider';
import { useForm } from 'react-hook-form';
import { questionSchema,topicSchema } from '@/schemas/topicSchema';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form,FormControl,FormField,FormItem,FormLabel,FormMessage } from './ui/form';
import { toast } from './ui/use-toast';
import axios,{ AxiosError } from 'axios';
import { ApiResponse } from '@/types/ApiResponse';
// import { Item } from '@/model/Alltopic'
import { ProblemDifficulty,Topic,TopicVisibility } from '@/types/types'
import { Delete,Loader2,Trash2 } from 'lucide-react'
import { useTopics } from '@/app/context/TopicProvider'
import { Table,TableBody,TableCell,TableHead,TableHeader,TableRow } from "@/components/ui/table";
import { Badge } from './ui/badge'
import { useInsertTopics } from '@/app/context/InsertTopicProvider'
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"



const Dashboard = () => {
    const { data: session,status } = useSession();
    const params = useParams();
    const username = params.username as string;

    const {
        addTopic,
        deleteTopic,
        addProblem,
        deleteProblem,
        user_Topics,
    } = useInsertTopics();


    const [isProblemSubmitting,setIsProblemSubmitting] = useState<boolean>(false)
    const [isTopicSubmitting,setIsTopicSubmitting] = useState<boolean>(false)
    const [isTopicDeleting, setIsTopicDeleting] = useState(false)

    const [isTopicModalOpen,setIsTopicModalOpen] = useState(false);
    const [isItemModalOpen,setIsItemModalOpen] = useState(false);
    const [isTopicDeleteModalOpen,setIsTopicDeleteModalOpen] = useState(false);
    const [isItemDeleteModalOpen,setIsItemDeleteModalOpen] = useState(false);

    const [currentTopicId,setCurrentTopicId] = useState<string | null>(null);

    const [searchQuery,setSearchQuery] = useState('')

    const filteredTopics = useMemo(() => {
        return user_Topics?.filter(topic =>
            topic.title.toLowerCase().includes(searchQuery.toLowerCase())
        )
    },[searchQuery, user_Topics])

    //! Implementing all functions
    const handleDeleteTopic = async () => {
        if (currentTopicId !== null) {
            setIsTopicDeleting(true)
            await deleteTopic(currentTopicId)
            setIsTopicDeleting(false)
            setIsTopicDeleteModalOpen(false)
        }
    }

    const handleOpenDeleteTopicModal = (id: string) => {
        setCurrentTopicId(id);
        setIsTopicDeleteModalOpen(true);
    };

    const topicform = useForm<z.infer<typeof topicSchema>>(
        {
            resolver: zodResolver(topicSchema),
            defaultValues: {
                title: '',
                about: '',
                visibility: 'public',
            }
        }
    )

    const topicSubmit = async (data: z.infer<typeof topicSchema>) => {
        try {
            setIsTopicSubmitting(true)
            await addTopic(data)
            setIsTopicModalOpen(false)
        } catch (error) {
            const axiosError = error as AxiosError<ApiResponse>
            let errorMessage = axiosError.response?.data.message
            toast({
                title: 'Topic add Failed',
                description: errorMessage,
                variant: 'destructive'
            })
        } finally {
            setIsTopicSubmitting(false)
            topicform.reset()
        }
    }

    return (
        <div>
            <div className='flex justify-between'>
                <div>
                    <Input type="text" placeholder='Search Topic...' className='w-[60vw] lg:w-[30vw]' value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                </div>
                {status === 'authenticated' && session?.user?.username === username && (
                    <Button onClick={() => setIsTopicModalOpen(true)} className='rounded' variant="default">Add Topic</Button>
                )}
            </div>

            {/* ADD TOPIC MODAL */}
            <Dialog open={isTopicModalOpen} onOpenChange={setIsTopicModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Topic Details</DialogTitle>
                    </DialogHeader>
                    <Form {...topicform}>
                        <form onSubmit={topicform.handleSubmit(topicSubmit)} className='space-y-6'>
                            <FormField
                                control={topicform.control}
                                name="title"
                                render={({ field }) => (
                                    <FormItem>
                                        {/* <FormLabel>Title</FormLabel> */}
                                        <FormControl>
                                            <Input autoFocus placeholder="Topic Title" {...field} onChange={(e) => field.onChange(e)} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={topicform.control}
                                name="about"
                                render={({ field }) => (
                                    <FormItem>
                                        {/* <FormLabel>About</FormLabel> */}
                                        <FormControl>
                                            <Input placeholder="Topic About" {...field} onChange={(e) => field.onChange(e)} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={topicform.control}
                                name="visibility"
                                render={({ field }) => (
                                    <FormItem>
                                        {/* <FormLabel>Visibility</FormLabel> */}
                                        <FormControl>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Visibility" onChange={(e) => field.onChange(e)} />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectGroup>
                                                        <SelectItem value="public">Public</SelectItem>
                                                        <SelectItem value="private">Private</SelectItem>
                                                    </SelectGroup>
                                                </SelectContent>
                                            </Select>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <DialogFooter>
                                <Button type="submit" variant="default" disabled={isTopicSubmitting}>
                                    {
                                        isTopicSubmitting ? (<>
                                            <Loader2 className='mr-2 h-4 w-4 animate-spin' /> Please wait
                                        </>) : ('Save')
                                    }
                                </Button>
                                <Button variant="destructive" disabled={isTopicSubmitting} onClick={() => setIsTopicModalOpen(false)}>Cancel</Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>

            {/* CONFIRM DELETE TOPIC MODAL */}
            <Dialog open={isTopicDeleteModalOpen} onOpenChange={setIsTopicDeleteModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirm Delete Topic</DialogTitle>
                    </DialogHeader>
                    <DialogDescription>Are you sure you want to delete this topic?</DialogDescription>
                    <DialogFooter>
                        <Button variant="destructive" disabled={isTopicDeleting} onClick={() => setIsTopicDeleteModalOpen(false)}>Cancel</Button>
                        <Button variant="default" onClick={handleDeleteTopic} disabled={isTopicDeleting}>
                            {
                                isTopicDeleting ? (<>
                                    <Loader2 className='mr-2 h-4 w-4 animate-spin' /> Please wait
                                </>) : ('Confirm')
                            }
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <div className="my-5 flex flex-col gap-3 w-full">
                {
                    filteredTopics && filteredTopics?.map(({ id,title,about,visibility,creator_username,collaborators,createdAt },idx) => {
                        return <>
                            <Card className='rounded-sm'>
                                <CardHeader>

                                    <div className="flex justify-between">
                                        <div className="flex gap-4 items-center mb-2">
                                            <CardTitle>
                                                <Link href={`/topic/${id}`} className='hover:text-blue-500 transition'>{title}</Link>
                                            </CardTitle>
                                            {visibility === "private" && (
                                                <Badge variant="destructive" className="flex items-center gap-2">private</Badge>
                                            )}
                                            {visibility === "public" && (
                                                <Badge variant="default" className="bg-blue-500 text-white dark:bg-blue-600">public</Badge>
                                            )}
                                        </div>

                                        <Button variant={'destructive'} onClick={() => handleOpenDeleteTopicModal(id)}> <Trash2 className='h-4 w-4' /> </Button>
                                    </div>

                                    <CardDescription>{about}...<Link href={`/topic/${id}`} className='text-blue-500'>read more</Link> </CardDescription>
                                </CardHeader>
                            </Card>
                        </>
                    })
                }
            </div>
        </div>
    )
}

export default Dashboard