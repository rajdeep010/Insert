import React from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { Card, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import OverviewSkeleton from './skeletons/OverviewSkeleton'
import { useInsertTopics } from '@/app/context/InsertTopicProvider'
import { useInsertUser } from '@/app/context/InsertUserProvider'

/* Shared style helpers (consistent with other pages) */
const surface =
	'relative rounded-2xl border border-black/[0.08] dark:border-white/[0.08] bg-white/60 dark:bg-gray-900/40 backdrop-blur-xl supports-[backdrop-filter]:bg-white/40 transition-colors'
const hoverable =
	'transition-colors hover:border-black/20 dark:hover:border-white/30'

const Overview = () => {
	const { isTopicsLoading, user_Topics } = useInsertTopics()
	const { user } = useInsertUser()
	const { data: session, status } = useSession()

	const canEdit = status === 'authenticated' && session?.user?.username === user?.username
	const hasTopics = !isTopicsLoading && user_Topics && user_Topics.length > 0
	const firstTopics = (user_Topics || []).slice(0, 4)

	return (
		<div className="py-6 flex flex-col gap-6">
			{isTopicsLoading && <OverviewSkeleton />}

			<div className="flex items-center justify-between">
				<h2 className="text-xl font-semibold tracking-tight">Recent Topics</h2>
				{hasTopics && (
					<Link
						href={`/u/${user?.username}?tab=topics`}
						className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
					>
						View all →
					</Link>
				)}
			</div>

			<div className="grid gap-5 sm:grid-cols-2">
				{hasTopics &&
					firstTopics.map((topic, idx) => (
						<Card
							key={idx}
							className={surface + ' shadow-none p-0 ' + hoverable + ' group overflow-hidden'}
						>
							<CardHeader className="p-5 pb-4 flex flex-col gap-3">
								<div className="flex items-start justify-between gap-4">
									<div className="flex flex-col gap-2 min-w-0">
										<div className="flex flex-wrap items-center gap-3">
											<CardTitle className="text-base font-semibold leading-snug truncate">
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
											<CardDescription className="text-xs leading-relaxed line-clamp-2">
												{topic.about.length > 120
													? topic.about.slice(0, 118) + '…'
													: topic.about}
											</CardDescription>
										)}
									</div>
								</div>
								<div className="flex items-center justify-between text-[10px] text-gray-500 dark:text-gray-400 pt-1">
									<span className="uppercase tracking-wide">
										{topic?.visibility}
									</span>
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
					<Card className={surface + ' shadow-none'}>
						<CardHeader className="p-8 flex flex-col items-start gap-4">
							<CardTitle className="text-base">No topics yet</CardTitle>
							<CardDescription className="text-xs">
								You have not created any topics. Start by adding your first one.
							</CardDescription>
							<Link
								href={`/u/${user?.username}?tab=topics`}
								className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
							>
								Create one →
							</Link>
						</CardHeader>
					</Card>
				)}

				{!isTopicsLoading && !hasTopics && !canEdit && (
					<Card className={surface + ' shadow-none'}>
						<CardHeader className="p-8 flex flex-col gap-3">
							<CardTitle className="text-base">No topics published</CardTitle>
							<CardDescription className="text-xs">
								This user has not published any topics yet.
							</CardDescription>
						</CardHeader>
					</Card>
				)}
			</div>

			{hasTopics && firstTopics.length < (user_Topics?.length || 0) && (
				<Link
					href={`/u/${user?.username}?tab=topics`}
					className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline w-fit"
				>
					Show more...
				</Link>
			)}
		</div>
	)
}

export default Overview