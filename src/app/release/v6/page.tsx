import { Bell, GitBranch, Layers, Users } from "lucide-react";
import { ReleaseStoryPage, type ReleaseStory } from "@/components/release/ReleaseStoryPage";

const story: ReleaseStory = {
    version: "v6.0", date: "June 2026", title: "Work together.", accentTitle: "Stay in context.", description: "v6 brought role-based collaboration, realtime notifications, actionable requests, and workspace switching to Topics and Blogs.", tags: ["Collaboration", "Notifications", "Roles", "Workspace switching"],
    screenshots: [
        { title: "Collaboration management", description: "Manage collaborators and roles from a dedicated screen.", image: "https://res.cloudinary.com/dgxeg3sju/image/upload/v1780849703/fb26e6fe-28c0-457b-b894-3d2ff511cd43.png" },
        { title: "Notification center", description: "Track notifications and collaboration activity.", image: "https://res.cloudinary.com/dgxeg3sju/image/upload/v1780920862/2c389123-efa6-41c2-9af7-607392b856b7.png" },
        { title: "Actionable notifications", description: "Accept or decline requests directly from notifications.", image: "https://res.cloudinary.com/dgxeg3sju/image/upload/v1780920946/701f5a1d-95f7-4f58-9e27-489e490de60b.png" },
        { title: "Topic switcher", description: "Move quickly between topics you can access.", image: "https://res.cloudinary.com/dgxeg3sju/image/upload/v1780920987/413a62f2-90c4-4e32-8ad3-a58b6ecde383.png" },
        { title: "Topic experience", description: "A cleaner, collaboration-aware topic workflow.", image: "https://res.cloudinary.com/dgxeg3sju/image/upload/v1780921041/cd39d291-a151-450b-985f-e28edcf3a9af.png" },
        { title: "Blog experience", description: "Improved navigation and collaboration visibility for blogs.", image: "https://res.cloudinary.com/dgxeg3sju/image/upload/v1780921147/18d12a7f-873f-447c-bfde-47c21197a965.png" },
    ],
    sections: [
        { icon: Users, title: "Collaboration", description: "Share Topics and Blogs without giving away ownership.", items: ["Invited editors and viewers", "Assigned role-based access", "Updated or removed collaborators", "Centralized collaborator management"] },
        { icon: GitBranch, title: "Request workflow", description: "A complete lifecycle for collaboration invitations.", items: ["Accepted or declined incoming requests", "Tracked incoming and sent invitations", "Revoked pending invitations", "Reflected access changes across workspaces"] },
        { icon: Bell, title: "Realtime notifications", description: "Important collaboration activity arrived without a refresh.", items: ["Delivered instant in-app notifications", "Added actions to request notifications", "Tracked unread notification counts", "Supported dismiss and read states"] },
        { icon: Layers, title: "Workspace switching", description: "Move between accessible work without losing context.", items: ["Added Topic and Blog switchers", "Exposed shared resources in navigation", "Improved collaboration visibility", "Reduced context switching between workspaces"] },
    ], next: { label: "Read v7.0", href: "/release/v7" },
};

export default function ReleaseV6Page() { return <ReleaseStoryPage story={story} />; }
