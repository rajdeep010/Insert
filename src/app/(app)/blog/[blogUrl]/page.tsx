"use client";
import * as React from "react";
import axios, { AxiosError } from "axios";
import { EditorContent, EditorContext, useEditor } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";
import { Image } from "@tiptap/extension-image";
import { TaskItem } from "@tiptap/extension-task-item";
import { TaskList } from "@tiptap/extension-task-list";
import { TextAlign } from "@tiptap/extension-text-align";
import { Typography } from "@tiptap/extension-typography";
import { Highlight } from "@tiptap/extension-highlight";
import { Subscript } from "@tiptap/extension-subscript";
import { Superscript } from "@tiptap/extension-superscript";
import { Underline } from "@tiptap/extension-underline";
import { Link } from "@/components/tiptap-extension/link-extension";
import { Selection } from "@/components/tiptap-extension/selection-extension";
import { TrailingNode } from "@/components/tiptap-extension/trailing-node-extension";
import { Button } from "@/components/tiptap-ui-primitive/button";
import { Spacer } from "@/components/tiptap-ui-primitive/spacer";
import {
	Toolbar,
	ToolbarGroup,
	ToolbarSeparator,
} from "@/components/tiptap-ui-primitive/toolbar";
import { ImageUploadNode } from "@/components/tiptap-node/image-upload-node/image-upload-node-extension";
import "@/components/tiptap-node/code-block-node/code-block-node.scss";
import "@/components/tiptap-node/list-node/list-node.scss";
import "@/components/tiptap-node/image-node/image-node.scss";
import "@/components/tiptap-node/paragraph-node/paragraph-node.scss";
import { HeadingDropdownMenu } from "@/components/tiptap-ui/heading-dropdown-menu";
import { ImageUploadButton } from "@/components/tiptap-ui/image-upload-button";
import { ListDropdownMenu } from "@/components/tiptap-ui/list-dropdown-menu";
import { BlockQuoteButton } from "@/components/tiptap-ui/blockquote-button";
import { CodeBlockButton } from "@/components/tiptap-ui/code-block-button";
import {
	ColorHighlightPopover,
	ColorHighlightPopoverContent,
	ColorHighlightPopoverButton,
} from "@/components/tiptap-ui/color-highlight-popover";
import {
	LinkPopover,
	LinkContent,
	LinkButton,
} from "@/components/tiptap-ui/link-popover";
import { MarkButton } from "@/components/tiptap-ui/mark-button";
import { TextAlignButton } from "@/components/tiptap-ui/text-align-button";
import { UndoRedoButton } from "@/components/tiptap-ui/undo-redo-button";
import { ArrowLeftIcon } from "@/components/tiptap-icons/arrow-left-icon";
import { HighlighterIcon } from "@/components/tiptap-icons/highlighter-icon";
import { LinkIcon } from "@/components/tiptap-icons/link-icon";
import { useMobile } from "@/hooks/use-mobile";
import { useWindowSize } from "@/hooks/use-window-size";
import { useCursorVisibility } from "@/hooks/use-cursor-visibility";
import { Button as Btn } from "@/components/ui/button";
import { handleImageUpload, MAX_FILE_SIZE } from "@/lib/tiptap-utils";
import "@/components/tiptap-templates/simple/simple-editor.scss";
import { Placeholder } from "@/components/tiptap-extension/placeholder-extension";
import BlogWriteSidebar from "@/components/BlogWriteSidebar";
import ShareLinkButton from "@/components/ShareLinkButton";
import { useBlog } from "@/features/blog/context/BlogProvider";
import { useCollaborationV2 } from "@/features/collaboration-v2/context/CollaborationProviderV2";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import type { ApiResponse } from "@/types/ApiResponse";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { useDebounceValue } from "usehooks-ts";
import { useParams } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { TopicActionButton } from "@/features/topic/components/TopicActionButton";
import { TopicActionSheet } from "@/features/topic/components/TopicActionSheet";
import {
	ArrowRightLeft,
	Crown,
	Eye,
	FileText,
	Loader2,
	LockIcon,
	LockOpen,
	PencilLine,
	Search,
	ShieldAlert,
	ShieldCheck,
	Trash2,
	UserPlus,
	Users,
} from "lucide-react";
import {
	inviteCollaboratorV2 as inviteCollaboratorServiceV2,
	removeCollaboratorV2 as removeCollaboratorServiceV2,
	updateCollaboratorRoleV2 as updateCollaboratorRoleServiceV2,
} from "@/services/collaboration-v2.service";
import type { CollaborationRoleV2, CollaborationTopicCollaboratorV2 } from "@/types/collaboration-v2";
import type { UserInfo } from "@/types/user";

type BlogEditorMode = "write" | "preview";

const getRoleBadgeVariant = (role: CollaborationRoleV2 | null) =>
	role === "OWNER" ? "default" : role === "EDITOR" ? "secondary" : "outline";

const formatRoleLabel = (role: CollaborationRoleV2 | null) => {
	if (!role) return "Viewer";
	return role.charAt(0) + role.slice(1).toLowerCase();
};



