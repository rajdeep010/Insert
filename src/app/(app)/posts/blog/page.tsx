"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Clock3, FileText, FolderSearch, Globe2, Loader2, Lock } from "lucide-react";

import InsertHoverCard from "@/components/InsertHoverCard";
import { PostDirectoryLayout } from "@/components/posts/PostDirectoryLayout";
import { Badge } from "@/components/ui/badge";
import { useBlog } from "@/features/blog/context/BlogProvider";
import { getLastModifiedText } from "@/helpers/last-modified";
import type { BlogEntry } from "@/types/blog";

const getReadingTime = (content?: string) => {
    const words = content?.trim().split(/\s+/).filter(Boolean).length ?? 0;
    return Math.max(1, Math.ceil(words / 200));
};

export default function AllBlogPosts() {
    const { allBlogPosts, fetchAllBlogPosts, isAllBlogPostsLoading } = useBlog();
    const [query, setQuery] = useState("");

    useEffect(() => {
        fetchAllBlogPosts();
    }, [fetchAllBlogPosts]);

    const filtered = useMemo(() => {
        const normalizedQuery = query.trim().toLowerCase();
        if (!normalizedQuery) return allBlogPosts || [];
        return (allBlogPosts || []).filter((blog: BlogEntry) =>
            [blog.blogTitle, blog.creator, blog.blogContentText]
                .filter((value): value is string => typeof value === "string")
                .some((value) => value.toLowerCase().includes(normalizedQuery)),
        );
    }, [allBlogPosts, query]);

    return (
        <PostDirectoryLayout
            title="Blogs"
            description="Read technical articles, practical notes, and engineering stories from the Insert community."
            query={query}
            onQueryChange={setQuery}
            searchPlaceholder="Search blogs, content, or authors..."
            accentClassName="text-cyan-600 dark:text-cyan-300"
        >
            <section className="py-3 lg:py-4">
                <div className="mb-5 flex items-center justify-between gap-4">
                    <p className="text-sm text-muted-foreground">Technical writing and notes</p>
                    <p className="text-sm text-muted-foreground">{filtered.length} blog{filtered.length === 1 ? "" : "s"}</p>
                </div>

                {isAllBlogPostsLoading ? (
                    <div className="flex min-h-[40vh] items-center justify-center"><Loader2 className="h-7 w-7 animate-spin text-muted-foreground" /></div>
                ) : filtered.length === 0 ? (
                    <div className="flex min-h-80 flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/30 text-center">
                        <FolderSearch className="h-9 w-9 text-muted-foreground" />
                        <h2 className="mt-4 font-semibold">No matching blogs</h2>
                        <p className="mt-2 text-sm text-muted-foreground">Try another title, phrase, or author.</p>
                    </div>
                ) : (
                    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                        {filtered.map((blog: BlogEntry) => {
                            const blogId = String(blog._id ?? blog.id ?? blog.blogUrl);
                            const visibility = blog.type === "private" ? "private" : "public";
                            return (
                                <article key={blogId} className="group flex overflow-hidden rounded-2xl border border-border/70 bg-card/55 backdrop-blur transition hover:-translate-y-0.5 hover:border-cyan-500/35 hover:bg-card md:flex-col">
                                    <Link href={`/posts/blog/${blog.blogUrl}`} className="relative w-32 shrink-0 overflow-hidden bg-muted md:aspect-[16/7] md:w-full">
                                        <Image src={blog.blogBannerImage || "/insert.png"} alt="" fill sizes="(max-width: 768px) 128px, (max-width: 1280px) 50vw, 25vw" className="object-cover transition duration-500 group-hover:scale-[1.03]" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/25 to-transparent" />
                                    </Link>
                                    <div className="flex min-w-0 flex-1 flex-col p-5">
                                        <div className="flex items-start justify-between gap-3">
                                            <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-500"><FileText className="h-4 w-4" /></span>
                                            <Badge variant={visibility === "public" ? "default" : "destructive"} className="gap-1 text-[10px] capitalize">{visibility === "public" ? <Globe2 className="h-3 w-3" /> : <Lock className="h-3 w-3" />}{visibility}</Badge>
                                        </div>
                                        <Link href={`/posts/blog/${blog.blogUrl}`} className="mt-4 inline-flex items-start justify-between gap-3">
                                            <h2 className="line-clamp-2 text-xl font-semibold tracking-tight transition group-hover:text-cyan-600 dark:group-hover:text-cyan-300">{blog.blogTitle}</h2>
                                            <ArrowRight className="mt-1 h-4 w-4 shrink-0 transition-transform group-hover:translate-x-1" />
                                        </Link>
                                        <p className="mt-2 line-clamp-2 text-sm leading-5 text-muted-foreground">{blog.blogContentText?.trim() || "A technical post from the Insert community."}</p>
                                        <div className="mt-auto flex items-end justify-between gap-3 border-t border-border/60 pt-4 text-xs text-muted-foreground">
                                            <div className="flex min-w-0 items-center gap-2">{blog.creator && <><InsertHoverCard username={blog.creator} type="avatar" avatarSize="small" /><InsertHoverCard username={blog.creator} type="username" avatarSize="small" /></>}</div>
                                            <div className="flex shrink-0 flex-col items-end gap-1"><span>{getLastModifiedText(blog.lastEdited)}</span><span className="inline-flex items-center gap-1"><Clock3 className="h-3 w-3" />{getReadingTime(blog.blogContentText)} min</span></div>
                                        </div>
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
