'use client'

import { ArrowLeft, ArrowRight, Users, Bell, GitBranch, Layers, Sparkles, Check } from "lucide-react";

import { useState } from "react";



const screenshots = [

    {

        title: "Collaboration Management",

        description: "Manage collaborators and roles from a dedicated screen.",

        image: "https://res.cloudinary.com/dgxeg3sju/image/upload/v1780849703/fb26e6fe-28c0-457b-b894-3d2ff511cd43.png",

    },

    {

        title: "Notification Center",

        description: "Track notifications and collaboration activity.",

        image: "https://res.cloudinary.com/dgxeg3sju/image/upload/v1780920862/2c389123-efa6-41c2-9af7-607392b856b7.png",

    },

    {

        title: "Actionable Notifications",

        description: "Accept or decline collaboration requests directly from notifications.",

        image: "https://res.cloudinary.com/dgxeg3sju/image/upload/v1780920946/701f5a1d-95f7-4f58-9e27-489e490de60b.png",

    },

    {

        title: "Topic Switcher",

        description: "Move between accessible topics quickly.",

        image: "https://res.cloudinary.com/dgxeg3sju/image/upload/v1780920987/413a62f2-90c4-4e32-8ad3-a58b6ecde383.png",

    },

    {

        title: "Redesigned Topic Experience",

        description: "Cleaner layout and collaboration-focused workflows.",

        image: "https://res.cloudinary.com/dgxeg3sju/image/upload/v1780921041/cd39d291-a151-450b-985f-e28edcf3a9af.png",

    },

    {

        title: "Updated Blog Experience",

        description: "Improved sidebar and collaboration visibility.",

        image: "https://res.cloudinary.com/dgxeg3sju/image/upload/v1780921147/18d12a7f-873f-447c-bfde-47c21197a965.png",

    },

];



const sections = [

    {

        icon: Users,

        title: "Collaboration across blogs & topics",

        description: "Share ownership of work and collaborate without relying on external tools.",

        accent: "#10b981",

        accentBg: "#d1fae5",

        items: [

            "Invite collaborators directly to blogs and topics",

            "Assign editor or viewer permissions",

            "Update collaborator roles at any time",

            "Remove collaborators when access is no longer needed",

            "Centralized collaborator management experience",

        ],

    },

    {

        icon: GitBranch,

        title: "Collaboration requests",

        description: "A dedicated workflow for managing collaboration invitations.",

        accent: "#6366f1",

        accentBg: "#e0e7ff",

        items: [

            "Accept or decline invitations",

            "Track incoming collaboration requests",

            "Track sent invitations",

            "Revoke pending invitations",

            "Dedicated collaboration request management screen",

        ],

    },

    {

        icon: Bell,

        title: "Realtime notification center",

        description: "Stay informed without refreshing the page.",

        accent: "#f59e0b",

        accentBg: "#fef3c7",

        items: [

            "Instant in-app notification delivery",

            "Actionable collaboration notifications",

            "Mark notifications as read",

            "Dismiss notifications without losing access",

            "Unread notification counters",

        ],

    },

    {

        icon: Layers,

        title: "Workspace navigation",

        description: "Move faster between resources you have access to.",

        accent: "#3b82f6",

        accentBg: "#dbeafe",

        items: [

            "Topic switcher",

            "Blog switcher",

            "Quick access to shared resources",

            "Reduced navigation overhead",

        ],

    },

    {

        icon: Sparkles,

        title: "User experience improvements",

        description: "Several interface updates focused on collaboration workflows.",

        accent: "#ec4899",

        accentBg: "#fce7f3",

        items: [

            "Cleaner topic page experience",

            "Improved blog management layout",

            "Better collaborator management UI",

            "More intuitive notification workflows",

            "Simplified access management",

        ],

    },

];



