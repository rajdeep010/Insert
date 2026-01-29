import * as React from "react";
import {
	ColumnDef,
	flexRender,
	getCoreRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	SortingState,
	useReactTable,
	VisibilityState,
	ColumnFiltersState,
} from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ArrowUpDown, ChevronDown, Edit, ExternalLink, Trash } from "lucide-react";
import Link from "next/link";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";

// ...existing code...
export function ProblemsDataTable({
	problems,
	showDelete,
	onDelete,
	onEdit,
}: {
	problems: {
		_id: string;
		qname: string;
		url: string;
		difficulty: string;
	}[];
	showDelete: boolean;
	onDelete?: (problemId: string) => void;
	onEdit?: (problem: any) => void;
}) {
	const [sorting, setSorting] = React.useState<SortingState>([]);
	const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
	const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
	const [rowSelection, setRowSelection] = React.useState({});

	// Custom difficulty order
	const DIFFICULTY_ORDER = [
		"Easy",
		"Easy-Med",
		"Medium",
		"Med-Hard",
		"Hard",
		"Advanced",
	] as const;
	const DIFFICULTY_ORDER_MAP = React.useMemo(
		() =>
			Object.fromEntries(DIFFICULTY_ORDER.map((d, i) => [d, i])) as Record<string, number>,
		[]
	);

	const columns = React.useMemo<ColumnDef<any>[]>(
		() => [
			{
				accessorKey: "qname",
				header: "Problem Name",
				cell: ({ row }) => (
					<Tooltip>
						<TooltipTrigger>
							<span>
								{row.original.qname.length < 22
									? row.original.qname
									: row.original.qname.substring(0, 70)}
								{row.original.qname.length >= 70 ? "..." : ""}
							</span>
						</TooltipTrigger>
						<TooltipContent className="bg-black dark:bg-white text-white dark:text-gray-900 px-2 py-1 rounded-md">
							{row.original.qname}
						</TooltipContent>
					</Tooltip>
				),
			},
			{
				accessorKey: "difficulty",
				header: ({ column }) => {
					return (
						<Button
							variant="ghost"
							onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
						>
							Difficulty
							<ArrowUpDown />
						</Button>
					);
				},
				cell: ({ row }) => row.original.difficulty,
				sortingFn: (rowA, rowB) => {
					const a = DIFFICULTY_ORDER_MAP[String(rowA.getValue("difficulty"))] ?? 999;
					const b = DIFFICULTY_ORDER_MAP[String(rowB.getValue("difficulty"))] ?? 999;
					return a - b;
				},
			},
			{
				accessorKey: "url",
				header: () => <div className="text-center w-full">Link</div>,
				cell: ({ row }) => (
					<div className="flex items-center justify-center">
						<Link
							href={row.original.url}
							target="_blank"
							rel="noopener noreferrer"
							className="inline-flex items-center justify-center text-blue-500 hover:text-blue-300 cursor-pointer"
						>
							<ExternalLink className="h-5 w-5" />
						</Link>
					</div>
				),
			},
			{
				accessorKey: "edit",
				header: "Edit",
				cell: ({ row }) => (
					<Edit className="h-5 w-5 cursor-pointer" onClick={() => onEdit?.(row.original)} />
				),
			},
			...(showDelete
				? [
					{
						id: "delete",
						header: "Delete",
						cell: ({ row }: any) => (
							<Trash
								className="h-5 w-5 text-red-500 hover:text-red-300 cursor-pointer"
								onClick={() => {
									onDelete?.(row.original._id);
								}}
							/>
						),
					},
				]
				: []),
		],
		[showDelete, onDelete, onEdit, DIFFICULTY_ORDER_MAP]
	);

	const table = useReactTable({
		data: problems,
		columns,
		onSortingChange: setSorting,
		onColumnFiltersChange: setColumnFilters,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		onColumnVisibilityChange: setColumnVisibility,
		onRowSelectionChange: setRowSelection,
		state: { sorting, columnFilters, columnVisibility, rowSelection },
	});

	return (
		<div className="w-full">
			<div className="flex items-center py-4">
				<Input
					placeholder="Filter problems..."
					value={(table.getColumn("qname")?.getFilterValue() as string) ?? ""}
					onChange={(event) =>
						table.getColumn("qname")?.setFilterValue(event.target.value)
					}
					className="max-w-sm"
				/>

				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant="outline" className="ml-auto">
							Columns <ChevronDown />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end">
						{table
							.getAllColumns()
							.filter((column) => column.getCanHide())
							.map((column) => {
								return (
									<DropdownMenuCheckboxItem
										key={column.id}
										className="capitalize"
										checked={column.getIsVisible()}
										onCheckedChange={(value) =>
											column.toggleVisibility(!!value)
										}
									>
										{column.id}
									</DropdownMenuCheckboxItem>
								);
							})}
					</DropdownMenuContent>
				</DropdownMenu>
			</div>

			<div className="rounded-md border">
				<Table>
					<TableHeader>
						{table.getHeaderGroups().map((headerGroup) => (
							<TableRow key={headerGroup.id}>
								{headerGroup.headers.map((header) => (
									<TableHead key={header.id}>
										{header.isPlaceholder
											? null
											: flexRender(
												header.column.columnDef.header,
												header.getContext()
											)}
									</TableHead>
								))}
							</TableRow>
						))}
					</TableHeader>

					<TableBody>
						{table.getRowModel().rows?.length ? (
							table.getRowModel().rows.map((row) => (
								<TableRow
									key={row.id}
									data-state={row.getIsSelected() && "selected"}
								>
									{row.getVisibleCells().map((cell) => (
										<TableCell key={cell.id}>
											{flexRender(
												cell.column.columnDef.cell,
												cell.getContext()
											)}
										</TableCell>
									))}
								</TableRow>
							))
						) : (
							<TableRow>
								<TableCell
									colSpan={columns.length}
									className="h-24 text-center"
								>
									No results.
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</div>

			<div className="flex items-center justify-end space-x-2 py-4">
				<div className="space-x-2">
					<Button
						variant="outline"
						size="sm"
						onClick={() => table.previousPage()}
						disabled={!table.getCanPreviousPage()}
					>
						Previous
					</Button>
					<Button
						variant="outline"
						size="sm"
						onClick={() => table.nextPage()}
						disabled={!table.getCanNextPage()}
					>
						Next
					</Button>
				</div>
			</div>
		</div>
	);
}
