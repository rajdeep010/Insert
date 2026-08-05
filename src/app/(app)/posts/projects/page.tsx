"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
    ArrowRight,
    ExternalLink,
    Eye,
    EyeOff,
    FolderGit2,
    GitBranch,
    GitCommit,
    Loader2,
    Search,
    Sparkles,
} from "lucide-react";

import InsertNavbar from "@/components/InsertNavbar";
import InsertHoverCard from "@/components/InsertHoverCard";
import ProGate from "@/components/ProGate";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getLastModifiedText } from "@/helpers/last-modified";
import { languageColors } from "@/types/master-data";
import { useInsertProjects } from "@/features/project/context/InsertProjectProvider";
import { useInsertUser } from "@/features/user/context/InsertUserProvider";

const accents = [
    {
        line: "group-hover:border-indigo-400/45",
        glow: "bg-indigo-500/10",
        label: "text-indigo-600 dark:text-indigo-300",
    },
    {
        line: "group-hover:border-cyan-400/45",
        glow: "bg-cyan-500/10",
        label: "text-cyan-700 dark:text-cyan-300",
    },
    {
        line: "group-hover:border-emerald-400/45",
        glow: "bg-emerald-500/10",
        label: "text-emerald-700 dark:text-emerald-300",
    },
    {
        line: "group-hover:border-amber-400/45",
        glow: "bg-amber-500/10",
        label: "text-amber-700 dark:text-amber-300",
    },
];

