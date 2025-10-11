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
    ColorHighlightPopoverButton,
    ColorHighlightPopoverContent,
} from "@/components/tiptap-ui/color-highlight-popover";
import {
    LinkPopover,
    LinkButton,
    LinkContent,
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
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { useDebounceValue } from "usehooks-ts";
import { useParams } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2 } from "lucide-react";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
import ReleaseBlogWriteSidebar from "@/components/ReleaseBlogWriteSidebar";
import { useInsertProjects } from "@/app/context/InsertProjectProvider";
import { useSession } from "next-auth/react";
import { EyeClosedIcon, EyeOpenIcon } from "@radix-ui/react-icons";

const EMPTY_DOC = { type: "doc", content: [] };

// --- Safe conversion for any backend content ---
const toValidContent = (raw: any) => {
    if (!raw) return EMPTY_DOC;
    if (typeof raw === "string") {
        try {
            return toValidContent(JSON.parse(raw));
        } catch {
            return raw.trim().length ? raw : EMPTY_DOC;
        }
    }
    if (typeof raw === "object") {
        return raw.type === "doc" ? raw : EMPTY_DOC;
    }
    return EMPTY_DOC;
};

// --- Helper to schedule setContent safely ---
const useSafeSetContent = () =>
    React.useCallback((editor: any, content: any) => {
        if (!editor || !content) return;
        requestAnimationFrame(() => {
            if (!editor.isDestroyed) editor.commands.setContent(content);
        });
    }, []);

// --- Toolbar content ---
const MainToolbarContent = ({
    onHighlighterClick,
    onLinkClick,
    isMobile,
    isSaving,
    isPublic,
    onTogglePublic,
    onSaveClick,
}: any) => (
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
                <Btn
                    variant="ghost"
                    size="sm"
                    onClick={onTogglePublic}
                    className="flex items-center gap-2 px-3 py-2 border rounded-md bg-purple-50 dark:bg-purple-950/30"
                >
                    {isPublic ? (
                        <EyeOpenIcon className="h-4 w-4 text-purple-600" />
                    ) : (
                        <EyeClosedIcon className="h-4 w-4 text-purple-600" />
                    )}
                    <span className="text-xs">
                        {isPublic ? "Public" : "Private"}
                    </span>
                </Btn>
            </TooltipTrigger>
            <TooltipContent>
                <p>{isPublic ? "Switch to Private" : "Switch to Public"}</p>
            </TooltipContent>
        </Tooltip>

        <ToolbarSeparator />

        <Btn onClick={onSaveClick} disabled={isSaving} size="sm">
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
        </Btn>
    </>
);

