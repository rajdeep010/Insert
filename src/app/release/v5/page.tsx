import { Code2, FolderTree, GitBranch, Palette } from "lucide-react";
import { ReleaseStoryPage, type ReleaseStory } from "@/components/release/ReleaseStoryPage";

const story: ReleaseStory = {
    version: "v5.0", date: "March 2026", title: "Automate the workflow.", accentTitle: "Refine the craft.", description: "v5 introduced a stronger project-release workflow, improved developer editing, GitHub-powered automation, and the first complete Pro membership experience.", tags: ["Automation", "GitHub", "Editor", "Pro membership"],
    screenshots: [
        { title: "Workflow automation", description: "Project releases and repository-driven publishing workflows.", image: "/insert_project.png" },
        { title: "Pro membership", description: "Subscription plans for unlocking advanced Insert capabilities.", image: "/release.png" },
        { title: "GitHub integration", description: "Connected repositories, commits, and project release notes.", image: "/insert_project.png" },
    ],
    sections: [
        { icon: GitBranch, title: "Release automation", description: "Turn repository activity into a repeatable release workflow.", items: ["Connected GitHub repositories to Insert projects", "Generated release drafts from project activity", "Added repository and branch metadata", "Created a focused release-publishing workflow"] },
        { icon: Code2, title: "Developer editor", description: "A stronger environment for technical writing and code.", items: ["Improved code-block and syntax presentation", "Refined rich-text authoring behavior", "Added better media handling", "Improved the reading experience for technical content"] },
        { icon: FolderTree, title: "Workspace organization", description: "Better ways to manage growing developer content.", items: ["Organized projects and release journals", "Improved navigation between writing surfaces", "Added clearer public and private state", "Introduced more consistent empty and loading states"] },
        { icon: Palette, title: "Pro & appearance", description: "Membership and appearance became product-level systems.", items: ["Introduced Razorpay-backed Pro upgrades", "Added paid capability gates", "Expanded dark-mode support", "Improved account-level membership state"] },
    ], next: { label: "Read v6.0", href: "/release/v6" },
};

export default function ReleaseV5Page() { return <ReleaseStoryPage story={story} />; }
