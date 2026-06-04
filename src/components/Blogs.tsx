'use client'
import React, { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import {
	AppWindowIcon,
	Edit,
	Loader2,
	MoreHorizontal,
	Trash2,
	Globe2,
	Lock,
	CalendarDays,
	Clock3,
	FolderKanban,
	PlusCircle,
	Files,
	Check,
	Link2
} from 'lucide-react'

import { useBlog } from '@/features/blog/context/BlogProvider'
import { getLastModifiedText } from '@/helpers/last-modified'
import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger
} from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import type { BlogEntry } from '@/types/blog'
import type { BlogCollectionEntry } from '@/types/blog-collection'
import EditBlogMetadataDialog from '@/components/EditBlogMetadataDialog'
import AddBlogModal from '@/components/AddBlogModal'

/* Shared style helpers (aligned with other pages) */
const surface =
	' rounded-2xl border border-black/[0.08] dark:border-white/[0.08] bg-white/60 dark:bg-gray-900/40 supports-[backdrop-filter]:bg-white/40 transition-colors'
const surfaceMuted =
	' rounded-xl border border-black/[0.06] dark:border-white/[0.06] bg-white/50 dark:bg-gray-900/30'
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

const getReadTime = (blog: BlogEntry) => {
	const text = typeof blog.blogContentText === 'string' ? blog.blogContentText.trim() : ''
	if (!text) return 'Short read'

	const words = text.split(/\s+/).filter(Boolean).length
	if (!words) return 'Short read'

	return `${Math.max(1, Math.ceil(words / 220))} min read`
}

