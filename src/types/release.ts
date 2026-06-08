import { LucideIcon } from "lucide-react";

export type FeatureSection = {
    icon: LucideIcon;
    title: string;
    description: string;
    accent: string;
    items: string[];
};

export type Screenshot = {
    title: string;
    description: string;
    image: string;
};

export type ReleaseData = {
    version: string;
    slug: string;
    title: string;
    date: string;
    summary: string;
    tags: string[];
    sections: FeatureSection[];
    screenshots: Screenshot[];
};