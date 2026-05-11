"use client";
import type { UserInfo } from "@/types/user";
import axios, { AxiosError } from "axios";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogFooter,
	DialogTitle,
	DialogDescription,
} from "@/components/ui/dialog";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { questionSchema, suggestionSchema } from "@/schemas/topicSchema";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { ApiResponse } from "@/types/ApiResponse";
import TableSkeleton from "@/components/skeletons/TableSkeleton";
import { useDebounceCallback, useDebounceValue } from "usehooks-ts";
import {
	CirclePlus,
	FileInput,
	FolderKanban,
	Link2,
	Loader2,
	Trash2,
	UserPlus,
	Users,
} from "lucide-react";
import UserCard from "@/components/UserCard";
import InsertNavbar from "@/components/InsertNavbar";
import ShareLinkButton from "@/components/ShareLinkButton";
import { useNotifications } from "@/features/notification/context/NotificationProvider";
import InsertHoverCard from "@/components/InsertHoverCard";
import { useBlog } from "@/features/blog/context/BlogProvider";
import { useInsertTopics } from "@/features/topic/context/InsertTopicProvider";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { TopicProblemsGrid, type TopicProblemReferenceDisplay } from "@/features/topic/components/TopicProblemsGrid";
import type { BlogCollectionEntry, BlogReferenceKind, ProblemBlogReference } from "@/types/blog-collection";

