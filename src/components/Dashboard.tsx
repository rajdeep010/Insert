'use client'
import React, { useMemo, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { topicSchema } from '@/schemas/topicSchema'
import { useInsertTopics } from '@/features/topic/context/InsertTopicProvider'
import { getLastModifiedText } from '@/helpers/last-modified'
import { toast } from './ui/use-toast'

import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent
} from '@/components/ui/card'
import { Input } from './ui/input'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from '@/components/ui/dialog'
import {
    Form,
    FormField,
    FormItem,
    FormControl,
    FormMessage
} from './ui/form'
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectGroup,
    SelectItem
} from '@/components/ui/select'

import {
    Loader2,
    Trash2,
    Plus,
    Search,
    Lock,
    Globe2,
    CalendarDays,
    ArrowUpRight,
    Users,
    Crown,
    Eye,
    ShieldCheck
} from 'lucide-react'

/* Shared style helpers (kept consistent with project page) */
const surface =
    'rounded-2xl border border-black/[0.08] dark:border-white/[0.08] bg-white/60 dark:bg-gray-900/40 supports-[backdrop-filter]:bg-white/40 transition-colors'
const surfaceMuted =
    'rounded-xl border border-black/[0.06] dark:border-white/[0.06] bg-white/50 dark:bg-gray-900/30'
const hoverable =
    'transition-colors hover:border-black/20 dark:hover:border-white/30'

const formatCreatedDate = (value?: string | Date) => {
    if (!value) return 'Unknown date'

    const date = typeof value === 'string' ? new Date(value) : value
    if (!(date instanceof Date) || Number.isNaN(date.getTime())) return 'Unknown date'

    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    })
}

const loadingCards = Array.from({ length: 4 })

