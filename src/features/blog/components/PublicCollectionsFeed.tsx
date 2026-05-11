'use client'

import axios from 'axios'
import Link from 'next/link'
import React from 'react'
import { Loader2, Search, FolderKanban, Globe2, Lock, Files, CalendarDays } from 'lucide-react'

import InsertNavbar from '@/components/InsertNavbar'
import InsertHoverCard from '@/components/InsertHoverCard'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/use-toast'

type PublicCollectionEntry = {
	_id: string
	name: string
	description?: string
	ownerUsername: string
	visibility: 'public' | 'private'
	linkedTopicId?: string | null
	blogIds: string[]
	visibleBlogCount?: number
	createdAt?: string | Date
	updatedAt?: string | Date
}

const surface = 'rounded-2xl border border-black/[0.08] dark:border-white/[0.08] bg-white/60 dark:bg-gray-900/40 supports-[backdrop-filter]:bg-white/40 transition-colors'
const hoverable = 'transition-colors hover:border-black/20 dark:hover:border-white/30'

const formatDate = (value?: string | Date) => {
	if (!value) return 'Date unavailable'
	const date = typeof value === 'string' ? new Date(value) : value
	if (!(date instanceof Date) || Number.isNaN(date.getTime())) return 'Date unavailable'
	return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export function PublicCollectionsFeed() {
	const { toast } = useToast()
	const [collections, setCollections] = React.useState<PublicCollectionEntry[]>([])
	const [isLoading, setIsLoading] = React.useState(true)
	const [query, setQuery] = React.useState('')

	React.useEffect(() => {
		const fetchCollections = async () => {
			try {
				setIsLoading(true)
				const response = await axios.get('/api/blog-collections/public')
				setCollections(response.data.success ? response.data.collections ?? [] : [])
			} catch {
				toast({ title: 'Error ⭕', description: 'Failed to fetch collection posts', variant: 'destructive' })
				setCollections([])
			} finally {
				setIsLoading(false)
			}
		}

		void fetchCollections()
	}, [toast])

	const filteredCollections = React.useMemo(() => {
		const normalized = query.trim().toLowerCase()
		if (!normalized) return collections
		return collections.filter((collection) => {
			const name = collection.name.toLowerCase()
			const owner = collection.ownerUsername.toLowerCase()
			const description = (collection.description || '').toLowerCase()
			return name.includes(normalized) || owner.includes(normalized) || description.includes(normalized)
		})
	}, [collections, query])

	return (
		<div className="flex flex-col gap-6 px-6 py-8 lg:px-56 lg:py-12">
			{!isLoading && <InsertNavbar />}

			{isLoading ? (
				<div className="flex h-[60vh] items-center justify-center">
					<Loader2 className="h-12 w-12 animate-spin text-gray-500" />
				</div>
			) : (
				<>
					<div className="flex flex-col gap-3">
						<div className="flex items-center justify-between gap-4 flex-wrap">
							<span className="text-[13px] uppercase tracking-wider font-semibold px-2 py-1 rounded bg-emerald-200/70 dark:bg-emerald-800/60 text-emerald-900 dark:text-emerald-200">
								Post: Collections
							</span>
							<div className="text-xs text-gray-500 dark:text-gray-400">
								{filteredCollections.length} shown{query ? ` of ${collections.length}` : ''}
							</div>
						</div>

						<div className={`${surface} ${hoverable} shadow-none p-2 pr-3 flex items-center gap-2`}>
							<div className="pl-2 pr-1 text-gray-500">
								<Search className="h-4 w-4" />
							</div>
							<Input
								value={query}
								onChange={(event) => setQuery(event.target.value)}
								placeholder="Search by collection name or owner..."
								className="border-0 focus-visible:ring-0 bg-transparent"
							/>
						</div>
					</div>

					<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
						{filteredCollections.length === 0 ? (
							<Card className={`${surface} shadow-none`}>
								<CardContent className="py-14 text-center text-sm text-gray-600 dark:text-gray-400">
									No collection posts found.
								</CardContent>
							</Card>
						) : filteredCollections.map((collection) => (
							<Link key={collection._id} href={`/posts/collections/${collection._id}`} className="block group">
								<Card className={`${surface} ${hoverable} shadow-none`}>
									<CardHeader className="p-6 pb-4">
										<div className="flex flex-wrap items-center gap-2">
											<Badge variant={collection.visibility === 'public' ? 'secondary' : 'destructive'} className="text-[11px] px-2 py-0.5 capitalize">
												{collection.visibility === 'public' ? <Globe2 className="mr-1 h-3.5 w-3.5" /> : <Lock className="mr-1 h-3.5 w-3.5" />}
												{collection.visibility}
											</Badge>
											<Badge variant="secondary" className="text-[11px] px-2 py-0.5">
												<Files className="mr-1 h-3.5 w-3.5" />
												{collection.visibleBlogCount ?? collection.blogIds.length} visible blog{(collection.visibleBlogCount ?? collection.blogIds.length) === 1 ? '' : 's'}
											</Badge>
										</div>
										<CardTitle className="text-2xl font-semibold leading-snug group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
											{collection.name}
										</CardTitle>
										<CardDescription className="text-[15px] text-muted-foreground line-clamp-3">
											{collection.description?.trim() || 'No description available for this collection.'}
										</CardDescription>
									</CardHeader>
									<CardContent className="flex flex-wrap items-center justify-between gap-3 p-6 pt-0 text-sm text-gray-600 dark:text-gray-400">
										<div className="flex items-center gap-2">
											<span>Curated by</span>
											<InsertHoverCard username={collection.ownerUsername} type="username" avatarSize="small" />
										</div>
										<div className="flex items-center gap-4 text-xs">
											<span className="inline-flex items-center gap-1">
												<CalendarDays className="h-3.5 w-3.5" />
												{formatDate(collection.createdAt)}
											</span>
											{collection.linkedTopicId ? <span>Linked to {collection.linkedTopicId}</span> : null}
										</div>
									</CardContent>
								</Card>
							</Link>
						))}
					</div>
				</>
			)}
		</div>
	)
}