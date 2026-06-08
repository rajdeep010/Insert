import { Check } from "lucide-react";

interface FeatureSectionProps {
    section: {
        icon: React.ElementType;
        title: string;
        description: string;
        accent: string;
        accentBg: string;
        items: string[];
    };
}

export function FeatureSection({ section }: FeatureSectionProps) {
    const Icon = section.icon;

    return (
        <div className="section-card">
            <div style={{ display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap" }}>

                {/* Icon Container - Matching your original layout */}
                <div style={{
                    width: 40,
                    height: 40,
                    borderRadius: 10,
                    background: `${section.accentBg}18`,
                    border: `1px solid ${section.accent}28`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0
                }}>
                    <Icon size={18} color={section.accent} strokeWidth={1.5} />
                </div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 240 }}>
                    <h2 style={{ fontSize: 16, fontWeight: 500, color: "#fafafa", marginBottom: 5, letterSpacing: "-0.02em" }}>
                        {section.title}
                    </h2>
                    <p style={{ fontSize: 13, color: "#71717a", marginBottom: 18, lineHeight: 1.6 }}>
                        {section.description}
                    </p>

                    {/* List Items */}
                    <div>
                        {section.items.map((item) => (
                            <div key={item} className="check-item">
                                <div style={{
                                    width: 16,
                                    height: 16,
                                    borderRadius: 4,
                                    background: `${section.accent}22`,
                                    border: `1px solid ${section.accent}44`,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    flexShrink: 0,
                                    marginTop: 1
                                }}>
                                    <Check size={10} color={section.accent} strokeWidth={2.5} />
                                </div>
                                <span>{item}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}