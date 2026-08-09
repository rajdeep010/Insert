"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { ArrowRight, BookOpen, FileText, FolderSearch, Layers3, Loader2 } from "lucide-react";

import InsertHoverCard from "@/components/InsertHoverCard";
import { PostDirectoryLayout } from "@/components/posts/PostDirectoryLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { fetchMyCollections, fetchPublicCollections } from "@/features/collection-v2/api/collections";
import type { CollectionEntry, CollectionType } from "@/types/collection";

type TypeFilter = "ALL" | CollectionType;

const formatDate = (value: string | Date) => new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
}).format(new Date(value));

export function PublicCollectionDirectory() {
    const { toast } = useToast();
    const { data: session, status } = useSession();
    const [collections, setCollections] = useState<CollectionEntry[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [query, setQuery] = useState("");
    const [typeFilter, setTypeFilter] = useState<TypeFilter>("ALL");

    useEffect(() => {
        if (status === "loading") return;

        const requests = status === "authenticated"
            ? Promise.all([fetchPublicCollections(), fetchMyCollections()])
            : Promise.all([fetchPublicCollections()]);

        requests
            .then((payloads) => {
                const merged = payloads.flatMap((payload) => payload.collections);
                setCollections(Array.from(new Map(merged.map((collection) => [collection._id, collection])).values()));
            })
            .catch((error: Error) => toast({ title: "Could not load collections", description: error.message, variant: "destructive" }))
            .finally(() => setIsLoading(false));
    }, [status, toast]);

    const filtered = useMemo(() => {
        const normalizedQuery = query.trim().toLowerCase();
        return collections.filter((collection) => {
            const matchesType = typeFilter === "ALL" || collection.collectionType === typeFilter;
            const matchesQuery = !normalizedQuery || [collection.name, collection.description, collection.ownerUsername]
                .some((value) => value.toLowerCase().includes(normalizedQuery));
            return matchesType && matchesQuery;
        });
    }, [collections, query, typeFilter]);

    return (
        <PostDirectoryLayout
            title="collections"
            description="Explore community collections alongside your private topic sheets and blog series."
            query={query}
            onQueryChange={setQuery}
            searchPlaceholder="Search collections or curators..."
        >
                <section className="py-3 lg:py-4">
                    <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-2">
                            {(["ALL", "TOPIC", "BLOG"] as TypeFilter[]).map((value) => (
                                <Button key={value} variant={typeFilter === value ? "default" : "outline"} size="sm" className="rounded-md px-4" onClick={() => setTypeFilter(value)}>{value === "ALL" ? "All" : value === "TOPIC" ? "Topic sheets" : "Blog series"}</Button>
                            ))}
                        </div>
                        <p className="text-sm text-muted-foreground">{filtered.length} collection{filtered.length === 1 ? "" : "s"}</p>
                    </div>

                    {isLoading ? (
                        <div className="flex min-h-[40vh] items-center justify-center"><Loader2 className="h-7 w-7 animate-spin text-muted-foreground" /></div>
                    ) : filtered.length === 0 ? (
                        <div className="flex min-h-80 flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/30 text-center">
                            <FolderSearch className="h-9 w-9 text-muted-foreground" />
                            <h2 className="mt-4 font-semibold">No matching collections</h2>
                            <p className="mt-2 text-sm text-muted-foreground">Try another search or content type.</p>
                        </div>
                    ) : (
                        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                            {filtered.map((collection) => {
                                const isTopic = collection.collectionType === "TOPIC";
                                const isOwnCollection = collection.ownerUsername === session?.user?.username;
                                const href = collection.visibility === "private" && isOwnCollection
                                    ? `/collections/${collection._id}`
                                    : `/posts/collections/${collection._id}`;
                                return (
                                    <article key={collection._id} className="group flex min-h-60 flex-col rounded-2xl border border-border/70 bg-card/55 p-5 backdrop-blur transition hover:-translate-y-0.5 hover:border-emerald-500/35 hover:bg-card">
                                        <div className="flex items-start justify-between gap-4">
                                            <span className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${isTopic ? "bg-emerald-500/10 text-emerald-500" : "bg-cyan-500/10 text-cyan-500"}`}>{isTopic ? <BookOpen className="h-5 w-5" /> : <FileText className="h-5 w-5" />}</span>
                                            <div className="flex gap-1.5">
                                                <Badge variant="default" className="font-mono text-[10px]">{collection.collectionType}</Badge>
                                                <Badge variant={collection.visibility === "public" ? "default" : "destructive"} className="flex items-center gap-1 text-[10px] capitalize">{collection.visibility}</Badge>
                                            </div>
                                        </div>
                                        <Link href={href} className="mt-5 inline-flex items-start justify-between gap-3">
                                            <h2 className="text-xl font-semibold tracking-tight transition group-hover:text-emerald-600 dark:group-hover:text-emerald-300">{collection.name}</h2>
                                            <ArrowRight className="mt-1 h-4 w-4 shrink-0 transition-transform group-hover:translate-x-1" />
                                        </Link>
                                        <p className="mt-2 line-clamp-2 text-sm leading-5 text-muted-foreground">{collection.description || "A curated collection from the Insert community."}</p>
                                        <div className="mt-auto flex items-center justify-between gap-3 border-t border-border/60 pt-4 text-xs text-muted-foreground">
                                            <div className="flex min-w-0 items-center gap-2"><span>By</span><InsertHoverCard username={collection.ownerUsername} type="username" avatarSize="small" /></div>
                                            <span className="inline-flex shrink-0 items-center gap-1.5"><Layers3 className="h-3.5 w-3.5" />{collection.itemCount} · {formatDate(collection.updatedAt)}</span>
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
