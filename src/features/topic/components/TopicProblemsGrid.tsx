'use client'

import * as React from 'react'
import type { ColDef } from 'ag-grid-community'
import { ExternalLink, FolderKanban, Link2, PencilLine, Trash2 } from 'lucide-react'

import { AgGridTable } from '@/components/data-grid/AgGridTable'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from '@/components/ui/tooltip'
import type { ProblemDifficulty } from '@/types/topic'
export type TopicProblemReferenceDisplay = {
	_id?: string
	blogId: string
	collectionId?: string | null
	kind: 'solution' | 'reference' | 'note'
	label?: string
	blogTitle?: string
	blogUrl?: string
	collectionName?: string
}

export type TopicProblemGridRow = {
	_id: string
	qname: string
	url: string
	difficulty: ProblemDifficulty
	blogReferences?: TopicProblemReferenceDisplay[]
}

const difficultyOrder = ['Easy', 'Easy-Med', 'Medium', 'Med-Hard', 'Hard', 'Advanced'] as const
const difficultyRank = Object.fromEntries(difficultyOrder.map((value, index) => [value, index])) as Record<ProblemDifficulty, number>

const difficultyTone: Record<ProblemDifficulty, string> = {
	Easy: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-200',
	'Easy-Med': 'border-lime-500/20 bg-lime-500/10 text-lime-700 dark:text-lime-200',
	Medium: 'border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-200',
	'Med-Hard': 'border-orange-500/20 bg-orange-500/10 text-orange-700 dark:text-orange-200',
	Hard: 'border-rose-500/20 bg-rose-500/10 text-rose-700 dark:text-rose-200',
	Advanced: 'border-fuchsia-500/20 bg-fuchsia-500/10 text-fuchsia-700 dark:text-fuchsia-200',
}

type TopicProblemsGridProps = {
	problems: TopicProblemGridRow[]
	canManageProblems: boolean
	onDelete?: (problemId: string) => void
	onEdit?: (problem: TopicProblemGridRow) => void
	onManageReferences?: (problem: TopicProblemGridRow) => void
}

const getHostname = (url: string) => {
	try {
		return new URL(url).hostname.replace(/^www\./, '')
	} catch {
		return url
	}
}

