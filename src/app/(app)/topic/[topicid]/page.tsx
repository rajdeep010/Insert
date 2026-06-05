"use client";
import type { UserInfo } from "@/types/user";
import axios, { AxiosError } from "axios";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
import { questionSchema, suggestionSchema, topicSchema } from "@/schemas/topicSchema";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { ApiResponse } from "@/types/ApiResponse";
import TableSkeleton from "@/components/skeletons/TableSkeleton";
import { useDebounceValue } from "usehooks-ts";
import {
	ArrowRightLeft,
	CirclePlus,
	Crown,
	Eye,
	FileInput,
	FolderKanban,
	Info,
	Link2,
	Loader2,
	PencilLine,
	Search,
	Settings2,
	ShieldCheck,
	Trash2,
	UserPlus,
	Users,
} from "lucide-react";
import InsertNavbar from "@/components/InsertNavbar";
import ShareLinkButton from "@/components/ShareLinkButton";
import { useCollaborationV2 } from "@/features/collaboration-v2/context/CollaborationProviderV2";
import { useNotifications } from "@/features/notification/context/NotificationProvider";
import InsertHoverCard from "@/components/InsertHoverCard";
import { useBlog } from "@/features/blog/context/BlogProvider";
import { useInsertTopics } from "@/features/topic/context/InsertTopicProvider";
import {
	inviteCollaboratorV2 as inviteCollaboratorServiceV2,
	removeCollaboratorV2 as removeCollaboratorServiceV2,
	updateCollaboratorRoleV2 as updateCollaboratorRoleServiceV2,
} from "@/services/collaboration-v2.service";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { TopicProblemsGrid, type TopicProblemReferenceDisplay } from "@/features/topic/components/TopicProblemsGrid";
import { TopicActionButton } from "@/features/topic/components/TopicActionButton";
import { TopicActionSheet } from "@/features/topic/components/TopicActionSheet";
import type { BlogCollectionEntry, BlogReferenceKind, ProblemBlogReference } from "@/types/blog-collection";
import type { CollaborationRoleV2, CollaborationTopicCollaboratorV2 } from "@/types/collaboration-v2";

const getRoleBadgeVariant = (role: CollaborationRoleV2 | null) =>
	role === "OWNER" ? "default" : role === "EDITOR" ? "secondary" : "outline";

const formatRoleLabel = (role: CollaborationRoleV2 | null) => {
	if (!role) return "Viewer";
	return role.charAt(0) + role.slice(1).toLowerCase();
};

