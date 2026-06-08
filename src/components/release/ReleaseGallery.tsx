"use client";
import { useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";

export function ScreenshotGallery({ screenshots }: { screenshots: any[] }) {
    const [activeShot, setActiveShot] = useState(0);

    return (
        <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 20, overflow: "hidden" }}>
            <div style={{ position: "relative", background: "#111113", aspectRatio: "16/9" }}>
                <img key={activeShot} src={screenshots[activeShot].image} alt={screenshots[activeShot].title} className="fade-in" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
            </div>
            <div style={{ padding: "20px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                <div>
                    <p style={{ fontSize: 14, fontWeight: 500, color: "#e4e4e7" }}>{screenshots[activeShot].title}</p>
                    <p style={{ fontSize: 13, color: "#71717a" }}>{screenshots[activeShot].description}</p>
                </div>
                <div style={{ display: "flex", gap: 12 }}>
                    <button className="nav-btn" onClick={() => setActiveShot(p => Math.max(0, p - 1))} disabled={activeShot === 0}>
                        <ArrowLeft size={14} />
                    </button>
                    <button className="nav-btn" onClick={() => setActiveShot(p => Math.min(screenshots.length - 1, p + 1))} disabled={activeShot === screenshots.length - 1}>
                        <ArrowRight size={14} />
                    </button>
                </div>
            </div>
        </div>
    );
}