const MainToolbarContent = ({
	onHighlighterClick,
	onLinkClick,
	isMobile,
	isSaving,
	onToggleAutoSave,
	autoSave,
	onSaveClick,
}: {
	onHighlighterClick: () => void;
	onLinkClick: () => void;
	isMobile: boolean;
	isSaving: boolean,
	onToggleAutoSave: () => void,
	autoSave: boolean,
	onSaveClick: () => void;
}) => {

	const { isBlogLoading } = useBlog();

	return (
		<>
			<ToolbarGroup>
				<UndoRedoButton action="undo" />
				<UndoRedoButton action="redo" />
			</ToolbarGroup>

			<ToolbarSeparator />

			<ToolbarGroup>
				<HeadingDropdownMenu levels={[1, 2, 3, 4]} />
				<ListDropdownMenu types={["bulletList", "orderedList", "taskList"]} />
				<BlockQuoteButton />
				<CodeBlockButton />
			</ToolbarGroup>

			<ToolbarSeparator />

			<ToolbarGroup>
				<MarkButton type="bold" />
				<MarkButton type="italic" />
				<MarkButton type="strike" />
				<MarkButton type="code" />
				<MarkButton type="underline" />
				{!isMobile ? (
					<ColorHighlightPopover />
				) : (
					<ColorHighlightPopoverButton onClick={onHighlighterClick} />
				)}
				{!isMobile ? <LinkPopover /> : <LinkButton onClick={onLinkClick} />}
			</ToolbarGroup>

			<ToolbarSeparator />

			<ToolbarGroup>
				<MarkButton type="superscript" />
				<MarkButton type="subscript" />
			</ToolbarGroup>

			<ToolbarSeparator />

			<ToolbarGroup>
				<TextAlignButton align="left" />
				<TextAlignButton align="center" />
				<TextAlignButton align="right" />
				<TextAlignButton align="justify" />
			</ToolbarGroup>

			<ToolbarSeparator />

			<ToolbarGroup>
				<ImageUploadButton text="Add" />
			</ToolbarGroup>

			<ToolbarSeparator />

			<Tooltip>
				<TooltipTrigger asChild>
					<span>
						{/* {
							isSaving 
							? <Loader2 className="animate-spin h-4 w-4" /> */}
						<Switch checked={autoSave} onCheckedChange={onToggleAutoSave} />
						{/* } */}
					</span>
				</TooltipTrigger>
				<TooltipContent>
					<p>Auto Save</p>
				</TooltipContent>
			</Tooltip>


			{!isBlogLoading && <Btn onClick={onSaveClick} disabled={autoSave} >Save</Btn>}
		</>
	);
};

const MobileToolbarContent = ({
	type,
	onBack,
}: {
	type: "highlighter" | "link";
	onBack: () => void;
}) => (
	<>
		<ToolbarGroup>
			<Button data-style="ghost" onClick={onBack}>
				<ArrowLeftIcon className="tiptap-button-icon" />
				{type === "highlighter" ? (
					<HighlighterIcon className="tiptap-button-icon" />
				) : (
					<LinkIcon className="tiptap-button-icon" />
				)}
			</Button>
		</ToolbarGroup>

		<ToolbarSeparator />

		{type === "highlighter" ? (
			<ColorHighlightPopoverContent />
		) : (
			<LinkContent />
		)}
	</>
);