const MobileToolbarContent = ({ type, onBack }: any) => (
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

// --- Main Editor Component ---
const ReleaseBlogEditor = () => {
    const { data: session, status } = useSession();
    const isMobile = useMobile();
    const windowSize = useWindowSize();
    const [mobileView, setMobileView] =
        React.useState<"main" | "highlighter" | "link">("main");
    const toolbarRef = React.useRef<HTMLDivElement>(null);

    const {
        curr_project,
        updateReleaseBlog,
        currReleaseBlog,
        isCurrReleaseBlogLoading,
    } = useInsertProjects();

    const safeSetContent = useSafeSetContent();
    const [editorContent, setEditorContent] = React.useState<any>(EMPTY_DOC);
    const [editorTextContent, setEditorTextContent] = React.useState("");
    const [isSaving, setIsSaving] = React.useState(false);
    const [isPublic, setIsPublic] = React.useState(false);

    const params = useParams();
    const projectId = params?.id as string;
    const releaseBlogId = params?.releaseBlogId as string;

    // --- extract first image for banner ---
    const getFirstImage = (content: any): string | null => {
        try {
            const obj = typeof content === "string" ? JSON.parse(content) : content;
            const search = (node: any): string | null => {
                if (!node) return null;
                if (node.type === "image" && node.attrs?.src) return node.attrs.src;
                if (Array.isArray(node.content)) {
                    for (const c of node.content) {
                        const res = search(c);
                        if (res) return res;
                    }
                }
                return null;
            };
            return search(obj);
        } catch {
            return null;
        }
    };

    // --- editor (write) ---
    const editor = useEditor({
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
                limit: 5,
                upload: handleImageUpload,
            }),
            TrailingNode,
            Link.configure({ openOnClick: false }),
            Placeholder.configure({
                placeholder: ({ node }) =>
                    node.type.name === "heading"
                        ? "Release title..."
                        : "Add release details, changes, improvements...",
            }),
        ],
        onUpdate: ({ editor }) => {
            const json = editor.getJSON();
            const text = editor.getText().trim();
            setEditorContent(json);
            setEditorTextContent(text);
        },
    });

    // --- preview editor (read-only) ---
    const previewEditor = useEditor({
        immediatelyRender: false,
        editable: false,
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
            ImageUploadNode,
            TrailingNode,
            Link.configure({ openOnClick: true }),
        ],
    });

    // --- initialize editors from server ---
    React.useEffect(() => {
        if (!currReleaseBlog) return;
        const valid = toValidContent(currReleaseBlog.blogContent);
        setEditorContent(valid);
        setEditorTextContent(currReleaseBlog.blogContentText || "");
        setIsPublic(currReleaseBlog.visibility === "public");

        requestAnimationFrame(() => {
            safeSetContent(editor, valid);
            safeSetContent(previewEditor, valid);
        });
    }, [currReleaseBlog, editor, previewEditor, safeSetContent]);

    // --- live sync preview ---
    React.useEffect(() => {
        if (!previewEditor || !editorContent) return;
        requestAnimationFrame(() => {
            if (!previewEditor.isDestroyed)
                previewEditor.commands.setContent(editorContent);
        });
    }, [editorContent, previewEditor]);

    // --- manual save ---
    const handleManualSave = async () => {
        if (!editorContent) return;
        try {
            setIsSaving(true);
            console.log('release blog content: ', JSON.stringify(editorContent));
            await updateReleaseBlog(projectId, releaseBlogId, {
                blogContent: JSON.stringify(editorContent),
                blogContentText: editorTextContent,
                blogBannerImage: getFirstImage(editorContent),
                visibility: isPublic ? "public" : "private",
                autosave: false,
            });
        } finally {
            setIsSaving(false);
        }
    };

    const bodyRect = useCursorVisibility({
        editor,
        overlayHeight: toolbarRef.current?.getBoundingClientRect().height ?? 0,
    });

    if (status !== "authenticated") return null;

    return (
        <EditorContext.Provider value={{ editor }}>
            <div className="flex flex-col gap-4 w-full">
                <div className="flex items-center gap-3">
                    <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-1 rounded bg-purple-200/70 dark:bg-purple-800/60 text-purple-900 dark:text-purple-200">
                        Release Notes Editor
                    </span>
                    {curr_project?.name && (
                        <span className="text-xs text-muted-foreground">
                            Project: {curr_project.name}
                        </span>
                    )}
                    {isSaving && (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Loader2 className="h-3 w-3 animate-spin" /> Saving...
                        </span>
                    )}
                </div>

                <Tabs defaultValue="write">
                    <TabsList>
                        <TabsTrigger value="write">Write</TabsTrigger>
                        <TabsTrigger value="preview">Preview</TabsTrigger>
                    </TabsList>

                    <TabsContent value="write" className="mt-4">
                        <Toolbar ref={toolbarRef} className="border-l-4 border-purple-500">
                            {mobileView === "main" ? (
                                isCurrReleaseBlogLoading ? (
                                    <Skeleton className="w-32 h-6" />
                                ) : (
                                    <MainToolbarContent
                                        onHighlighterClick={() => setMobileView("highlighter")}
                                        onLinkClick={() => setMobileView("link")}
                                        isMobile={isMobile}
                                        isSaving={isSaving}
                                        onTogglePublic={() => setIsPublic((v) => !v)}
                                        isPublic={isPublic}
                                        onSaveClick={handleManualSave}
                                    />
                                )
                            ) : (
                                <MobileToolbarContent
                                    type={mobileView}
                                    onBack={() => setMobileView("main")}
                                />
                            )}
                        </Toolbar>

                        <div className="content-wrapper shadow-sm dark:shadow-grey-800 mt-4">
                            <EditorContent
                                editor={editor}
                                className="simple-editor-content"
                                role="presentation"
                            />
                        </div>
                    </TabsContent>

                    <TabsContent value="preview" className="mt-4">
                        <div className="content-wrapper shadow-sm dark:shadow-grey-800">
                            <EditorContent
                                editor={previewEditor}
                                className="simple-editor-content"
                                role="presentation"
                            />
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </EditorContext.Provider>
    );
};

const WriteReleaseBlog = () => {
    const { isCurrReleaseBlogLoading } = useInsertProjects();
    const { data: session, status } = useSession();

    return (
        <>
            <div className="absolute top-5 left-5">
                {status === "authenticated" && <ReleaseBlogWriteSidebar />}
            </div>

            <div className="px-6 lg:px-56 pt-8 min-h-screen">
                <div className="flex item-center justify-center flex-col gap-4">
                    {isCurrReleaseBlogLoading ? (
                        <div className="flex justify-center items-center h-screen">
                            <Loader2 className="h-12 w-12 animate-spin text-gray-500" />
                        </div>
                    ) : (
                        <ReleaseBlogEditor />
                    )}
                </div>
            </div>
        </>
    );
};

export default WriteReleaseBlog;
