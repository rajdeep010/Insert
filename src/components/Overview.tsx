import React from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { Card, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import OverviewSkeleton from './skeletons/OverviewSkeleton'
import { useInsertTopics } from '@/features/topic/context/InsertTopicProvider'
import { useInsertUser } from '@/features/user/context/InsertUserProvider'

/* Shared style helpers (consistent with other pages) */
const surface =
	'rounded-2xl border border-black/[0.08] dark:border-white/[0.08] bg-white/60 dark:bg-gray-900/40 supports-[backdrop-filter]:bg-white/40 transition-colors'
const hoverable =
	'transition-colors hover:border-black/20 dark:hover:border-white/30'

const Overview = () => {
	const { isTopicsLoading, user_Topics } = useInsertTopics()
	const { profileUser } = useInsertUser()
	const { data: session, status } = useSession()

	const canEdit =
		status === 'authenticated' && session?.user?.username === profileUser?.username
	const hasTopics = !isTopicsLoading && user_Topics && user_Topics.length > 0
	const firstTopics = (user_Topics || []).slice(0, 4)

	return (
		<div className="flex flex-col gap-6">
			{isTopicsLoading && <OverviewSkeleton />}

			<div className="flex items-center justify-between flex-wrap gap-3">
				{!isTopicsLoading && <div className="flex items-center gap-2">
					<span className="flex items-center gap-2 text-[13px] uppercase tracking-wider font-semibold px-2 py-1 rounded bg-purple-200/70 dark:bg-purple-800/60 text-purple-900 dark:text-purple-200">
						Overview
						{hasTopics && (
							<Badge variant="secondary" className="text-xs">
								{user_Topics?.length || 0}
							</Badge>
						)}
					</span>

				</div>}
				{hasTopics && (
					<Link
						href={`/u/${profileUser?.username}?tab=topics`}
						className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
					>
						View all →
					</Link>
				)}
			</div>

			<div className="grid gap-6 sm:grid-cols-2">
				{hasTopics &&
					firstTopics.map((topic, idx) => (
						<Card
							key={idx}
							className={`${surface} shadow-none p-0 ${hoverable} group overflow-hidden`}
						>
							<CardHeader className="p-6 pb-5 flex flex-col gap-3 min-h-[140px]">
								<div className="flex items-start justify-between gap-4">
									<div className="flex flex-col gap-2 min-w-0">
										<div className="flex flex-wrap items-center gap-3">
											<CardTitle className="text-lg font-semibold leading-snug truncate">
												<Link
													href={`/topic/${topic.id}`}
													className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
												>
													{topic?.title || 'Untitled'}
												</Link>
											</CardTitle>
											{topic?.visibility === 'private' ? (
												<Badge
													variant="destructive"
													className="text-[10px] px-2 py-0.5 uppercase tracking-wide"
												>
													private
												</Badge>
											) : (
												<Badge
													variant="secondary"
													className="text-[10px] px-2 py-0.5 uppercase tracking-wide"
												>
													public
												</Badge>
											)}
										</div>
										{topic?.about && (
											<CardDescription className="text-sm leading-relaxed text-gray-600 dark:text-gray-400 line-clamp-3">
												{topic.about.length > 160
													? topic.about.slice(0, 158) + '…'
													: topic.about}
											</CardDescription>
										)}
									</div>
								</div>

								<div className="flex items-center justify-between text-[11px] text-gray-500 dark:text-gray-400 pt-2 mt-1 border-t border-black/5 dark:border-white/10">
									<span className="uppercase tracking-wide">{topic?.visibility}</span>
									<Link
										href={`/topic/${topic.id}`}
										className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline"
									>
										Open
									</Link>
								</div>
							</CardHeader>
						</Card>
					))}

				{!isTopicsLoading && !hasTopics && canEdit && (
					<Card className={`${surface} shadow-none`}>
						<CardHeader className="p-8 flex flex-col items-start gap-4">
							<CardTitle className="text-base">No topics yet</CardTitle>
							<CardDescription className="text-sm text-gray-600 dark:text-gray-400">
								You have not created any topics. Start by adding your first one.
							</CardDescription>
							<Link
								href={`/u/${profileUser?.username}?tab=topics`}
								className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
							>
								Create one →
							</Link>
						</CardHeader>
					</Card>
				)}

				{!isTopicsLoading && !hasTopics && !canEdit && (
					<Card className={`${surface} shadow-none`}>
						<CardHeader className="p-8 flex flex-col gap-3">
							<CardTitle className="text-base">No topics published</CardTitle>
							<CardDescription className="text-sm text-gray-600 dark:text-gray-400">
								This user has not published any topics yet.
							</CardDescription>
						</CardHeader>
					</Card>
				)}
			</div>

			{hasTopics && firstTopics.length < (user_Topics?.length || 0) && (
				<Link
					href={`/u/${profileUser?.username}?tab=topics`}
					className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline w-fit"
				>
					Show more...
				</Link>
			)}
		</div>
	)
}

export default Overview