export default function ProjectsPage() {
    const { all_projects, isAllProjectsLoading, pagination, loadMore, fetchAllProjects } = useInsertProjects();
    const { currentUser } = useInsertUser();
    const { status } = useSession();
    const [query, setQuery] = useState("");

    const filtered = useMemo(() => {
        const normalizedQuery = query.trim().toLowerCase();
        if (!normalizedQuery) return all_projects || [];

        return (all_projects || []).filter((project: any) =>
            [project?.name, project?.username, project?.repoName, project?.description, project?.language]
                .filter(Boolean)
                .some((value) => String(value).toLowerCase().includes(normalizedQuery)),
        );
    }, [all_projects, query]);

    useEffect(() => {
        if (status === "authenticated") fetchAllProjects({ limit: 5 });
    }, [fetchAllProjects, status]);

    return (
        <>
            <ProGate show={currentUser?.proStatus?.active === false} />

            <main className="relative min-h-screen overflow-hidden bg-slate-50 text-slate-950 dark:bg-[#020817] dark:text-slate-50">
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 opacity-60 dark:opacity-100 [background-image:linear-gradient(to_right,rgba(100,116,139,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(100,116,139,0.08)_1px,transparent_1px)] [background-size:48px_48px] [mask-image:linear-gradient(to_bottom,black,transparent_92%)]"
                />
                <div aria-hidden="true" className="pointer-events-none absolute left-[12%] top-0 h-80 w-80 rounded-full bg-indigo-500/10 blur-[120px]" />
                <div aria-hidden="true" className="pointer-events-none absolute right-[8%] top-64 h-72 w-72 rounded-full bg-cyan-500/10 blur-[120px]" />

                <div className="relative mx-auto w-full max-w-[1560px] px-4 py-5 sm:px-8 lg:px-12 lg:py-8">
                    <InsertNavbar />

                    <section className="grid gap-8 border-b border-slate-200/80 py-14 dark:border-slate-800/80 lg:grid-cols-[minmax(0,1fr)_minmax(360px,0.62fr)] lg:items-end lg:py-20">
                        <div>
                            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/[0.07] px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-emerald-700 dark:text-emerald-300">
                                <Sparkles className="h-3 w-3" />
                                Community showcase
                            </div>
                            <h1 className="max-w-4xl text-4xl font-semibold tracking-[-0.04em] sm:text-6xl lg:text-7xl">
                                Projects built in public,
                                <span className="block text-slate-500 dark:text-slate-400">ready to explore.</span>
                            </h1>
                            <p className="mt-6 max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-400 sm:text-lg">
                                Browse release-ready work from the Insert community. See the stack, follow the repository, and discover how each project is evolving.
                            </p>
                        </div>

                        <div className="rounded-2xl border border-slate-200 bg-white/65 p-2 shadow-sm backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/55">
                            <label htmlFor="project-search" className="flex items-center gap-3 rounded-xl border border-transparent px-3 focus-within:border-indigo-500/40 focus-within:bg-white dark:focus-within:bg-slate-950">
                                <Search className="h-4 w-4 shrink-0 text-slate-400" />
                                <Input
                                    id="project-search"
                                    value={query}
                                    onChange={(event) => setQuery(event.target.value)}
                                    placeholder="Search projects, owners, stacks..."
                                    className="h-12 border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
                                />
                                <span className="hidden rounded-md border border-slate-200 px-2 py-1 font-mono text-[10px] text-slate-400 dark:border-slate-700 sm:block">
                                    {filtered.length} found
                                </span>
                            </label>
                        </div>
                    </section>

                    {isAllProjectsLoading && (all_projects?.length ?? 0) === 0 ? (
                        <div className="flex min-h-[40vh] items-center justify-center">
                            <Loader2 className="h-7 w-7 animate-spin text-slate-400" />
                        </div>
                    ) : (
                        <section className="py-8 lg:py-10">
                            <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
                                <div>
                                    <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-indigo-600 dark:text-indigo-300">Project directory</p>
                                    <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">Explore the latest builds</h2>
                                </div>
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    {query ? `${filtered.length} of ${all_projects?.length ?? 0} projects` : `${filtered.length} public projects`}
                                </p>
                            </div>

                            {filtered.length > 0 ? (
                                <div className="grid auto-rows-fr gap-3 md:grid-cols-2 xl:grid-cols-3">
                                    {filtered.map((project: any, index: number) => {
                                        const accent = accents[index % accents.length];
                                        return (
                                            <article
                                                key={project?.id}
                                                className={`group relative min-h-[320px] overflow-hidden rounded-2xl border border-slate-200 bg-white/65 p-6 shadow-sm backdrop-blur-xl transition duration-300 hover:-translate-y-0.5 hover:bg-white dark:border-slate-800 dark:bg-slate-950/55 dark:hover:bg-slate-950/85 ${accent.line} ${index === 0 ? "md:col-span-2 xl:col-span-2" : ""}`}
                                            >
                                                <div aria-hidden="true" className={`absolute -right-20 -top-20 h-52 w-52 rounded-full blur-3xl transition-transform duration-500 group-hover:scale-125 ${accent.glow}`} />

                                                <div className="relative flex h-full flex-col">
                                                    <div className="flex items-start justify-between gap-4">
                                                        <div className="flex min-w-0 items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                                                            <InsertHoverCard username={project?.username} type="avatar" avatarSize="small" />
                                                            <InsertHoverCard username={project?.username} type="username" avatarSize="small" />
                                                        </div>
                                                        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-slate-200 bg-slate-100/80 px-2.5 py-1 text-[10px] uppercase tracking-wider text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
                                                            {project?.visibility === "private" ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                                                            {project?.visibility || "public"}
                                                        </span>
                                                    </div>

                                                    <div className="mt-10">
                                                        <p className={`mb-3 font-mono text-[10px] uppercase tracking-[0.2em] ${accent.label}`}>
                                                            {index === 0 ? "Featured build" : `Project ${String(index + 1).padStart(2, "0")}`}
                                                        </p>
                                                        <Link href={`/posts/projects/${project?.id}`} className="inline-flex max-w-full items-center gap-2">
                                                            <h3 className="truncate text-2xl font-semibold tracking-tight transition-colors group-hover:text-indigo-600 dark:group-hover:text-indigo-300 sm:text-3xl">
                                                                {project?.name}
                                                            </h3>
                                                            <ArrowRight className="h-5 w-5 shrink-0 transition-transform group-hover:translate-x-1" />
                                                        </Link>
                                                        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-400">
                                                            {project?.description?.trim() || "An open project from the Insert community. Explore the repository and follow its release journey."}
                                                        </p>
                                                    </div>

                                                    <div className="mt-auto flex flex-wrap items-center gap-2 pt-8 text-xs text-slate-500 dark:text-slate-400">
                                                        {project?.language && (
                                                            <span className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-2.5 py-1.5 dark:border-slate-800">
                                                                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: languageColors[project.language] || "#64748b" }} />
                                                                {project.language}
                                                            </span>
                                                        )}
                                                        {project?.defaultBranch && (
                                                            <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1.5 dark:border-slate-800">
                                                                <GitBranch className="h-3.5 w-3.5" /> {project.defaultBranch}
                                                            </span>
                                                        )}
                                                        {project?.monitorCommits && (
                                                            <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1.5 dark:border-slate-800">
                                                                <GitCommit className="h-3.5 w-3.5" /> monitored
                                                            </span>
                                                        )}
                                                        <span className="ml-auto pt-1 font-mono text-[10px] uppercase tracking-wider">
                                                            {getLastModifiedText(project?.createdAt)}
                                                        </span>
                                                        {project?.repoUrl && (
                                                            <Link
                                                                href={project.repoUrl}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                aria-label={`Open ${project.name} repository`}
                                                                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 transition hover:bg-slate-100 dark:border-slate-800 dark:hover:bg-slate-900"
                                                            >
                                                                <ExternalLink className="h-3.5 w-3.5" />
                                                            </Link>
                                                        )}
                                                    </div>
                                                </div>
                                            </article>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="flex min-h-[320px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white/45 px-6 text-center dark:border-slate-700 dark:bg-slate-950/35">
                                    <span className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
                                        <FolderGit2 className="h-5 w-5 text-slate-400" />
                                    </span>
                                    <h3 className="text-lg font-semibold">No projects found</h3>
                                    <p className="mt-2 max-w-sm text-sm text-slate-500 dark:text-slate-400">
                                        {query ? `Nothing matches “${query}”. Try another project, owner, or technology.` : "The project directory is waiting for its first build."}
                                    </p>
                                    {query && <Button variant="outline" className="mt-5" onClick={() => setQuery("")}>Clear search</Button>}
                                </div>
                            )}

                            {pagination?.hasMore && !query && (
                                <div className="mt-8 flex justify-center">
                                    <Button variant="outline" className="h-11 rounded-xl px-6" disabled={isAllProjectsLoading} onClick={loadMore}>
                                        {isAllProjectsLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                        {isAllProjectsLoading ? "Loading projects" : "Load more projects"}
                                    </Button>
                                </div>
                            )}
                        </section>
                    )}
                </div>
            </main>
        </>
    );
}
