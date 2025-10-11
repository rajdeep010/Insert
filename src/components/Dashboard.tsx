'use client'
import React, { useMemo, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { topicSchema } from '@/schemas/topicSchema'
import { useInsertTopics } from '@/app/context/InsertTopicProvider'
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
    Globe2
} from 'lucide-react'

/* Shared style helpers (kept consistent with project page) */
const surface =
    'relative rounded-2xl border border-black/[0.08] dark:border-white/[0.08] bg-white/60 dark:bg-gray-900/40 backdrop-blur-xl supports-[backdrop-filter]:bg-white/40 transition-colors'
const surfaceMuted =
    'relative rounded-xl border border-black/[0.06] dark:border-white/[0.06] bg-white/50 dark:bg-gray-900/30 backdrop-blur-xl'
const hoverable =
    'transition-colors hover:border-black/20 dark:hover:border-white/30'

const Dashboard = () => {
    const { data: session, status } = useSession()
    const params = useParams()
    const username = params.username as string

    const {
        addTopic,
        deleteTopic,
        user_Topics
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
            {/* Header / Controls */}
            <div className="flex flex-col gap-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
                    <div className="flex items-center gap-3">
                        <span className="flex items-center gap-2 text-[13px] uppercase tracking-wider font-semibold px-2 py-1 rounded bg-purple-200/70 dark:bg-purple-800/60 text-purple-900 dark:text-purple-200">
                            Topics
                            <Badge variant="secondary" className="text-xs px-2 py-0.5">
                                {filteredTopics.length}
                            </Badge>
                        </span>
                    </div>
                    <div className="flex items-center gap-3 w-full md:w-auto">
                        {/* <div className={surfaceMuted + ' flex items-center gap-2 px-3 py-2 w-full md:w-80'}>
                            <Search className="h-4 w-4 text-gray-500" />
                            <Input
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                placeholder="Search topics..."
                                className="h-8 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-sm"
                            />
                        </div> */}
                        {canEdit && (
                            <Button
                                onClick={() => setIsTopicModalOpen(true)}
                                size="sm"
                                className="gap-2"
                            >
                                <Plus className="h-4 w-4" />
                                Add
                            </Button>
                        )}
                    </div>
                </div>

                <div className={`${surface} ${hoverable} shadow-none p-2 pr-3 flex items-center gap-2 w-full`}>
                    <div className="pl-2 pr-1 text-gray-500">
                        <Search className="h-4 w-4" />
                    </div>
                    <Input
                        type="text"
                        placeholder="Search topics by title..."
                        className="border-0 focus-visible:ring-0 bg-transparent"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* Topics List */}
            <div className="flex flex-col gap-4 max-h-[65vh] overflow-y-auto pr-1 custom-small-scrollbar">
                {filteredTopics.length > 0 ? (
                    filteredTopics.map(
                        (
                            {
                                id,
                                title,
                                about,
                                visibility
                            },
                            idx
                        ) => (
                            <Link key={id} href={`/topic/${id}`} className="block group">
                                {/* Larger card with full-click surface */}
                                <Card
                                    className={
                                        surface +
                                        ' shadow-none p-0 ' +
                                        hoverable +
                                        ' cursor-pointer group/inner overflow-hidden'
                                    }
                                >
                                    <CardHeader className="p-6 lg:p-7 pb-5 lg:pb-6">
                                        <div className="flex items-start justify-between gap-4">
                                            {/* Left: content */}
                                            <div className="flex flex-col gap-3 min-w-0">
                                                <div className="flex flex-wrap items-center gap-3">
                                                    <CardTitle className="text-xl font-semibold truncate group-hover/inner:text-indigo-600 dark:group-hover/inner:text-indigo-400 transition-colors">
                                                        {title}
                                                    </CardTitle>
                                                    {visibility === 'private' ? (
                                                        <Badge
                                                            variant="destructive"
                                                            className="flex items-center gap-1 text-[10px] px-2 py-0.5"
                                                        >
                                                            <Lock className="h-3 w-3" />
                                                            private
                                                        </Badge>
                                                    ) : (
                                                        <Badge
                                                            variant="secondary"
                                                            className="flex items-center gap-1 text-[10px] px-2 py-0.5"
                                                        >
                                                            <Globe2 className="h-3 w-3" />
                                                            public
                                                        </Badge>
                                                    )}
                                                </div>
                                                {about && (
                                                    <CardDescription className="text-sm leading-relaxed line-clamp-3">
                                                        {about}
                                                    </CardDescription>
                                                )}
                                            </div>

                                            {/* Right: action (does not navigate) */}
                                            {canEdit && (
                                                <Button
                                                    variant="destructive"
                                                    size="icon"
                                                    onClick={(e) => {
                                                        e.preventDefault()
                                                        e.stopPropagation()
                                                        handleOpenDeleteTopicModal(id)
                                                    }}
                                                    className="h-8 w-8"
                                                    title="Delete topic"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>
                                    </CardHeader>
                                </Card>
                            </Link>
                        )
                    )
                ) : (
                    <Card className={surface + ' shadow-none'}>
                        <CardContent className="py-16 flex flex-col items-center gap-4 text-center">
                            <div className="h-10 w-10 rounded-full bg-indigo-500/10 flex items-center justify-center">
                                <Search className="h-5 w-5 text-indigo-500" />
                            </div>
                            <div>
                                <h3 className="font-medium">No topics found</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
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