export function TopicProblemsGrid({
	problems,
	canManageProblems,
	onDelete,
	onEdit,
	onManageReferences,
}: TopicProblemsGridProps) {
	const columnDefs = React.useMemo<ColDef<TopicProblemGridRow>[]>(() => [
		{
			headerName: 'Problem',
			field: 'qname',
			minWidth: 280,
			flex: 2.1,
			resizable: true,
			filter: 'agTextColumnFilter',
			headerClass: 'topic-problem-header-cell',
			cellClass: 'topic-problem-cell',
			cellRenderer: (params: { value: string; data?: TopicProblemGridRow }) => (
				<div className="flex min-w-0 flex-col justify-center gap-1 py-1">
					<span className="truncate text-sm font-semibold text-foreground">{params.value}</span>
					<span className="truncate text-xs text-muted-foreground">{getHostname(params.data?.url ?? '')}</span>
				</div>
			),
		},
		{
			headerName: 'Difficulty',
			field: 'difficulty',
			minWidth: 160,
			resizable: true,
			filter: 'agTextColumnFilter',
			headerClass: 'topic-problem-header-cell',
			cellClass: 'topic-problem-cell',
			comparator: (left: ProblemDifficulty, right: ProblemDifficulty) => {
				return (difficultyRank[left] ?? 999) - (difficultyRank[right] ?? 999)
			},
			cellRenderer: (params: { value: ProblemDifficulty }) => (
				<Badge className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${difficultyTone[params.value]}`}>
					{params.value}
				</Badge>
			),
		},
		// {
		// 	headerName: 'Resource',
		// 	field: 'url',
		// 	minWidth: 210,
		// 	flex: 1.05,
		// 	filter: 'agTextColumnFilter',
		// 	resizable: true,
		// 	headerClass: 'topic-problem-header-cell',
		// 	cellClass: 'topic-problem-cell',
		// 	valueGetter: (params) => params.data?.url ?? '',
		// 	cellRenderer: (params: { value: string }) => (
		// 		<div className="flex min-w-0 items-center gap-2 py-1">
		// 			<div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-sky-500/15 bg-sky-500/10 text-sky-700 dark:text-sky-200">
		// 				<Link2 className="h-3.5 w-3.5" />
		// 			</div>
		// 			<div className="min-w-0">
		// 				<span className="truncate text-sm font-medium text-foreground">{getHostname(params.value)}</span>
		// 			</div>
		// 		</div>
		// 	),
		// },
		{
			headerName: 'References',
			field: 'blogReferences',
			minWidth: 150,
			flex: 1,
			resizable: true,
			filter: false,
			sortable: false,
			headerClass: 'topic-problem-header-cell',
			cellClass: 'topic-problem-cell',
			valueGetter: (params) => params.data?.blogReferences?.length ?? 0,
			cellRenderer: (params: { data?: TopicProblemGridRow }) => {
				const references = params.data?.blogReferences ?? []
				const count = references.length

				return (
					<div className="flex min-w-0 flex-col gap-1 py-1.5">
						<Badge className="w-fit rounded-full border border-slate-500/15 bg-slate-500/10 px-2.5 py-1 text-[11px] font-semibold text-slate-700 dark:text-slate-200">
							{count} ref{count === 1 ? '' : 's'}
						</Badge>
						<span className="text-xs text-muted-foreground">{count > 0 ? 'Attached notes available' : 'No references yet'}</span>
					</div>
				)
			},
		},
		{
			headerName: 'Actions',
			field: '_id',
			minWidth: canManageProblems ? 200 : 120,
			filter: false,
			sortable: false,
			floatingFilter: false,
			resizable: true,
			headerClass: 'topic-problem-header-cell',
			cellClass: 'topic-problem-actions-cell',
			cellRenderer: (params: { data?: TopicProblemGridRow }) => {
				if (!params.data) return null

				return (
					<div className="flex h-full items-center justify-end gap-1.5">
						<Tooltip>
							<TooltipTrigger asChild>
								<a
									href={params.data.url}
									target="_blank"
									rel="noreferrer noopener"
									onClick={(event) => event.stopPropagation()}
								>
									<Button type="button" variant="ghost" size="icon" className="h-9 w-9 rounded-xl border border-sky-500/10 bg-sky-500/[0.06] text-sky-600 hover:border-sky-500/20 hover:bg-sky-500/10 hover:text-sky-700 dark:text-sky-300 dark:hover:text-sky-200">
										<ExternalLink className="h-4 w-4" />
									</Button>
								</a>
							</TooltipTrigger>
							<TooltipContent>Open resource</TooltipContent>
						</Tooltip>

						{canManageProblems ? (
							<>
								<Tooltip>
									<TooltipTrigger asChild>
										<Button
											type="button"
											variant="ghost"
											size="icon"
											className="h-9 w-9 rounded-xl border border-violet-500/10 bg-violet-500/[0.06] text-violet-600 hover:border-violet-500/20 hover:bg-violet-500/10 hover:text-violet-700 dark:text-violet-300 dark:hover:text-violet-200"
											onClick={(event) => {
												event.stopPropagation()
												onManageReferences?.(params.data!)
											}}
										>
											<FolderKanban className="h-4 w-4" />
										</Button>
									</TooltipTrigger>
									<TooltipContent>Manage references</TooltipContent>
								</Tooltip>

								<Tooltip>
									<TooltipTrigger asChild>
										<Button
											type="button"
											variant="ghost"
											size="icon"
											className="h-9 w-9 rounded-xl border border-amber-500/10 bg-amber-500/[0.06] text-amber-600 hover:border-amber-500/20 hover:bg-amber-500/10 hover:text-amber-700 dark:text-amber-300 dark:hover:text-amber-200"
											onClick={(event) => {
												event.stopPropagation()
												onEdit?.(params.data!)
											}}
										>
											<PencilLine className="h-4 w-4" />
										</Button>
									</TooltipTrigger>
									<TooltipContent>Edit problem</TooltipContent>
								</Tooltip>

								<Tooltip>
									<TooltipTrigger asChild>
										<Button
											type="button"
											variant="ghost"
											size="icon"
											className="h-9 w-9 rounded-xl border border-rose-500/10 bg-rose-500/[0.06] text-rose-600 hover:border-rose-500/20 hover:bg-rose-500/10 hover:text-rose-700 dark:text-rose-300 dark:hover:text-rose-200"
											onClick={(event) => {
												event.stopPropagation()
												onDelete?.(params.data!._id)
											}}
										>
											<Trash2 className="h-4 w-4" />
										</Button>
									</TooltipTrigger>
									<TooltipContent>Delete problem</TooltipContent>
								</Tooltip>
							</>
						) : null}
					</div>
				)
			},
		},
	], [canManageProblems, onDelete, onEdit, onManageReferences])

	return (
		<AgGridTable<TopicProblemGridRow>
			title="Problems"
			subtitle="Track practice links, references, and difficulty from one cleaner workspace."
			rowData={problems}
			columnDefs={columnDefs}
			quickFilterPlaceholder="Search by problem, difficulty, or resource..."
			emptyMessage="No problems added yet"
			paginationPageSize={5}
		/>
	)
}