const SimpleEditor = ({ mode }: { mode: BlogEditorMode }) => {
	const { data: session, status } = useSession()
	const { getBlogPermissionV2 } = useCollaborationV2()


	const isMobile = useMobile();
	const windowSize = useWindowSize();
	const [mobileView, setMobileView] = React.useState<"main" | "highlighter" | "link">("main")
	const toolbarRef = React.useRef<HTMLDivElement>(null);

	const { currentBlog, handleBlogUpdate, isBlogLoading, handleAutoSaveBlog } = useBlog();
	const blogPermission = React.useMemo(
		() => getBlogPermissionV2(
			String(currentBlog?._id ?? currentBlog?.id ?? ""),
			(currentBlog?.creator as string | undefined) ?? null,
			(currentBlog?.type as string | undefined) ?? null
		),
		[currentBlog?._id, currentBlog?.id, currentBlog?.creator, currentBlog?.type, getBlogPermissionV2]
	)
	const canEditCurrentBlog = blogPermission.canEdit
	const [editorContent, setEditorContent] = React.useState<any>(currentBlog?.blogContent)
	const [editorTextContent, setEditorTextContent] = React.useState<string>(currentBlog?.blogContentText || "");

	const [debouncedEditorContent, setDebouncedEditorContent] = useDebounceValue<any>(currentBlog?.blogContent, 300)
	const [debouncedEditorTextContent, setDebouncedEditorTextContent] = useDebounceValue<any>(currentBlog?.blogContentText || "", 300)

	const [autoSave, setAutoSave] = React.useState(currentBlog?.autosave || false)
	const [isSaving, setIsSaving] = React.useState(false)

	React.useEffect(() => {
		setEditorContent(currentBlog?.blogContent)
		setEditorTextContent(currentBlog?.blogContentText || "")
		setAutoSave(currentBlog?.autosave || false)
	}, [currentBlog])

	const getFirstImageFromBlogContent = (blogContent: string) => {
		try {
			const contentObj = typeof blogContent === "string" ? JSON.parse(blogContent) : blogContent;

			const findFirstImage = (node: any): string | null => {
				if (!node) return null;
				if (node.type === "image" && node.attrs?.src) {
					return node.attrs.src;
				}
				if (Array.isArray(node.content)) {
					for (const child of node.content) {
						const found = findFirstImage(child);
						if (found) return found;
					}
				}
				return null;
			}

			return findFirstImage(contentObj) || null;
		} catch {
			return null;
		}
	}

	const editor = useEditor({
		immediatelyRender: false,
		editorProps: {
			attributes: {
				autocomplete: "off",
				autocorrect: "off",
				autocapitalize: "off",
				"aria-label": "Main content area, start typing to enter text.",
			},
		},
		extensions: [
			StarterKit,
			TextAlign.configure({ types: ["heading", "paragraph"] }),
			Underline,
			TaskList,
			TaskItem.configure({ nested: true }),
			Highlight.configure({ multicolor: true }),
			Image,
			Typography,
			Superscript,
			Placeholder.configure({
				placeholder: ({ node, pos }) => {
					if (pos === 0 && node.type.name === "heading") {
						return "Enter title";
					}
					return "Start writing...";
				},
				emptyEditorClass: "is-editor-empty",
				showOnlyWhenEditable: true,
			}),
			Subscript,
			Selection,
			ImageUploadNode.configure({
				accept: "image/*",
				maxSize: MAX_FILE_SIZE,
				limit: 3,
				upload: handleImageUpload,
				onError: (error) => console.error("Upload failed:", error),
			}),
			TrailingNode,
			Link.configure({ openOnClick: false }),
		],
		content: editorContent,
		onUpdate: ({ editor }) => {
			const json = editor.getJSON() || "";
			const plainText = editor?.getText().trim() || ""

			setEditorContent(json)
			setEditorTextContent(plainText)

			if (autoSave) {
				setDebouncedEditorContent(json)
				setDebouncedEditorTextContent(plainText)
				// debouncedSave(json, plainText)
			}
		},
	})

	const previewEditor = useEditor({
		immediatelyRender: false,
		extensions: [
			StarterKit,
			TextAlign.configure({ types: ["heading", "paragraph"] }),
			Underline,
			TaskList,
			TaskItem.configure({ nested: true }),
			Highlight.configure({ multicolor: true }),
			Image,
			Typography,
			Superscript,
			Subscript,
			Selection,
			ImageUploadNode.configure({
				accept: "image/*",
				maxSize: MAX_FILE_SIZE,
				limit: 3,
				upload: handleImageUpload,
				onError: (error) => console.error("Upload failed:", error),
			}),
			TrailingNode,
			Link.configure({ openOnClick: false }),
		],
		content: editorContent,
		editable: false,
	})

	const bodyRect = useCursorVisibility({
		editor,
		overlayHeight: toolbarRef.current?.getBoundingClientRect().height ?? 0,
	});

	const handleSaveContent = async () => {
		if (!canEditCurrentBlog || (!editorContent && !currentBlog)) return;

		await handleBlogUpdate({
			blogContent: JSON.stringify(editorContent),
			blogContentText: editorTextContent,
			blogBannerImage: getFirstImageFromBlogContent(editorContent) ?? undefined,
		})
	}

	React.useEffect(() => {
		if (!isMobile && mobileView !== "main") {
			setMobileView("main");
		}
		if (!editor) {
			return;
		}

		// editor.chain().focus().setImageUploadNode().run();
	}, [isMobile, mobileView])

	React.useEffect(() => {
		const handleAutoSave = async () => {
			if (debouncedEditorContent) {
				try {
					setIsSaving(true);
					await handleAutoSaveBlog({
						blogContent: JSON.stringify(debouncedEditorContent),
						blogContentText: debouncedEditorTextContent,
						blogBannerImage: getFirstImageFromBlogContent(debouncedEditorContent) ?? undefined,
						autosave: true,
					});
					setIsSaving(false);
				} catch (error) {
				}
			}
		}
		// console.log("contents: ", currentBlog, 'current blog content: ', currentBlog?.blogContent, 'debounded editor content: ', debouncedEditorContent);
		if (canEditCurrentBlog && autoSave && currentBlog && currentBlog?.blogContent !== debouncedEditorContent) handleAutoSave()

	}, [autoSave, canEditCurrentBlog, currentBlog, debouncedEditorContent, debouncedEditorTextContent, handleAutoSaveBlog])


	React.useEffect(() => {
		if (previewEditor && editorContent) {
			previewEditor.commands.setContent(editorContent)
		}
	}, [editorContent, previewEditor])

	return (
		<EditorContext.Provider value={{ editor }}>

			<div className="flex w-full flex-col gap-3">
				{canEditCurrentBlog &&
					(mode === "write" ? (
						<>
							<Toolbar
								ref={toolbarRef}
								style={isMobile ? { bottom: `calc(100% - ${windowSize.height - bodyRect.y}px)`, } : {}}
							>
								{mobileView === "main" ?
									isBlogLoading ? <Skeleton className="w-32 h-6" /> : (
										<MainToolbarContent
											onHighlighterClick={() => setMobileView("highlighter")}
											onLinkClick={() => setMobileView("link")}
											isMobile={isMobile}
											isSaving={isSaving}
											autoSave={autoSave}
											onToggleAutoSave={() => setAutoSave(!autoSave)}
											onSaveClick={handleSaveContent}
										/>
									) : (
										<MobileToolbarContent
											type={mobileView === "highlighter" ? "highlighter" : "link"}
											onBack={() => setMobileView("main")}
										/>
									)}
							</Toolbar>

							<div className="content-wrapper shadow-sm dark:shadow-grey-800">
								<EditorContent
									editor={editor}
									role="presentation"
									className="simple-editor-content"
								/>
							</div>
						</>
						) : (
							<div className="content-wrapper shadow-sm dark:shadow-grey-800">
								<EditorContent
									editor={previewEditor}
									role="presentation"
									className="simple-editor-content"
								/>
							</div>
						))}

				{!canEditCurrentBlog && <>
					<div className="content-wrapper shadow-sm dark:shadow-grey-800">
						<EditorContent
							editor={previewEditor}
							role="presentation"
							className="simple-editor-content"
						/>
					</div>
				</>
				}
			</div>

		</EditorContext.Provider>
	);
};

