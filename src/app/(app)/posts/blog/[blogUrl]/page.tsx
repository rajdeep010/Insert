"use client";
import * as React from "react";
import { EditorContent,EditorContext,useEditor } from "@tiptap/react";
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
import { handleImageUpload,MAX_FILE_SIZE } from "@/lib/tiptap-utils";
import "@/components/tiptap-templates/simple/simple-editor.scss";
import { useBlog } from "@/app/context/BlogProvider";
import { useSession } from "next-auth/react";
import { useParams,useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import axios from "axios";
import InsertNavbar from "@/components/InsertNavbar";
import BlogWriteSidebar from "@/components/BlogWriteSidebar";



export default function BlogPost({ params }: any) {
    const { blogUrl } = params
    const { toast } = useToast()
    const router = useRouter()

    const [blog,setBlog] = React.useState<any>(null)
    const [blogLoader,setBlogLoader] = React.useState(true)

    const [editorContent,setEditorContent] = React.useState<any>(blog?.blogContent || {})


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
    },[blogUrl])

    React.useEffect(() => {
        if (!blogLoader && !blog) {
            router.replace("/404") // or show a custom not found UI
        }
    },[blogLoader,blog,router])


    const previewEditor = useEditor({
        immediatelyRender: false,
        extensions: [
            StarterKit,
            TextAlign.configure({ types: ["heading","paragraph"] }),
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
                onError: (error) => console.error("Upload failed:",error),
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
    },[editorContent,previewEditor])


    if (!blog) {
        return null
    }


    return (
        <>
            <div className="flex flex-col gap-6 pt-8 lg:pt-12 justify-center px-8 lg:px-56">
                <InsertNavbar />
            </div>
            <div className="flex items-center justify-center m-auto px-6 lg:px-56 min-h-screen">
                <div className="flex item-center justify-center flex-col gap-4">
                    {blogLoader
                        ? <div className="flex justify-center items-center h-screen">
                            <Loader2 className="h-12 w-12 animate-spin text-gray-500" />
                        </div>
                        : <EditorContext.Provider value={{ editor: previewEditor }}>
                            {/* <div className="pt-8 lg:pt-12"><InsertNavbar /></div> */}
                            <div className="flex w-full flex-col gap-6">
                                <div className="post-wrapper shadow-sm dark:shadow-grey-800">
                                    <EditorContent
                                        editor={previewEditor}
                                        role="presentation"
                                        className="simple-editor-content"
                                    />
                                </div>
                            </div>
                        </EditorContext.Provider>}
                </div>
            </div>
        </>
    );
}