const Blogs = () => {
	const { data: session } = useSession()
	const params = useParams()
	const profileUsername = params.username as string
	const canManageCollections = session?.user?.username === profileUsername

	const [deletingBlogId, setDeletingBlogId] = useState<string | null>(null)
	const [blogToEdit, setBlogToEdit] = useState<BlogEntry | null>(null)
	const [isCreateCollectionOpen, setIsCreateCollectionOpen] = useState(false)
	const [collectionName, setCollectionName] = useState('')
	const [collectionDescription, setCollectionDescription] = useState('')
	const [collectionVisibility, setCollectionVisibility] = useState<'public' | 'private'>('private')
	const [collectionToDelete, setCollectionToDelete] = useState<BlogCollectionEntry | null>(null)
	const [blogForCollection, setBlogForCollection] = useState<BlogEntry | null>(null)
	const [selectedCollectionId, setSelectedCollectionId] = useState('')
	const [defaultVisibility, setDefaultVisibility] = useState<'public' | 'private'>('public')
	const {
		allBlogs,
		blogCollections,
		deleteBlog,
		isAllBlogsLoading,
		isBlogCollectionsLoading,
		isCollectionMutating,
		createBlogCollection,
		deleteBlogCollection,
		addBlogToCollection,
		fetchBlogCollections,
		setIsAddBlogModalOpen,
	} = useBlog()

	useEffect(() => {
		if (!canManageCollections) return
		void fetchBlogCollections()
	}, [canManageCollections, fetchBlogCollections])

	const handleDeleteBlog = async (blogId?: string) => {
		if (!blogId) return

		try {
			setDeletingBlogId(blogId)
			await deleteBlog(blogId)
		} finally {
			setDeletingBlogId(null)
		}
	}

	const privateBlogs = useMemo(
		() => allBlogs.filter(b => b?.type === 'private'),
		[allBlogs]
	)
	const publicBlogs = useMemo(
		() => allBlogs.filter(b => b?.type === 'public'),
		[allBlogs]
	)

	const defaultBanner = '/insert.png'

	const handleCreateCollection = async () => {
		const name = collectionName.trim()
		if (!name) return

		await createBlogCollection({
			name,
			description: collectionDescription.trim(),
			visibility: collectionVisibility,
		})

		setCollectionName('')
		setCollectionDescription('')
		setCollectionVisibility('private')
		setIsCreateCollectionOpen(false)
	}

	const handleAddBlogToCollection = async () => {
		if (!blogForCollection?._id || !selectedCollectionId) return

		await addBlogToCollection(selectedCollectionId, blogForCollection._id)
		setBlogForCollection(null)
		setSelectedCollectionId('')
	}

	const handleDeleteCollection = async () => {
		if (!collectionToDelete?._id) return
		await deleteBlogCollection(collectionToDelete._id)
		setCollectionToDelete(null)
	}

	const openAddBlogModal = (visibility: 'public' | 'private') => {
		setDefaultVisibility(visibility)
		setIsAddBlogModalOpen(true)
	}

	const BlogCard = ({ blog }: { blog: BlogEntry }) => {
		const isDeletingCurrentBlog = deletingBlogId === blog._id
		const createdDateLabel = formatCreatedDate(blog.createdAt)
		const createdRelativeLabel = getLastModifiedText(blog.createdAt, { empty: 'Recently created' })
		const readTimeLabel = getReadTime(blog)

		return (
			<Link
				href={`/blog/${blog?.blogUrl}`}
				target="_blank"
				className="block group"
			>
				<Card
					className={
						surface +
						' shadow-none p-0 overflow-hidden flex flex-col h-full ' +
						hoverable
					}
				>
					<CardHeader className="p-0">
						<div className="relative">
							<Image
								height={400}
								width={800}
								src={blog?.blogBannerImage || defaultBanner}
								alt={blog?.blogTitle}
								className="w-full h-44 object-cover"
							/>
							<div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/0 to-transparent opacity-60 group-hover:opacity-70 transition" />
							<div className="absolute bottom-3 left-4 flex items-center gap-2">
								{blog?.type === 'public' ? (
									<Badge variant="secondary" className="text-[10px] px-2 py-0.5">
										<Globe2 className="h-3 w-3 mr-1" />
										public
									</Badge>
								) : (
									<Badge variant="destructive" className="text-[10px] px-2 py-0.5">
										<Lock className="h-3 w-3 mr-1" />
										private
									</Badge>
								)}
							</div>
						</div>
					</CardHeader>

					<CardContent className="p-5 flex flex-col flex-1 relative">
						<div className="flex items-start justify-between gap-4">
							<div className="flex-1 min-w-0">
								<CardTitle className="text-xl font-semibold leading-snug line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
									{blog?.blogTitle || 'Untitled'}
								</CardTitle>
								{blog?.blogContentText && (
									<CardDescription className="mt-3 text-sm leading-relaxed line-clamp-3">
										{blog.blogContentText}
									</CardDescription>
								)}
							</div>

							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button
										variant="outline"
										size="icon"
										className="h-8 w-8 shrink-0"
										onClick={e => {
											e.preventDefault()
										}}
									>
										<MoreHorizontal className="h-4 w-4" />
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent side="right" align="start">
									<Link href={`/blog/${blog?.blogUrl}`}>
										<DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
											<Edit className="h-4 w-4" />
											<span>Open editor</span>
										</DropdownMenuItem>
									</Link>
									<DropdownMenuItem
										onClick={e => {
											e.preventDefault()
											setBlogToEdit(blog)
										}}
										className="flex items-center gap-2 cursor-pointer"
									>
										<Edit className="h-4 w-4" />
										<span>Edit details</span>
									</DropdownMenuItem>
									{canManageCollections && (
										<DropdownMenuItem
											onClick={e => {
												e.preventDefault()
												setBlogForCollection(blog)
												setSelectedCollectionId(blogCollections[0]?._id ?? '')
											}}
											className="flex items-center gap-2 cursor-pointer"
										>
											<FolderKanban className="h-4 w-4" />
											<span>Add to collection</span>
										</DropdownMenuItem>
									)}
									<DropdownMenuItem
										onClick={e => {
											e.preventDefault()
											handleDeleteBlog(blog?._id)
										}}
										disabled={isDeletingCurrentBlog}
										className="flex items-center gap-2 text-red-500 focus:text-red-600 cursor-pointer"
									>
										{isDeletingCurrentBlog ? (
											<Loader2 className="h-4 w-4 animate-spin" />
										) : (
											<Trash2 className="h-4 w-4" />
										)}
										<span>Delete</span>
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
						</div>

						<div className="mt-auto flex items-center justify-between gap-3 border-t border-black/5 pt-4 text-xs text-gray-500 dark:border-white/10 dark:text-gray-400">
							<div className="flex min-w-0 items-center gap-2">
								<CalendarDays className="h-4 w-4 shrink-0" />
								<span className="truncate">{createdDateLabel}</span>
							</div>
							<div className="flex items-center gap-3">
								<span className="inline-flex items-center gap-1">
									<Clock3 className="h-4 w-4" />
									{readTimeLabel}
								</span>
							</div>
						</div>
					</CardContent>
				</Card>
			</Link>
		)
	}

	const EmptyState = ({ label }: { label: string }) => (
		<div className='w-full m-auto'>
			<Card className={surface + ' shadow-none'}>
				<CardContent className="py-20 flex flex-col items-center gap-4 text-center">
					<div className="h-12 w-12 rounded-full bg-indigo-500/10 flex items-center justify-center">
						<AppWindowIcon className="h-6 w-6 text-indigo-500" />
					</div>
					<h3 className="font-medium">No {label} blogs</h3>
					<p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs">
						You have not created any {label} blogs yet.
					</p>
					{canManageCollections && (
						<Button
							type="button"
							className="rounded-full"
							onClick={() => openAddBlogModal(label === 'private' ? 'private' : 'public')}
						>
							<PlusCircle className="mr-2 h-4 w-4" />
							Create {label} blog
						</Button>
					)}
				</CardContent>
			</Card>
		</div>
	)

	return (
		<div className="flex flex-col gap-6">
			<AddBlogModal defaultVisibility={defaultVisibility} />

			{/* {canManageCollections && (
				<section className={surface + ' p-5 sm:p-6'}>
					<div className="flex flex-col gap-5">
						<div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
							<div className="space-y-2">
								<div className="flex items-center gap-2">
									<span className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 text-[12px] font-semibold uppercase tracking-[0.18em] text-emerald-700 dark:text-emerald-300">
										Collections
									</span>
									<Badge variant="secondary" className="rounded-full px-2.5 py-1 text-xs">
										{blogCollections.length}
									</Badge>
								</div>
								<h3 className="text-xl font-semibold tracking-tight text-slate-950 dark:text-slate-50">
									Keep reusable blog bundles
								</h3>
								<p className="max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">
									Create reusable blog collections that you can later attach to sheet problems as solutions, notes, or references.
								</p>
							</div>

							<div className="flex flex-row items-center gap-2">
								<Button asChild variant="outline" className="h-11 gap-2 px-4">
									<Link href={`/u/${profileUsername}?tab=collections`}>
										<FolderKanban className="h-4 w-4" />
										Manage
									</Link>
								</Button>
								<Button variant='secondary' className="h-11 gap-2 px-4" onClick={() => setIsCreateCollectionOpen(true)}>
									<PlusCircle className="h-2 w-2" /> New
								</Button>
							</div>
						</div>

						{isBlogCollectionsLoading ? (
							<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
								{Array.from({ length: 3 }).map((_, index) => (
									<Card key={index} className={surfaceMuted + ' shadow-none'}>
										<CardContent className="space-y-3 p-5">
											<div className="h-5 w-40 animate-pulse rounded-md bg-slate-200 dark:bg-slate-800" />
											<div className="h-4 w-full animate-pulse rounded-md bg-slate-200 dark:bg-slate-800" />
											<div className="h-4 w-2/3 animate-pulse rounded-md bg-slate-200 dark:bg-slate-800" />
										</CardContent>
									</Card>
								))}
							</div>
						) : blogCollections.length > 0 ? (
							<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
								{blogCollections.map((collection) => {
									const createdLabel = formatCreatedDate(collection.createdAt)
									const linkedTopicLabel = collection.linkedTopicId ? `Linked to ${collection.linkedTopicId}` : 'Standalone collection'

									return (
										<Card key={collection._id} className={surfaceMuted + ' shadow-none'}>
											<CardHeader className="space-y-4 p-5">
												<div className="flex items-start justify-between gap-3">
													<div className="min-w-0 space-y-2">
														<CardTitle className="truncate text-lg font-semibold text-slate-950 dark:text-slate-50">
															{collection.name}
														</CardTitle>
														<CardDescription className="line-clamp-2 text-sm leading-relaxed">
															{collection.description?.trim() || 'No description added yet.'}
														</CardDescription>
													</div>
												</div>

												<div className="flex flex-wrap items-center gap-2">
													<Badge variant="secondary" className="rounded-full px-2.5 py-1 text-[11px]">
														<Files className="mr-1 h-3.5 w-3.5" />
														{collection.blogIds.length} blog{collection.blogIds.length === 1 ? '' : 's'}
													</Badge>
													<Badge variant={collection.visibility === 'public' ? 'secondary' : 'destructive'} className="rounded-full px-2.5 py-1 text-[11px] capitalize">
														{collection.visibility}
													</Badge>
												</div>

												<div className="flex items-center justify-between gap-3 border-t border-black/5 pt-4 text-xs text-slate-500 dark:border-white/10 dark:text-slate-400">
													<div className="flex min-w-0 items-center gap-2">
														<CalendarDays className="h-4 w-4 shrink-0" />
														<span className="truncate">Created {createdLabel}</span>
													</div>
												</div>
											</CardHeader>
										</Card>
									)
								})}
							</div>
						) : (
							<Card className={surfaceMuted + ' shadow-none'}>
								<CardContent className="py-12 flex flex-col items-center gap-4 text-center">
									<div className="h-12 w-12 rounded-full bg-emerald-500/10 flex items-center justify-center">
										<FolderKanban className="h-6 w-6 text-emerald-500" />
									</div>
									<div>
										<h3 className="font-medium">No collections yet</h3>
										<p className="text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-md">
											Start a blog collection to group reusable answers, notes, and solution writeups for topic problems.
										</p>
									</div>
								</CardContent>
							</Card>
						)}
					</div>
				</section>
			)} */}

			<div className="flex items-center justify-between flex-wrap gap-4">
				{/* <h2 className="text-2xl font-semibold tracking-tight">Blogs</h2> */}
				{!isAllBlogsLoading && <span className="flex items-center gap-2 text-[13px] uppercase tracking-wider font-semibold px-2 py-1 rounded bg-purple-200/70 dark:bg-purple-800/60 text-purple-900 dark:text-purple-200">
					Blogs
					<Badge variant="secondary" className="text-xs px-2 py-0.5">
						{allBlogs.length}
					</Badge>
				</span>}
				<div className="flex flex-wrap items-center justify-end gap-3">
					<div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
						<span className="flex items-center gap-1">
							<Globe2 className="h-3 w-3" /> {publicBlogs.length} public
						</span>
						<span className="opacity-40">•</span>
						<span className="flex items-center gap-1">
							<Lock className="h-3 w-3" /> {privateBlogs.length} private
						</span>
					</div>
					{canManageCollections && (
						<div className="flex flex-wrap items-center gap-2">
							<Button variant="outline" className="h-10 rounded-full px-4" onClick={() => openAddBlogModal('private')}>
								<Lock className="mr-2 h-4 w-4" />
								New private
							</Button>
							<Button className="h-10 rounded-full px-4" onClick={() => openAddBlogModal('public')}>
								<PlusCircle className="mr-2 h-4 w-4" />
								New public
							</Button>
						</div>
					)}
				</div>
			</div>

			<Tabs defaultValue="public" className="flex flex-col gap-6">
				<TabsList
					className="w-full flex rounded-xl p-1 bg-gray-100/70 dark:bg-gray-800/40 border border-black/10 dark:border-white/10 backdrop-blur supports-[backdrop-filter]:bg-gray-100/50"
				>
					<TabsTrigger
						value="public"
						className="relative flex-1 rounded-lg px-5 py-2 text-sm font-medium transition
      data-[state=active]:bg-white/90 dark:data-[state=active]:bg-gray-900/70
      data-[state=active]:text-indigo-600 dark:data-[state=active]:text-indigo-400
      hover:text-indigo-600 dark:hover:text-indigo-400
      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40
      data-[state=inactive]:opacity-70"
					>
						Public <span className="ml-1 opacity-60">({publicBlogs.length})</span>
					</TabsTrigger>
					<TabsTrigger
						value="private"
						className="relative flex-1 rounded-lg px-5 py-2 text-sm font-medium transition
      data-[state=active]:bg-white/90 dark:data-[state=active]:bg-gray-900/70
      data-[state=active]:text-indigo-600 dark:data-[state=active]:text-indigo-400
      hover:text-indigo-600 dark:hover:text-indigo-400
      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40
      data-[state=inactive]:opacity-70"
					>
						Private <span className="ml-1 opacity-60">({privateBlogs.length})</span>
					</TabsTrigger>
				</TabsList>

				<div className="max-h-[70vh] overflow-y-auto pr-1 custom-small-scrollbar">
					<TabsContent
						value="public"
						className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5"
					>
						{publicBlogs.length > 0
							? publicBlogs.map((b: any) => <BlogCard blog={b} key={b._id} />)
							: <EmptyState label="public" />}
					</TabsContent>
					<TabsContent
						value="private"
						className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5"
					>
						{privateBlogs.length > 0
							? privateBlogs.map((b: any) => <BlogCard blog={b} key={b._id} />)
							: <EmptyState label="private" />}
					</TabsContent>
				</div>
			</Tabs>

			<Dialog open={isCreateCollectionOpen} onOpenChange={setIsCreateCollectionOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Create collection</DialogTitle>
						<DialogDescription>Group blogs into a reusable collection for future problem references.</DialogDescription>
					</DialogHeader>
					<div className="space-y-4">
						<Input placeholder="Collection name" value={collectionName} onChange={(event) => setCollectionName(event.target.value)} />
						<Input placeholder="Short description" value={collectionDescription} onChange={(event) => setCollectionDescription(event.target.value)} />
						<Select value={collectionVisibility} onValueChange={(value: 'public' | 'private') => setCollectionVisibility(value)}>
							<SelectTrigger>
								<SelectValue placeholder="Visibility" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="private">Private</SelectItem>
								<SelectItem value="public">Public</SelectItem>
							</SelectContent>
						</Select>
					</div>
					<DialogFooter>
						<Button type="button" variant="outline" onClick={() => setIsCreateCollectionOpen(false)} disabled={isCollectionMutating}>
							Cancel
						</Button>
						<Button type="button" onClick={handleCreateCollection} disabled={isCollectionMutating || !collectionName.trim()}>
							{isCollectionMutating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
							<span className="ml-2">Create</span>
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			<Dialog open={Boolean(blogForCollection)} onOpenChange={(open) => {
				if (!open) {
					setBlogForCollection(null)
					setSelectedCollectionId('')
				}
			}}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Add to collection</DialogTitle>
						<DialogDescription>
							{blogForCollection?.blogTitle ? `Choose a collection for "${blogForCollection.blogTitle}".` : 'Choose a collection.'}
						</DialogDescription>
					</DialogHeader>
					<div className="space-y-4">
						<Select value={selectedCollectionId} onValueChange={setSelectedCollectionId}>
							<SelectTrigger>
								<SelectValue placeholder="Select collection" />
							</SelectTrigger>
							<SelectContent>
								{blogCollections.map((collection) => (
									<SelectItem key={collection._id} value={collection._id || ''}>
										{collection.name}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
					<DialogFooter>
						<Button type="button" variant="outline" onClick={() => {
							setBlogForCollection(null)
							setSelectedCollectionId('')
						}} disabled={isCollectionMutating}>
							Cancel
						</Button>
						<Button type="button" onClick={handleAddBlogToCollection} disabled={isCollectionMutating || !selectedCollectionId}>
							{isCollectionMutating ? <Loader2 className="h-4 w-4 animate-spin" /> : <FolderKanban className="h-4 w-4" />}
							<span className="ml-2">Add</span>
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			<Dialog open={Boolean(collectionToDelete)} onOpenChange={(open) => {
				if (!open) {
					setCollectionToDelete(null)
				}
			}}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Delete collection</DialogTitle>
						<DialogDescription>
							{collectionToDelete ? `Delete "${collectionToDelete.name}"? This only removes the collection, not the blogs.` : 'Delete this collection?'}
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button type="button" variant="outline" onClick={() => setCollectionToDelete(null)} disabled={isCollectionMutating}>
							Cancel
						</Button>
						<Button type="button" variant="destructive" onClick={handleDeleteCollection} disabled={isCollectionMutating}>
							{isCollectionMutating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
							<span className="ml-2">Delete</span>
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			<EditBlogMetadataDialog
				blog={blogToEdit}
				open={Boolean(blogToEdit)}
				onOpenChange={(open) => {
					if (!open) setBlogToEdit(null)
				}}
			/>
		</div>
	)
}

export default Blogs