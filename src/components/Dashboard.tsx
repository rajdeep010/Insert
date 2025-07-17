'use client'
import { uniqueId } from '@/helpers/unique-id'
import { useSession } from 'next-auth/react'
import { useParams } from 'next/navigation'
import React,{ useEffect,useState } from 'react'
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
import { Loader2 } from 'lucide-react'
import { useTopics } from '@/app/context/TopicProvider'
import { Table,TableBody,TableCell,TableHead,TableHeader,TableRow } from "@/components/ui/table";
import { Badge } from './ui/badge'
import { useInsertTopics } from '@/app/context/InsertTopicProvider'




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


    const [isProblemSubmitting, setIsProblemSubmitting] = useState<boolean>(false)
    const [isTopicSubmitting, setIsTopicSubmitting] = useState<boolean>(false)

    const [isTopicModalOpen,setIsTopicModalOpen] = useState(false);
    const [isItemModalOpen,setIsItemModalOpen] = useState(false);
    const [isTopicDeleteModalOpen,setIsTopicDeleteModalOpen] = useState(false);
    const [isItemDeleteModalOpen,setIsItemDeleteModalOpen] = useState(false);

    const [currentTopicId,setCurrentTopicId] = useState<string | null>(null);
    const [currentProblemId,setCurrentProblemId] = useState<string | null>(null);
    const [expandedTopicId,setExpandedTopicId] = useState<string | undefined>(undefined);

    const [problemsByTopic,setProblemsByTopic] = useState<Record<string,any[]>>({});
    const [loadingProblems,setLoadingProblems] = useState<Record<string,boolean>>({});

    //! Implementing all functions for firebase db

    // problem adding function
    const handleDeleteTopic = () => {
        if (currentTopicId !== null) {
            deleteTopic(currentTopicId)
            setIsTopicDeleteModalOpen(false)
        }
    }

    const handleDeleteProblem = () => {
        if (currentTopicId !== null && currentProblemId !== null) {
            deleteProblem(currentTopicId,currentProblemId)
            setIsItemDeleteModalOpen(false)
        }
    }

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

    const questionform = useForm<z.infer<typeof questionSchema>>(
        {
            resolver: zodResolver(questionSchema),
            defaultValues: {
                qname: '',
                url: '',
                difficulty: 'Easy'
            }
        }
    )

    const topicSubmit = async (data: z.infer<typeof topicSchema>) => {
        try {
            setIsTopicSubmitting(true)
            addTopic(data)
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
        }
    }

    const problemSubmit = async (data: z.infer<typeof questionSchema>) => {
        try {
            if (!currentTopicId) return

            setIsProblemSubmitting(true)
            addProblem(data,currentTopicId)
            setIsItemModalOpen(false)
        } catch (error) {
            const axiosError = error as AxiosError<ApiResponse>
            let errorMessage = axiosError.response?.data.message
            toast({
                title: 'Problem add Failed',
                description: errorMessage,
                variant: 'destructive'
            })
        } finally {
            setIsProblemSubmitting(false)
        }
    }

    useEffect(() => {
        const topicId = expandedTopicId;

        const fetchProblemsByTopicID = async (topicId: any) => {
            try {
                if (!topicId) return;
                // if (problemsByTopic[topicId]) return;

                setLoadingProblems((p) => ({ ...p,[topicId]: true }));

                const response = await axios.get(`/api/get-problem-by-topicid?topic_id=${topicId}`)
                if (response.data.success) {
                    setProblemsByTopic((p) => ({ ...p,[topicId]: response.data.problems }));
                } else {
                    toast({ title: "Error",description: response.data.message,variant: "destructive" });
                }
            } catch (error) {
                toast({ title: "Error",description: "Could not load problems",variant: "destructive" });
            } finally {
                setLoadingProblems((p) => ({ ...p,[topicId]: false }));
            }
        }

        fetchProblemsByTopicID(topicId)


    },[expandedTopicId]);

    const handleOpenItemModal = (id: string) => {
        setCurrentTopicId(id);
        setIsItemModalOpen(true);
    };

    const handleOpenDeleteTopicModal = (id: string) => {
        setCurrentTopicId(id);
        setIsTopicDeleteModalOpen(true);
    };

    const handleOpenDeleteProblemModal = (topicId: string,problemId: string) => {
        setCurrentTopicId(topicId);
        setCurrentProblemId(problemId);
        setIsItemDeleteModalOpen(true);
    };

    return (
        <div>
            <div className='flex justify-between'>
                <div>
                    {/* <Input type="text" placeholder='Search Topic...' /> */}
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
                                <Button type="submit" variant="default">
                                    {
                                        isTopicSubmitting ? (<>
                                            <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                                        </>) : ('Save')
                                    }
                                </Button>
                                <Button variant="destructive" onClick={() => setIsTopicModalOpen(false)}>Cancel</Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>

            {/* PROBLEM ADD MODAL */}
            <Dialog open={isItemModalOpen} onOpenChange={setIsItemModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Problem Details</DialogTitle>
                    </DialogHeader>
                    <Form {...questionform}>
                        <form onSubmit={questionform.handleSubmit(problemSubmit)} className='space-y-6'>
                            <FormField
                                control={questionform.control}
                                name="qname"
                                render={({ field }) => (
                                    <FormItem>
                                        {/* <FormLabel>Problem Name</FormLabel> */}
                                        <FormControl>
                                            <Input placeholder="Problem Name" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={questionform.control}
                                name="url"
                                render={({ field }) => (
                                    <FormItem>
                                        {/* <FormLabel>URL</FormLabel> */}
                                        <FormControl>
                                            <Input placeholder="URL" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={questionform.control}
                                name="difficulty"
                                render={({ field }) => (
                                    <FormItem>
                                        {/* <FormLabel>Difficulty</FormLabel> */}
                                        <FormControl>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Difficulty" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectGroup>
                                                        <SelectItem value="Easy">Easy</SelectItem>
                                                        <SelectItem value="Easy-Med">Easy-Med</SelectItem>
                                                        <SelectItem value="Medium">Medium</SelectItem>
                                                        <SelectItem value="Med-Hard">Med-Hard</SelectItem>
                                                        <SelectItem value="Hard">Hard</SelectItem>
                                                        <SelectItem value="Advanced">Advanced</SelectItem>
                                                    </SelectGroup>
                                                </SelectContent>
                                            </Select>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <DialogFooter>
                                <Button type="submit" variant="default">Save</Button>
                                <Button variant="destructive" onClick={() => setIsItemModalOpen(false)}>Cancel</Button>
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
                        <Button variant="destructive" onClick={() => setIsTopicDeleteModalOpen(false)}>Cancel</Button>
                        <Button variant="default" onClick={handleDeleteTopic}>Confirm</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* CONFIRM DELETE PROBLEM MODAL */}
            <Dialog open={isItemDeleteModalOpen} onOpenChange={setIsItemDeleteModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirm Delete Problem</DialogTitle>
                    </DialogHeader>
                    <DialogDescription>Are you sure you want to delete this problem?</DialogDescription>
                    <DialogFooter>
                        <Button variant="destructive" onClick={() => setIsItemDeleteModalOpen(false)}>Cancel</Button>
                        <Button variant="default" onClick={handleDeleteProblem}>Confirm</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <div className="my-5 flex flex-col gap-3 w-full">
                <Accordion
                    className="flex flex-col gap-2"
                    type="single"
                    collapsible
                    value={expandedTopicId}
                    onValueChange={(val) => setExpandedTopicId(val)}
                >
                    {user_Topics && user_Topics.length > 0 ? (
                        user_Topics.map(({ title,about,id,visibility }, idx) => (
                            <AccordionItem
                                key={idx}
                                value={id}
                                className="border-2 px-6 rounded-lg accordion-width"
                            >
                                <AccordionTrigger
                                    className={
                                        expandedTopicId === id
                                            ? "text-blue-500"
                                            : "text-black dark:text-white"
                                    }
                                >
                                    <div className="flex gap-4 items-center">
                                        <div className="text-2xl">{title}</div>
                                        {visibility === "private" && (
                                            <Badge variant="destructive" className="flex items-center gap-2">
                                                private
                                            </Badge>
                                        )}
                                        {visibility === "public" && (
                                            <Badge
                                                variant="default"
                                                className="bg-blue-500 text-white dark:bg-blue-600"
                                            >
                                                public
                                            </Badge>
                                        )}
                                    </div>
                                </AccordionTrigger>

                                <AccordionContent>
                                    {loadingProblems[id] ? (
                                        <>Loading…</>
                                    ) : (
                                        <>
                                            <div className="flex flex-col gap-2">
                                                <div>
                                                    {about && about.length > 0 && (
                                                        <>
                                                            {about.length < 70 ? about : `${about.substring(0,70)}... `}
                                                            {about.length >= 70 && (
                                                                <Link
                                                                    href={`/topic/${id}`}
                                                                    className="text-blue-500"
                                                                    rel="noopener noreferrer"
                                                                >
                                                                    open in new tab
                                                                </Link>
                                                            )}
                                                        </>
                                                    )}
                                                </div>

                                                <div className="flex justify-between mb-4">
                                                    <div className="flex gap-2 justify-center items-center text-md">
                                                        <div>
                                                            {(problemsByTopic[id]?.length ?? 0) + " Problems"}
                                                        </div>
                                                        <div className="text-blue-400">
                                                            <Link href={`/topic/${id}`}>
                                                                <FiExternalLink />
                                                            </Link>
                                                        </div>
                                                    </div>

                                                    {status === "authenticated" &&
                                                        session?.user.username === username && (
                                                            <div className="flex gap-2">
                                                                <Button
                                                                    onClick={() => handleOpenItemModal(id)}
                                                                    className="rounded-md w-fit"
                                                                    variant="default"
                                                                >
                                                                    Add Problem
                                                                </Button>
                                                                <Button
                                                                    variant="destructive"
                                                                    onClick={() => handleOpenDeleteTopicModal(id)}
                                                                    className="rounded-md w-fit"
                                                                >
                                                                    Delete Topic
                                                                </Button>
                                                            </div>
                                                        )}
                                                </div>

                                                <Table className="border-collapse separate md:table px-8 py-2">
                                                    {(!problemsByTopic[id] || problemsByTopic[id].length === 0) && (
                                                        <div className="text-2xl">No problems</div>
                                                    )}

                                                    {problemsByTopic[id] && problemsByTopic[id].length > 0 && (
                                                        <>
                                                            <TableHeader className="block md:table-header-group">
                                                                <TableRow className="border border-grey-500 md:border-none block md:table-row">
                                                                    <TableHead className="rounded-tl-md rounded-bl-md bg-black dark:bg-white text-white dark:text-gray-900 font-bold text-center md:border md:border-grey-500 block md:table-cell">
                                                                        Problem Name
                                                                    </TableHead>
                                                                    <TableHead className="bg-black dark:bg-white text-white dark:text-gray-900 font-bold text-center md:border md:border-grey-500 block md:table-cell">
                                                                        Link
                                                                    </TableHead>
                                                                    <TableHead className="bg-black dark:bg-white text-white dark:text-gray-900 font-bold text-center md:border md:border-grey-500 block md:table-cell">
                                                                        Difficulty
                                                                    </TableHead>
                                                                    {status === "authenticated" &&
                                                                        session?.user.username === username && (
                                                                            <TableHead className="rounded-tr-md rounded-br-md bg-black dark:bg-white text-white dark:text-gray-900 font-bold text-center md:border md:border-grey-500 block md:table-cell">
                                                                                Delete
                                                                            </TableHead>
                                                                        )}
                                                                </TableRow>
                                                            </TableHeader>
                                                            <TableBody className="block md:table-row-group px-6">
                                                                {problemsByTopic[id].map(
                                                                    ({ id: problemId,qname,url,difficulty }) => (
                                                                        <TableRow
                                                                            key={problemId}
                                                                            className="bg-gray-50 dark:bg-gray-900 my-4 border-2 rounded-md block md:table-row"
                                                                        >
                                                                            <TableCell className="p-2 px-4 text-center block md:table-cell">
                                                                                <Tooltip>
                                                                                    <TooltipTrigger>
                                                                                        <span>
                                                                                            {qname.length < 22
                                                                                                ? qname
                                                                                                : `${qname.substring(0,22)}...`}
                                                                                        </span>
                                                                                    </TooltipTrigger>
                                                                                    <TooltipContent className="bg-black dark:bg-white text-white dark:text-gray-900 px-2 py-1 rounded-md">
                                                                                        {qname}
                                                                                    </TooltipContent>
                                                                                </Tooltip>
                                                                            </TableCell>
                                                                            <TableCell className="p-2 px-4 text-center block md:table-cell ">
                                                                                <Link href={url} target="_blank" rel="noopener noreferrer">
                                                                                    Go Problem
                                                                                </Link>
                                                                            </TableCell>
                                                                            <TableCell className="p-2 px-4 text-center block md:table-cell">
                                                                                {difficulty}
                                                                            </TableCell>
                                                                            {status === "authenticated" &&
                                                                                session?.user.username === username && (
                                                                                    <TableCell className="p-2 px-4 text-center block md:table-cell">
                                                                                        <Button
                                                                                            variant="destructive"
                                                                                            onClick={() =>
                                                                                                handleOpenDeleteProblemModal(id,problemId)
                                                                                            }
                                                                                        >
                                                                                            Delete
                                                                                        </Button>
                                                                                    </TableCell>
                                                                                )}
                                                                        </TableRow>
                                                                    )
                                                                )}
                                                            </TableBody>
                                                        </>
                                                    )}
                                                </Table>
                                            </div>
                                        </>
                                    )}
                                </AccordionContent>
                            </AccordionItem>
                        ))
                    ) : (
                        <div className="font-bold font-sans m-auto text-2xl">No topics...</div>
                    )}
                </Accordion>
            </div>

        </div>
    )
}

export default Dashboard