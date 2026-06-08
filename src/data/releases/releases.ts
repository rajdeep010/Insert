import { Users, Bell, GitBranch, Layers, Sparkles } from "lucide-react";

export const RELEASES = [
    {
        version: "6.0",
        slug: "v6-0",
        title: "Collaboration & Realtime Notifications",
        date: "June 2026",
        summary: "Work together across Topics and Blogs with role-based collaboration, realtime notifications, workspace switching, and a cleaner management experience.",
        tags: ["Collaboration", "Notifications", "Roles", "Workspace switching", "UI refresh"],
        screenshots: [
            { title: "Collaboration Management", description: "Manage collaborators and roles from a dedicated screen.", image: "https://res.cloudinary.com/dgxeg3sju/image/upload/v1780849703/fb26e6fe-28c0-457b-b894-3d2ff511cd43.png" },
            { title: "Notification Center", description: "Track notifications and collaboration activity.", image: "https://res.cloudinary.com/dgxeg3sju/image/upload/v1780920862/2c389123-efa6-41c2-9af7-607392b856b7.png" },
            { title: "Actionable Notifications", description: "Accept or decline collaboration requests directly from notifications.", image: "https://res.cloudinary.com/dgxeg3sju/image/upload/v1780920946/701f5a1d-95f7-4f58-9e27-489e490de60b.png" },
            { title: "Topic Switcher", description: "Move between accessible topics quickly.", image: "https://res.cloudinary.com/dgxeg3sju/image/upload/v1780920987/413a62f2-90c4-4e32-8ad3-a58b6ecde383.png" },
            { title: "Redesigned Topic Experience", description: "Cleaner layout and collaboration-focused workflows.", image: "https://res.cloudinary.com/dgxeg3sju/image/upload/v1780921041/cd39d291-a151-450b-985f-e28edcf3a9af.png" },
            { title: "Updated Blog Experience", description: "Improved sidebar and collaboration visibility.", image: "https://res.cloudinary.com/dgxeg3sju/image/upload/v1780921147/18d12a7f-873f-447c-bfde-47c21197a965.png" },
        ],
        sections: [
            { icon: Users, title: "Collaboration across blogs & topics", description: "Share ownership of work and collaborate without relying on external tools.", accent: "#10b981", accentBg: "#d1fae5", items: ["Invite collaborators directly to blogs and topics", "Assign editor or viewer permissions", "Update collaborator roles at any time"] },
            { icon: GitBranch, title: "Collaboration requests", description: "A dedicated workflow for managing collaboration invitations.", accent: "#6366f1", accentBg: "#e0e7ff", items: ["Accept or decline invitations", "Track incoming collaboration requests", "Track sent invitations"] },
            { icon: Bell, title: "Realtime notification center", description: "Stay informed without refreshing the page.", accent: "#f59e0b", accentBg: "#fef3c7", items: ["Instant in-app notification delivery", "Actionable collaboration notifications", "Mark notifications as read"] },
            { icon: Layers, title: "Workspace navigation", description: "Move faster between resources you have access to.", accent: "#3b82f6", accentBg: "#dbeafe", items: ["Topic switcher", "Blog switcher", "Quick access to shared resources"] },
            { icon: Sparkles, title: "User experience improvements", description: "Several interface updates focused on collaboration workflows.", accent: "#ec4899", accentBg: "#fce7f3", items: ["Cleaner topic page experience", "Improved blog management layout", "Better collaborator management UI"] },
        ],
    },
];