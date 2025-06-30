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
import { useDebounceCallback } from "usehooks-ts";
import { useParams } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2 } from "lucide-react";

function extractBlogTitle(blogContent: any): string {
  if (!blogContent) return "";

  const content = blogContent?.content || {};
  if (Array.isArray(content) && content.length > 0) {
    const firstNode = content[0];
    if (firstNode.type === "heading" && firstNode.attrs?.level === 1) {
      return firstNode.content?.[0]?.text || "";
    }
    return "";
  }
  return "";
}

const MainToolbarContent = ({
  onHighlighterClick,
  onLinkClick,
  isMobile,
  onSaveClick,
}: {
  onHighlighterClick: () => void;
  onLinkClick: () => void;
  isMobile: boolean;
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
        <HeadingDropdownMenu levels={[1,2,3,4]} />
        <ListDropdownMenu types={["bulletList","orderedList","taskList"]} />
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

      {/* <Tooltip>
        <TooltipTrigger asChild>
          <span>
            <Switch checked={autoSave} onCheckedChange={onToggleAutoSave} />
          </span>
        </TooltipTrigger>
        <TooltipContent>
          <p>Auto Save</p>
        </TooltipContent>
      </Tooltip> */}

      {!isBlogLoading && <Btn onClick={onSaveClick}>Save</Btn>}
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
  const isMobile = useMobile();
  const windowSize = useWindowSize();
  const [mobileView,setMobileView] = React.useState<
    "main" | "highlighter" | "link"
  >("main");
  const toolbarRef = React.useRef<HTMLDivElement>(null);

  const { currentBlog,handleBlogUpdate, isBlogLoading } = useBlog();
  const [editorContent,setEditorContent] = React.useState<any>(currentBlog?.blogContent)
  // const [autoSave,setAutoSave] = React.useState(currentBlog?.autosave || false)

  // const debounced = useDebounceCallback(setEditorContent, 5000)

  const handleSaveContent = React.useCallback(() => {
    if (!editorContent && !currentBlog) return;

    handleBlogUpdate({
      blogContent: JSON.stringify(editorContent),
    });
  },[editorContent,currentBlog, handleBlogUpdate])

  // React.useEffect(() => {
  //   handleSaveContent()
  // }, [editorContent])

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
      TextAlign.configure({ types: ["heading","paragraph"] }),
      Underline,
      TaskList,
      TaskItem.configure({ nested: true }),
      Highlight.configure({ multicolor: true }),
      Image,
      Typography,
      Superscript,
      Placeholder.configure({
        placeholder: ({ node,pos }) => {
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
        onError: (error) => console.error("Upload failed:",error),
      }),
      TrailingNode,
      Link.configure({ openOnClick: false }),
    ],
    content: editorContent,
    onUpdate: ({ editor }) => {
      const json = editor.getJSON() || "";
      setEditorContent(json);
    },
  });

  const bodyRect = useCursorVisibility({
    editor,
    overlayHeight: toolbarRef.current?.getBoundingClientRect().height ?? 0,
  });

  React.useEffect(() => {
    if (!isMobile && mobileView !== "main") {
      setMobileView("main");
    }
    if (!editor) {
      return;
    }

    editor.chain().focus().setImageUploadNode().run();
  },[isMobile,mobileView]);

  return (
    <EditorContext.Provider value={{ editor }}>
      <Toolbar
        ref={toolbarRef}
        style={
          isMobile
            ? {
              bottom: `calc(100% - ${windowSize.height - bodyRect.y}px)`,
            }
            : {}
        }
      >
        {mobileView === "main" ? 
          isBlogLoading ? <Skeleton className="w-32 h-6" /> : (

          <MainToolbarContent
            onHighlighterClick={() => setMobileView("highlighter")}
            onLinkClick={() => setMobileView("link")}
            isMobile={isMobile}
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
    </EditorContext.Provider>
  );
};

const Write = () => {
  const { isBlogLoading } = useBlog();

  return (
    <>
      <div className="absolute top-5 left-5">
        {" "}
        <BlogWriteSidebar />{" "}
      </div>

      <div className="px-64 pt-8 min-h-screen">
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
