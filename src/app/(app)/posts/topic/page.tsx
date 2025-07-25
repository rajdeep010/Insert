"use client";
import { useBlog } from "@/app/context/BlogProvider";
import InsertNavbar from "@/components/InsertNavbar";
import { Avatar,AvatarFallback,AvatarImage } from "@/components/ui/avatar";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getLastModifiedText } from "@/helpers/last-modified";
import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuPortal,
    DropdownMenuSeparator,
    DropdownMenuShortcut,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Loader2,MoreHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import InsertHoverCard from "@/components/InsertHoverCard";
import { useInsertTopics } from "@/app/context/InsertTopicProvider";
import TopicCard from "@/components/TopicCard";

export default function AllTopicPosts() {

    const {all_topics, fetchAllTopicPosts, isAllSheetsLoading} = useInsertTopics()
    useEffect(() => {
        fetchAllTopicPosts()
    }, [])
    console.log(all_topics)

    return (
        <>
            <div className="flex flex-col gap-6 py-8 lg:py-12 justify-center px-8 lg:px-64">
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

                <div className="text-2xl font-bold mx-auto text-gray-500 dark:text-gray-400">Topics</div>


                {!isAllSheetsLoading && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 max-h-[75vh] overflow-y-scroll custom-small-scrollbar  shadow-gray-200 dark:shadow-gray-800">
                        {all_topics?.map((topic,idx) => (
                            <div key={idx} className="group">
                                <div className="flex justify-between hover:bg-gray-50 dark:hover:bg-gray-900 transition ease-in-out">
                                    <TopicCard topic={topic} />
                                </div>

                                {/* {idx < all_topics?.length - 1 && <Separator />} */}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}
