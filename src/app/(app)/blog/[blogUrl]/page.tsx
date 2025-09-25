"use client";
import * as React from "react";
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
import { useBlog } from "@/app/context/BlogProvider";
import { useSession } from "next-auth/react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { useDebounceCallback, useDebounceValue } from "usehooks-ts";
import { useParams } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2 } from "lucide-react";
import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from "@/components/ui/tabs"



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

const SimpleEditor = () => {
	const { data: session, status } = useSession()


	const isMobile = useMobile();
	const windowSize = useWindowSize();
	const [mobileView, setMobileView] = React.useState<"main" | "highlighter" | "link">("main")
	const toolbarRef = React.useRef<HTMLDivElement>(null);

	const { currentBlog, handleBlogUpdate, isBlogLoading, handleAutoSaveBlog } = useBlog();
	const [editorContent, setEditorContent] = React.useState<any>(currentBlog?.blogContent)
	const [editorTextContent, setEditorTextContent] = React.useState<string>(currentBlog?.blogContentText || "");

	const [debouncedEditorContent, setDebouncedEditorContent] = useDebounceValue<any>(currentBlog?.blogContent, 300)
	const [debouncedEditorTextContent, setDebouncedEditorTextContent] = useDebounceValue<any>(currentBlog?.blogContentText || "", 300)

	const [autoSave, setAutoSave] = React.useState(currentBlog?.autosave || false)
	const [isSaving, setIsSaving] = React.useState(false)

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
			// console.log("Plain Text:", typeof plainText);

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
		if (!editorContent && !currentBlog) return;

		await handleBlogUpdate({
			blogContent: JSON.stringify(editorContent),
			blogContentText: editorTextContent,
			blogBannerImage: getFirstImageFromBlogContent(editorContent),
		})
	}

	React.useEffect(() => {
		if (!isMobile && mobileView !== "main") {
			setMobileView("main");
		}
		if (!editor) {
			return;
		}

		editor.chain().focus().setImageUploadNode().run();
	}, [isMobile, mobileView])

	React.useEffect(() => {
		const handleAutoSave = async () => {
			if(debouncedEditorContent){
				try {
					setIsSaving(true);
					await handleAutoSaveBlog({
						blogContent: JSON.stringify(debouncedEditorContent),
						blogContentText: debouncedEditorTextContent,
						blogBannerImage: getFirstImageFromBlogContent(debouncedEditorContent),
					});
					setIsSaving(false);
				} catch (error) {
					console.log('this is error: ', error)
				}
			}
		}

		handleAutoSave()
	}, [debouncedEditorContent])


	React.useEffect(() => {
		if (previewEditor && editorContent) {
			previewEditor.commands.setContent(editorContent)
		}
	}, [editorContent, previewEditor])

	return (
		<EditorContext.Provider value={{ editor }}>

			<div className="flex w-full flex-col gap-6">
				{status === 'authenticated' && session?.user?.username === currentBlog?.creator &&
					<Tabs defaultValue="write">
						<TabsList>
							<TabsTrigger value="write">Write</TabsTrigger>
							<TabsTrigger value="preview">Preview</TabsTrigger>
						</TabsList>
						<TabsContent value="write">
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
						</TabsContent>


						<TabsContent value="preview">

							<div className="content-wrapper shadow-sm dark:shadow-grey-800">
								<EditorContent
									editor={previewEditor}
									role="presentation"
									className="simple-editor-content"
								/>
							</div>

						</TabsContent>
					</Tabs>}

				{
					status === 'unauthenticated' && <>
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
	const { isBlogLoading } = useBlog()
	const { data: session, status } = useSession();

	if(isBlogLoading){
		console.log('Blog is loading...', isBlogLoading)
	}else{
		console.log('Blog is loaded', isBlogLoading)
	}

	return (
		<>
			<div className="absolute top-5 left-5">
				{status === 'authenticated' && <BlogWriteSidebar />}
			</div>

			<div className="px-6 lg:px-56 pt-8 min-h-screen">
				<div className="flex item-center justify-center flex-col gap-4">
					{isBlogLoading
						? <div className="flex justify-center items-center h-screen">
							<Loader2 className="h-12 w-12 animate-spin text-gray-500" />
						</div>
						: <SimpleEditor />}
				</div>
			</div>
		</>
	);
};

export default Write;
