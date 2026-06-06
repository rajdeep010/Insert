'use client'

import * as React from 'react'
import { AgGridReact } from 'ag-grid-react'
import {
	AllCommunityModule,
	ModuleRegistry,
	type ColDef,
	type GridApi,
	type GridReadyEvent,
	type PaginationChangedEvent,
} from 'ag-grid-community'
import { Search, Rows3 } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

ModuleRegistry.registerModules([AllCommunityModule])

type AgGridTableProps<T extends object> = {
	rowData: T[]
	columnDefs: ColDef<T>[]
	title?: string
	subtitle?: string
	quickFilterPlaceholder?: string
	emptyMessage?: string
	paginationPageSize?: number
	className?: string
	gridClassName?: string
}

export function AgGridTable<T extends object>({
	rowData,
	columnDefs,
	title = 'Records',
	subtitle,
	quickFilterPlaceholder = 'Search records...',
	emptyMessage = 'No rows to display',
	paginationPageSize = 5,
	className,
	gridClassName,
}: AgGridTableProps<T>) {
	const gridApiRef = React.useRef<GridApi<T> | null>(null)
	const [quickFilter, setQuickFilter] = React.useState('')
	const [currentPage, setCurrentPage] = React.useState(1)
	const [totalPages, setTotalPages] = React.useState(1)
	const [pageSize, setPageSize] = React.useState(paginationPageSize)
	const [visibleRowCount, setVisibleRowCount] = React.useState(rowData.length)

	const defaultColDef = React.useMemo<ColDef<T>>(
		() => ({
			resizable: true,
			sortable: true,
			filter: true,
			floatingFilter: true,
			minWidth: 120,
			flex: 1,
			suppressHeaderMenuButton: true,
		}),
		[]
	)

	const onGridReady = React.useCallback((event: GridReadyEvent<T>) => {
		gridApiRef.current = event.api
		setCurrentPage(event.api.paginationGetCurrentPage() + 1)
		setTotalPages(Math.max(event.api.paginationGetTotalPages(), 1))
		setVisibleRowCount(event.api.getDisplayedRowCount())
	}, [])

	const onPaginationChanged = React.useCallback((event: PaginationChangedEvent<T>) => {
		setCurrentPage(event.api.paginationGetCurrentPage() + 1)
		setTotalPages(Math.max(event.api.paginationGetTotalPages(), 1))
		setVisibleRowCount(event.api.getDisplayedRowCount())
	}, [])

	React.useEffect(() => {
		gridApiRef.current?.setGridOption('quickFilterText', quickFilter)
	}, [quickFilter])

	React.useEffect(() => {
		setVisibleRowCount(rowData.length)
	}, [rowData.length])

	const goToPage = React.useCallback((page: number) => {
		const api = gridApiRef.current
		if (!api) return
		api.paginationGoToPage(page - 1)
	}, [])

	const handlePageSizeChange = React.useCallback((value: string) => {
		const nextPageSize = Number(value)
		setPageSize(nextPageSize)
		gridApiRef.current?.setGridOption('paginationPageSize', nextPageSize)
		gridApiRef.current?.paginationGoToFirstPage()
	}, [])

	const visiblePages = React.useMemo(() => {
		if (totalPages <= 5) {
			return Array.from({ length: totalPages }, (_, index) => index + 1)
		}

		const start = Math.max(1, currentPage - 2)
		const end = Math.min(totalPages, start + 4)
		const normalizedStart = Math.max(1, end - 4)

		return Array.from({ length: end - normalizedStart + 1 }, (_, index) => normalizedStart + index)
	}, [currentPage, totalPages])

	const themeClassName = 'ag-theme-quartz ag-theme-insert'

	return (
		<div className={cn(
			'rounded-[20px] bg-transparent p-0',
			className,
		)}>
			{/* <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
				<div className="space-y-1.5">
					<div className="flex items-center gap-2">
						<Badge className="rounded-full bg-secondary px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-secondary-foreground">
							<Rows3 className="mr-1.5 h-3.5 w-3.5" />
							{title}
						</Badge>
						<Badge variant="secondary" className="rounded-full px-3 py-1 text-xs font-medium">
							{rowData.length} rows
						</Badge>
					</div>
					{subtitle ? <p className="max-w-2xl text-sm text-muted-foreground">{subtitle}</p> : null}
				</div>

				<div className="relative w-full lg:max-w-md">
					<Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
					<Input
						value={quickFilter}
						onChange={(event) => setQuickFilter(event.target.value)}
						placeholder={quickFilterPlaceholder}
						className="h-11 rounded-2xl border-border bg-background pl-10 shadow-none"
					/>
				</div>
			</div> */}

			<div className={cn(themeClassName, 'ag-grid-shell w-full overflow-hidden rounded-[18px]', gridClassName)}>
				<AgGridReact<T>
					rowData={rowData}
					columnDefs={columnDefs}
					defaultColDef={defaultColDef}
					onGridReady={onGridReady}
					onPaginationChanged={onPaginationChanged}
					animateRows
					pagination
					paginationPageSize={pageSize}
					paginationPageSizeSelector={[5, 10, 20, 50]}
					suppressPaginationPanel
					domLayout="autoHeight"
					headerHeight={52}
					rowHeight={60}
					suppressCellFocus
					suppressDragLeaveHidesColumns
					tooltipShowDelay={150}
					overlayNoRowsTemplate={`<span class="ag-empty-state">${emptyMessage}</span>`}
				/>
			</div>

			<div className="mt-3 flex flex-col gap-3 px-1 py-1 lg:flex-row lg:items-center lg:justify-between">
				<div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
					<span>Page size</span>
					<Select value={String(pageSize)} onValueChange={handlePageSizeChange}>
						<SelectTrigger className="h-9 w-[92px] border-border bg-background">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="5">5</SelectItem>
							<SelectItem value="10">10</SelectItem>
							<SelectItem value="20">20</SelectItem>
							<SelectItem value="50">50</SelectItem>
						</SelectContent>
					</Select>
					<Badge variant="secondary" className="rounded-full px-3 py-1 text-xs font-medium">
						Showing {visibleRowCount} result{visibleRowCount === 1 ? '' : 's'}
					</Badge>
				</div>

				<div className="flex flex-wrap items-center justify-end gap-2">
					<Button
						type="button"
						variant="outline"
						size="sm"
						onClick={() => goToPage(currentPage - 1)}
						disabled={currentPage <= 1}
					>
						Previous
					</Button>

					{visiblePages.map((page) => (
						<Button
							key={page}
							type="button"
							variant={page === currentPage ? 'default' : 'outline'}
							size="sm"
							className={cn('min-w-10', page === currentPage && 'shadow-[0_10px_30px_-16px_rgba(14,165,233,0.85)]')}
							onClick={() => goToPage(page)}
						>
							{page}
						</Button>
					))}

					<Button
						type="button"
						variant="outline"
						size="sm"
						onClick={() => goToPage(currentPage + 1)}
						disabled={currentPage >= totalPages}
					>
						Next
					</Button>
				</div>
			</div>
		</div>
	)
}