"use client";

import React, { useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import {
	Command,
	CommandInput,
	CommandList,
	CommandGroup,
	CommandEmpty,
	CommandItem,
} from "@/components/ui/command";
import {
	Sheet,
	SheetTrigger,
	SheetContent,
	SheetHeader,
	SheetDescription,
	SheetTitle,
} from "@/components/ui/sheet";
import {
	Menu,
	Loader2,
	FileEdit,
	CheckCircle,
	GitCommit,
	Clock,
	ArrowLeftFromLine,
	XCircle,
	AlertCircle,
	Plus,
	Layers3,
	Sparkles,
} from "lucide-react";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import InsertIcon from "./InsertIcon";
import AddReleaseBlogModal from "./AddReleaseBlogModal";
import { useInsertProjects } from "@/features/project/context/InsertProjectProvider";
import { getLastModifiedText } from "@/helpers/last-modified";
import { cn } from "@/lib/utils";

type ReleaseBlogStatus = "PUBLISHED" | "DRAFT" | "PROCESSING" | "ERROR" | "COMPLETED";

interface ReleaseBlog {
	_id: string;
	blogTitle?: string;
	releaseTitle?: string;
	status: ReleaseBlogStatus;
	commitId?: string;
	createdAt?: string;
	blogContentText?: string;
}

interface ReleaseBlogItemProps {
	blog: ReleaseBlog;
	isCurrent: boolean;
	onSelect: (id: string) => void;
}

const statusStyles: Record<ReleaseBlogStatus | "DEFAULT", string> = {
	PUBLISHED: "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
	DRAFT: "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300",
	PROCESSING: "border-sky-500/20 bg-sky-500/10 text-sky-700 dark:text-sky-300",
	ERROR: "border-rose-500/20 bg-rose-500/10 text-rose-700 dark:text-rose-300",
	COMPLETED: "border-teal-500/20 bg-teal-500/10 text-teal-700 dark:text-teal-300",
	DEFAULT: "border-border/60 bg-muted text-muted-foreground",
};

const buildStatusIcon = (status: ReleaseBlogStatus) => {
	switch (status) {
		case "PUBLISHED":
		case "COMPLETED":
			return <CheckCircle className="h-3 w-3 text-green-500" />;
		case "PROCESSING":
			return <Clock className="h-3 w-3 text-blue-500" />;
		case "ERROR":
			return <XCircle className="h-3 w-3 text-red-500" />;
		default:
			return <AlertCircle className="h-3 w-3 text-gray-400" />;
	}
};

const ReleaseBlogItem = ({ blog, isCurrent, onSelect }: ReleaseBlogItemProps) => {
	const title = blog.blogTitle || blog.releaseTitle || "Untitled Release";
	const summary = blog.blogContentText?.trim() || "Open this release note to continue editing and publishing updates.";
	const statusClassName = statusStyles[blog.status] || statusStyles.DEFAULT;

	return (
		<CommandItem
			value={`${title} ${blog.commitId || ""} ${blog.status}`}
			onSelect={() => onSelect(blog._id)}
			className={cn(
				"group rounded-2xl border border-border/60 bg-background/70 px-4 py-4 transition-colors",
				"data-[selected=true]:bg-accent/60 data-[selected=true]:text-foreground",
				isCurrent && "border-primary/30 bg-primary/5 shadow-sm"
			)}
		>
			<div className="flex w-full items-start gap-3">
				<div className="mt-0.5 rounded-2xl bg-muted p-2.5 text-muted-foreground">
					{buildStatusIcon(blog.status)}
				</div>
				<div className="flex-1 min-w-0">
					<div className="flex items-start justify-between gap-3">
						<div className="min-w-0 space-y-1">
							<p className="truncate text-sm font-medium text-foreground">{title}</p>
							<p className="line-clamp-2 text-xs leading-5 text-muted-foreground">{summary}</p>
						</div>
						<Badge
							className={cn(
								"rounded-full border px-2.5 py-1 text-[10px] font-medium tracking-wide shadow-none",
								statusClassName
							)}
						>
							{blog.status}
						</Badge>
					</div>
					<div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
						{blog.commitId && (
							<span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-1">
								<GitCommit className="h-3 w-3" />
								<code>
									{blog.commitId.slice(0, 7)}
								</code>
							</span>
						)}
						<span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-1">
							<Clock className="h-3 w-3" />
							<span>{blog.createdAt ? getLastModifiedText(blog.createdAt) : "—"}</span>
						</span>
					</div>
				</div>
			</div>
		</CommandItem>
	);
};

// Category keys
type CategoryKey = "processing" | "drafts" | "published";

const categoryMeta: Record<
	CategoryKey,
	{ label: string; icon: React.ReactNode; match: (b: ReleaseBlog) => boolean }
> = {
	processing: {
		label: "Processing",
		icon: <Clock className="h-3 w-3 text-blue-500" />,
		match: (b) => b.status === "PROCESSING",
	},
	drafts: {
		label: "Drafts",
		icon: <FileEdit className="h-3 w-3" />,
		match: (b) => b.status === "DRAFT" || b.status === "COMPLETED",
	},
	published: {
		label: "Published",
		icon: <CheckCircle className="h-3 w-3 text-green-500" />,
		match: (b) => b.status === "PUBLISHED",
	},
};

const mapStatusToCategory = (status: ReleaseBlogStatus): CategoryKey => {
	if (status === "PROCESSING") return "processing";
	if (status === "PUBLISHED") return "published";
	return "drafts"; // DRAFT / COMPLETED / ERROR -> drafts bucket (adjust if you want ERROR separate)
};

const ReleaseBlogWriteSidebar = () => {
	const { curr_project, isProjectLoading } = useInsertProjects();
	const router = useRouter();
	const params = useParams();

	const projectId = params.id as string;
	const currentReleaseBlogId = params.releaseBlogId as string;
	const [isAddReleaseBlogModalOpen, setIsAddReleaseBlogModalOpen] = React.useState(false);
	const [search, setSearch] = React.useState("");
	const [selectedCategories, setSelectedCategories] = React.useState<Set<string>>(
		() => new Set(["processing", "drafts", "published"])
	);

	const toggleCategory = (key: CategoryKey) => {
		setSelectedCategories((prev) => {
			const next = new Set(prev);
			if (next.has(key)) {
				next.delete(key);
			} else {
				next.add(key);
			}
			if (next.size === 0) {
				// Prevent all empty: optional; comment out if you want to allow zero
				return new Set<CategoryKey>(); // allow empty to show prompt
			}
			return next;
		});
	};

	const handleBlogSelect = (blogId: string) => {
		if (blogId !== currentReleaseBlogId) {
			router.push(`/project/${projectId}/edit/${blogId}`);
		}
	};

	const handleBackToProject = () => router.push(`/project/${projectId}`);

	const releaseBlogs: ReleaseBlog[] = useMemo(
		() =>
			(curr_project?.releaseBlogs as ReleaseBlog[] | undefined)
				?.slice()
				.sort(
					(a, b) =>
						new Date(b.createdAt || "").getTime() -
						new Date(a.createdAt || "").getTime()
				) || [],
		[curr_project?.releaseBlogs]
	);

	// Filter by selected categories first
	const categoryFiltered = useMemo(
		() =>
			releaseBlogs.filter((b) =>
				selectedCategories.has(mapStatusToCategory(b.status))
			),
		[releaseBlogs, selectedCategories]
	);

	// Apply search inside category-filtered
	const visibleBlogs = useMemo(() => {
		if (!search.trim()) return categoryFiltered;
		const q = search.toLowerCase();
		return categoryFiltered.filter(
			(b) =>
				(b.blogTitle || "").toLowerCase().includes(q) ||
				(b.releaseTitle || "").toLowerCase().includes(q) ||
				(b.commitId || "").toLowerCase().includes(q)
		);
	}, [categoryFiltered, search]);

	// Group AFTER search for display
	const grouped = useMemo(() => {
		const base: Record<CategoryKey, ReleaseBlog[]> = {
			processing: [],
			drafts: [],
			published: [],
		};
		for (const b of visibleBlogs) {
			base[mapStatusToCategory(b.status)].push(b);
		}
		return base;
	}, [visibleBlogs]);

	const anyErrorItems = releaseBlogs.some((b) => b.status === "ERROR");
	const processingCount = releaseBlogs.filter((blog) => blog.status === "PROCESSING").length;
	const publishedCount = releaseBlogs.filter((blog) => blog.status === "PUBLISHED").length;
	const draftCount = releaseBlogs.filter((blog) => mapStatusToCategory(blog.status) === "drafts").length;

	return (
		<>
			<AddReleaseBlogModal
				defaultVisibility={isAddReleaseBlogModalOpen}
				onClose={() => setIsAddReleaseBlogModalOpen(false)}
			/>

			<Sheet>
				<SheetTrigger asChild>
					<Button type="button" variant="outline" size="icon" className="h-10 w-10 rounded-full border-border/60 bg-background/80 shadow-sm">
						<Menu className="h-5 w-5" />
					</Button>
				</SheetTrigger>

				<SheetContent
					side="left"
					className="max-w-[550px] min-w-[450px] border-border/60 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,250,252,0.98))] p-0 dark:bg-[linear-gradient(180deg,rgba(2,6,23,0.98),rgba(2,6,23,1))]"
				>
					<div className="flex h-full flex-col">
						<SheetHeader className="border-b border-border/60 px-5 py-5 text-left">
							<div className="flex items-start justify-between gap-4">
								<div className="space-y-3">
									<div className="flex items-center gap-3">
										<InsertIcon className="rounded-full border bg-white p-[4px]" />
										<div>
											<p className="font-semibold text-xl tracking-tight">Insert</p>
											{/* <SheetTitle className="text-base font-medium">Release writing</SheetTitle> */}
										</div>
									</div>
									<SheetDescription>
										Keep release notes organized, searchable, and easy to continue.
									</SheetDescription>
								</div>
								{/* <Badge variant="secondary" className="rounded-full px-3 py-1 text-xs font-medium">
									{releaseBlogs.length} release{releaseBlogs.length === 1 ? "" : "s"}
								</Badge> */}
							</div>

							{curr_project ? (
								<div className="mt-5 space-y-4">
									<div className="rounded-3xl border border-border/60 bg-background/70 px-4 py-4">
										<div className="flex items-start justify-between gap-3">
											<div className="min-w-0 space-y-1">
												<p className="truncate text-sm font-medium text-foreground" title={curr_project.name}>
													{curr_project.name}
												</p>
												<p className="line-clamp-2 text-xs leading-5 text-muted-foreground" title={curr_project.description || undefined}>
													{curr_project.description || "Document releases, track progress, and move between notes without leaving the project editor."}
												</p>
											</div>
											<div className="rounded-2xl bg-muted p-2 text-muted-foreground">
												<Layers3 className="h-4 w-4" />
											</div>
										</div>

										<div className="mt-4 grid grid-cols-3 gap-2">
											<div className="rounded-2xl border border-border/60 bg-muted/50 px-3 py-2.5">
												<p className="text-[10px] font-medium uppercase text-muted-foreground">Drafts</p>
												<p className="mt-1 text-sm font-medium text-foreground">{draftCount}</p>
											</div>
											<div className="rounded-2xl border border-border/60 bg-muted/50 px-3 py-2.5">
												<p className="text-[10px] font-medium uppercase text-muted-foreground">In progress</p>
												<p className="mt-1 text-sm font-medium text-foreground">{processingCount}</p>
											</div>
											<div className="rounded-2xl border border-border/60 bg-muted/50 px-3 py-2.5">
												<p className="text-[10px] font-medium uppercase text-muted-foreground">Published</p>
												<p className="mt-1 text-sm font-medium text-foreground">{publishedCount}</p>
											</div>
										</div>
									</div>

									<div className="flex items-center gap-2">
										<Button
											variant="outline"
											size="sm"
											className="h-10 rounded-full px-4"
											onClick={handleBackToProject}
										>
											<ArrowLeftFromLine className="mr-2 h-4 w-4" />
											Back to project
										</Button>
										<Button
											size="sm"
											className="h-10 rounded-full px-4"
											onClick={() => setIsAddReleaseBlogModalOpen(true)}
											disabled={isProjectLoading}
										>
											{isProjectLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
											New release
										</Button>
									</div>
								</div>
							) : null}
						</SheetHeader>

						<div className="flex-1 overflow-y-auto px-5 py-5">
							<div className="space-y-5 pb-4">
									<section className="space-y-3">
										<div className="flex items-center justify-between gap-3">
											<div>
												<p className="text-sm font-medium text-foreground">Browse release notes</p>
												<p className="text-xs text-muted-foreground">Filter by status and search by title or commit hash.</p>
											</div>
											{/* <Badge variant="outline" className="rounded-full px-2.5 py-1 text-[11px]">
												<Sparkles className="mr-1 h-3 w-3" />
												Release mode
											</Badge> */}
										</div>

										<div className="flex flex-wrap gap-2">
											{(Object.keys(categoryMeta) as CategoryKey[]).map((key) => {
												const active = selectedCategories.has(key);
												const count = releaseBlogs.filter(categoryMeta[key].match).length;

												return (
													<button
														key={key}
														type="button"
														onClick={() => toggleCategory(key)}
														className={cn(
															"inline-flex min-h-10 items-center gap-2 rounded-full border px-3 py-2 text-xs font-medium transition-colors",
															active
																? "border-primary/30 bg-primary/10 text-primary"
																: "border-border/60 bg-background/70 text-muted-foreground hover:bg-accent/50 hover:text-foreground"
														)}
														aria-pressed={active}
													>
														{categoryMeta[key].icon}
														<span>{categoryMeta[key].label}</span>
														<span className="rounded-full bg-black/5 px-1.5 py-0.5 text-[10px] dark:bg-white/10">{count}</span>
													</button>
												);
											})}
										</div>

										<Command className="overflow-hidden rounded-3xl border border-border/60 bg-background/70 shadow-none">
											<CommandInput
												placeholder="Search release notes or commit ids"
												value={search}
												onValueChange={setSearch}
												className="h-12 border-0 text-sm"
											/>

											<CommandList className="max-h-[56vh] overflow-y-auto p-2">
												{selectedCategories.size === 0 ? (
													<CommandEmpty className="py-10 text-center">
														<div className="space-y-1">
															<p className="text-sm font-medium text-foreground">No category selected</p>
															<p className="text-xs text-muted-foreground">Pick at least one status above to view release notes.</p>
														</div>
													</CommandEmpty>
												) : visibleBlogs.length === 0 ? (
													<CommandEmpty className="py-10 text-center">
														<div className="space-y-1">
															<p className="text-sm font-medium text-foreground">No matching release notes</p>
															<p className="text-xs text-muted-foreground">
																{search ? "Try a different title or commit hash." : "There are no release notes in the selected categories yet."}
															</p>
														</div>
													</CommandEmpty>
												) : (
													(Object.keys(categoryMeta) as CategoryKey[])
														.filter((key) => selectedCategories.has(key) && grouped[key].length > 0)
														.map((key) => (
															<CommandGroup
																key={key}
																heading={
																	<div className="flex items-center gap-2 px-1 text-[11px] font-semibold uppercase text-muted-foreground">
																		{categoryMeta[key].icon}
																		<span>{categoryMeta[key].label}</span>
																		<span>{grouped[key].length}</span>
																	</div>
																}
																className="space-y-2 px-1 pb-2 pt-3"
															>
																{grouped[key].map((blog) => (
																	<ReleaseBlogItem
																		key={blog._id}
																		blog={blog}
																		isCurrent={blog._id === currentReleaseBlogId}
																		onSelect={handleBlogSelect}
																	/>
																))}
															</CommandGroup>
														))
												)}
											</CommandList>
										</Command>
									</section>

									{anyErrorItems ? (
										<div className="flex items-start gap-3 rounded-2xl border border-rose-500/20 bg-rose-500/5 px-4 py-3">
											<div className="rounded-xl bg-rose-500/10 p-2 text-rose-500">
												<XCircle className="h-4 w-4" />
											</div>
											<div className="space-y-1">
												<p className="text-sm font-medium text-foreground">Some release notes need attention</p>
												<p className="text-xs leading-5 text-muted-foreground">One or more items failed to process. Open the item to review or regenerate it.</p>
											</div>
										</div>
									) : null}
								</div>
						</div>
					</div>
				</SheetContent>
			</Sheet>
		</>
	);
};

export default ReleaseBlogWriteSidebar;