"use client";
import { useEffect, useMemo, useState } from "react";
import { useInsertProjects } from "@/app/context/InsertProjectProvider";
import InsertNavbar from "@/components/InsertNavbar";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { getLastModifiedText } from "@/helpers/last-modified";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Loader2,
    MoreHorizontal,
    GitBranch,
    ExternalLink,
    Eye,
    EyeOff,
    GitCommit,
    Search,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import InsertHoverCard from "@/components/InsertHoverCard";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { languageColors } from "@/types/master-data";

/* Surface styles aligned with Posts/Blogs/Projects */
const surface =
    "relative rounded-2xl border border-black/[0.08] dark:border-white/[0.08] bg-white/60 dark:bg-gray-900/40 supports-[backdrop-filter]:bg-white/40 transition-colors";
const hoverable = "transition-colors hover:border-black/20 dark:hover:border-white/30";

export default function ProjectsPage() {
    const { all_projects, isAllProjectsLoading, pagination, loadMore } = useInsertProjects();
    const [query, setQuery] = useState("");

    useEffect(() => {
        // If fetching is manual elsewhere, keep it as-is. This page just renders what context provides.
    }, []);

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return all_projects || [];
        return (all_projects || []).filter((p: any) => {
            const name = (p?.name || "").toLowerCase();
            const username = (p?.username || "").toLowerCase();
            const repo = (p?.repoName || "").toLowerCase();
            return name.includes(q) || username.includes(q) || repo.includes(q);
        });
    }, [all_projects, query]);

    return (
        <>
            <div className="flex flex-col gap-6 py-8 lg:py-12 justify-center px-8 lg:px-56">
                {isAllProjectsLoading && (
                    <div className="flex justify-center items-center h-[60vh]">
                        <Loader2 className="h-12 w-12 animate-spin text-gray-500" />
                    </div>
                )}

                {!isAllProjectsLoading && (
                    <div>
                        <InsertNavbar />
                    </div>
                )}

                {!isAllProjectsLoading && <div className="flex items-center justify-between flex-wrap gap-4">
                    <span className="text-[13px] uppercase tracking-wider font-semibold px-2 py-1 rounded bg-purple-200/70 dark:bg-purple-800/60 text-purple-900 dark:text-purple-200">
                        Post: Projects
                    </span>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                        {filtered?.length ?? 0} shown{query ? ` of ${all_projects?.length ?? 0}` : ""}
                    </div>
                </div>}

                {/* Search */}
                <div className={`${surface} ${hoverable} shadow-none p-2 pr-3 flex items-center gap-2`}>
                    <div className="pl-2 pr-1 text-gray-500">
                        <Search className="h-4 w-4" />
                    </div>
                    <Input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search by project name, owner, or repo..."
                        className="border-0 focus-visible:ring-0 bg-transparent"
                    />
                </div>

                {!isAllProjectsLoading && (
                    <div className="flex flex-col gap-4 max-h-[72vh] overflow-visible custom-small-scrollbar">
                        {filtered?.length === 0 && (
                            <Card className={`${surface} shadow-none`}>
                                <CardContent className="py-14 text-center text-sm text-gray-600 dark:text-gray-400">
                                    No results for “{query}”. Try a different search.
                                </CardContent>
                            </Card>
                        )}

                        {filtered?.map((project: any, idx: number) => (
                            <div key={project?.id} className="group">
                                <Card className={`${surface} ${hoverable} shadow-none`}>
                                    <div className="flex justify-between px-3 lg:px-6 py-6">
                                        {/* Left: meta + content */}
                                        <CardContent className="flex flex-col gap-3 pr-6 w-full p-0">
                                            <CardHeader className="flex flex-col gap-3 px-0 py-0">
                                                {/* User Info */}
                                                <div className="flex items-center gap-2">
                                                    <InsertHoverCard
                                                        username={project?.username}
                                                        type="avatar"
                                                        avatarSize="small"
                                                    />
                                                    <div className="text-sm text-gray-600 hover:text-blue-500 hover:underline">
                                                        <InsertHoverCard
                                                            username={project?.username}
                                                            type="username"
                                                            avatarSize="small"
                                                        />
                                                    </div>
                                                </div>

                                                {/* Title and Badges */}
                                                <div className="flex items-center gap-3 flex-wrap">
                                                    <Link href={`/posts/projects/${project?.id}`}>
                                                        <CardTitle className="text-2xl font-semibold hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                                                            {project?.name}
                                                        </CardTitle>
                                                    </Link>

                                                    {/* Visibility Badge */}
                                                    {project?.visibility === "private" ? (
                                                        <Badge variant="destructive" className="flex items-center gap-1">
                                                            <EyeOff className="w-4 h-4" />
                                                            Private
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="secondary" className="flex items-center gap-1">
                                                            <Eye className="w-4 h-4" />
                                                            Public
                                                        </Badge>
                                                    )}

                                                    {/* Language Badge */}
                                                    {project?.language && (
                                                        <Badge variant="outline" className="text-sm flex items-center gap-2">
                                                            <span
                                                                className="w-3 h-3 rounded-full"
                                                                style={{ backgroundColor: languageColors[project?.language] || "#586069" }}
                                                            />
                                                            {project?.language}
                                                        </Badge>
                                                    )}

                                                    {/* Monitoring Badge */}
                                                    {project?.monitorCommits && (
                                                        <Badge variant="outline" className="text-sm flex items-center gap-1">
                                                            <GitCommit className="w-4 h-4" />
                                                            Monitored
                                                        </Badge>
                                                    )}
                                                </div>
                                            </CardHeader>

                                            {/* Description */}
                                            <CardDescription className="text-[15px] text-muted-foreground line-clamp-2">
                                                {project?.description && project?.description.length > 0
                                                    ? project?.description.slice(0, 240) + (project?.description.length > 240 ? "…" : "")
                                                    : "No description available..."}
                                            </CardDescription>

                                            {/* Repository Info */}
                                            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                                                <div className="flex items-center gap-1">
                                                    <GitBranch className="w-4 h-4" />
                                                    <span>{project?.defaultBranch}</span>
                                                </div>
                                                <span className="opacity-40">•</span>
                                                <span className="font-mono text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                                                    {project?.repoName}
                                                </span>
                                            </div>

                                            {/* Bottom Row - Timestamp and Actions */}
                                            <div className="flex justify-between items-center mt-2">
                                                <div className="text-xs text-gray-600 dark:text-gray-400">
                                                    Created {getLastModifiedText(project?.createdAt)}
                                                </div>

                                                {/* Actions */}
                                                <div className="flex items-center gap-2">
                                                    {/* Repository Link */}
                                                    {project?.repoUrl && (
                                                        <Link
                                                            href={project?.repoUrl}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-md transition-colors"
                                                        >
                                                            <ExternalLink className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                                                        </Link>
                                                    )}

                                                    {/* Dropdown Menu */}
                                                    <div className="hover:bg-gray-200 dark:hover:bg-gray-800 p-2 rounded-md">
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <MoreHorizontal className="h-4 w-4 cursor-pointer" />
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent className="w-56" align="end">
                                                                <DropdownMenuGroup>
                                                                    <DropdownMenuItem>
                                                                        <Link href={`/posts/projects/${project?.id}`} className="flex w-full">
                                                                            View Project
                                                                        </Link>
                                                                    </DropdownMenuItem>
                                                                </DropdownMenuGroup>
                                                                <DropdownMenuGroup>
                                                                    <DropdownMenuItem disabled>Hide Project</DropdownMenuItem>
                                                                </DropdownMenuGroup>
                                                                <DropdownMenuGroup>
                                                                    <DropdownMenuItem className="text-red-500" disabled>
                                                                        Report Project
                                                                    </DropdownMenuItem>
                                                                </DropdownMenuGroup>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </div>
                                </Card>

                                {/* Optional divider to keep rhythm on long lists */}
                                {idx < filtered.length - 1 && <Separator className="opacity-60" />}
                            </div>
                        ))}

                        {pagination?.hasMore && (
                            <Button disabled={isAllProjectsLoading} onClick={loadMore}>
                                {isAllProjectsLoading ? "Loading..." : "Load more"}
                            </Button>
                        )}

                        {/* Empty State when nothing at all */}
                        {(all_projects?.length ?? 0) === 0 && (
                            <Card className={`${surface} shadow-none`}>
                                <CardContent className="py-12 text-center">
                                    <div className="text-gray-500 text-lg mb-2">No projects found</div>
                                    <div className="text-gray-400 text-sm">Start by creating your first project!</div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                )}
            </div>
        </>
    );
}