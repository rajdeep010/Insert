import { SimpleEditor } from "@/components/tiptap-templates/simple/simple-editor";

export default function Page() {
  
  const content = {
    type: "doc",
    content: [
      {
        type: "heading",
        attrs: {
          textAlign: null,
          level: 1,
        },
        content: [
          {
            type: "text",
            text: "Getting started",
          },
        ],
      },
      {
        type: "paragraph",
        attrs: {
          textAlign: null,
        },
        content: [
          {
            type: "text",
            text: "Welcome to the ",
          },
          {
            type: "text",
            marks: [
              {
                type: "italic",
              },
              {
                type: "highlight",
                attrs: {
                  color: "var(--tt-highlight-yellow)",
                },
              },
            ],
            text: "Simple Editor",
          },
          {
            type: "text",
            text: " template! This template integrates ",
          },
          {
            type: "text",
            marks: [
              {
                type: "bold",
              },
            ],
            text: "open source",
          },
          {
            type: "text",
            text: " UI components and Tiptap extensions licensed under ",
          },
          {
            type: "text",
            marks: [
              {
                type: "bold",
              },
            ],
            text: "MIT hello world",
          },
          {
            type: "text",
            text: ".",
          },
        ],
      },
    ],
  }

  return <SimpleEditor content={content} />;
}
