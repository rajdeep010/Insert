"use client";
import { useInsertProjects } from "@/app/context/InsertProjectProvider";
import InsertNavbar from "@/components/InsertNavbar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { getLastModifiedText } from "@/helpers/last-modified";
import { useEffect } from "react";
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
    Star,
    GitCommit
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import InsertHoverCard from "@/components/InsertHoverCard";
import Link from "next/link";
import { languageColors } from "@/types/master-data";

export default function ProjectsPage() {
    const { 
        all_projects, 
        isAllProjectsLoading 
    } = useInsertProjects();

    return (
        <>
            <div className="flex flex-col gap-6 py-8 lg:py-12 justify-center px-8 lg:px-64">
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

                <div className="text-2xl font-bold mx-auto text-gray-500 dark:text-gray-400">
                    Projects
                </div>

                {!isAllProjectsLoading && (
                    <div className="flex flex-col gap-4 max-h-[72vh] overflow-y-scroll custom-small-scrollbar shadow-gray-200 dark:shadow-gray-800">
                        {all_projects?.map((project, idx) => (
                            <div key={project?.id} className="group">
                                <div className="flex gap-6 justify-between px-2 lg:px-8 py-6 hover:bg-blue-50 dark:hover:bg-slate-900 transition ease-in-out border-[1px] rounded-md">
                                    
                                   
                                    <CardContent className="flex flex-col gap-3 pr-6 w-full">
                                        <CardHeader className="flex flex-col gap-3 px-0">
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

                                            {/* project? Title and Badges */}
                                            <div className="flex items-center gap-3 flex-wrap">
                                                <Link href={`/posts/projects/${project?.id}`}>
                                                    <CardTitle className="text-2xl font-bold hover:text-blue-600 transition-colors">
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
                                                    <Badge variant="default" className=" flex items-center gap-1">
                                                        <Eye className="w-4 h-4" />
                                                        Public
                                                    </Badge>
                                                )}

                                                {/* Language Badge */}
                                                {project?.language && (
                                                    <Badge variant="outline" className="text-sm flex items-center gap-2">
														<div
															className="w-3 h-3 rounded-full"
															style={{ backgroundColor: languageColors[project?.language] || '#586069' }}
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

                                        {/* project? Description */}
                                        <CardDescription className="text-md text-muted-foreground line-clamp-2">
                                            {project?.description && project?.description.length > 0
                                                ? project?.description.slice(0, 200) + (project?.description.length > 200 ? "…" : "")
                                                : "No description available..."}
                                        </CardDescription>

                                        {/* Repository Info */}
                                        <div className="flex items-center gap-4 text-sm text-gray-600">
                                            <div className="flex items-center gap-1">
                                                <GitBranch className="w-4 h-4" />
                                                <span>{project?.defaultBranch}</span>
                                            </div>
                                            <span>•</span>
                                            <span className="font-mono text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                                                {project?.repoName}
                                            </span>
                                        </div>

                                        {/* Bottom Row - Timestamp and Actions */}
                                        <div className="flex justify-between items-center mt-2">
                                            <div className="text-xs text-gray-600">
                                                Created {getLastModifiedText(project?.createdAt)}
                                            </div>

                                            {/* Actions */}
                                            <div className="flex items-center gap-2">
                                                {/* Repository Link */}
                                                <Link 
                                                    href={project?.repoUrl} 
                                                    target="_blank"
                                                    className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-md transition-colors"
                                                >
                                                    <ExternalLink className="h-4 w-4 text-gray-600 hover:text-blue-600" />
                                                </Link>

                                                {/* Dropdown Menu */}
                                                <div className="hover:bg-gray-200 dark:hover:bg-gray-800 p-2 rounded-md">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <MoreHorizontal className="h-4 w-4 cursor-pointer" />
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent className="w-56" align="end">
                                                            <DropdownMenuGroup>
                                                                <DropdownMenuItem>
                                                                    <Link 
                                                                        href={`/posts/projects/${project?.id}`}
                                                                        className="flex w-full"
                                                                    >
                                                                        View Project
                                                                    </Link>
                                                                </DropdownMenuItem>
                                                                {/* <DropdownMenuItem>
                                                                    <Link 
                                                                        href={`/projects/${project?.id}/settings`}
                                                                        className="flex w-full"
                                                                    >
                                                                        Settings
                                                                    </Link>
                                                                </DropdownMenuItem> */}
                                                            </DropdownMenuGroup>
                                                            <DropdownMenuGroup>
                                                                <DropdownMenuItem disabled>
                                                                    Hide Project
                                                                </DropdownMenuItem>
                                                            </DropdownMenuGroup>
                                                            <DropdownMenuGroup>
                                                                <DropdownMenuItem
                                                                    className="text-red-500"
                                                                    disabled
                                                                >
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
                            </div>
                        ))}

                        {/* Empty State */}
                        {all_projects?.length === 0 && (
                            <div className="text-center py-12">
                                <div className="text-gray-500 text-lg mb-2">No projects found</div>
                                <div className="text-gray-400 text-sm">
                                    Start by creating your first project!
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </>
    );
}