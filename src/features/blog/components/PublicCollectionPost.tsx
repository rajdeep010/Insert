'use client'

import axios from 'axios'
import Link from 'next/link'
import React from 'react'
import { CalendarDays, ExternalLink, Files, FolderKanban, Globe2, Loader2, Lock } from 'lucide-react'

import InsertNavbar from '@/components/InsertNavbar'
import InsertHoverCard from '@/components/InsertHoverCard'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/components/ui/use-toast'
import { useRouter } from 'next/navigation'

type CollectionBlog = {
	_id: string
	blogTitle: string
	blogContentText?: string
	blogUrl: string
	status: string
	type: 'public' | 'private' | string
	creator: string
	blogBannerImage?: string
	createdAt?: string | Date
	lastEdited?: string | Date
}

type CollectionDetail = {
	_id: string
	name: string
	description?: string
	ownerUsername: string
	visibility: 'public' | 'private'
	linkedTopicId?: string | null
	blogIds: string[]
	createdAt?: string | Date
	updatedAt?: string | Date
}

const surface = 'rounded-2xl border border-black/[0.08] dark:border-white/[0.08] bg-white/60 dark:bg-gray-900/40 supports-[backdrop-filter]:bg-white/40 transition-colors'
const hoverable = 'transition-colors hover:border-black/20 dark:hover:border-white/30'

const formatCollectionDate = (value?: string | Date) => {
	if (!value) return 'Date unavailable'
	const date = typeof value === 'string' ? new Date(value) : value
	if (!(date instanceof Date) || Number.isNaN(date.getTime())) return 'Date unavailable'
	return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}


