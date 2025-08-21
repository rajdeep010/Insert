"use client";
import { useParams } from "next/navigation";
import React from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { CirclePlus, FileInput, Filter, GitBranch, ListFilter, Loader2, MoreHorizontal, Trash2, UserPlus } from "lucide-react";
import InsertNavbar from "@/components/InsertNavbar";
import InsertHoverCard from "@/components/InsertHoverCard";
import { useInsertTopics } from "@/app/context/InsertTopicProvider";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { AvatarImage } from "@radix-ui/react-avatar";
import { Separator } from "@/components/ui/separator";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import Link from "next/link";



export default function page() {
    const { data: session, status } = useSession();
    const { curr_topic, isTopicLoading } = useInsertTopics();

    // Dummy feed-like data
    const dummyFeed = [
        {
            id: 2970,
            user: "tanmoysrt",
            btitle: "Blog feature with preview option and public private access",
            repo: "frappe/press",
            time: "2 days ago",
            title: "feat(cluster): Add btn to check machine availability",
            status: "Merged",
        },
        {
            id: 2969,
            user: "tanmoysrt",
            btitle: "Blog feature with preview option and public private access",
            repo: "frappe/press",
            time: "2 days ago",
            title: "fix(ui): Auto Increase Storage dialog",
            status: "Merged",
        },
        {
            id: 2969,
            user: "tanmoysrt",
            btitle: "Blog feature with preview option and public private access",
            repo: "frappe/press",
            time: "2 days ago",
            title: "fix(ui): Auto Increase Storage dialog",
            status: "Merged",
        },
        {
            id: 2969,
            user: "tanmoysrt",
            btitle: "Blog feature with preview option and public private access",
            repo: "frappe/press",
            time: "2 days ago",
            title: "fix(ui): Auto Increase Storage dialog",
            status: "Merged",
        },
        {
            id: 2969,
            user: "tanmoysrt",
            btitle: "Blog feature with preview option and public private access",
            repo: "frappe/press",
            time: "2 days ago",
            title: "fix(ui): Auto Increase Storage dialog",
            status: "Merged",
        },
        {
            id: 2969,
            user: "tanmoysrt",
            btitle: "Blog feature with preview option and public private access",
            repo: "frappe/press",
            time: "2 days ago",
            title: "fix(ui): Auto Increase Storage dialog",
            status: "Merged",
        },
        {
            id: 2969,
            user: "tanmoysrt",
            btitle: "Blog feature with preview option and public private access",
            repo: "frappe/press",
            time: "2 days ago",
            title: "fix(ui): Auto Increase Storage dialog",
            status: "Merged",
        },
        {
            id: 2969,
            user: "tanmoysrt",
            btitle: "Blog feature with preview option and public private access",
            repo: "frappe/press",
            time: "2 days ago",
            title: "fix(ui): Auto Increase Storage dialog",
            status: "Merged",
        },
        {
            id: 2969,
            user: "tanmoysrt",
            btitle: "Blog feature with preview option and public private access",
            repo: "frappe/press",
            time: "2 days ago",
            title: "fix(ui): Auto Increase Storage dialog",
            status: "Merged",
        },
        {
            id: 2969,
            user: "tanmoysrt",
            btitle: "Blog feature with preview option and public private access",
            repo: "frappe/press",
            time: "2 days ago",
            title: "fix(ui): Auto Increase Storage dialog",
            status: "Merged",
        }
    ];

    return (
        <div className="flex flex-col gap-6 py-8 lg:py-12 justify-center px-8 lg:px-64">
            <InsertNavbar />

            {/* Topic Section */}
            <div className="flex flex-col mt-6 gap-4">
                <div className="flex justify-between gap-6 py-3 rounded-md">
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-4">
                            <Avatar className={'h-10 w-10 cursor-pointer outline-2 outline-black border-[1px] border-red-500 dark:border-white'}>
                                <AvatarImage src={'https://github.com/shadcn.png'} />
                                <AvatarFallback>u</AvatarFallback>
                            </Avatar>

                            <div className="flex flex-col gap-[1px]">
                                <div className="text-md font-semibold">Rajdeep Mallick</div>
                                <div className="text-xs text-gray-800 dark:text-gray-400">@rajdeep999</div>
                            </div>
                        </div>
                    </div>


                    <div className="flex flex-col lg:flex-row gap-2 items-center">
                        <Button variant="outline" className="rounded-md w-fit">
                            <UserPlus className="h-4 w-4" />
                        </Button>
                        <Button className="rounded-md w-fit" variant={"default"}>
                            <CirclePlus className="h-4 w-4" />
                        </Button>
                        <Button variant="destructive" className="rounded-md w-fit">
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                <div className="flex flex-col justify-between gap-2 border-[1px] py-3 px-4 rounded-md">
                    <div className="flex justify-between gap-2">
                        <div className="flex gap-2 items-center">
                            <p className="text-xl font-bold">{curr_topic?.topic?.title || "Dummy Topic Title"}</p>
                            <Badge variant="default" className="bg-blue-500 text-white">public</Badge>
                        </div>

                        <div className="flex gap-2 items-center border-2 py-1 px-3 rounded-md">
                            <GitBranch className="h-4 w-4 text-sm" />
                            <p className="text-sm">master</p>
                        </div>
                    </div>
                    <div className="text-xs text-gray-700 dark:text-gray-500">Lorem, ipsum dolor sit amet consectetur adipisicing elit. Mollitia odio natus fugiat debitis provident fugit porro enim itaque nostrum tempore.</div>
                </div>
            </div>

            <Separator />

            <div className="flex justify-between items-center py-[-1rem]">
                <div className="text-md font-semibold">Release Blogs</div>
                <div className="gap-2 flex items-center border-2 px-4 py-1 rounded-md cursor-pointer"><ListFilter className="h-4 w-4" /> <span className="text-sm">Filter</span></div>
            </div>

            {/* Feed Section */}
            <div className="flex flex-col gap-4 max-h-[75vh] overflow-y-scroll custom-small-scrollbar  shadow-gray-200 dark:shadow-gray-800">
                {dummyFeed.map((item, index) => (
                    <div
                        key={index}
                        className="bg-[#e6f2ffc5] dark:bg-gray-950 rounded-lg px-6 py-8 border border-gray-300 dark:border-gray-700 shadow-sm dark:hover:bg-gray-900 hover:bg-[#cee6fec5] transition-colors duration-200"
                    >
                        {/* Top Row */}
                        <div className="flex justify-between gap-4 items-center mb-2">
                            <div className="flex gap-2 items-center">
                                <Avatar className={'h-6 w-6 cursor-pointer outline-2 dark:outline-black border-[1px] border-red-500 dark:border-white'}>
                                    <AvatarImage src={'https://github.com/shadcn.png'} />
                                    <AvatarFallback>u</AvatarFallback>
                                </Avatar>
                                <span className="text-sm text-gray-400">
                                    {item.user}{" "}
                                    <span className="text-gray-500">contributed to</span>{" "}
                                    {item.repo}
                                </span>
                            </div>
                            <div className="z-100 hover:bg-gray-300 dark:hover:bg-gray-800 p-2 flex justify-end rounded-md">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <MoreHorizontal className="h-4 w-4" />
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent className="w-56" align="start">
                                        <DropdownMenuGroup>
                                            <DropdownMenuItem disabled>
                                                Show less like this
                                            </DropdownMenuItem>
                                        </DropdownMenuGroup>
                                        <DropdownMenuGroup>
                                            <DropdownMenuItem
                                                className="text-red-600"
                                                disabled
                                            >
                                                Report post...
                                            </DropdownMenuItem>
                                        </DropdownMenuGroup>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>

                        {/* Title */}
                        <div className="text-md py-6">
                            <Link href={'/posts/blog/blog123'} className="font-bold hover:underline">{item.btitle}</Link>

                            <div className="flex items-center gap-2">
                                <div className="text-sm text-gray-500">{item.title}</div>
                                <span className="text-gray-500">#{item.id}</span>
                            </div>
                        </div>

                        {/* Badge */}
                        <div className="mt-2">
                            {/* <Badge className="bg-purple-700 rounded-full px-2 py-0.5">
                                {item.status}
                            </Badge> */}
                            <div className="text-[12px] flex items-center gap-2 text-gray-600 mt-2">
                                <div>Last modified on 12th Aug, 2025</div>
                                <span>•</span>
                                <span>2 min read</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
