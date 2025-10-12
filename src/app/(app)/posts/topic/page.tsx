"use client";

import { useEffect, useMemo, useState } from "react";
import InsertNavbar from "@/components/InsertNavbar";
import TopicCard from "@/components/TopicCard";
import { useInsertTopics } from "@/app/context/InsertTopicProvider";
import {
    Card,
    CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Loader2, Search } from "lucide-react";

/* Consistent surface styles */
const surface =
    "relative rounded-2xl border border-black/[0.08] dark:border-white/[0.08] bg-white/60 dark:bg-gray-900/40 backdrop-blur-xl supports-[backdrop-filter]:bg-white/40 transition-colors";
const hoverable = "transition-colors hover:border-black/20 dark:hover:border-white/30";

export default function AllTopicPosts() {
    const { all_topics, fetchAllTopicPosts, isAllSheetsLoading } = useInsertTopics();
    const [query, setQuery] = useState("");

    useEffect(() => {
        fetchAllTopicPosts();
    }, []); // keep behavior unchanged

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return all_topics || [];
        return (all_topics || []).filter((t: any) => {
            const name = (t?.name || t?.title || "").toLowerCase();
            const creator = (t?.username || t?.owner || t?.createdBy || "").toLowerCase();
            const desc = (t?.description || "").toLowerCase();
            return name.includes(q) || creator.includes(q) || desc.includes(q);
        });
    }, [all_topics, query]);

    return (
        <>
            <div className="flex flex-col gap-6 py-8 lg:py-12 justify-center px-8 lg:px-56">
                {isAllSheetsLoading && (
                    <div className="flex justify-center items-center h-[60vh]">
                        <Loader2 className="h-12 w-12 animate-spin text-gray-500" />
                    </div>
                )}

                {!isAllSheetsLoading && (
                    <div>
                        <InsertNavbar />
                    </div>
                )}

                <div className="flex items-center justify-between flex-wrap gap-3">
                    <span className="text-[13px] uppercase tracking-wider font-semibold px-2 py-1 rounded bg-purple-200/70 dark:bg-purple-800/60 text-purple-900 dark:text-purple-200">
                        Post: Topics
                    </span>
                    <Badge variant="secondary" className="text-xs">
                        {filtered?.length ?? 0} shown{query ? ` of ${all_topics?.length ?? 0}` : ""}
                    </Badge>
                </div>

                {/* Search */}
                <div className={`${surface} ${hoverable} shadow-none p-2 pr-3 flex items-center gap-2`}>
                    <div className="pl-2 pr-1 text-gray-500">
                        <Search className="h-4 w-4" />
                    </div>
                    <Input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search topics by name, creator, or description..."
                        className="border-0 focus-visible:ring-0 bg-transparent"
                    />
                </div>

                {!isAllSheetsLoading && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 overflow-visible">
                        {filtered?.length === 0 && (
                            <div className="col-span-full">
                                <Card className={`${surface} shadow-none`}>
                                    <CardContent className="py-14 text-center text-sm text-gray-600 dark:text-gray-400">
                                        No results for “{query}”. Try a different search.
                                    </CardContent>
                                </Card>
                            </div>
                        )}

                        {filtered?.map((topic: any, idx: number) => (
                            <Card key={idx} className={`${surface} ${hoverable} shadow-none`}>
                                <CardContent className="p-0">
                                    <TopicCard topic={topic} />
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}