const Dashboard = () => {
    const { data: session, status } = useSession()
    const params = useParams()
    const username = params.username as string

    const {
        addTopic,
        deleteTopic,
        user_Topics,
        isTopicLoading
    } = useInsertTopics()

    const [isTopicSubmitting, setIsTopicSubmitting] = useState(false)
    const [isTopicDeleting, setIsTopicDeleting] = useState(false)

    const [isTopicModalOpen, setIsTopicModalOpen] = useState(false)
    const [isTopicDeleteModalOpen, setIsTopicDeleteModalOpen] = useState(false)

    const [currentTopicId, setCurrentTopicId] = useState<string | null>(null)
    const [searchQuery, setSearchQuery] = useState('')

    const filteredTopics = useMemo(
        () =>
            user_Topics?.filter(t =>
                t.title.toLowerCase().includes(searchQuery.toLowerCase())
            ) || [],
        [searchQuery, user_Topics]
    )

    const topicCountLabel = useMemo(() => {
        if (isTopicLoading) return 'Loading topics'
        return `${filteredTopics.length} topic${filteredTopics.length === 1 ? '' : 's'}`
    }, [filteredTopics.length, isTopicLoading])

    const handleOpenDeleteTopicModal = (id: string) => {
        setCurrentTopicId(id)
        setIsTopicDeleteModalOpen(true)
    }

    const handleDeleteTopic = async () => {
        if (!currentTopicId) return
        setIsTopicDeleting(true)
        await deleteTopic(currentTopicId)
        setIsTopicDeleting(false)
        setIsTopicDeleteModalOpen(false)
    }

    const topicForm = useForm<z.infer<typeof topicSchema>>({
        resolver: zodResolver(topicSchema),
        defaultValues: {
            title: '',
            about: '',
            visibility: 'public'
        }
    })

    const topicSubmit = async (data: z.infer<typeof topicSchema>) => {
        try {
            setIsTopicSubmitting(true)
            await addTopic(data)
            setIsTopicModalOpen(false)
        } catch (e: any) {
            toast({
                title: 'Topic add failed',
                description: e?.response?.data?.message || 'Unexpected error',
                variant: 'destructive'
            })
        } finally {
            setIsTopicSubmitting(false)
            topicForm.reset()
        }
    }

    const canEdit = status === 'authenticated' && session?.user?.username === username

    return (
        <div className="flex flex-col gap-8">
            {/* <section className={surface + ' p-5 sm:p-6'}> */}
                <div className="flex w-full items-center gap-3 lg:w-auto">
                    <div className={`${surfaceMuted} flex flex-1 items-center gap-2 px-3 py-2 lg:min-w-[20rem]`}>
                        <Search className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                        <Input
                            type="text"
                            placeholder="Search topics by title..."
                            className="h-auto border-0 bg-transparent px-0 py-0 shadow-none focus-visible:ring-0"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                        />
                    </div>

                    {canEdit && (
                        <Button
                            onClick={() => setIsTopicModalOpen(true)}
                            className="h-11 shrink-0 gap-2 px-4"
                        >
                            <Plus className="h-4 w-4" />
                            Topic
                        </Button>
                    )}
                </div>
            {/* </section> */}

            <div className="flex flex-col gap-4">
                {isTopicLoading ? (
                    <div className="grid gap-4 md:grid-cols-2">
                        {loadingCards.map((_, index) => (
                            <Card key={index} className={surface + ' overflow-hidden shadow-none'}>
                                <CardHeader className="space-y-4 p-6">
                                    <div className="flex items-center justify-between gap-3">
                                        <div className="space-y-2">
                                            <div className="h-6 w-36 animate-pulse rounded-md bg-slate-200 dark:bg-slate-800" />
                                            <div className="h-4 w-24 animate-pulse rounded-md bg-slate-200 dark:bg-slate-800" />
                                        </div>
                                        <div className="h-7 w-20 animate-pulse rounded-full bg-slate-200 dark:bg-slate-800" />
                                    </div>
                                    <div className="space-y-2">
                                        <div className="h-4 w-full animate-pulse rounded-md bg-slate-200 dark:bg-slate-800" />
                                        <div className="h-4 w-4/5 animate-pulse rounded-md bg-slate-200 dark:bg-slate-800" />
                                    </div>
                                    <div className="flex items-center gap-2 pt-2">
                                        <div className="h-6 w-24 animate-pulse rounded-full bg-slate-200 dark:bg-slate-800" />
                                        <div className="h-6 w-28 animate-pulse rounded-full bg-slate-200 dark:bg-slate-800" />
                                    </div>
                                </CardHeader>
                            </Card>
                        ))}
                    </div>
                ) : filteredTopics.length > 0 ? (
                    <div className="grid gap-4 md:grid-cols-3">
                        {filteredTopics.map(({ id, title, about, visibility, createdAt, collaborators, problems, creator_username, currentAccessRole }) => {
                            const createdLabel = formatCreatedDate(createdAt)
                            const currentRole = currentAccessRole ?? collaborators?.find(
                                (collaborator) => collaborator.username === session?.user?.username
                            )?.role ?? null
                            const accessMeta = session?.user?.username === creator_username || currentRole === 'OWNER'
                                ? { label: 'Owner', icon: Crown, variant: 'default' as const, helper: 'Full control' }
                                : currentRole === 'EDITOR'
                                    ? { label: 'Editor', icon: ShieldCheck, variant: 'secondary' as const, helper: 'Can manage problems' }
                                    : currentRole === 'VIEWER'
                                        ? { label: 'Viewer', icon: Eye, variant: 'outline' as const, helper: 'Read-only access' }
                                        : visibility === 'public'
                                            ? { label: 'Public', icon: Eye, variant: 'outline' as const, helper: 'Open visibility' }
                                            : null
                            const AccessIcon = accessMeta?.icon

                            return (
                                <Link key={id} href={`/topic/${id}`} className="block group">
                                    <Card
                                        className={
                                            surface +
                                            ' shadow-none p-0 ' +
                                            hoverable +
                                            ' h-full cursor-pointer overflow-hidden group/inner'
                                        }
                                    >
                                        <CardHeader className="flex h-full flex-col gap-5 p-6 lg:p-7">
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="min-w-0 space-y-3">
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <CardTitle className="truncate text-xl font-semibold group-hover/inner:text-indigo-600 dark:group-hover/inner:text-indigo-400 transition-colors">
                                                            {title}
                                                        </CardTitle>
                                                        {visibility === 'private' ? (
                                                            <Badge
                                                                variant="destructive"
                                                                className="flex items-center gap-1 rounded-full p-1 text-[10px]"
                                                            >
                                                                <Lock className="h-3 w-3" />
                                                                {/* private */}
                                                            </Badge>
                                                        ) : (
                                                            <Badge
                                                                variant="secondary"
                                                                className="flex items-center gap-1 rounded-full p-1 text-[10px]"
                                                            >
                                                                <Globe2 className="h-3 w-3" />
                                                                {/* public */}
                                                            </Badge>
                                                        )}
                                                        {accessMeta && AccessIcon ? (
                                                            <Badge
                                                                variant={accessMeta.variant}
                                                                className="flex items-center gap-1 rounded-full p-1 text-[10px]"
                                                            >
                                                                <AccessIcon className="h-3 w-3" />
                                                                {/* {accessMeta.label} */}
                                                            </Badge>
                                                        ) : null}
                                                    </div>

                                                    {/* {accessMeta ? (
                                                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{accessMeta.helper}</p>
                                                    ) : null} */}

                                                    <CardDescription className="line-clamp-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                                                        {about?.trim() ? about : 'No description added for this topic yet.'}
                                                    </CardDescription>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    {canEdit && (
                                                        <Button
                                                            variant="destructive"
                                                            size="icon"
                                                            onClick={(e) => {
                                                                e.preventDefault()
                                                                e.stopPropagation()
                                                                handleOpenDeleteTopicModal(id)
                                                            }}
                                                            className="h-8 w-8 shrink-0 rounded-lg"
                                                            title="Delete topic"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    )}

                                                    <div className="rounded-full border border-black/10 bg-black/[0.03] p-2 text-slate-500 transition-colors group-hover/inner:text-indigo-600 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300 dark:group-hover/inner:text-indigo-300">
                                                        <ArrowUpRight className="h-4 w-4" />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* <div className="flex flex-wrap items-center gap-2">
                                                
                                            </div> */}

                                            <div className="mt-auto flex items-center justify-between gap-3 border-t border-black/5 pt-4 text-xs text-slate-500 dark:border-white/10 dark:text-slate-400">
                                                <div className="flex min-w-0 items-center gap-2">
                                                    <CalendarDays className="h-4 w-4 shrink-0" />
                                                    <span className="truncate">Created {createdLabel}</span>
                                                </div>
                                            </div>
                                        </CardHeader>
                                    </Card>
                                </Link>
                            )
                        })}
                    </div>
                ) : (
                    <Card className={surface + ' shadow-none'}>
                        <CardContent className="py-16 flex flex-col items-center gap-4 text-center">
                            <div className="h-10 w-10 rounded-full bg-indigo-500/10 flex items-center justify-center">
                                <Search className="h-5 w-5 text-indigo-500" />
                            </div>
                            <div>
                                <h3 className="font-medium">No topics found</h3>
                                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                    {searchQuery
                                        ? 'Try refining your search query.'
                                        : canEdit
                                            ? 'Create your first topic to get started.'
                                            : 'Nothing here yet.'}
                                </p>
                            </div>
                            {canEdit && (
                                <Button
                                    size="sm"
                                    className="mt-2 gap-2"
                                    onClick={() => setIsTopicModalOpen(true)}
                                >
                                    <Plus className="h-4 w-4" />
                                    New Topic
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* ADD TOPIC MODAL */}
            <Dialog open={isTopicModalOpen} onOpenChange={setIsTopicModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>New Topic</DialogTitle>
                        <DialogDescription>Create a new topic with a short title, description, and visibility.</DialogDescription>
                    </DialogHeader>
                    <Form {...topicForm}>
                        <form
                            onSubmit={topicForm.handleSubmit(topicSubmit)}
                            className="space-y-5"
                        >
                            <FormField
                                control={topicForm.control}
                                name="title"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormControl>
                                            <Input
                                                autoFocus
                                                placeholder="Title"
                                                {...field}
                                                onChange={e => field.onChange(e)}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={topicForm.control}
                                name="about"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormControl>
                                            <Input
                                                placeholder="Short description"
                                                {...field}
                                                onChange={e => field.onChange(e)}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={topicForm.control}
                                name="visibility"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormControl>
                                            <Select
                                                value={field.value}
                                                onValueChange={field.onChange}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Visibility" />
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
                                <Button
                                    type="submit"
                                    variant="default"
                                    disabled={isTopicSubmitting}
                                    className="gap-2"
                                >
                                    {isTopicSubmitting ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            Saving
                                        </>
                                    ) : (
                                        'Save'
                                    )}
                                </Button>
                                <Button
                                    type="button"
                                    variant="destructive"
                                    disabled={isTopicSubmitting}
                                    onClick={() => setIsTopicModalOpen(false)}
                                >
                                    Cancel
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>

            {/* DELETE TOPIC MODAL */}
            <Dialog
                open={isTopicDeleteModalOpen}
                onOpenChange={setIsTopicDeleteModalOpen}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Topic</DialogTitle>
                        <DialogDescription>
                            This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="destructive"
                            disabled={isTopicDeleting}
                            onClick={() => setIsTopicDeleteModalOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="default"
                            onClick={handleDeleteTopic}
                            disabled={isTopicDeleting}
                            className="gap-2"
                        >
                            {isTopicDeleting ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Deleting
                                </>
                            ) : (
                                'Confirm'
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default Dashboard