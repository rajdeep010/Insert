'use client'
import React, { useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
	AppWindowIcon,
	CodeIcon,
	Edit,
	Loader2,
	MoreHorizontal,
	Trash2,
	Globe2,
	Lock
} from 'lucide-react'

import { useBlog } from '@/app/context/BlogProvider'
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

/* Shared style helpers (aligned with other pages) */
const surface =
	'relative rounded-2xl border border-black/[0.08] dark:border-white/[0.08] bg-white/60 dark:bg-gray-900/40 backdrop-blur-xl supports-[backdrop-filter]:bg-white/40 transition-colors'
const surfaceMuted =
	'relative rounded-xl border border-black/[0.06] dark:border-white/[0.06] bg-white/50 dark:bg-gray-900/30 backdrop-blur-xl'
const hoverable =
	'transition-colors hover:border-black/20 dark:hover:border-white/30'

const Blogs = () => {
	const [currBlog, setCurrBlog] = useState<any>(null)
	const { allBlogs, removeBlogFromState, deleteBlog } = useBlog()
	const [deleting, setIsDeleting] = useState(false)

	const handleDeleteBlog = async (blogId: string) => {
		try {
			setIsDeleting(true)
			await deleteBlog(blogId)
			removeBlogFromState(blogId)
		} finally {
			setIsDeleting(false)
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

	const BlogCard = ({ blog }: { blog: any }) => {
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
											setCurrBlog(blog)
										}}
									>
										<MoreHorizontal className="h-4 w-4" />
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent side="right" align="start">
									<Link href={`/blog/${blog?.blogUrl}`}>
										<DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
											<Edit className="h-4 w-4" />
											<span>Edit</span>
										</DropdownMenuItem>
									</Link>
									<DropdownMenuItem
										onClick={e => {
											e.preventDefault()
											handleDeleteBlog(blog?._id)
										}}
										disabled={deleting}
										className="flex items-center gap-2 text-red-500 focus:text-red-600 cursor-pointer"
									>
										{deleting && currBlog?._id === blog?._id ? (
											<Loader2 className="h-4 w-4 animate-spin" />
										) : (
											<Trash2 className="h-4 w-4" />
										)}
										<span>Delete</span>
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
						</div>
						{/* <div className="mt-auto pt-4 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400"> */}
							{/* <span>{blog?.readTime || '—'} min read</span> */}
							{/* <span>{blog?.createdAt ? new Date(blog.createdAt).toLocaleDateString() : ''}</span> */}
						{/* </div> */}
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
				</CardContent>
			</Card>
		</div>
	)

	return (
		<div className="flex flex-col gap-6">
			<div className="flex items-center justify-between flex-wrap gap-4">
				{/* <h2 className="text-2xl font-semibold tracking-tight">Blogs</h2> */}
				<span className="flex items-center gap-2 text-[13px] uppercase tracking-wider font-semibold px-2 py-1 rounded bg-purple-200/70 dark:bg-purple-800/60 text-purple-900 dark:text-purple-200">
					Blogs
					<Badge variant="secondary" className="text-xs px-2 py-0.5">
						{allBlogs.length}
					</Badge>
				</span>
				<div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
					<span className="flex items-center gap-1">
						<Globe2 className="h-3 w-3" /> {publicBlogs.length} public
					</span>
					<span className="opacity-40">•</span>
					<span className="flex items-center gap-1">
						<Lock className="h-3 w-3" /> {privateBlogs.length} private
					</span>
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
		</div>
	)
}

export default Blogs