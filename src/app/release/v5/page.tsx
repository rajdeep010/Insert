"use client";

import { ArrowLeft, ArrowRight, Zap, Code2, FolderTree, Palette, Check, LayoutTemplate } from "lucide-react";
import { useState } from "react";

const screenshots = [
    {
        title: "Workflow Automation",
        description: "Define custom triggers and actions for your release notes.",
        image: "/insert_project.png",
    },
    {
        title: "Pro Access with subscription plans",
        description: "Subscribe to our Pro plan for exclusive features and priority support.",
        image: "/release.png",
    },
    {
        title: "GitHub Integration",
        description: "Automatic commit fetching and grouping.",
        image: "/insert_project.png",
    },
];

const sections = [
    {
        icon: Zap,
        title: "Release Workflow Automation",
        description: "Automate the boring parts of publishing release notes.",
        accent: "#f59e0b",
        accentBg: "#fef3c7",
        items: [
            "Define custom automation rules",
            "Auto-generate drafts from GitHub commits",
            "Trigger notifications on new releases",
            "Custom post-publish webhooks",
        ],
    },
    {
        icon: Code2,
        title: "Advanced Code Sheets",
        description: "Deep improvements to how you write and display code.",
        accent: "#3b82f6",
        accentBg: "#dbeafe",
        items: [
            "Support for 50+ programming languages",
            "Inline execution environments",
            "Copy-to-clipboard functionality",
            "Dynamic code block rendering",
        ],
    },
    {
        icon: FolderTree,
        title: "Workspace Organization",
        description: "Better ways to manage your growing library of resources.",
        accent: "#8b5cf6",
        accentBg: "#ede9fe",
        items: [
            "Nested folder structures",
            "Drag-and-drop resource management",
            "Global search improvements",
            "Archive and bulk delete actions",
        ],
    },
    {
        icon: Palette,
        title: "Theme & Customization",
        description: "Make your workspace your own.",
        accent: "#ec4899",
        accentBg: "#fce7f3",
        items: [
            "Full native Dark Mode support",
            "Custom branding for public pages",
            "Primary color theme selection",
            "Font size and spacing controls",
        ],
    },
];

export default function ReleaseV5() {
    const [activeShot, setActiveShot] = useState(0);

    return (
        <div  style={{ fontFamily: "'DM Sans', 'Geist', system-ui, sans-serif", color: "#e4e4e7", minHeight: "100vh" }}>
            {/* Header */}
            <div style={{ borderBottom: "1px solid rgba(255,255,255,0.07)", padding: "0 40px" }}>
                <div style={{ maxWidth: 960, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 56 }}>
                    <a href="/release" style={{ display: "flex", alignItems: "center", gap: 8, color: "#71717a", fontSize: 13, textDecoration: "none", fontFamily: "'DM Mono', monospace" }}>
                        <ArrowLeft size={14} /> all releases
                    </a>
                    <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: "#52525b" }}>insert / releases</span>
                </div>
            </div>

            {/* Hero */}
            <div style={{ maxWidth: 960, margin: "0 auto", padding: "72px 40px 48px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 28, flexWrap: "wrap" }}>
                    <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: "#a855f7", border: "1px solid rgba(168,85,247,0.2)", padding: "3px 10px", borderRadius: 6 }}>major release</span>
                    <span style={{ color: "#3f3f46", fontSize: 13 }}>·</span>
                    <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: "#71717a" }}>March 2026</span>
                </div>

                <div style={{ display: "flex", alignItems: "baseline", gap: 20, marginBottom: 20, flexWrap: "wrap" }}>
                    <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 48, fontWeight: 500, color: "#27272a", letterSpacing: "-0.03em", lineHeight: 1 }}>v5.0</span>
                    <h1 style={{ fontSize: "clamp(28px, 5vw, 44px)", fontWeight: 500, letterSpacing: "-0.03em", color: "#fafafa", lineHeight: 1.1 }}>
                        Workflow Automation &<br />Editor Enhancements
                    </h1>
                </div>

                <p style={{ fontSize: 17, color: "#71717a", lineHeight: 1.7, maxWidth: 600, marginBottom: 32 }}>
                    Introducing powerful automation for your release workflows, refined syntax support for developers, and a complete dark mode overhaul.
                </p>

                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {["Automation", "Code Editor", "Organization", "Dark Mode"].map(t => (
                        <span key={t} className="tag">{t}</span>
                    ))}
                </div>
            </div>

            {/* Screenshot gallery */}
            <div style={{ maxWidth: 960, margin: "0 auto", padding: "0 40px 80px" }}>
                <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 20, overflow: "hidden" }}>
                    <div style={{ position: "relative", background: "#111113", aspectRatio: "16/9" }}>
                        <img key={activeShot} src={screenshots[activeShot].image} alt={screenshots[activeShot].title} className="fade-in" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                    </div>

                    <div style={{ padding: "20px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, borderTop: "1px solid rgba(255,255,255,0.06)", flexWrap: "wrap" }}>
                        <div>
                            <p style={{ fontSize: 14, fontWeight: 500, color: "#e4e4e7", marginBottom: 3 }}>{screenshots[activeShot].title}</p>
                            <p style={{ fontSize: 13, color: "#71717a" }}>{screenshots[activeShot].description}</p>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                            <div className="dot-nav" style={{ display: "flex", gap: 6, alignItems: "center" }}>
                                {screenshots.map((_, i) => (
                                    <button key={i} onClick={() => setActiveShot(i)} style={{ background: i === activeShot ? "#e4e4e7" : "rgba(255,255,255,0.15)", width: i === activeShot ? 18 : 6 }} aria-label={`Screenshot ${i + 1}`} />
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
                    <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#52525b", textTransform: "uppercase", letterSpacing: "0.08em" }}>What&apos;s included</p>
                </div>

                <div style={{ display: "grid", gap: 16 }}>
                    {sections.map((s) => {
                        const Icon = s.icon;
                        return (
                            <div key={s.title} className="section-card">
                                <div style={{ display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap" }}>
                                    <div style={{ width: 40, height: 40, borderRadius: 10, background: s.accentBg + "18", border: `1px solid ${s.accent}28`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                        <Icon size={18} color={s.accent} strokeWidth={1.5} />
                                    </div>
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