const EachTopic = () => {
	const params = useParams();
	const topic_id = params.topicid as string;
	const { data: session, status } = useSession();
	const { toast } = useToast();

	const {
		curr_topic,
		isTopicLoading,
		fetchTopicById,
		addProblem,
		deleteProblem,
		deleteTopic,
		editProblem
	} = useInsertTopics();
	const {
		allBlogs,
		blogCollections,
		isAllBlogsLoading,
		isBlogCollectionsLoading,
		fetchBlogsByUsername,
		fetchBlogCollections,
	} = useBlog();

	const { sendSuggestion } = useNotifications();

	// Modal state
	const [currentProblemId, setCurrentProblemId] = useState<string | null>(null);

	const [isItemModalOpen, setIsItemModalOpen] = useState(false);
	const [isItemDeleteModalOpen, setIsItemDeleteModalOpen] = useState(false);
	const [isSuggestProblemOpen, setIsSuggestProblemOpen] = useState(false);
	const [isReferenceModalOpen, setIsReferenceModalOpen] = useState(false);
	const [referenceProblem, setReferenceProblem] = useState<any | null>(null);
	const [selectedBlogId, setSelectedBlogId] = useState("");
	const [selectedCollectionId, setSelectedCollectionId] = useState("");
	const [referenceKind, setReferenceKind] = useState<BlogReferenceKind>("reference");
	const [referenceLabel, setReferenceLabel] = useState("");
	const [isReferenceSubmitting, setIsReferenceSubmitting] = useState(false);
	const [removingReferenceId, setRemovingReferenceId] = useState<string | null>(null);
	const [editingReferenceId, setEditingReferenceId] = useState<string | null>(null);

	const [isAddingProblem, setIsAddingProblem] = useState(false)
	const [isDeletingProblem, setIsDeletingProblem] = useState(false)

	// collaborator search
	const [debouncedUsername, setSearchUsername] = useDebounceValue<string>('', 500)
	const [isSearchingUsername, setIsSearchingUsername] = useState(false);
	const [searchUsernameMessage, setSearchUsernameMessage] = useState("");
	const [similarUsers, setSimilarUsers] = useState<UserInfo[]>([]);

	const debounced = useDebounceCallback(setSearchUsername, 500);

	const [isTopicDeleting, setIsTopicDeleting] = useState(false)

	const [isTopicModalOpen, setIsTopicModalOpen] = useState(false);
	const [isTopicDeleteModalOpen, setIsTopicDeleteModalOpen] = useState(false);

	const handleOpenItemModal = () => setIsItemModalOpen(true);
	const handleOpenDeleteProblemModal = (problemId: string) => {
		setCurrentProblemId(problemId);
		setIsItemDeleteModalOpen(true);
	};
	const handleOpenSuggestProblem = () => setIsSuggestProblemOpen(true);
	const handleOpenReferenceModal = (problem: any) => {
		setReferenceProblem(problem);
		setSelectedBlogId("");
		setSelectedCollectionId("");
		setReferenceKind("reference");
		setReferenceLabel("");
		setEditingReferenceId(null);
		setIsReferenceModalOpen(true);
	};

	const resetReferenceForm = () => {
		setSelectedBlogId("");
		setSelectedCollectionId("");
		setReferenceKind("reference");
		setReferenceLabel("");
		setEditingReferenceId(null);
	};

	const handleDeleteProblem = async () => {
		if (!topic_id || !currentProblemId) return;
		setIsDeletingProblem(true);
		await deleteProblem(topic_id, currentProblemId);
		setIsItemDeleteModalOpen(false);
		setIsDeletingProblem(false);
		setCurrentProblemId(null);
	};

	// ------------------------------------------
	const questionForm = useForm<z.infer<typeof questionSchema>>({
		resolver: zodResolver(questionSchema),
		defaultValues: { qname: "", url: "", difficulty: "Easy" },
	});

	const problemSubmit = async (data: z.infer<typeof questionSchema>) => {
		if (!topic_id || !session?.user?.username) return;
		setIsAddingProblem(true);
		await addProblem(data, topic_id);
		questionForm.reset()
		setIsAddingProblem(false)
		setIsItemModalOpen(false);
	};


	// ------------------------------------

	const suggestionForm = useForm<z.infer<typeof suggestionSchema>>({
		resolver: zodResolver(suggestionSchema),
		defaultValues: { problemname: "", problemurl: "" },
	});

	const suggestionSubmit = async (data: z.infer<typeof suggestionSchema>) => {
		if (!curr_topic || !session?.user?.username) return;
		await sendSuggestion(curr_topic.topic?.creator_username, {
			noti_type: "suggestion",
			from: session.user.username,
			topicid: curr_topic.topic.id,
			topicname: curr_topic.topic.title,
			read: true,
			problemname: data.problemname,
			problemurl: data.problemurl
		});
		suggestionForm.reset()
	};

	const [iscollabModalOpen, setIsCollabModalOpen] = useState(false);
	const handleCollabModal = (id: string) => {
		setIsCollabModalOpen(true);
	};

	useEffect(() => {
		if (!debouncedUsername) {
			setSearchUsernameMessage("");
			setSimilarUsers([]);
			return;
		}
		(async () => {
			setIsSearchingUsername(true);
			setSearchUsernameMessage("");
			try {
				const res = await axios.get<ApiResponse>(
					`/api/users/search?query=${encodeURIComponent(debouncedUsername)}${session?.user?.username ? `&exclude=${encodeURIComponent(session.user.username)}` : ""}`
				);
				setSearchUsernameMessage(res.data.message);
				setSimilarUsers(res.data.users || []);
			} catch (err) {
				const e = err as AxiosError<ApiResponse>;
				setSimilarUsers([]);
				setSearchUsernameMessage(e.response?.data.message ?? "Error searching");
			} finally {
				setIsSearchingUsername(false);
			}
		})();
	}, [debouncedUsername, session?.user?.username]);

	const handleOpenDeleteTopicModal = () => {
		setIsTopicDeleteModalOpen(true);
	};

	const handleDeleteTopic = async () => {
		if (topic_id !== null) {
			setIsTopicDeleting(true)
			await deleteTopic(topic_id)
			setIsTopicDeleting(false)
			setIsTopicDeleteModalOpen(false)
		}
	}

	const [isEditModalOpen, setIsEditModalOpen] = useState(false);
	const [editingProblem, setEditingProblem] = useState<any | null>(null);
	const [isUpdatingProblem, setIsUpdatingProblem] = useState(false);

	useEffect(() => {
		if (!topic_id) return;
		fetchTopicById(topic_id);
	}, [topic_id, fetchTopicById]);

	const editForm = useForm<z.infer<typeof questionSchema>>({
		resolver: zodResolver(questionSchema),
		defaultValues: { qname: "", url: "", difficulty: "Easy" },
	});

	const handleOpenEditProblemModal = (problem: any) => {
		setEditingProblem(problem);
		editForm.reset({
			qname: problem?.qname ?? "",
			url: problem?.url ?? "",
			difficulty: problem?.difficulty ?? "Easy",
		});
		setIsEditModalOpen(true);
	};

	const handleEditProblemSubmit = async (data: z.infer<typeof questionSchema>) => {
		if (!topic_id || !editingProblem?._id) return;
		try {
			setIsUpdatingProblem(true);
			await editProblem(topic_id, editingProblem._id, data);
			setIsEditModalOpen(false);
			setEditingProblem(null);
		} finally {
			setIsUpdatingProblem(false);
		}
	};

	const blogMap = React.useMemo(() => {
		return new Map(allBlogs.map((blog) => [String(blog._id ?? blog.id ?? ""), blog]))
	}, [allBlogs]);

	const collectionMap = React.useMemo(() => {
		return new Map(blogCollections.map((collection) => [String(collection._id ?? ""), collection]))
	}, [blogCollections]);

	const resolveProblemReference = React.useCallback((reference: ProblemBlogReference): TopicProblemReferenceDisplay => {
		const blog = blogMap.get(String(reference.blogId));
		const collection = reference.collectionId ? collectionMap.get(String(reference.collectionId)) : undefined;
		const resolvedBlogUrl = typeof reference.blogUrl === "string"
			? `/blog/${reference.blogUrl}`
			: typeof blog?.blogUrl === "string"
				? `/blog/${blog.blogUrl}`
				: undefined;

		return {
			_id: reference._id,
			blogId: String(reference.blogId),
			collectionId: reference.collectionId ? String(reference.collectionId) : null,
			kind: reference.kind,
			label: reference.label,
			blogTitle: reference.blogTitle || blog?.blogTitle,
			blogUrl: resolvedBlogUrl,
			collectionName: reference.collectionName || collection?.name,
		};
	}, [blogMap, collectionMap]);

	const tableProblems = (curr_topic?.problems || []).map((problem) => ({
		_id: String(problem._id ?? problem.id ?? ""),
		qname: problem.qname,
		url: problem.url,
		difficulty: problem.difficulty,
		blogReferences: (problem.blogReferences || []).map(resolveProblemReference),
	}));

	const canManageProblems = Boolean(
		status === "authenticated" &&
		(session?.user.username === curr_topic?.topic?.creator_username ||
			curr_topic?.topic?.collaborators.find((each: any) => each.username === session?.user?.username))
	);
	const isOwner = session?.user?.username === curr_topic?.topic?.creator_username;
	const isCollaborator = Boolean(
		curr_topic?.topic?.collaborators.find((each: any) => each.username === session?.user?.username)
	);
	const canSuggestProblem = Boolean(
		status === "authenticated" &&
		session?.user?.username &&
		curr_topic &&
		session.user.username !== curr_topic.topic.creator_username &&
		!isCollaborator
	);
	const collaboratorCount = curr_topic?.topic?.collaborators?.length ?? 0;
	const resolvedTopicId = String(curr_topic?.topic?.id ?? "");
	const isResolvedTopic = Boolean(curr_topic && resolvedTopicId === topic_id);

	useEffect(() => {
		if (status !== "authenticated" || !session?.user?.username || !canManageProblems) return;
		void fetchBlogsByUsername(session.user.username);
		void fetchBlogCollections();
	}, [canManageProblems, fetchBlogCollections, fetchBlogsByUsername, session?.user?.username, status]);

	const selectedBlogCollections = React.useMemo(() => {
		if (!selectedBlogId) return blogCollections
		return blogCollections.filter((collection) => collection.blogIds.includes(selectedBlogId))
	}, [blogCollections, selectedBlogId]);

	const handleAttachReference = async () => {
		if (!topic_id || !referenceProblem?._id || !selectedBlogId) return;

		try {
			setIsReferenceSubmitting(true);

			const payload = {
				blogId: selectedBlogId,
				collectionId: selectedCollectionId || null,
				kind: referenceKind,
				label: referenceLabel.trim(),
			};

			if (editingReferenceId) {
				await axios.patch(`/api/topics/${topic_id}/problems/${referenceProblem._id}/blog-references/${editingReferenceId}`, payload);
			} else {
				await axios.post(`/api/topics/${topic_id}/problems/${referenceProblem._id}/blog-references`, payload);
			}

			await fetchTopicById(topic_id, { force: true });
			toast({
				title: editingReferenceId ? "Reference updated ✅" : "Reference added ✅",
				description: editingReferenceId
					? "Blog reference updated successfully"
					: "Blog reference added successfully",
				variant: "default",
			});
			resetReferenceForm();
		} catch (error: any) {
			toast({
				title: "Reference update failed ⭕",
				description: error?.response?.data?.message || error?.message || "Unable to save blog reference",
				variant: "destructive",
			});
		} finally {
			setIsReferenceSubmitting(false);
		}
	};

	const handleEditReference = (reference: TopicProblemReferenceDisplay) => {
		setEditingReferenceId(reference._id ?? null);
		setSelectedBlogId(String(reference.blogId || ""));
		setSelectedCollectionId(reference.collectionId ? String(reference.collectionId) : "");
		setReferenceKind(reference.kind);
		setReferenceLabel(reference.label || "");
	};

	const handleRemoveReference = async (referenceId: string) => {
		if (!topic_id || !referenceProblem?._id || !referenceId) return;

		try {
			setRemovingReferenceId(referenceId);
			await axios.delete(`/api/topics/${topic_id}/problems/${referenceProblem._id}/blog-references/${referenceId}`);
			await fetchTopicById(topic_id, { force: true });
			toast({
				title: "Reference removed ✅",
				description: "Blog reference removed successfully",
				variant: "default",
			});
		} catch (error: any) {
			toast({
				title: "Reference removal failed ⭕",
				description: error?.response?.data?.message || error?.message || "Unable to remove blog reference",
				variant: "destructive",
			});
		} finally {
			setRemovingReferenceId(null);
			if (editingReferenceId === referenceId) {
				resetReferenceForm();
			}
		}
	};

	const referenceProblemFromState = referenceProblem?._id
		? curr_topic?.problems.find((problem) => String(problem._id ?? problem.id ?? "") === String(referenceProblem._id))
		: null;
	const resolvedReferenceProblemReferences = (referenceProblemFromState?.blogReferences || []).map(resolveProblemReference);

	if (isTopicLoading || !isResolvedTopic) {
		return (
			<div className="min-h-screen bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,250,252,0.98))] dark:bg-[linear-gradient(180deg,rgba(2,6,23,1),rgba(2,6,23,0.98))]">
				<div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
					<InsertNavbar />
					<TableSkeleton />
				</div>
			</div>
		);
	}

	if (!curr_topic) return null

	return (
		<div className="min-h-screen bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,250,252,0.98))] dark:bg-[linear-gradient(180deg,rgba(2,6,23,1),rgba(2,6,23,0.98))]">
			<div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
				<InsertNavbar />

				<section className="flex flex-col gap-4 py-1">
					<div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
						<div className="min-w-0 space-y-2">
							<div className="flex flex-wrap items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
								<Badge variant="secondary" className="rounded-full bg-slate-100 px-2.5 py-1 capitalize text-slate-700 dark:bg-slate-800 dark:text-slate-200">
									{curr_topic.topic.visibility}
								</Badge>
								<Badge variant="secondary" className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-700 dark:bg-slate-800 dark:text-slate-200">
									{curr_topic.problems.length} problem{curr_topic.problems.length === 1 ? "" : "s"}
								</Badge>
								{collaboratorCount > 0 ? (
									<Badge variant="secondary" className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-700 dark:bg-slate-800 dark:text-slate-200">
										{collaboratorCount} collaborator{collaboratorCount === 1 ? "" : "s"}
									</Badge>
								) : null}
							</div>
							<h1 className="truncate text-2xl font-semibold tracking-tight text-slate-950 dark:text-slate-50 sm:text-3xl">
								{curr_topic.topic.title}
							</h1>
							<div className="flex flex-wrap items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
								<span className="inline-flex items-center gap-1.5">
									<span>Author</span>
									<InsertHoverCard username={curr_topic.topic.creator_username as string} type={"username"} />
								</span>
								<span className="inline-flex items-center gap-1.5">
									<Users className="h-4 w-4" />
									<span>{isOwner ? "Owner" : isCollaborator ? "Collaborator" : "Viewer"}</span>
								</span>
							</div>
							{curr_topic.topic.about?.trim() ? (
								<p className="max-w-3xl text-sm leading-6 text-slate-600 dark:text-slate-300">
									{curr_topic.topic.about}
								</p>
							) : null}
						</div>

						<div className="flex flex-wrap gap-2 lg:justify-end">
							<ShareLinkButton
								path={`/topic/${topic_id}`}
								title={curr_topic.topic.title || 'Insert topic'}
								text={`Check out this topic on Insert: ${curr_topic.topic.title || 'Untitled topic'}`}
								className="h-10 rounded-xl border-black/10 bg-transparent px-4 dark:border-white/10 dark:bg-transparent"
							/>
							{!isTopicLoading && status === "authenticated" && isOwner && (
								<Button variant="outline" className="h-10 rounded-xl border-black/10 bg-transparent px-4 dark:border-white/10 dark:bg-transparent" onClick={() => handleCollabModal(topic_id)}>
									<UserPlus className="mr-2 h-4 w-4" />
									Collaborator
								</Button>
							)}
							{!isTopicLoading && canManageProblems && (
								<Button onClick={() => handleOpenItemModal()} className="h-10 rounded-xl px-4" variant={"default"}>
									<CirclePlus className="mr-2 h-4 w-4" />
									Add problem
								</Button>
							)}
							{!isTopicLoading && canSuggestProblem && (
								<Button onClick={() => handleOpenSuggestProblem()} className="h-10 rounded-xl border-black/10 bg-transparent px-4 dark:border-white/10 dark:bg-transparent" variant={"outline"}>
									<FileInput className="mr-2 h-4 w-4" />
									Suggest
								</Button>
							)}
							{!isTopicLoading && status === "authenticated" && isOwner && (
								<Button variant="destructive" className="h-10 rounded-xl px-4" onClick={() => handleOpenDeleteTopicModal()}>
									<Trash2 className="mr-2 h-4 w-4" />
									Delete
								</Button>
							)}


						</div>
					</div>

					{collaboratorCount > 0 && (
						<div className="flex items-center gap-3 overflow-x-auto pt-1">
							<div className="flex -space-x-2 *:data-[slot=avatar]:ring-2 *:data-[slot=avatar]:ring-background">
								<InsertHoverCard username={curr_topic.topic.creator_username as string} type={"avatar"} />
								{curr_topic.topic.collaborators.map((each: any, idx: number) => (
									<InsertHoverCard
										key={`${each?.username}-${idx}`}
										username={each?.username as string}
										type={"avatar"}
									/>
								))}
							</div>
							<p className="text-sm text-slate-500 dark:text-slate-400">Shared with {collaboratorCount} collaborator{collaboratorCount === 1 ? "" : "s"}.</p>
						</div>
					)}
				</section>

				<div>
					<Dialog open={iscollabModalOpen} onOpenChange={setIsCollabModalOpen}>
						<DialogContent>
							<DialogHeader className="mb-4">
								<DialogTitle>Add collaborator</DialogTitle>
								<DialogDescription>Start typing the username below...</DialogDescription>
							</DialogHeader>
							<Input
								placeholder="Search username"
								onChange={(e) => {
									setSearchUsername(e.target.value);
									debounced(e.target.value);
								}}
							/>
							{isSearchingUsername && <Loader2 className="animate-spin" />}
							<p
								className={`text-sm ${searchUsernameMessage === "Found"
									? "text-green-500"
									: "text-red-500"
									}`}
							>
								{searchUsernameMessage}
							</p>

							<div className="flex flex-col gap-2 p-2 overflow-y-scroll custom-small-scrollbar">
								{similarUsers?.map((user, idx) => (
									<>
										<UserCard
											key={idx}
											user={user}
											topicid={topic_id}
											topic={curr_topic?.topic}
											collaborators={curr_topic?.topic?.collaborators}
										/>
										<Separator className="my-1" />
									</>
								))}
							</div>
						</DialogContent>
					</Dialog>

					<Dialog open={isItemModalOpen} onOpenChange={setIsItemModalOpen}>
						<DialogContent>
							<DialogHeader>
								<DialogTitle>Add Problem</DialogTitle>
								<DialogDescription>Enter the following details to add problem</DialogDescription>
							</DialogHeader>
							<Form {...questionForm}>
								<form
									onSubmit={questionForm.handleSubmit(problemSubmit)}
									className="space-y-6"
								>
									<FormField
										control={questionForm.control}
										name="qname"
										render={({ field }) => (
											<FormItem>
												<FormControl>
													<Input placeholder="Problem Name" {...field} />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
									<FormField
										control={questionForm.control}
										name="url"
										render={({ field }) => (
											<FormItem>
												<FormControl>
													<Input placeholder="URL" {...field} />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
									<FormField
										control={questionForm.control}
										name="difficulty"
										render={({ field }) => (
											<FormItem>
												<FormControl>
													<Select
														onValueChange={field.onChange}
														value={field.value}
													>
														<SelectTrigger>
															<SelectValue placeholder="Difficulty" />
														</SelectTrigger>
														<SelectContent>
															<SelectGroup>
																<SelectItem value="Easy">Easy</SelectItem>
																<SelectItem value="Easy-Med">Easy-Med</SelectItem>
																<SelectItem value="Medium">Medium</SelectItem>
																<SelectItem value="Med-Hard">Med-Hard</SelectItem>
																<SelectItem value="Hard">Hard</SelectItem>
																<SelectItem value="Advanced">Advanced</SelectItem>
															</SelectGroup>
														</SelectContent>
													</Select>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
									<DialogFooter>
										<Button type="submit" variant="default" disabled={isAddingProblem}>
											{isAddingProblem ? (
												<>
													<Loader2 className='mr-2 h-4 w-4 animate-spin' /> Please Wait
												</>
											) : ('Save')}
										</Button>
										<Button
											disabled={isAddingProblem}
											variant="destructive"
											onClick={() => setIsItemModalOpen(false)}
										>
											Cancel
										</Button>
									</DialogFooter>
								</form>
							</Form>
						</DialogContent>
					</Dialog>

					<Dialog
						open={isItemDeleteModalOpen}
						onOpenChange={setIsItemDeleteModalOpen}
					>
						<DialogContent>
							<DialogHeader>
								<DialogTitle>Delete Problem</DialogTitle>
								<DialogDescription>
									Are you sure you want to delete this problem? This action cannot
									be undone.
								</DialogDescription>
							</DialogHeader>
							<DialogFooter>
								<Button variant="destructive" disabled={isDeletingProblem} onClick={handleDeleteProblem}>
									{isDeletingProblem ? (
										<>
											<Loader2 className='mr-2 h-4 w-4 animate-spin' /> Please Wait
										</>
									) : ('Delete')}
								</Button>
								<Button
									disabled={isDeletingProblem}
									variant="default"
									onClick={() => setIsItemDeleteModalOpen(false)}
								>
									Cancel
								</Button>
							</DialogFooter>
						</DialogContent>
					</Dialog>

					<Dialog
						open={isSuggestProblemOpen}
						onOpenChange={setIsSuggestProblemOpen}
					>
						<DialogContent>
							<DialogHeader>
								<DialogTitle>Problem Details</DialogTitle>
								<DialogDescription>Share a problem suggestion with its name and source URL for this topic.</DialogDescription>
							</DialogHeader>
							<Form {...suggestionForm}>
								<form
									onSubmit={suggestionForm.handleSubmit(suggestionSubmit)}
									className="space-y-6"
								>
									<FormField
										control={suggestionForm.control}
										name="problemname"
										render={({ field }) => (
											<FormItem>
												<FormControl>
													<Input placeholder="Problem Name" {...field} />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
									<FormField
										control={suggestionForm.control}
										name="problemurl"
										render={({ field }) => (
											<FormItem>
												<FormControl>
													<Input placeholder="Problem URL" {...field} />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
									<DialogFooter>
										<Button type="submit" variant="default">
											Send
										</Button>
										<Button
											variant="destructive"
											onClick={() => setIsSuggestProblemOpen(false)}
										>
											Cancel
										</Button>
									</DialogFooter>
								</form>
							</Form>
						</DialogContent>
					</Dialog>

					<Dialog open={isTopicDeleteModalOpen} onOpenChange={setIsTopicDeleteModalOpen}>
						<DialogContent>
							<DialogHeader>
								<DialogTitle>Confirm Delete Topic</DialogTitle>
							</DialogHeader>
							<DialogDescription>Are you sure you want to delete this topic?</DialogDescription>
							<DialogFooter>
								<Button variant="destructive" disabled={isTopicDeleting} onClick={() => setIsTopicDeleteModalOpen(false)}>Cancel</Button>
								<Button variant="default" onClick={handleDeleteTopic} disabled={isTopicDeleting}>
									{
										isTopicDeleting ? (<>
											<Loader2 className='mr-2 h-4 w-4 animate-spin' /> Please wait
										</>) : ('Confirm')
									}
								</Button>
							</DialogFooter>
						</DialogContent>
					</Dialog>

					<Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
						<DialogContent>
							<DialogHeader>
								<DialogTitle>Edit Problem</DialogTitle>
								<DialogDescription>Update the problem details</DialogDescription>
							</DialogHeader>
							<Form {...editForm}>
								<form onSubmit={editForm.handleSubmit(handleEditProblemSubmit)} className="space-y-6">
									<FormField
										control={editForm.control}
										name="qname"
										render={({ field }) => (
											<FormItem>
												<FormControl>
													<Input placeholder="Problem Name" {...field} />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
									<FormField
										control={editForm.control}
										name="url"
										render={({ field }) => (
											<FormItem>
												<FormControl>
													<Input placeholder="URL" {...field} />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
									<FormField
										control={editForm.control}
										name="difficulty"
										render={({ field }) => (
											<FormItem>
												<FormControl>
													<Select onValueChange={field.onChange} value={field.value}>
														<SelectTrigger>
															<SelectValue placeholder="Difficulty" />
														</SelectTrigger>
														<SelectContent>
															<SelectGroup>
																<SelectItem value="Easy">Easy</SelectItem>
																<SelectItem value="Easy-Med">Easy-Med</SelectItem>
																<SelectItem value="Medium">Medium</SelectItem>
																<SelectItem value="Med-Hard">Med-Hard</SelectItem>
																<SelectItem value="Hard">Hard</SelectItem>
																<SelectItem value="Advanced">Advanced</SelectItem>
															</SelectGroup>
														</SelectContent>
													</Select>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
									<DialogFooter>
										<Button type="submit" variant="default" disabled={isUpdatingProblem}>
											{isUpdatingProblem ? (
												<>
													<Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving
												</>
											) : (
												"Save"
											)}
										</Button>
										<Button
											type="button"
											variant="destructive"
											disabled={isUpdatingProblem}
											onClick={() => setIsEditModalOpen(false)}
										>
											Cancel
										</Button>
									</DialogFooter>
								</form>
							</Form>
						</DialogContent>
					</Dialog>

					<Dialog open={isReferenceModalOpen} onOpenChange={(open) => {
						setIsReferenceModalOpen(open)
						if (!open) {
							resetReferenceForm()
						}
					}}>
						<DialogContent className="sm:max-w-2xl">
							<DialogHeader>
								<DialogTitle>Manage blog references</DialogTitle>
								<DialogDescription>
									Attach blogs or collection-backed references to this problem.
								</DialogDescription>
							</DialogHeader>

							<div className="space-y-6">
								<div className="rounded-2xl border border-border/60 bg-card/50 p-4">
									<p className="text-sm font-medium text-foreground">{referenceProblem?.qname}</p>
									<p className="mt-1 text-xs text-muted-foreground">Choose one of your blogs and optionally tie it to a collection.</p>
									{editingReferenceId ? (
										<Badge variant="secondary" className="mt-3 rounded-full px-2.5 py-1 text-[11px]">
											Editing existing reference
										</Badge>
									) : null}
								</div>

								<div className="grid gap-4 md:grid-cols-2">
									<div className="space-y-2">
										<p className="text-sm font-medium">Blog</p>
										<Select value={selectedBlogId} onValueChange={(value) => {
											setSelectedBlogId(value)
											setSelectedCollectionId("")
										}}>
											<SelectTrigger>
												<SelectValue placeholder={isAllBlogsLoading ? "Loading blogs..." : "Select a blog"} />
											</SelectTrigger>
											<SelectContent>
												{allBlogs.map((blog) => (
													<SelectItem key={blog._id} value={blog._id || ""}>
														{blog.blogTitle}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									</div>

									<div className="space-y-2">
										<p className="text-sm font-medium">Collection</p>
										<Select value={selectedCollectionId} onValueChange={setSelectedCollectionId}>
											<SelectTrigger>
												<SelectValue placeholder={isBlogCollectionsLoading ? "Loading collections..." : "Optional collection"} />
											</SelectTrigger>
											<SelectContent>
												{selectedBlogCollections.map((collection: BlogCollectionEntry) => (
													<SelectItem key={collection._id} value={collection._id || ""}>
														{collection.name}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									</div>
								</div>

								<div className="grid gap-4 md:grid-cols-[180px_minmax(0,1fr)]">
									<div className="space-y-2">
										<p className="text-sm font-medium">Type</p>
										<Select value={referenceKind} onValueChange={(value: BlogReferenceKind) => setReferenceKind(value)}>
											<SelectTrigger>
												<SelectValue placeholder="Reference type" />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="solution">Solution</SelectItem>
												<SelectItem value="reference">Reference</SelectItem>
												<SelectItem value="note">Note</SelectItem>
											</SelectContent>
										</Select>
									</div>

									<div className="space-y-2">
										<p className="text-sm font-medium">Label</p>
										<Input placeholder="Optional label like DP approach or edge cases" value={referenceLabel} onChange={(event) => setReferenceLabel(event.target.value)} />
									</div>
								</div>

								<DialogFooter>
									<Button type="button" variant="outline" onClick={() => {
										if (editingReferenceId) {
											resetReferenceForm()
											return
										}
										setIsReferenceModalOpen(false)
									}} disabled={isReferenceSubmitting}>
										{editingReferenceId ? "Stop editing" : "Cancel"}
									</Button>
									<Button type="button" onClick={handleAttachReference} disabled={isReferenceSubmitting || !selectedBlogId}>
										{isReferenceSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FolderKanban className="mr-2 h-4 w-4" />}
										{editingReferenceId ? "Save changes" : "Attach reference"}
									</Button>
								</DialogFooter>

								<div className="space-y-3 border-t border-border/60 pt-4">
									<div className="flex items-center justify-between gap-3">
										<p className="text-sm font-medium">Attached references</p>
										<Badge variant="secondary" className="rounded-full px-2.5 py-1 text-[11px]">
											{referenceProblemFromState?.blogReferences?.length ?? 0}
										</Badge>
									</div>

									{resolvedReferenceProblemReferences.length ? (
										<div className="space-y-3">
											{resolvedReferenceProblemReferences.map((reference) => (
												<div key={reference._id} className="flex items-center justify-between gap-4 rounded-2xl border border-border/60 bg-background/50 px-4 py-3">
													<div className="min-w-0 space-y-1">
														<div className="flex flex-wrap items-center gap-2">
															<Badge className="rounded-full border border-violet-500/20 bg-violet-500/10 px-2.5 py-1 text-[11px] font-semibold capitalize text-violet-700 dark:text-violet-200">
																{reference.kind}
															</Badge>
															<span className="text-sm font-medium text-foreground">
																{reference.blogTitle || reference.label || "Linked blog"}
															</span>
															{reference.label && reference.blogTitle && reference.label !== reference.blogTitle ? (
																<span className="text-xs text-muted-foreground">{reference.label}</span>
															) : null}
														</div>
														<div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
															{reference.collectionName ? <span>Collection: {reference.collectionName}</span> : null}
															{reference.blogUrl ? (
																<a href={reference.blogUrl} target="_blank" rel="noreferrer noopener" className="inline-flex items-center gap-1 text-sky-600 hover:underline dark:text-sky-300">
																	<Link2 className="h-3.5 w-3.5" />
																	Open blog
																</a>
															) : null}
														</div>
													</div>
													<div className="flex items-center gap-1">
														<Button
															type="button"
															variant="ghost"
															size="icon"
															className="h-8 w-8 rounded-lg text-amber-600 hover:bg-amber-500/10 hover:text-amber-700 dark:text-amber-300 dark:hover:text-amber-200"
															onClick={() => handleEditReference(reference)}
															disabled={!reference._id || isReferenceSubmitting || removingReferenceId === reference._id}
														>
															<FileInput className="h-4 w-4" />
														</Button>
														<Button
															type="button"
															variant="ghost"
															size="icon"
															className="h-8 w-8 rounded-lg text-rose-600 hover:bg-rose-500/10 hover:text-rose-700 dark:text-rose-300 dark:hover:text-rose-200"
															onClick={() => handleRemoveReference(String(reference._id || ""))}
															disabled={removingReferenceId === reference._id || !reference._id}
														>
															{removingReferenceId === reference._id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
														</Button>
													</div>
												</div>
											))}
										</div>
									) : (
										<div className="rounded-2xl border border-dashed border-border/60 px-4 py-6 text-center text-sm text-muted-foreground">
											No blog references attached yet.
										</div>
									)}
								</div>
							</div>
						</DialogContent>
					</Dialog>

					<TopicProblemsGrid
						problems={tableProblems}
						canManageProblems={canManageProblems}
						onDelete={handleOpenDeleteProblemModal}
						onEdit={handleOpenEditProblemModal}
						onManageReferences={handleOpenReferenceModal}
					/>
				</div>
			</div>
		</div>
	);
};

export default EachTopic;
