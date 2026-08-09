"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { ArrowRight, BookOpen, Crown, Eye, FolderSearch, Loader2, Lock, ShieldCheck } from "lucide-react";

import InsertHoverCard from "@/components/InsertHoverCard";
import { PostDirectoryLayout } from "@/components/posts/PostDirectoryLayout";
import { Badge } from "@/components/ui/badge";
import { getLastModifiedText } from "@/helpers/last-modified";
import { useInsertTopics } from "@/features/topic/context/InsertTopicProvider";
import type { Topic } from "@/types/topic";

const getAccessMeta = (topic: Topic, currentUsername?: string | null) => {
    const role = topic.creator_username === currentUsername ? "OWNER" : topic.currentAccessRole;
    if (role === "OWNER") return { label: "Owner", icon: Crown };
    if (role === "EDITOR") return { label: "Editor", icon: ShieldCheck };
    if (role === "VIEWER") return { label: "Viewer", icon: Eye };
    return null;
};

export default function AllTopicPosts() {
    const { data: session } = useSession();
    const { all_topics, fetchAllTopicPosts, isAllSheetsLoading } = useInsertTopics();
    const [query, setQuery] = useState("");

    useEffect(() => {
        fetchAllTopicPosts();
    }, [fetchAllTopicPosts]);

    const filtered = useMemo(() => {
        const normalizedQuery = query.trim().toLowerCase();
        if (!normalizedQuery) return all_topics || [];
        return (all_topics || []).filter((topic) =>
            [topic.title, topic.creator_username, topic.about]
                .filter(Boolean)
                .some((value) => value.toLowerCase().includes(normalizedQuery)),
        );
    }, [all_topics, query]);

    return (
        <PostDirectoryLayout
            title="Topics"
            description="Explore focused coding sheets shared by the Insert community."
            query={query}
            onQueryChange={setQuery}
            searchPlaceholder="Search topics, descriptions, or creators..."
            accentClassName="text-indigo-600 dark:text-indigo-300"
        >
            <section className="py-3 lg:py-4">
                <div className="mb-5 flex items-center justify-between gap-4">
                    <p className="text-sm text-muted-foreground">Structured topic sheets</p>
                    <p className="text-sm text-muted-foreground">{filtered.length} topic{filtered.length === 1 ? "" : "s"}</p>
                </div>

                {isAllSheetsLoading ? (
                    <div className="flex min-h-[40vh] items-center justify-center"><Loader2 className="h-7 w-7 animate-spin text-muted-foreground" /></div>
                ) : filtered.length === 0 ? (
                    <div className="flex min-h-80 flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/30 text-center">
                        <FolderSearch className="h-9 w-9 text-muted-foreground" />
                        <h2 className="mt-4 font-semibold">No matching topics</h2>
                        <p className="mt-2 text-sm text-muted-foreground">Try another title, description, or creator.</p>
                    </div>
                ) : (
                    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                        {filtered.map((topic) => {
                            const access = getAccessMeta(topic, session?.user?.username);
                            const AccessIcon = access?.icon;
                            return (
                                <article key={topic.id} className="group flex min-h-60 flex-col rounded-2xl border border-border/70 bg-card/55 p-5 backdrop-blur transition hover:-translate-y-0.5 hover:border-indigo-500/35 hover:bg-card">
                                    <div className="flex items-start justify-between gap-4">
                                        <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-500"><BookOpen className="h-5 w-5" /></span>
                                        <div className="flex flex-wrap justify-end gap-1.5">
                                            <Badge variant={topic.visibility === "public" ? "default" : "destructive"} className="gap-1 text-[10px] capitalize">{topic.visibility === "public" ? <Eye className="h-3 w-3" /> : <Lock className="h-3 w-3" />}{topic.visibility}</Badge>
                                            {access && AccessIcon && <Badge variant="outline" className="gap-1 text-[10px]"><AccessIcon className="h-3 w-3" />{access.label}</Badge>}
                                        </div>
                                    </div>
                                    <Link href={`/topic/${topic.id}`} className="mt-5 inline-flex items-start justify-between gap-3">
                                        <h2 className="line-clamp-2 text-xl font-semibold tracking-tight transition group-hover:text-indigo-600 dark:group-hover:text-indigo-300">{topic.title}</h2>
                                        <ArrowRight className="mt-1 h-4 w-4 shrink-0 transition-transform group-hover:translate-x-1" />
                                    </Link>
                                    <p className="mt-2 line-clamp-2 text-sm leading-5 text-muted-foreground">{topic.about || "A structured coding sheet from the Insert community."}</p>
                                    <div className="mt-auto flex items-center justify-between gap-3 border-t border-border/60 pt-4 text-xs text-muted-foreground">
                                        <div className="flex min-w-0 items-center gap-2"><InsertHoverCard username={topic.creator_username} type="avatar" avatarSize="small" /><InsertHoverCard username={topic.creator_username} type="username" avatarSize="small" /></div>
                                        <span className="shrink-0">{getLastModifiedText(topic.createdAt)}</span>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                )}
            </section>
        </PostDirectoryLayout>
    );
}