const getBlogPublishLabel = (blog: CollectionBlog) => {
	if (blog.status !== 'active') return 'Unpublished'

	const candidateDate = blog.createdAt ?? blog.lastEdited
	if (!candidateDate) return 'Published'

	const date = typeof candidateDate === 'string' ? new Date(candidateDate) : candidateDate
	if (!(date instanceof Date) || Number.isNaN(date.getTime())) return 'Published'

	return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

const canOpenPublicBlog = (blog: CollectionBlog) => blog.status === 'active' && blog.type === 'public'

const getBlogHref = (blog: CollectionBlog, isOwner: boolean) => {
	if (!blog.blogUrl) return null
	if (isOwner) return `/blog/${blog.blogUrl}`
	if (canOpenPublicBlog(blog)) return `/posts/blog/${blog.blogUrl}`
	return null
}

export function PublicCollectionPost({ collectionId }: { collectionId: string }) {
	const { toast } = useToast()
	const router = useRouter()
	const [collection, setCollection] = React.useState<CollectionDetail | null>(null)
	const [blogs, setBlogs] = React.useState<CollectionBlog[]>([])
	const [isLoading, setIsLoading] = React.useState(true)
	const [isOwner, setIsOwner] = React.useState(false)

	React.useEffect(() => {
		const fetchCollection = async () => {
			try {
				setIsLoading(true)
				const response = await axios.get(`/api/blog-collections/${collectionId}`)
				if (!response.data.success) {
					setCollection(null)
					setBlogs([])
					setIsOwner(false)
					return
				}

				setCollection(response.data.collection)
				setBlogs(response.data.blogs ?? [])
				setIsOwner(Boolean(response.data.isOwner))
			} catch {
				toast({ title: 'Error ⭕', description: 'Failed to fetch collection post', variant: 'destructive' })
				setCollection(null)
				setBlogs([])
				setIsOwner(false)
			} finally {
				setIsLoading(false)
			}
		}

		void fetchCollection()
	}, [collectionId, toast])

	React.useEffect(() => {
		if (!isLoading && !collection) {
			router.replace('/404')
		}
	}, [collection, isLoading, router])

	if (isLoading) {
		return (
			<div className="flex flex-col gap-6 px-6 py-8 lg:px-56 lg:py-12">
				<InsertNavbar />
				<div className="flex h-[60vh] items-center justify-center">
					<Loader2 className="h-12 w-12 animate-spin text-gray-500" />
				</div>
			</div>
		)
	}

	if (!collection) return null

	return (
		<div className="flex flex-col gap-6 px-6 py-8 lg:px-56 lg:py-12">
			<InsertNavbar />

			<Card className={`${surface} shadow-none`}>
				<CardHeader className="p-6 pb-5 flex flex-col gap-4">
					<div className="flex flex-wrap items-center gap-2">
						<Badge variant={collection.visibility === 'public' ? 'secondary' : 'destructive'} className="text-[11px] px-2 py-0.5 capitalize">
							{collection.visibility === 'public' ? <Globe2 className="mr-1 h-3.5 w-3.5" /> : <Lock className="mr-1 h-3.5 w-3.5" />}
							{collection.visibility}
						</Badge>
						<Badge variant="secondary" className="text-[11px] px-2 py-0.5">
							<Files className="mr-1 h-3.5 w-3.5" />
							{blogs.length} visible blog{blogs.length === 1 ? '' : 's'}
						</Badge>
					</div>
					<CardTitle className="text-3xl font-semibold tracking-tight">{collection.name}</CardTitle>
					<CardDescription className="text-base leading-7 text-muted-foreground">
						{collection.description?.trim() || 'No description added for this collection.'}
					</CardDescription>
				</CardHeader>
				<CardContent className="border-t border-black/5 dark:border-white/10 p-6 pt-5 flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
					<div className="flex items-center gap-2">
						<span>Curated by</span>
						<InsertHoverCard username={collection.ownerUsername} type="username" avatarSize="small" />
					</div>
					<span className="inline-flex items-center gap-1">
						<CalendarDays className="h-4 w-4" />
						Created {formatCollectionDate(collection.createdAt)}
					</span>
					{collection.linkedTopicId ? <span>Linked topic: {collection.linkedTopicId}</span> : null}
				</CardContent>
			</Card>

			<div className="flex flex-col gap-4">
				{blogs.length === 0 ? (
					<Card className={`${surface} shadow-none`}>
						<CardContent className="py-14 text-center text-sm text-gray-600 dark:text-gray-400">
							No visible blogs in this collection yet.
						</CardContent>
					</Card>
				) : blogs.map((blog) => (
					<Card key={blog._id} className={`${surface} ${hoverable} shadow-none`}>
						{(() => {
							const isPublicPost = canOpenPublicBlog(blog)
							const blogHref = getBlogHref(blog, isOwner)
							const publishLabel = getBlogPublishLabel(blog)
							const showOwnerOnlyBadge = !isPublicPost && !isOwner

							return (
						<div className="flex flex-col gap-4 p-6 lg:flex-row lg:items-center lg:justify-between">
							<div className="min-w-0 flex-1 space-y-3">
								<div className="flex flex-wrap items-center gap-2">
									<Badge variant={blog.status === 'active' ? 'secondary' : 'outline'} className="text-[11px] px-2 py-0.5 capitalize">
										{blog.status === 'active' ? 'Published' : 'Unpublished'}
									</Badge>
									<Badge variant={blog.type === 'public' ? 'secondary' : 'destructive'} className="text-[11px] px-2 py-0.5 capitalize">
										{blog.type === 'public' ? <Globe2 className="mr-1 h-3.5 w-3.5" /> : <Lock className="mr-1 h-3.5 w-3.5" />}
										{blog.type}
									</Badge>
									<div className="text-sm text-gray-600 dark:text-gray-400">
										<InsertHoverCard username={blog.creator} type="username" avatarSize="small" />
									</div>
								</div>
								<CardTitle className="text-2xl font-semibold leading-snug">
									{blogHref ? (
										<Link href={blogHref} className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
											{blog.blogTitle}
										</Link>
									) : (
										<span>{blog.blogTitle}</span>
									)}
								</CardTitle>
								<CardDescription className="text-[15px] text-muted-foreground line-clamp-3">
									{blog.blogContentText?.trim() || 'No content preview available.'}
								</CardDescription>
							</div>
							<div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
								<span className="inline-flex items-center gap-1">
									<CalendarDays className="h-3.5 w-3.5" />
									{publishLabel}
								</span>
								{blogHref ? (
									<Button asChild variant="outline" size="icon" className="rounded-xl">
										<Link href={blogHref}>
											<ExternalLink className="h-4 w-4" />
										</Link>
									</Button>
								) : showOwnerOnlyBadge ? (
									<Badge variant="outline" className="rounded-xl px-3 py-1 text-[11px]">
										Owner only
									</Badge>
								) : null}
							</div>
						</div>
							)
						})()}
					</Card>
				))}
			</div>
		</div>
	)
}