const EachTopic = () => {
	const params = useParams();
	const router = useRouter();
	const topic_id = params.topicid as string;
	const { data: session, status } = useSession();
	const { toast } = useToast();
	const accessToken = session?.accessToken ?? null;
	const { myCollaborations, topicOptions, refreshCollaborationV2, getTopicPermissionV2 } = useCollaborationV2();

	const {
		curr_topic,
		isTopicLoading,
		fetchTopicById,
		addProblem,
		deleteProblem,
		deleteTopic,
		updateTopicDetails,
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
	const [inviteUsername, setInviteUsername] = useState("");
	const [debouncedUsername] = useDebounceValue<string>(inviteUsername, 500)
	const [inviteRole, setInviteRole] = useState<"EDITOR" | "VIEWER">("EDITOR");
	const [isInviting, setIsInviting] = useState(false);
	const [pendingInviteUsername, setPendingInviteUsername] = useState<string | null>(null);
	const [isSearchingUsername, setIsSearchingUsername] = useState(false);
	const [searchUsernameMessage, setSearchUsernameMessage] = useState("");
	const [similarUsers, setSimilarUsers] = useState<UserInfo[]>([]);
	const [updatingCollaboratorIds, setUpdatingCollaboratorIds] = useState<string[]>([]);
	const [removingCollaboratorIds, setRemovingCollaboratorIds] = useState<string[]>([]);
	const [collaboratorToRemove, setCollaboratorToRemove] = useState<CollaborationTopicCollaboratorV2 | null>(null);
	const [isTopicSwitcherOpen, setIsTopicSwitcherOpen] = useState(false);
	const [isCollaboratorSheetOpen, setIsCollaboratorSheetOpen] = useState(false);
	const [isDetailsSheetOpen, setIsDetailsSheetOpen] = useState(false);
	const [isSavingTopicDetails, setIsSavingTopicDetails] = useState(false);
	const [hasResolvedTopicRequest, setHasResolvedTopicRequest] = useState(false);

	const [isTopicDeleting, setIsTopicDeleting] = useState(false)

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

	const topicDetailsForm = useForm<z.infer<typeof topicSchema>>({
		resolver: zodResolver(topicSchema),
		defaultValues: {
			title: "",
			about: "",
			visibility: "private",
		},
	});

	useEffect(() => {
		if (!debouncedUsername.trim()) {
			setSearchUsernameMessage("");
			setSimilarUsers([]);
			return;
		}
		(async () => {
			setIsSearchingUsername(true);
			setSearchUsernameMessage("");
			try {
				const res = await axios.get<ApiResponse>(
					`/api/users/search?query=${encodeURIComponent(debouncedUsername)}`
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
	const resolvedTopicId = String(curr_topic?.topic?.id ?? "");
	const ownerUsername = curr_topic?.topic?.creator_username ?? null;

	const accessibleTopics = React.useMemo(() => {
		const mapped = new Map<string, { id: string; title: string; currentRole: CollaborationRoleV2 }>();

		topicOptions.forEach((topic) => {
			mapped.set(topic.id, {
				id: topic.id,
				title: topic.title,
				currentRole: "OWNER",
			});
		});

		return Array.from(topicOptions.values());

		// console.log("this is the topic options: ", topicOptions);

		// myCollaborations
		// 	.filter((membership) => membership.entityType === "TOPIC")
		// 	.forEach((membership) => {
		// 		if (!mapped.has(membership.entityId)) {
		// 			mapped.set(membership.entityId, {
		// 				id: membership.entityId,
		// 				title: membership.entityTitle,
		// 				currentRole: membership.role,
		// 			});
		// 		}
		// 	});

		// console.log("this is the my collaborations: ", myCollaborations);

		// if (resolvedTopicId && curr_topic?.topic?.title && !mapped.has(resolvedTopicId)) {

		// 	const owner = curr_topic.topic.creator_username;
		// 	console.log('current topic id: ', curr_topic?.topic);
		// 	mapped.set(resolvedTopicId, {
		// 		id: resolvedTopicId,
		// 		title: curr_topic.topic.title,
		// 		currentRole: session?.user?.username === owner ? "OWNER" : "VIEWER",
		// 	});
		// }

		// console.log("this is the accessible topics: ", Array.from(mapped.values()));

		// return Array.from(mapped.values());
	}, [curr_topic?.topic?.title, myCollaborations, ownerUsername, resolvedTopicId, session?.user?.username, topicOptions]);

	const fallbackCollaborators = (curr_topic?.topic?.collaborators || []).map((each: any) => ({
		id: String(each?.id ?? each?._id ?? each?.username ?? ""),
		username: String(each?.username ?? ""),
		name: typeof each?.name === "string" ? each.name : null,
		role: each?.role === "OWNER" || each?.role === "EDITOR" || each?.role === "VIEWER" ? each.role : "VIEWER",
		grantedBy: ownerUsername,
		isCurrentUser: each?.username === session?.user?.username,
	}));
	const displayCollaborators = fallbackCollaborators;
	const currentMembership = accessibleTopics.find((topic) => topic.id === resolvedTopicId) ?? null;
	const currentCollaborator = displayCollaborators.find((collaborator) => collaborator.username === session?.user?.username) ?? null;
	const currentPermission = getTopicPermissionV2(
		resolvedTopicId,
		ownerUsername,
		curr_topic?.topic?.visibility ?? null
	);
	const currentAccessRole: CollaborationRoleV2 = currentPermission.role ?? currentMembership?.currentRole ?? currentCollaborator?.role ?? "VIEWER";
	const canManageProblems = status === "authenticated" && currentPermission.canEdit;
	const canManageCollaborators = status === "authenticated" && currentPermission.canManageCollaborators;
	const isOwner = currentPermission.role === "OWNER";
	const isCollaborator = currentAccessRole === "EDITOR" || currentAccessRole === "VIEWER";
	const collaboratorCount = displayCollaborators.length;
	const isResolvedTopic = Boolean(curr_topic && resolvedTopicId === topic_id);
	const inviteCandidates = similarUsers.filter(
		(user) => user.username !== ownerUsername && !displayCollaborators.some((collaborator) => collaborator.username === user.username)
	);

	const handleInviteCollaborator = async (usernameOverride?: string) => {
		const targetUsername = (usernameOverride ?? inviteUsername).trim();
		if (!accessToken || !resolvedTopicId || !targetUsername) return;

		setPendingInviteUsername(targetUsername);
		setIsInviting(true);
		try {
			await inviteCollaboratorServiceV2(
				{
					entityType: "TOPIC",
					entityId: resolvedTopicId,
					receiverUsername: targetUsername,
					role: inviteRole,
				},
				accessToken
			);

			await Promise.all([
				fetchTopicById(topic_id, { force: true }),
				refreshCollaborationV2(),
			]);

			setInviteUsername("");
			setInviteRole("EDITOR");
			setSearchUsernameMessage("");
			setSimilarUsers([]);
			toast({
				title: "Invite sent",
				description: "Topic collaboration invite sent successfully.",
				variant: "default",
			});
		} catch (error: any) {
			toast({
				title: "Invite failed",
				description: error?.response?.data?.message || error?.message || "Unable to invite collaborator.",
				variant: "destructive",
			});
		} finally {
			setIsInviting(false);
			setPendingInviteUsername(null);
		}
	};

	useEffect(() => {
		if (!topic_id) return;
		setHasResolvedTopicRequest(false);
		void fetchTopicById(topic_id).finally(() => setHasResolvedTopicRequest(true));
	}, [topic_id, fetchTopicById]);

	useEffect(() => {
		if (!curr_topic?.topic) return;
		topicDetailsForm.reset({
			title: curr_topic.topic.title ?? "",
			about: curr_topic.topic.about ?? "",
			visibility: curr_topic.topic.visibility ?? "private",
		});
	}, [curr_topic?.topic, topicDetailsForm]);

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

	const canSuggestProblem = Boolean(
		status === "authenticated" &&
		session?.user?.username &&
		curr_topic &&
		session.user.username !== curr_topic.topic.creator_username &&
		!canManageProblems
	);

	const handleTopicSwitch = (nextTopicId: string) => {
		if (!nextTopicId || nextTopicId === resolvedTopicId) return;
		setIsTopicSwitcherOpen(false);
		router.push(`/topic/${nextTopicId}`);
	};

	const handleTopicDetailsSubmit = async (data: z.infer<typeof topicSchema>) => {
		if (!topic_id || !isOwner) return;

		setIsSavingTopicDetails(true);
		try {
			const updatedTopic = await updateTopicDetails(topic_id, data);
			if (!updatedTopic) {
				return;
			}
			toast({
				title: "Topic updated",
				description: "Topic details saved successfully.",
				variant: "default",
			});
		} catch (error: any) {
			toast({
				title: "Update failed",
				description: error?.response?.data?.message || error?.message || "Unable to update topic details.",
				variant: "destructive",
			});
		} finally {
			setIsSavingTopicDetails(false);
		}
	};

	const handleRoleUpdate = async (
		collaborator: CollaborationTopicCollaboratorV2,
		nextRole: Exclude<CollaborationRoleV2, "OWNER">
	) => {
		if (!accessToken || collaborator.role === nextRole) return;

		setUpdatingCollaboratorIds((current) => [...current, collaborator.id]);
		try {
			await updateCollaboratorRoleServiceV2(collaborator.id, nextRole, accessToken);
			await Promise.all([
				fetchTopicById(topic_id, { force: true }),
				refreshCollaborationV2(),
			]);
			toast({
				title: "Role updated",
				description: `@${collaborator.username} is now ${formatRoleLabel(nextRole).toLowerCase()}.`,
				variant: "default",
			});
		} catch (error: any) {
			toast({
				title: "Role update failed",
				description: error?.response?.data?.message || error?.message || "Unable to update collaborator role.",
				variant: "destructive",
			});
		} finally {
			setUpdatingCollaboratorIds((current) => current.filter((value) => value !== collaborator.id));
		}
	};

	const handleRemoveCollaborator = async () => {
		if (!collaboratorToRemove || !accessToken) return;

		setRemovingCollaboratorIds((current) => [...current, collaboratorToRemove.id]);
		try {
			await removeCollaboratorServiceV2(collaboratorToRemove.id, accessToken);
			await Promise.all([
				fetchTopicById(topic_id, { force: true }),
				refreshCollaborationV2(),
			]);
			toast({
				title: "Collaborator removed",
				description: `@${collaboratorToRemove.username} no longer has access to this topic.`,
				variant: "default",
			});
			setCollaboratorToRemove(null);
		} catch (error: any) {
			toast({
				title: "Removal failed",
				description: error?.response?.data?.message || error?.message || "Unable to remove collaborator.",
				variant: "destructive",
			});
		} finally {
			setRemovingCollaboratorIds((current) => current.filter((value) => value !== collaboratorToRemove.id));
		}
	};

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
		if (!isTopicLoading && hasResolvedTopicRequest && !isResolvedTopic) {
			return (
				<div className="min-h-screen bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,250,252,0.98))] dark:bg-[linear-gradient(180deg,rgba(2,6,23,1),rgba(2,6,23,0.98))]">
					<div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
						<InsertNavbar />
						<section className="mx-auto w-full max-w-xl rounded-[28px] border border-border/60 bg-background/80 px-6 py-10 text-center shadow-[0_24px_80px_-48px_rgba(15,23,42,0.55)] backdrop-blur">
							<Users className="mx-auto h-10 w-10 text-amber-500" />
							<h1 className="mt-4 text-2xl font-semibold text-foreground">Access denied</h1>
							<p className="mt-2 text-sm leading-6 text-muted-foreground">This topic is private and your account does not currently have access to open or edit it.</p>
						</section>
					</div>
				</div>
			);
		}

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

				<section className="rounded-[28px] border border-border/60 bg-background/80 px-5 py-5 backdrop-blur sm:px-6 sm:py-6">
					<div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
						<div className="min-w-0 space-y-3">
							<div className="flex flex-wrap items-center gap-2">
								<Badge variant="secondary" className="rounded-full px-2.5 py-1 capitalize">
									{curr_topic.topic.visibility}
								</Badge>
								<Badge variant="secondary" className="rounded-full px-2.5 py-1">
									{curr_topic.problems.length} problem{curr_topic.problems.length === 1 ? "" : "s"}
								</Badge>
								<Badge variant={getRoleBadgeVariant(currentAccessRole)} className="rounded-full px-2.5 py-1">
									{formatRoleLabel(currentAccessRole)}
								</Badge>
							</div>
							<h1 className="truncate text-2xl font-semibold tracking-tight text-foreground">
								{curr_topic.topic.title}
							</h1>
						</div>

						<div className="flex flex-wrap items-center gap-2">
							<TopicActionButton label="Share topic">
								<ShareLinkButton
									path={`/topic/${topic_id}`}
									title={curr_topic.topic.title || "Insert topic"}
									text={`Check out this topic on Insert: ${curr_topic.topic.title || "Untitled topic"}`}
									className="h-9 w-9 rounded-full border-border/60 bg-background/70 p-0"
									iconOnly
								/>
							</TopicActionButton>

							<TopicActionButton label="Switch topic">
								<Button variant="outline" size="icon" className="h-9 w-9 rounded-full border-border/60 bg-background/70" onClick={() => setIsTopicSwitcherOpen(true)}>
									<ArrowRightLeft className="h-4 w-4" />
								</Button>
							</TopicActionButton>

							<TopicActionButton label="Topic details">
								<Button variant="outline" size="icon" className="h-9 w-9 rounded-full border-border/60 bg-background/70" onClick={() => setIsDetailsSheetOpen(true)}>
									<Info className="h-4 w-4" />
								</Button>
							</TopicActionButton>

							{canManageCollaborators ? (
								<TopicActionButton label="Manage collaborators">
									<Button variant="outline" size="icon" className="h-9 w-9 rounded-full border-border/60 bg-background/70" onClick={() => setIsCollaboratorSheetOpen(true)}>
										<Users className="h-4 w-4" />
									</Button>
								</TopicActionButton>
							) : null}

							{canManageProblems ? (
								<TopicActionButton label="Add problem">
									<Button variant="default" size="icon" className="h-9 w-9 rounded-full" onClick={() => handleOpenItemModal()}>
										<CirclePlus className="h-4 w-4" />
									</Button>
								</TopicActionButton>
							) : null}

							{canSuggestProblem ? (
								<TopicActionButton label="Suggest problem">
									<Button variant="outline" size="icon" className="h-9 w-9 rounded-full border-border/60 bg-background/70" onClick={() => handleOpenSuggestProblem()}>
										<FileInput className="h-4 w-4" />
									</Button>
								</TopicActionButton>
							) : null}

							{/* {isOwner ? (
								<TopicActionButton label="Edit topic details">
									<Button variant="outline" size="icon" className="h-9 w-9 rounded-full border-border/60 bg-background/70" onClick={() => setIsDetailsSheetOpen(true)}>
										<PencilLine className="h-4 w-4" />
									</Button>
								</TopicActionButton>
							) : null} */}

							{isOwner ? (
								<TopicActionButton label="Delete topic">
									<Button variant="destructive" size="icon" className="h-9 w-9 rounded-full" onClick={() => handleOpenDeleteTopicModal()}>
										<Trash2 className="h-4 w-4" />
									</Button>
								</TopicActionButton>
							) : null}
						</div>
					</div>
				</section>

				<div className="min-w-0">

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

				<TopicActionSheet
					open={isTopicSwitcherOpen}
					onOpenChange={setIsTopicSwitcherOpen}
					title="Switch topic"
					description="Jump between owned and shared topics without backing out of the workspace."
				>
					<div className="space-y-3">
						{accessibleTopics?.map((topic) => {
							const active = topic.id === resolvedTopicId;
							const accessMeta = topic.currentRole === "OWNER"
								? { label: "Owner", icon: Crown, variant: "default" as const, helper: "You manage this topic" }
								: topic.currentRole === "EDITOR"
									? { label: "Editor", icon: ShieldCheck, variant: "secondary" as const, helper: "Shared with edit access" }
									: { label: "Viewer", icon: Eye, variant: "outline" as const, helper: "Shared with read access" };
							const AccessIcon = accessMeta.icon;

							return (
								<button
									key={topic.id}
									type="button"
									onClick={() => handleTopicSwitch(topic.id)}
									className={`flex w-full items-start justify-between gap-3 rounded-2xl border px-4 py-4 text-left transition-colors ${active ? "border-primary/30 bg-primary/5" : "border-border/60 bg-background/60 hover:bg-accent/50"}`}
								>
									<div className="min-w-0 space-y-1">
										<p className="truncate text-sm font-medium text-foreground">{topic.title}</p>
										<p className="text-xs text-muted-foreground">{accessMeta.helper}</p>
									</div>
									<div className="flex items-center gap-2">
										<Badge variant={accessMeta.variant} className="rounded-md px-2.5 py-1 text-[11px]">
											<AccessIcon className="mr-1 h-3 w-3" />
											{accessMeta.label}
										</Badge>
										{/* <Badge variant={getRoleBadgeVariant(topic.currentRole)} className="rounded-full px-2.5 py-1 text-[11px]">
											{formatRoleLabel(topic.currentRole)}
										</Badge> */}
									</div>
								</button>
							);
						})}
					</div>
				</TopicActionSheet>

				<TopicActionSheet
					open={isCollaboratorSheetOpen}
					onOpenChange={setIsCollaboratorSheetOpen}
					title="Collaborator access"
				>
					<div className="space-y-4">
						{canManageCollaborators ? (
							<div className="space-y-3 rounded-3xl border border-border/60 bg-background/60 p-4">
								<div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_168px]">
									<div className="relative">
										<Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
										<Input
											placeholder="Search username"
											value={inviteUsername}
											onChange={(event) => setInviteUsername(event.target.value)}
											className="h-11 rounded-2xl border-border/60 bg-background/80 pl-9"
										/>
										{isSearchingUsername ? <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" /> : null}
									</div>
									<Select value={inviteRole} onValueChange={(value: "EDITOR" | "VIEWER") => setInviteRole(value)}>
										<SelectTrigger className="h-11 rounded-2xl border-border/60 bg-background/80">
											<SelectValue placeholder="Access role" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="EDITOR">Editor</SelectItem>
											<SelectItem value="VIEWER">Viewer</SelectItem>
										</SelectContent>
									</Select>
								</div>
								{/* <div className="flex items-center justify-between gap-3">
									{searchUsernameMessage && inviteUsername.trim() ? (
										<p className={`text-sm ${searchUsernameMessage === "Found" ? "text-emerald-600" : "text-muted-foreground"}`}>
											{searchUsernameMessage}
										</p>
									) : <span />}
									<Button type="button" className="rounded-full" onClick={() => handleInviteCollaborator()} disabled={isInviting || !inviteUsername.trim()}>
										{isInviting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserPlus className="mr-2 h-4 w-4" />}
										Invite collaborator
									</Button>
								</div> */}
								<div className="max-h-64 space-y-2 overflow-y-auto custom-small-scrollbar">
									{inviteCandidates.map((user) => {
										const username = user.username ?? "";
										const isBusy = isInviting && pendingInviteUsername === username;

										return (
											<div key={username} className="flex items-center justify-between gap-3 rounded-2xl border border-border/60 bg-background/80 px-3 py-3">
												<div className="flex min-w-0 items-center gap-3">
													<Avatar className="h-9 w-9 border border-border/60">
														<AvatarImage src={user.avatar ?? undefined} alt={user.username ?? "User avatar"} />
														<AvatarFallback>{username.charAt(0).toUpperCase() || "U"}</AvatarFallback>
													</Avatar>
													<div className="min-w-0 space-y-0.5">
														<p className="truncate text-sm font-medium text-foreground">{user.name || username}</p>
														<p className="truncate text-xs text-muted-foreground">@{username}{user.company ? ` • ${user.company}` : ""}</p>
													</div>
												</div>
												<Button
													type="button"
													variant="outline"
													className="rounded-full"
													disabled={isInviting}
													onClick={() => handleInviteCollaborator(username)}
												>
													{isBusy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserPlus className="mr-2 h-4 w-4" />}
													Invite
												</Button>
											</div>
										);
									})}
									{!inviteCandidates.length && !isSearchingUsername ? (
										<p className="rounded-2xl border border-dashed border-border/60 px-4 py-5 text-center text-sm text-muted-foreground">
											{inviteUsername.trim() ? "No matching users." : "Start typing to invite someone."}
										</p>
									) : null}
								</div>
							</div>
						) : null}

						<div className="space-y-3">
							<div className="flex items-center justify-between gap-3">
								<p className="text-sm font-medium text-foreground">People with access</p>
								<Badge variant="secondary" className="rounded-full px-2.5 py-1 text-[11px]">
									{collaboratorCount + 1} total
								</Badge>
							</div>

							<div className="rounded-2xl border border-border/60 bg-background/60 px-4 py-3">
								<div className="flex items-center justify-between gap-3">
									<div className="min-w-0">
										<p className="text-sm font-medium text-foreground">@{ownerUsername}</p>
										<p className="text-xs text-muted-foreground">Topic owner</p>
									</div>
									<Badge variant="default" className="rounded-full px-2.5 py-1 text-[11px]">OWNER</Badge>
								</div>
							</div>

							{displayCollaborators.length ? (
								displayCollaborators.map((collaborator) => {
									const isBusy = updatingCollaboratorIds.includes(collaborator.id) || removingCollaboratorIds.includes(collaborator.id);

									return (
										<div key={collaborator.id} className="rounded-2xl border border-border/60 bg-background/60 px-4 py-3">
											<div className="flex flex-col gap-3">
												<div className="flex items-center justify-between gap-3">
													<div className="min-w-0">
														<p className="truncate text-sm font-medium text-foreground">@{collaborator.username}</p>
														<p className="text-xs text-muted-foreground">
															{collaborator.name || "Collaborator"}
															{collaborator.isCurrentUser ? " • You" : ""}
														</p>
													</div>
													<Badge variant={getRoleBadgeVariant(collaborator.role)} className="rounded-full px-2.5 py-1 text-[11px]">
														{collaborator.role}
													</Badge>
												</div>

												{canManageCollaborators && !collaborator.isCurrentUser ? (
													<div className="flex flex-wrap items-center gap-2">
														<Select
															value={collaborator.role === "OWNER" ? "EDITOR" : collaborator.role}
															onValueChange={(value) => void handleRoleUpdate(collaborator, value as Exclude<CollaborationRoleV2, "OWNER">)}
															disabled={isBusy}
														>
															<SelectTrigger className="h-9 w-[132px] rounded-xl">
																<SelectValue />
															</SelectTrigger>
															<SelectContent>
																<SelectItem value="EDITOR">EDITOR</SelectItem>
																<SelectItem value="VIEWER">VIEWER</SelectItem>
															</SelectContent>
														</Select>

														<Button
															variant="outline"
															className="h-9 rounded-xl border-rose-500/20 text-rose-600 hover:bg-rose-500/10 hover:text-rose-700 dark:text-rose-300"
															onClick={() => setCollaboratorToRemove(collaborator)}
															disabled={isBusy}
														>
															{removingCollaboratorIds.includes(collaborator.id) ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
															Remove
														</Button>
													</div>
												) : null}
											</div>
										</div>
									);
								})
							) : (
								<div className="rounded-2xl border border-dashed border-border/60 px-4 py-6 text-center text-sm text-muted-foreground">
									No collaborators have accepted access yet.
								</div>
							)}
						</div>
					</div>
				</TopicActionSheet>

				<TopicActionSheet
					open={isDetailsSheetOpen}
					onOpenChange={setIsDetailsSheetOpen}
					title="Topic details"
					description="Secondary information and owner controls live here so the main workspace stays focused."
				>
					<div className="space-y-6">
						<div className="rounded-2xl border border-border/60 bg-background/60 p-4">
							<div className="flex flex-wrap items-center gap-2">
								<Badge variant="secondary" className="rounded-full px-2.5 py-1 capitalize">{curr_topic.topic.visibility}</Badge>
								<Badge variant="secondary" className="rounded-full px-2.5 py-1">{curr_topic.problems.length} problems</Badge>
								<Badge variant="secondary" className="rounded-full px-2.5 py-1">{collaboratorCount} collaborators</Badge>
							</div>
							<div className="mt-4 space-y-3">
								<div>
									<p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Author</p>
									<div className="mt-2 inline-flex items-center gap-2 text-sm text-foreground">
										<InsertHoverCard username={curr_topic.topic.creator_username as string} type={"username"} />
									</div>
								</div>
								<div>
									<p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">About</p>
									<p className="mt-2 text-sm leading-6 text-muted-foreground">
										{curr_topic.topic.about?.trim() || "No description added yet."}
									</p>
								</div>
								<div>
									<p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Shared with</p>
									<div className="mt-3 flex flex-wrap gap-2">
										<Badge variant="outline" className="rounded-full px-2.5 py-1">@{ownerUsername}</Badge>
										{displayCollaborators.map((collaborator) => (
											<Badge key={collaborator.id} variant="outline" className="rounded-full px-2.5 py-1">
												@{collaborator.username}
											</Badge>
										))}
									</div>
								</div>
							</div>
						</div>

						{isOwner ? (
							<div className="space-y-4 rounded-2xl border border-border/60 bg-background/60 p-4">
								<div className="flex items-center gap-2 text-sm font-medium text-foreground">
									<Settings2 className="h-4 w-4" /> Topic settings
								</div>
								<Form {...topicDetailsForm}>
									<form onSubmit={topicDetailsForm.handleSubmit(handleTopicDetailsSubmit)} className="space-y-4">
										<FormField
											control={topicDetailsForm.control}
											name="title"
											render={({ field }) => (
												<FormItem>
													<FormControl>
														<Input placeholder="Topic title" {...field} />
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>

										<FormField
											control={topicDetailsForm.control}
											name="about"
											render={({ field }) => (
												<FormItem>
													<FormControl>
														<Textarea rows={5} placeholder="Short description for this topic" {...field} />
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>

										<FormField
											control={topicDetailsForm.control}
											name="visibility"
											render={({ field }) => (
												<FormItem>
													<FormControl>
														<Select onValueChange={field.onChange} value={field.value}>
															<SelectTrigger>
																<SelectValue />
															</SelectTrigger>
															<SelectContent>
																<SelectItem value="private">Private</SelectItem>
																<SelectItem value="public">Public</SelectItem>
															</SelectContent>
														</Select>
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>

										<div className="flex justify-end">
											<Button type="submit" disabled={isSavingTopicDetails}>
												{isSavingTopicDetails ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
												Save changes
											</Button>
										</div>
									</form>
								</Form>
							</div>
						) : null}
					</div>
				</TopicActionSheet>

				<AlertDialog open={Boolean(collaboratorToRemove)} onOpenChange={(open) => !open ? setCollaboratorToRemove(null) : null}>
					<AlertDialogContent>
						<AlertDialogHeader>
							<AlertDialogTitle>Remove collaborator access?</AlertDialogTitle>
							<AlertDialogDescription>
								This removes the user from the current topic. They would need a new invite to regain access.
							</AlertDialogDescription>
						</AlertDialogHeader>
						<AlertDialogFooter>
							<AlertDialogCancel>Cancel</AlertDialogCancel>
							<AlertDialogAction onClick={() => void handleRemoveCollaborator()}>Remove</AlertDialogAction>
						</AlertDialogFooter>
					</AlertDialogContent>
				</AlertDialog>
			</div>
		</div>
	);
};

export default EachTopic;
