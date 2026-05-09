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
import { useBlog } from "@/features/blog/context/BlogProvider";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import axios from "axios";
import InsertNavbar from "@/components/InsertNavbar";
import InsertHoverCard from "@/components/InsertHoverCard";
import { getLastModifiedText } from "@/helpers/last-modified";
import BlogWriteSidebar from "@/components/BlogWriteSidebar";
import { CalendarDays, Clock3, Info, PenSquare } from "lucide-react";



export default function BlogPost({ params }: any) {
    const { blogUrl } = params
    const { toast } = useToast()
    const router = useRouter()

    const [blog, setBlog] = React.useState<any>(null)
    const [blogLoader, setBlogLoader] = React.useState(true)
    const [showMeta, setShowMeta] = React.useState(false)

    const [editorContent, setEditorContent] = React.useState<any>(blog?.blogContent || {})

    const publishDateLabel = React.useMemo(() => {
        if (!blog?.createdAt) return "Unpublished"

        const date = new Date(blog.createdAt)
        if (Number.isNaN(date.getTime())) return "Unpublished"

        return date.toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
        })
    }, [blog?.createdAt])

    const updatedLabel = React.useMemo(() => {
        return getLastModifiedText(blog?.lastEdited || blog?.createdAt, { empty: "Not updated yet" })
    }, [blog?.createdAt, blog?.lastEdited])

    const readingTimeLabel = React.useMemo(() => {
        const text = typeof blog?.blogContentText === "string"
            ? blog.blogContentText.trim()
            : ""

        if (!text) return null

        const wordCount = text.split(/\s+/).filter(Boolean).length
        if (!wordCount) return null

        const minutes = Math.max(1, Math.ceil(wordCount / 220))
        return `${minutes} min read`
    }, [blog?.blogContentText])


    React.useEffect(() => {
        const getCurrentBlog = async () => {
            try {
                setBlogLoader(true)
                const response = await axios.get(`/api/blogs/slug/${blogUrl}`)
                if (response.data.success) {
                    setBlog(response.data.blog)
                    setEditorContent(JSON.parse(response?.data?.blog?.blogContent) || {})
                } else {
                    setBlog(null)
                }
            } catch (error) {
                toast({
                    title: "Error ⭕",
                    description: "Failed to fetch blog",
                    variant: "destructive",
                })
                setBlog(null)
            } finally {
                setBlogLoader(false)
            }
        }
        getCurrentBlog()
    }, [blogUrl])

    React.useEffect(() => {
        if (!blogLoader && !blog) {
            router.replace("/404") // or show a custom not found UI
        }
    }, [blogLoader, blog, router])


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

    React.useEffect(() => {
        if (previewEditor && editorContent) {
            previewEditor.commands.setContent(editorContent)
        }
    }, [editorContent, previewEditor])


    if (!blog) {
        return null
    }


    return (
        <>
            <div className="flex flex-col gap-6 pt-8 lg:pt-12 justify-center px-8 lg:px-56">
                <InsertNavbar />
            </div>
            <div className="m-auto min-h-screen px-6 pb-12 lg:px-56">
                <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
                    {blogLoader
                        ? <div className="flex justify-center items-center h-screen">
                            <Loader2 className="h-12 w-12 animate-spin text-gray-500" />
                        </div>
                        : <EditorContext.Provider value={{ editor: previewEditor }}>
                            <div className="flex w-full min-w-0 flex-col gap-4">
                                <div className="flex min-w-0 flex-col gap-2">
                                    <header className="flex flex-col gap-4 border-b border-border/60 pb-6">
                                        <span className="inline-flex w-fit items-center rounded-full border border-border/70 bg-background px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                                            Blog post
                                        </span>
                                        <div className="max-w-5xl text-xl font-semibold tracking-tight text-foreground lg:text-3xl lg:leading-tight">
                                            <span>{blog?.blogTitle}</span>

                                            <div className="flex justify-between">
                                                <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                                                    <span>Written by</span>
                                                    {blog?.creator
                                                        ? <InsertHoverCard username={blog.creator} type="username" />
                                                        : <span className="font-medium text-foreground">Unknown author</span>}
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => setShowMeta((prev) => !prev)}
                                                    aria-expanded={showMeta}
                                                    className="inline-flex w-fit items-center gap-2 rounded-full border border-border/70 bg-background px-3 py-2 text-sm font-medium text-foreground transition hover:bg-muted/60"
                                                >
                                                    <Info className="h-4 w-4" />
                                                    {showMeta ? "Hide info" : "Post info"}
                                                </button>
                                            </div>

                                        </div>

                                        {showMeta && <div className="flex flex-col gap-3 rounded-2xl border border-border/60 bg-card/60 px-4 py-4 shadow-sm backdrop-blur-sm sm:px-5">

                                            <div className="flex items-start gap-3 rounded-xl bg-background/70 px-3 py-3">
                                                <CalendarDays className="mt-0.5 h-4 w-4 text-foreground/70" />
                                                <div className="space-y-1">
                                                    <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground/80">Published</p>
                                                    <p className="font-medium text-foreground">{publishDateLabel}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-start gap-3 rounded-xl bg-background/70 px-3 py-3">
                                                <PenSquare className="mt-0.5 h-4 w-4 text-foreground/70" />
                                                <div className="space-y-1">
                                                    <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground/80">Updated</p>
                                                    <p className="font-medium text-foreground">{updatedLabel}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-start gap-3 rounded-xl bg-background/70 px-3 py-3">
                                                <Clock3 className="mt-0.5 h-4 w-4 text-foreground/70" />
                                                <div className="space-y-1">
                                                    <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground/80">Reading time</p>
                                                    <p className="font-medium text-foreground">{readingTimeLabel || "Short read"}</p>
                                                </div>
                                            </div>
                                        </div>}
                                    </header>

                                    <div className="post-wrapper rounded-[1.5rem] bg-card/40">
                                        <EditorContent
                                            editor={previewEditor}
                                            role="presentation"
                                            className="simple-editor-content"
                                        />
                                    </div>
                                </div>
                            </div>
                        </EditorContext.Provider>}
                </div>
            </div>
        </>
    );
}