const Write = () => {
	const router = useRouter()
	const { toast } = useToast()
	const { allBlogs, currentBlog, isBlogLoading, fetchBlogByIdentifier, fetchBlogsByUsername, deleteBlog } = useBlog()
	const { getBlogPermissionV2, refreshCollaborationV2 } = useCollaborationV2()
	const { data: session, status } = useSession();
	const params = useParams()
	const blogUrl = params?.blogUrl as string
	const accessToken = session?.accessToken ?? null
	const [isBlogSwitcherOpen, setIsBlogSwitcherOpen] = React.useState(false)
	const [isCollaboratorSheetOpen, setIsCollaboratorSheetOpen] = React.useState(false)
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false)
	const [inviteUsername, setInviteUsername] = React.useState("")
	const [debouncedInviteUsername] = useDebounceValue(inviteUsername, 400)
	const [inviteRole, setInviteRole] = React.useState<"EDITOR" | "VIEWER">("EDITOR")
	const [isInviting, setIsInviting] = React.useState(false)
	const [pendingInviteUsername, setPendingInviteUsername] = React.useState<string | null>(null)
	const [isSearchingUsername, setIsSearchingUsername] = React.useState(false)
	const [searchUsernameMessage, setSearchUsernameMessage] = React.useState("")
	const [similarUsers, setSimilarUsers] = React.useState<UserInfo[]>([])
	const [updatingCollaboratorIds, setUpdatingCollaboratorIds] = React.useState<string[]>([])
	const [removingCollaboratorIds, setRemovingCollaboratorIds] = React.useState<string[]>([])
	const [isDeletingBlog, setIsDeletingBlog] = React.useState(false)
	const [editorMode, setEditorMode] = React.useState<BlogEditorMode>("write")
	const blogPermission = React.useMemo(
		() => getBlogPermissionV2(
			String(currentBlog?._id ?? currentBlog?.id ?? ""),
			(currentBlog?.creator as string | undefined) ?? null,
			(currentBlog?.type as string | undefined) ?? null
		),
		[currentBlog?._id, currentBlog?.id, currentBlog?.creator, currentBlog?.type, getBlogPermissionV2]
	)
	const resolvedBlogId = String(currentBlog?._id ?? currentBlog?.id ?? "")
	const blogCollaborators = React.useMemo(
		() => ((currentBlog?.collaborators as Array<Record<string, any>> | undefined) ?? []).map((collaborator) => ({
			id: String(collaborator.id ?? collaborator._id ?? collaborator.username ?? ""),
			username: String(collaborator.username ?? ""),
			name: typeof collaborator.name === "string" ? collaborator.name : null,
			role: collaborator.role === "OWNER" || collaborator.role === "EDITOR" || collaborator.role === "VIEWER" ? collaborator.role : "VIEWER",
			grantedBy: currentBlog?.creator ? String(currentBlog.creator) : null,
			isCurrentUser: collaborator.username === session?.user?.username,
		})),
		[currentBlog?.collaborators, currentBlog?.creator, session?.user?.username]
	)
	const currentCollaborator = blogCollaborators.find((collaborator) => collaborator.username === session?.user?.username) ?? null
	const currentAccessRole: CollaborationRoleV2 = blogPermission.role ?? currentCollaborator?.role ?? "VIEWER"
	const accessibleBlogItems = React.useMemo(() => {
		const mapped = new Map<string, { id: string; title: string; blogUrl: string; visibility: string | null; creator: string | null; role: CollaborationRoleV2 | null }>()
		const sourceBlogs = [...allBlogs] as Array<Record<string, any>>

		if (currentBlog) {
			const currentId = String(currentBlog._id ?? currentBlog.id ?? "")
			if (currentId && !sourceBlogs.some((blog) => String(blog._id ?? blog.id ?? "") === currentId)) {
				sourceBlogs.unshift(currentBlog as Record<string, any>)
			}
		}

		sourceBlogs.forEach((blog) => {
			const id = String(blog._id ?? blog.id ?? "")
			const nextBlogUrl = String(blog.blogUrl ?? "")
			if (!id || !nextBlogUrl || mapped.has(id)) return

			mapped.set(id, {
				id,
				title: String(blog.blogTitle ?? "Untitled blog"),
				blogUrl: nextBlogUrl,
				visibility: typeof blog.type === "string" ? blog.type : null,
				creator: typeof blog.creator === "string" ? blog.creator : null,
				role: getBlogPermissionV2(id, typeof blog.creator === "string" ? blog.creator : null, typeof blog.type === "string" ? blog.type : null).role,
			})
		})

		return Array.from(mapped.values())
	}, [allBlogs, currentBlog, getBlogPermissionV2])

	const currentAccessMeta = React.useMemo(() => {
		if ((currentBlog?.creator ?? null) === session?.user?.username || currentAccessRole === "OWNER") {
			return { label: "Owner", icon: Crown, variant: "default" as const, helper: "You manage this blog" }
		}
		if (currentAccessRole === "EDITOR") {
			return { label: "Editor", icon: ShieldCheck, variant: "secondary" as const, helper: "Shared with edit access" }
		}
		if (currentAccessRole === "VIEWER") {
			return { label: "Viewer", icon: Eye, variant: "outline" as const, helper: "Shared with read access" }
		}
		if (currentBlog?.type === "public") {
			return { label: "Public", icon: Eye, variant: "outline" as const, helper: "Visible without collaboration" }
		}
		return null
	}, [currentAccessRole, currentBlog?.creator, currentBlog?.type, session?.user?.username])
	const inviteCandidates = React.useMemo(
		() => similarUsers.filter((user) => {
			const username = user.username ?? null
			if (!username) return false
			if (username === currentBlog?.creator) return false
			return !blogCollaborators.some((collaborator) => collaborator.username === username)
		}),
		[blogCollaborators, currentBlog?.creator, similarUsers]
	)
	const canManageCollaborators = blogPermission.canManageCollaborators
	const canDeleteBlog = currentBlog?.creator === session?.user?.username
	const refreshCurrentBlog = React.useCallback(async () => {
		if (!blogUrl) return
		await fetchBlogByIdentifier(currentBlog?.blogUrl ?? blogUrl, { silent: true })
	}, [blogUrl, currentBlog?.blogUrl, fetchBlogByIdentifier])

	const handleInviteCollaborator = async (usernameOverride?: string) => {
		const targetUsername = (usernameOverride ?? inviteUsername).trim()
		if (!accessToken || !resolvedBlogId || !targetUsername) return

		setPendingInviteUsername(targetUsername)
		setIsInviting(true)
		try {
			await inviteCollaboratorServiceV2(
				{
					entityType: "BLOG",
					entityId: resolvedBlogId,
					receiverUsername: targetUsername,
					role: inviteRole,
				},
				accessToken
			)
			await Promise.all([refreshCurrentBlog(), refreshCollaborationV2()])
			setInviteUsername("")
			setInviteRole("EDITOR")
			setSearchUsernameMessage("")
			setSimilarUsers([])
			toast({ title: "Invite sent", description: "Blog collaboration invite sent successfully.", variant: "default" })
		} catch (error: any) {
			toast({
				title: "Invite failed",
				description: error?.response?.data?.message || error?.message || "Unable to invite collaborator.",
				variant: "destructive",
			})
		} finally {
			setIsInviting(false)
			setPendingInviteUsername(null)
		}
	}

	const handleRoleUpdate = async (
		collaborator: CollaborationTopicCollaboratorV2,
		nextRole: Exclude<CollaborationRoleV2, "OWNER">
	) => {
		if (!accessToken || collaborator.role === nextRole) return

		setUpdatingCollaboratorIds((current) => [...current, collaborator.id])
		try {
			await updateCollaboratorRoleServiceV2(collaborator.id, nextRole, accessToken)
			await Promise.all([refreshCurrentBlog(), refreshCollaborationV2()])
			toast({
				title: "Role updated",
				description: `@${collaborator.username} is now ${formatRoleLabel(nextRole).toLowerCase()}.`,
				variant: "default",
			})
		} catch (error: any) {
			toast({
				title: "Role update failed",
				description: error?.response?.data?.message || error?.message || "Unable to update collaborator role.",
				variant: "destructive",
			})
		} finally {
			setUpdatingCollaboratorIds((current) => current.filter((value) => value !== collaborator.id))
		}
	}

	const handleRemoveCollaborator = async (collaborator: CollaborationTopicCollaboratorV2) => {
		if (!accessToken) return

		setRemovingCollaboratorIds((current) => [...current, collaborator.id])
		try {
			await removeCollaboratorServiceV2(collaborator.id, accessToken)
			await Promise.all([refreshCurrentBlog(), refreshCollaborationV2()])
			toast({
				title: "Collaborator removed",
				description: `@${collaborator.username} no longer has access to this blog.`,
				variant: "default",
			})
		} catch (error: any) {
			toast({
				title: "Removal failed",
				description: error?.response?.data?.message || error?.message || "Unable to remove collaborator.",
				variant: "destructive",
			})
		} finally {
			setRemovingCollaboratorIds((current) => current.filter((value) => value !== collaborator.id))
		}
	}

	const handleDeleteCurrentBlog = async () => {
		if (!resolvedBlogId || !session?.user?.username) return

		setIsDeletingBlog(true)
		try {
			await deleteBlog(resolvedBlogId)
			setIsDeleteDialogOpen(false)
			router.replace(`/u/${session.user.username}?tab=blogs`)
		} finally {
			setIsDeletingBlog(false)
		}
	}

	React.useEffect(() => {
		if (!blogUrl) return
		fetchBlogByIdentifier(blogUrl)
	}, [blogUrl, fetchBlogByIdentifier])

	React.useEffect(() => {
		if (status !== 'authenticated' || !session?.user?.username) return
		fetchBlogsByUsername(session.user.username)
	}, [status, session?.user?.username, fetchBlogsByUsername])

	React.useEffect(() => {
		if (!debouncedInviteUsername.trim()) {
			setSearchUsernameMessage("")
			setSimilarUsers([])
			return
		}

		let ignore = false

		const searchUsers = async () => {
			setIsSearchingUsername(true)
			setSearchUsernameMessage("")
			try {
				const response = await axios.get<ApiResponse>(`/api/users/search?query=${encodeURIComponent(debouncedInviteUsername.trim())}`)
				if (ignore) return
				setSearchUsernameMessage(response.data.message)
				setSimilarUsers(response.data.users || [])
			} catch (error) {
				if (ignore) return
				const axiosError = error as AxiosError<ApiResponse>
				setSimilarUsers([])
				setSearchUsernameMessage(axiosError.response?.data.message ?? "Error searching")
			} finally {
				if (!ignore) {
					setIsSearchingUsername(false)
				}
			}
		}

		void searchUsers()

		return () => {
			ignore = true
		}
	}, [debouncedInviteUsername])

	React.useEffect(() => {
		setEditorMode("write")
	}, [resolvedBlogId])

	const AccessIcon = currentAccessMeta?.icon
	const nextEditorMode: BlogEditorMode = editorMode === "write" ? "preview" : "write"
	const nextEditorModeLabel = nextEditorMode === "preview" ? "Preview" : "Write"
	const NextEditorModeIcon = nextEditorMode === "preview" ? FileText : PencilLine

	return (
		<>
			<div className="absolute top-5 left-5">
				{status === 'authenticated' && blogPermission.canEdit && <BlogWriteSidebar />}
			</div>

			<div className="px-6 lg:px-56 pt-8 min-h-screen">
				<div className="flex item-center justify-center flex-col gap-3">
					{isBlogLoading
						? <div className="flex justify-center items-center h-screen">
							<Loader2 className="h-12 w-12 animate-spin text-gray-500" />
						</div>
						: currentBlog
							? <>
								<div className="mx-auto w-full max-w-5xl rounded-3xl border border-border/60 bg-background/80 py-3 px-5 shadow-[0_24px_80px_-52px_rgba(15,23,42,0.6)] backdrop-blur">
									<div className="flex items-center gap-5 lg:flex-row lg:items-center lg:justify-between">
										<div className="min-w-0 space-y-3">
											<div className="flex items-center gap-2">
												<h1 className="truncate text-xl font-semibold tracking-tight text-foreground lg:text-2xl">{currentBlog.blogTitle}</h1>
												<div className="flex flex-wrap items-center gap-2">
													<Badge variant={currentBlog.type === "public" ? "secondary" : "destructive"} className="rounded-full p-1 text-[11px] uppercase tracking-wide">
														{currentBlog.type === "public" ? <LockOpen className="h-3 w-3" /> : <LockIcon className="h-3 w-3" />}
													</Badge>
													{currentAccessMeta && AccessIcon ? (
														<Badge variant={currentAccessMeta.variant} className="rounded-full p-1 text-[11px]">
															<AccessIcon className="h-3 w-3" />
															{/* {currentAccessMeta.label} */}
														</Badge>
													) : null}
												</div>
											</div>
										</div>
										<div className="flex flex-wrap items-center gap-2">
											{blogPermission.canEdit ? (
												<TopicActionButton label={nextEditorModeLabel}>
													<Btn
														type="button"
														variant="default"
														size="icon"
														className="h-8 w-8 rounded-xl"
														aria-label={nextEditorModeLabel}
														onClick={() => setEditorMode(nextEditorMode)}
													>
														<NextEditorModeIcon className="h-4 w-4" />
													</Btn>
												</TopicActionButton>
											) : null}
											<TopicActionButton label="Switch blog">
												<Btn type="button" variant="outline" size="icon" className="h-10 w-10 rounded-2xl" onClick={() => setIsBlogSwitcherOpen(true)}>
													<ArrowRightLeft className="h-4 w-4" />
												</Btn>
											</TopicActionButton>
											<TopicActionButton label="Share blog">
												<ShareLinkButton
													path={`/blog/${currentBlog.blogUrl}`}
													title={currentBlog.blogTitle}
													text={currentBlog.blogContentText || currentBlog.blogTitle}
													className="h-10 w-10 rounded-2xl"
													size="icon"
													iconOnly
												/>
											</TopicActionButton>
											<TopicActionButton label={canManageCollaborators ? "Manage collaborators" : "Review access"}>
												<Btn type="button" variant="outline" size="icon" className="h-10 w-10 rounded-2xl" onClick={() => setIsCollaboratorSheetOpen(true)}>
													<Users className="h-4 w-4" />
												</Btn>
											</TopicActionButton>
											{canDeleteBlog ? (
												<TopicActionButton label="Delete blog">
													<Btn type="button" variant="destructive" size="icon" className="h-10 w-10 rounded-2xl" onClick={() => setIsDeleteDialogOpen(true)}>
														<Trash2 className="h-4 w-4" />
													</Btn>
												</TopicActionButton>
											) : null}
										</div>
									</div>
								</div>

								<SimpleEditor mode={editorMode} />

								<TopicActionSheet
									open={isBlogSwitcherOpen}
									onOpenChange={setIsBlogSwitcherOpen}
									title="Switch blog"
									description="Jump between owned and shared blogs without leaving the editor."
								>
									<div className="space-y-3">
										{accessibleBlogItems.map((blog) => {
											const active = blog.id === resolvedBlogId
											const itemMeta = blog.creator === session?.user?.username || blog.role === "OWNER"
												? { label: "Owner", icon: Crown, variant: "default" as const }
												: blog.role === "EDITOR"
													? { label: "Editor", icon: ShieldCheck, variant: "secondary" as const }
													: blog.role === "VIEWER"
														? { label: "Viewer", icon: Eye, variant: "outline" as const }
														: blog.visibility === "public"
															? { label: "Public", icon: Eye, variant: "outline" as const }
															: null
											const ItemIcon = itemMeta?.icon

											return (
												<button
													key={blog.id}
													type="button"
													onClick={() => {
														setIsBlogSwitcherOpen(false)
														router.push(`/blog/${blog.blogUrl}`)
													}}
													className={`flex w-full items-start justify-between gap-3 rounded-2xl border px-4 py-4 text-left transition-colors ${active ? "border-primary/30 bg-primary/5" : "border-border/60 bg-background/60 hover:bg-accent/50"}`}
												>
													<div className="min-w-0 space-y-1">
														<p className="truncate text-sm font-medium text-foreground">{blog.title}</p>
														<p className="text-xs text-muted-foreground">Owner: @{blog.creator ?? "unknown"}</p>
													</div>
													<div className="flex items-center gap-2">
														<Badge variant={blog.visibility === "public" ? "secondary" : "destructive"} className="rounded-full px-2.5 py-1 text-[11px]">
															{blog.visibility === "public" ? "Public" : "Private"}
														</Badge>
														{itemMeta && ItemIcon ? (
															<Badge variant={itemMeta.variant} className="rounded-full px-2.5 py-1 text-[11px]">
																<ItemIcon className="mr-1 h-3 w-3" />
																{itemMeta.label}
															</Badge>
														) : null}
													</div>
												</button>
											)
										})}
									</div>
								</TopicActionSheet>

								<TopicActionSheet
									open={isCollaboratorSheetOpen}
									onOpenChange={setIsCollaboratorSheetOpen}
									title="Blog access"
								>
									<div className="space-y-4">
										{canManageCollaborators ? (
											<div className="space-y-3 rounded-3xl border border-border/60 bg-background/60 p-4">
												<div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_168px]">
													<div className="relative">
														<Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
														<Input
															id="blog-collaborator-username"
															placeholder="Search username"
															value={inviteUsername}
															onChange={(event) => setInviteUsername(event.target.value)}
															className="h-11 rounded-2xl border-border/60 bg-background/80 pl-9"
														/>
														{isSearchingUsername ? <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" /> : null}
													</div>
													<Select value={inviteRole} onValueChange={(value: "EDITOR" | "VIEWER") => setInviteRole(value)}>
														<SelectTrigger id="blog-collaborator-role" className="h-11 rounded-2xl border-border/60 bg-background/80">
															<SelectValue placeholder="Access role" />
														</SelectTrigger>
														<SelectContent>
															<SelectItem value="EDITOR">Editor</SelectItem>
															<SelectItem value="VIEWER">Viewer</SelectItem>
														</SelectContent>
													</Select>
												</div>
												<div className="flex items-center justify-between gap-3">
													{/* {searchUsernameMessage && inviteUsername.trim() ? (
														<p className={`text-sm ${searchUsernameMessage === "Found" ? "text-emerald-600" : "text-muted-foreground"}`}>
															{searchUsernameMessage}
														</p>
													) : <span />}
													<Btn type="button" className="rounded-full" onClick={() => handleInviteCollaborator()} disabled={isInviting || !inviteUsername.trim()}>
														{isInviting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserPlus className="mr-2 h-4 w-4" />}
														Invite collaborator
													</Btn> */}
												</div>
												<div className="max-h-64 space-y-2 overflow-y-auto custom-small-scrollbar">
													{inviteCandidates.map((user) => {
														const username = user.username ?? ""
														const isBusy = isInviting && pendingInviteUsername === username

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
																<Btn
																	type="button"
																	variant="outline"
																	className="rounded-full"
																	disabled={isInviting}
																	onClick={() => handleInviteCollaborator(username)}
																>
																	{isBusy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserPlus className="mr-2 h-4 w-4" />}
																	Invite
																</Btn>
															</div>
														)
													})}
														{!inviteCandidates.length && !isSearchingUsername ? (
															<p className="rounded-2xl border border-dashed border-border/60 px-4 py-5 text-center text-sm text-muted-foreground">
																{inviteUsername.trim() ? "No matching users." : "Start typing to invite someone."}
															</p>
														) : null}
													</div>
											</div>
										) : null}

										{blogCollaborators.length === 0 ? (
											<div className="rounded-3xl border border-dashed border-border/60 px-4 py-6 text-center text-sm text-muted-foreground">
												No collaborators added yet.
											</div>
										) : (
											<div className="space-y-3">
												{blogCollaborators.map((collaborator) => (
													<div key={collaborator.id} className="flex flex-col gap-3 rounded-2xl border border-border/70 p-4 sm:flex-row sm:items-center sm:justify-between">
														<div className="space-y-1">
															<div className="flex flex-wrap items-center gap-2">
																<p className="font-medium">@{collaborator.username}</p>
																<Badge variant={getRoleBadgeVariant(collaborator.role)} className="rounded-full px-2.5 py-1 text-[11px]">{formatRoleLabel(collaborator.role)}</Badge>
															</div>
															<p className="text-sm text-muted-foreground">Granted by: {collaborator.grantedBy ?? currentBlog?.creator ?? "Unknown"}</p>
														</div>
														{canManageCollaborators ? (
															<div className="flex flex-wrap items-center gap-2">
																{collaborator.role !== "EDITOR" ? (
																	<Btn
																		type="button"
																		variant="outline"
																		className="rounded-full"
																		disabled={updatingCollaboratorIds.includes(collaborator.id)}
																		onClick={() => handleRoleUpdate(collaborator, "EDITOR")}
																	>
																		{updatingCollaboratorIds.includes(collaborator.id) ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
																		Set editor
																	</Btn>
																) : null}
																{collaborator.role !== "VIEWER" ? (
																	<Btn
																		type="button"
																		variant="outline"
																		className="rounded-full"
																		disabled={updatingCollaboratorIds.includes(collaborator.id)}
																		onClick={() => handleRoleUpdate(collaborator, "VIEWER")}
																	>
																		{updatingCollaboratorIds.includes(collaborator.id) ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
																		Set viewer
																	</Btn>
																) : null}
																<Btn
																	type="button"
																	variant="destructive"
																	className="rounded-full"
																	disabled={removingCollaboratorIds.includes(collaborator.id)}
																	onClick={() => handleRemoveCollaborator(collaborator)}
																>
																	{removingCollaboratorIds.includes(collaborator.id) ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
																	Remove
																</Btn>
															</div>
														) : null}
													</div>
												))}
											</div>
										)}
									</div>
								</TopicActionSheet>

								<AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
									<AlertDialogContent>
										<AlertDialogHeader>
											<AlertDialogTitle>Delete blog</AlertDialogTitle>
											<AlertDialogDescription>
												This action cannot be undone. This will permanently delete {currentBlog?.blogTitle}.
											</AlertDialogDescription>
										</AlertDialogHeader>
										<AlertDialogFooter>
											<AlertDialogCancel disabled={isDeletingBlog}>Cancel</AlertDialogCancel>
											<AlertDialogAction onClick={handleDeleteCurrentBlog} disabled={isDeletingBlog}>
												{isDeletingBlog ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
												Delete blog
											</AlertDialogAction>
										</AlertDialogFooter>
									</AlertDialogContent>
								</AlertDialog>
							</>
							: (
								<div className="mx-auto mt-20 max-w-3xl rounded-3xl border border-border/60 bg-background/80 p-8 text-center shadow-[0_24px_80px_-48px_rgba(15,23,42,0.55)] backdrop-blur">
									<ShieldAlert className="mx-auto h-10 w-10 text-amber-500" />
									<h1 className="mt-4 text-2xl font-semibold text-foreground">Access denied</h1>
									<p className="mt-2 text-sm leading-6 text-muted-foreground">This blog is private and your account does not currently have access to open it.</p>
								</div>
							)}
				</div>
			</div>
		</>
	);
};

export default Write;
