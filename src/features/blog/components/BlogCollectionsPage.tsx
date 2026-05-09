'use client'

import Link from 'next/link'
import React, { useEffect, useMemo, useState } from 'react'
import { useParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import {
	CalendarDays,
	ExternalLink,
	Files,
	FolderKanban,
	Globe2,
	Inbox,
	Lock,
	Loader2,
	PencilLine,
	PlusCircle,
	Trash2,
	Unlink,
} from 'lucide-react'

import { useBlog } from '@/features/blog/context/BlogProvider'
import type { BlogEntry, BlogVisibility } from '@/types/blog'
import type { BlogCollectionEntry } from '@/types/blog-collection'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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

const surface =
	'rounded-2xl border border-black/[0.08] dark:border-white/[0.08] bg-white/60 dark:bg-gray-900/40 supports-[backdrop-filter]:bg-white/40 transition-colors'
const surfaceMuted =
	'rounded-xl border border-black/[0.06] dark:border-white/[0.06] bg-white/50 dark:bg-gray-900/30'

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

const getBlogId = (blog: BlogEntry) => String(blog._id ?? blog.id ?? '')

export function BlogCollectionsPage() {
	const { data: session, status } = useSession()
	const params = useParams()
	const profileUsername = params.username as string
	const canManageCollections = status === 'authenticated' && session?.user?.username === profileUsername

	const [selectedCollectionId, setSelectedCollectionId] = useState('')
	const [isCollectionDialogOpen, setIsCollectionDialogOpen] = useState(false)
	const [editingCollection, setEditingCollection] = useState<BlogCollectionEntry | null>(null)
	const [collectionName, setCollectionName] = useState('')
	const [collectionDescription, setCollectionDescription] = useState('')
	const [collectionVisibility, setCollectionVisibility] = useState<BlogVisibility>('private')
	const [collectionToDelete, setCollectionToDelete] = useState<BlogCollectionEntry | null>(null)
	const [blogToAddId, setBlogToAddId] = useState('')
	const [removingBlogId, setRemovingBlogId] = useState<string | null>(null)

	const {
		allBlogs,
		blogCollections,
		isAllBlogsLoading,
		isBlogCollectionsLoading,
		isCollectionMutating,
		createBlogCollection,
		updateBlogCollection,
		deleteBlogCollection,
		addBlogToCollection,
		removeBlogFromCollection,
	} = useBlog()

	useEffect(() => {
		if (!blogCollections.length) {
			setSelectedCollectionId('')
			return
		}

		const hasSelected = blogCollections.some((collection) => collection._id === selectedCollectionId)
		if (!selectedCollectionId || !hasSelected) {
			setSelectedCollectionId(blogCollections[0]?._id ?? '')
		}
	}, [blogCollections, selectedCollectionId])

	const selectedCollection = useMemo(
		() => blogCollections.find((collection) => collection._id === selectedCollectionId) ?? null,
		[blogCollections, selectedCollectionId]
	)

	const selectedCollectionBlogs = useMemo(() => {
		if (!selectedCollection) return []
		const blogIdSet = new Set(selectedCollection.blogIds)
		return allBlogs.filter((blog) => blogIdSet.has(getBlogId(blog)))
	}, [allBlogs, selectedCollection])

	const availableBlogs = useMemo(() => {
		if (!selectedCollection) return allBlogs
		const blogIdSet = new Set(selectedCollection.blogIds)
		return allBlogs.filter((blog) => !blogIdSet.has(getBlogId(blog)))
	}, [allBlogs, selectedCollection])

	useEffect(() => {
		if (!availableBlogs.length) {
			setBlogToAddId('')
			return
		}

		const isStillValid = availableBlogs.some((blog) => getBlogId(blog) === blogToAddId)
		if (!blogToAddId || !isStillValid) {
			setBlogToAddId(getBlogId(availableBlogs[0]))
		}
	}, [availableBlogs, blogToAddId])

	const resetCollectionForm = () => {
		setCollectionName('')
		setCollectionDescription('')
		setCollectionVisibility('private')
		setEditingCollection(null)
	}

	const handleOpenCreateDialog = () => {
		resetCollectionForm()
		setIsCollectionDialogOpen(true)
	}

	const handleOpenEditDialog = (collection: BlogCollectionEntry) => {
		setEditingCollection(collection)
		setCollectionName(collection.name)
		setCollectionDescription(collection.description ?? '')
		setCollectionVisibility(collection.visibility)
		setIsCollectionDialogOpen(true)
	}

	const handleSaveCollection = async () => {
		const name = collectionName.trim()
		if (!name) return

		const payload = {
			name,
			description: collectionDescription.trim(),
			visibility: collectionVisibility,
		}

		if (editingCollection?._id) {
			await updateBlogCollection(editingCollection._id, payload)
		} else {
			await createBlogCollection(payload)
		}

		setIsCollectionDialogOpen(false)
		resetCollectionForm()
	}

	const handleDeleteCollection = async () => {
		if (!collectionToDelete?._id) return
		await deleteBlogCollection(collectionToDelete._id)
		setCollectionToDelete(null)
	}

	const handleAddBlog = async () => {
		if (!selectedCollection?._id || !blogToAddId) return
		await addBlogToCollection(selectedCollection._id, blogToAddId)
	}

	const handleRemoveBlog = async (blogId: string) => {
		if (!selectedCollection?._id) return

		try {
			setRemovingBlogId(blogId)
			await removeBlogFromCollection(selectedCollection._id, blogId)
		} finally {
			setRemovingBlogId(null)
		}
	}

	if (!canManageCollections) {
		return (
			<Card className={surface + ' shadow-none'}>
				<CardContent className="flex flex-col items-center gap-4 py-16 text-center">
					<div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10">
						<FolderKanban className="h-7 w-7 text-emerald-500" />
					</div>
					<div className="space-y-2">
						<h2 className="text-xl font-semibold text-slate-950 dark:text-slate-50">Collections are private to the owner</h2>
						<p className="max-w-lg text-sm leading-6 text-slate-600 dark:text-slate-300">
							Collection management is only available on your own profile because collections are an author workspace for organizing reusable blogs.
						</p>
					</div>
				</CardContent>
			</Card>
		)
	}

	return (
		<div className="flex flex-col gap-6">
			<section className={surface + ' p-5 sm:p-6'}>
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
						<h2 className="text-2xl font-semibold tracking-tight text-slate-950 dark:text-slate-50">
							Manage reusable blog bundles
						</h2>
						<p className="max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">
							See every blog inside a collection, add or remove entries, and keep the collection details clean before using them in topic problems.
						</p>
					</div>

					<Button className="h-11 gap-2 rounded-xl px-4" onClick={handleOpenCreateDialog}>
						<PlusCircle className="h-4 w-4" />
						New collection
					</Button>
				</div>
			</section>

			{isBlogCollectionsLoading ? (
				<div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
					<Card className={surface + ' shadow-none'}>
						<CardContent className="space-y-3 p-5">
							<div className="h-5 w-40 animate-pulse rounded-md bg-slate-200 dark:bg-slate-800" />
							<div className="h-20 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />
							<div className="h-20 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />
						</CardContent>
					</Card>
					<Card className={surface + ' shadow-none'}>
						<CardContent className="space-y-3 p-5">
							<div className="h-6 w-48 animate-pulse rounded-md bg-slate-200 dark:bg-slate-800" />
							<div className="h-32 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />
							<div className="h-32 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />
						</CardContent>
					</Card>
				</div>
			) : blogCollections.length === 0 ? (
				<Card className={surface + ' shadow-none'}>
					<CardContent className="flex flex-col items-center gap-4 py-16 text-center">
						<div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10">
							<Inbox className="h-7 w-7 text-emerald-500" />
						</div>
						<div className="space-y-2">
							<h3 className="text-xl font-semibold text-slate-950 dark:text-slate-50">No collections yet</h3>
							<p className="max-w-lg text-sm leading-6 text-slate-600 dark:text-slate-300">
								Create your first collection to start grouping blog posts into a reusable bundle.
							</p>
						</div>
						<Button className="h-11 gap-2 rounded-xl px-4" onClick={handleOpenCreateDialog}>
							<PlusCircle className="h-4 w-4" />
							Create collection
						</Button>
					</CardContent>
				</Card>
			) : (
				<div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
					<Card className={surface + ' shadow-none'}>
						<CardHeader className="p-5 pb-3">
							<CardTitle className="text-lg">All collections</CardTitle>
							<CardDescription>Pick a collection to manage its blogs and details.</CardDescription>
						</CardHeader>
						<CardContent className="space-y-3 p-5 pt-0">
							{blogCollections.map((collection) => {
								const isActive = collection._id === selectedCollectionId

								return (
									<button
										key={collection._id}
										type="button"
										onClick={() => setSelectedCollectionId(collection._id || '')}
										className={
											surfaceMuted +
											` w-full p-4 text-left transition ${isActive ? 'border-emerald-500/40 bg-emerald-500/10' : 'hover:border-black/15 dark:hover:border-white/20'}`
										}
									>
										<div className="flex items-start justify-between gap-3">
											<div className="min-w-0 space-y-2">
												<p className="truncate text-sm font-semibold text-slate-950 dark:text-slate-50">{collection.name}</p>
												<p className="line-clamp-2 text-xs leading-5 text-slate-600 dark:text-slate-300">
													{collection.description?.trim() || 'No description added yet.'}
												</p>
											</div>
											<Badge variant={collection.visibility === 'public' ? 'secondary' : 'destructive'} className="rounded-full px-2 py-0.5 text-[10px] capitalize">
												{collection.visibility}
											</Badge>
										</div>
										<div className="mt-3 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
											<span className="inline-flex items-center gap-1">
												<Files className="h-3.5 w-3.5" />
												{collection.blogIds.length} blog{collection.blogIds.length === 1 ? '' : 's'}
											</span>
											<span>{formatCreatedDate(collection.createdAt)}</span>
										</div>
									</button>
								)
							})}
						</CardContent>
					</Card>

					{selectedCollection ? (
						<div className="flex flex-col gap-6">
							<Card className={surface + ' shadow-none'}>
								<CardHeader className="p-5 pb-4">
									<div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
										<div className="space-y-3">
											<div className="flex flex-wrap items-center gap-2">
												<Badge variant="secondary" className="rounded-full px-2.5 py-1 text-[11px]">
													<Files className="mr-1 h-3.5 w-3.5" />
													{selectedCollection.blogIds.length} blog{selectedCollection.blogIds.length === 1 ? '' : 's'}
												</Badge>
												<Badge variant={selectedCollection.visibility === 'public' ? 'secondary' : 'destructive'} className="rounded-full px-2.5 py-1 text-[11px] capitalize">
													{selectedCollection.visibility === 'public' ? <Globe2 className="mr-1 h-3.5 w-3.5" /> : <Lock className="mr-1 h-3.5 w-3.5" />}
													{selectedCollection.visibility}
												</Badge>
											</div>
											<CardTitle className="text-2xl font-semibold tracking-tight text-slate-950 dark:text-slate-50">
												{selectedCollection.name}
											</CardTitle>
											<CardDescription className="max-w-2xl text-sm leading-6">
												{selectedCollection.description?.trim() || 'No description added yet for this collection.'}
											</CardDescription>
										</div>
										<div className="flex flex-wrap items-center gap-2">
											<Button variant="outline" className="gap-2 rounded-xl" onClick={() => handleOpenEditDialog(selectedCollection)}>
												<PencilLine className="h-4 w-4" />
												Edit details
											</Button>
											<Button variant="destructive" className="gap-2 rounded-xl" onClick={() => setCollectionToDelete(selectedCollection)}>
												<Trash2 className="h-4 w-4" />
												Delete
											</Button>
										</div>
									</div>
								</CardHeader>
								<CardContent className="flex flex-wrap items-center gap-4 border-t border-black/5 p-5 pt-4 text-xs text-slate-500 dark:border-white/10 dark:text-slate-400">
									<span className="inline-flex items-center gap-1.5">
										<CalendarDays className="h-4 w-4" />
										Created {formatCreatedDate(selectedCollection.createdAt)}
									</span>
									<span className="inline-flex items-center gap-1.5">
										<FolderKanban className="h-4 w-4" />
										{selectedCollection.linkedTopicId ? `Linked topic: ${selectedCollection.linkedTopicId}` : 'No topic linked yet'}
									</span>
								</CardContent>
							</Card>

							<Card className={surface + ' shadow-none'}>
								<CardHeader className="p-5 pb-4">
									<CardTitle className="text-lg">Add existing blog</CardTitle>
									<CardDescription>Bring another post into this collection without leaving the page.</CardDescription>
								</CardHeader>
								<CardContent className="flex flex-col gap-4 p-5 pt-0 md:flex-row">
									<Select value={blogToAddId} onValueChange={setBlogToAddId}>
										<SelectTrigger className="flex-1">
											<SelectValue placeholder={isAllBlogsLoading ? 'Loading blogs...' : 'Select a blog'} />
										</SelectTrigger>
										<SelectContent>
											{availableBlogs.map((blog) => (
												<SelectItem key={getBlogId(blog)} value={getBlogId(blog)}>
													{blog.blogTitle}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
									<Button className="gap-2 rounded-xl" onClick={handleAddBlog} disabled={isCollectionMutating || !blogToAddId || availableBlogs.length === 0}>
										{isCollectionMutating ? <Loader2 className="h-4 w-4 animate-spin" /> : <PlusCircle className="h-4 w-4" />}
										Add blog
									</Button>
								</CardContent>
							</Card>

							<Card className={surface + ' shadow-none'}>
								<CardHeader className="p-5 pb-4">
									<CardTitle className="text-lg">Blogs in this collection</CardTitle>
									<CardDescription>Review every included post and remove entries that no longer belong here.</CardDescription>
								</CardHeader>
								<CardContent className="space-y-3 p-5 pt-0">
									{selectedCollectionBlogs.length > 0 ? (
										selectedCollectionBlogs.map((blog) => {
											const blogId = getBlogId(blog)

											return (
												<div key={blogId} className={surfaceMuted + ' flex flex-col gap-4 p-4 md:flex-row md:items-center md:justify-between'}>
													<div className="min-w-0 space-y-2">
														<div className="flex flex-wrap items-center gap-2">
															<p className="truncate text-sm font-semibold text-slate-950 dark:text-slate-50">{blog.blogTitle || 'Untitled'}</p>
															<Badge variant={blog.type === 'public' ? 'secondary' : 'destructive'} className="rounded-full px-2 py-0.5 text-[10px] capitalize">
																{blog.type === 'public' ? <Globe2 className="mr-1 h-3.5 w-3.5" /> : <Lock className="mr-1 h-3.5 w-3.5" />}
																{blog.type}
															</Badge>
														</div>
														<p className="line-clamp-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
															{blog.blogContentText?.trim() || 'No summary available yet.'}
														</p>
														<div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
															<span className="inline-flex items-center gap-1">
																<CalendarDays className="h-3.5 w-3.5" />
																Created {formatCreatedDate(blog.createdAt)}
															</span>
														</div>
													</div>
													<div className="flex items-center gap-2 self-end md:self-center">
														<Button asChild variant="outline" size="icon" className="h-9 w-9 rounded-xl">
															<Link href={`/blog/${blog.blogUrl}`} target="_blank">
																<ExternalLink className="h-4 w-4" />
															</Link>
														</Button>
														<Button variant="destructive" size="icon" className="h-9 w-9 rounded-xl" onClick={() => handleRemoveBlog(blogId)} disabled={isCollectionMutating && removingBlogId === blogId}>
															{isCollectionMutating && removingBlogId === blogId ? <Loader2 className="h-4 w-4 animate-spin" /> : <Unlink className="h-4 w-4" />}
														</Button>
													</div>
												</div>
											)
										})
									) : (
										<div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-black/10 px-4 py-12 text-center dark:border-white/10">
											<div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-500/10">
												<FolderKanban className="h-6 w-6 text-slate-500" />
											</div>
											<div className="space-y-1">
												<p className="text-sm font-medium text-slate-950 dark:text-slate-50">No blogs in this collection yet</p>
												<p className="text-sm text-slate-600 dark:text-slate-300">Use the add section above to bring in one of your existing blog posts.</p>
											</div>
										</div>
									)}
								</CardContent>
							</Card>
						</div>
					) : null}
				</div>
			)}

			<Dialog open={isCollectionDialogOpen} onOpenChange={(open) => {
				setIsCollectionDialogOpen(open)
				if (!open) {
					resetCollectionForm()
				}
			}}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>{editingCollection ? 'Edit collection' : 'Create collection'}</DialogTitle>
						<DialogDescription>
							{editingCollection ? 'Update the collection details and visibility.' : 'Group blogs into a reusable collection for future problem references.'}
						</DialogDescription>
					</DialogHeader>
					<div className="space-y-4">
						<Input placeholder="Collection name" value={collectionName} onChange={(event) => setCollectionName(event.target.value)} />
						<Input placeholder="Short description" value={collectionDescription} onChange={(event) => setCollectionDescription(event.target.value)} />
						<Select value={collectionVisibility} onValueChange={(value: BlogVisibility) => setCollectionVisibility(value)}>
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
						<Button type="button" variant="outline" onClick={() => setIsCollectionDialogOpen(false)} disabled={isCollectionMutating}>
							Cancel
						</Button>
						<Button type="button" onClick={handleSaveCollection} disabled={isCollectionMutating || !collectionName.trim()}>
							{isCollectionMutating ? <Loader2 className="h-4 w-4 animate-spin" /> : editingCollection ? <PencilLine className="h-4 w-4" /> : <PlusCircle className="h-4 w-4" />}
							<span className="ml-2">{editingCollection ? 'Save changes' : 'Create'}</span>
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
		</div>
	)
}