export default function ReleaseV6() {

    const [activeShot, setActiveShot] = useState(0);



    return (

        <div
            className="bg-background"
            style={{

                fontFamily: "'DM Sans', 'Geist', system-ui, sans-serif",

                background: "#0a0a0b",

                color: "#e4e4e7",

                minHeight: "100vh",

            }}

        >

            {/* Header */}

            <div style={{ borderBottom: "1px solid rgba(255,255,255,0.07)", padding: "0 40px" }}>

                <div style={{ maxWidth: 960, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 56 }}>

                    <a href="/release" style={{ display: "flex", alignItems: "center", gap: 8, color: "#71717a", fontSize: 13, textDecoration: "none", fontFamily: "'DM Mono', monospace" }}>

                        <ArrowLeft size={14} />

                        all releases

                    </a>

                    <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: "#52525b" }}>insert / releases</span>

                </div>

            </div>



            {/* Hero */}

            <div style={{ maxWidth: 960, margin: "0 auto", padding: "72px 40px 48px" }}>



                {/* Meta row */}

                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 28, flexWrap: "wrap" }}>

                    <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: "#10b981", background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)", padding: "3px 10px", borderRadius: 6 }}>major release</span>

                    <span style={{ color: "#3f3f46", fontSize: 13 }}>·</span>

                    <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: "#71717a" }}>June 2026</span>

                </div>



                {/* Version + title */}

                <div style={{ display: "flex", alignItems: "baseline", gap: 20, marginBottom: 20, flexWrap: "wrap" }}>

                    <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 48, fontWeight: 500, color: "#27272a", letterSpacing: "-0.03em", lineHeight: 1 }}>v6.0</span>

                    <h1 style={{ fontSize: "clamp(28px, 5vw, 44px)", fontWeight: 500, letterSpacing: "-0.03em", color: "#fafafa", lineHeight: 1.1 }}>

                        Collaboration &<br />Realtime Notifications

                    </h1>

                </div>



                {/* Summary */}

                <p style={{ fontSize: 17, color: "#71717a", lineHeight: 1.7, maxWidth: 600, marginBottom: 32 }}>

                    Work together across Topics and Blogs with role-based collaboration, realtime notifications, workspace switching, and a cleaner management experience.

                </p>



                {/* Tags */}

                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>

                    {["Collaboration", "Notifications", "Roles", "Workspace switching", "UI refresh"].map(t => (

                        <span key={t} className="tag">{t}</span>

                    ))}

                </div>

            </div>



            {/* Screenshot gallery */}

            <div style={{ maxWidth: 960, margin: "0 auto", padding: "0 40px 80px" }}>

                <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 20, overflow: "hidden" }}>



                    {/* Image */}

                    <div style={{ position: "relative", background: "#111113", aspectRatio: "16/9" }}>

                        <img

                            key={activeShot}

                            src={screenshots[activeShot].image}

                            alt={screenshots[activeShot].title}

                            className="fade-in"

                            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}

                        />

                    </div>



                    {/* Caption + controls */}

                    <div style={{ padding: "20px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, borderTop: "1px solid rgba(255,255,255,0.06)", flexWrap: "wrap" }}>

                        <div>

                            <p style={{ fontSize: 14, fontWeight: 500, color: "#e4e4e7", marginBottom: 3 }}>{screenshots[activeShot].title}</p>

                            <p style={{ fontSize: 13, color: "#71717a" }}>{screenshots[activeShot].description}</p>

                        </div>

                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>

                            <div className="dot-nav" style={{ display: "flex", gap: 6, alignItems: "center" }}>

                                {screenshots.map((_, i) => (

                                    <button

                                        key={i}

                                        onClick={() => setActiveShot(i)}

                                        style={{ background: i === activeShot ? "#e4e4e7" : "rgba(255,255,255,0.15)", width: i === activeShot ? 18 : 6 }}

                                        aria-label={`Screenshot ${i + 1}`}

                                    />

                                ))}

                            </div>

                            <div style={{ display: "flex", gap: 6 }}>

                                <button className="nav-btn" onClick={() => setActiveShot(p => Math.max(0, p - 1))} disabled={activeShot === 0} aria-label="Previous">

                                    <ArrowLeft size={14} />

                                </button>

                                <button className="nav-btn" onClick={() => setActiveShot(p => Math.min(screenshots.length - 1, p + 1))} disabled={activeShot === screenshots.length - 1} aria-label="Next">

                                    <ArrowRight size={14} />

                                </button>

                            </div>

                        </div>

                    </div>

                </div>

            </div>



            {/* Sections */}

            <div style={{ maxWidth: 960, margin: "0 auto", padding: "0 40px 120px" }}>



                <div style={{ borderBottom: "1px solid rgba(255,255,255,0.07)", paddingBottom: 20, marginBottom: 48 }}>

                    <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#52525b", textTransform: "uppercase", letterSpacing: "0.08em" }}>What's included</p>

                </div>



                <div style={{ display: "grid", gap: 16 }}>

                    {sections.map((s) => {

                        const Icon = s.icon;

                        return (

                            <div key={s.title} className="section-card">

                                <div style={{ display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap" }}>



                                    {/* Icon */}

                                    <div style={{ width: 40, height: 40, borderRadius: 10, background: s.accentBg + "18", border: `1px solid ${s.accent}28`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>

                                        <Icon size={18} color={s.accent} strokeWidth={1.5} />

                                    </div>



                                    {/* Content */}

                                    <div style={{ flex: 1, minWidth: 240 }}>

                                        <h2 style={{ fontSize: 16, fontWeight: 500, color: "#fafafa", marginBottom: 5, letterSpacing: "-0.02em" }}>{s.title}</h2>

                                        <p style={{ fontSize: 13, color: "#71717a", marginBottom: 18, lineHeight: 1.6 }}>{s.description}</p>



                                        <div>

                                            {s.items.map(item => (

                                                <div key={item} className="check-item">

                                                    <div style={{ width: 16, height: 16, borderRadius: 4, background: s.accent + "22", border: `1px solid ${s.accent}44`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>

                                                        <Check size={10} color={s.accent} strokeWidth={2.5} />

                                                    </div>

                                                    <span>{item}</span>

                                                </div>

                                            ))}

                                        </div>

                                    </div>

                                </div>

                            </div>

                        );

                    })}

                </div>



                {/* Footer nav */}

                <div style={{ marginTop: 72, paddingTop: 32, borderTop: "1px solid rgba(255,255,255,0.07)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>

                    <a href="/release" style={{ display: "flex", alignItems: "center", gap: 8, color: "#71717a", fontSize: 13, textDecoration: "none", fontFamily: "'DM Mono', monospace" }}>

                        <ArrowLeft size={14} /> all releases

                    </a>

                    <a href="/sign-up" style={{ display: "flex", alignItems: "center", gap: 8, background: "#fafafa", color: "#0a0a0b", padding: "10px 20px", borderRadius: 8, fontSize: 13, fontWeight: 500, textDecoration: "none" }}>

                        Get started free <ArrowRight size={13} />

                    </a>

                </div>

            </div>

        </div>

    );

}

