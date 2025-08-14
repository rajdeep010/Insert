"use client";
import { useParams } from "next/navigation";
import React from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { CirclePlus,FileInput,Loader2,Trash2,UserPlus } from "lucide-react";
import InsertNavbar from "@/components/InsertNavbar";
import InsertHoverCard from "@/components/InsertHoverCard";
import { useInsertTopics } from "@/app/context/InsertTopicProvider";
import { Badge } from "@/components/ui/badge";



export default function page() {
	const { data: session,status } = useSession();

	const {
		curr_topic,
		isTopicLoading,
	} = useInsertTopics();


	return (
		<div className="flex flex-col gap-6 py-8 lg:py-12 justify-center px-8 lg:px-64">
			<div><InsertNavbar /></div>

			<div className="flex flex-col mt-6">
				<div className="flex flex-col gap-4">

					<div className="flex justify-between gap-6">
						<div className="flex flex-col gap-1">
							<div className="flex items-center gap-4">
								<p className="text-3xl font-bold">
									{curr_topic?.topic?.title}
								</p>
								<div className="flex items-center gap-2">
									{curr_topic?.topic?.visibility === "private" && (
										<Badge variant="destructive" className="flex items-center gap-2">private</Badge>
									)}
									{curr_topic?.topic?.visibility === "public" && (
										<Badge variant="default" className="bg-blue-500 text-white dark:bg-blue-600">public</Badge>
									)}
									<Badge variant="default">{curr_topic?.problems?.length} Problems</Badge>
								</div>
							</div>

							<div className="text-xs">{curr_topic && <div className="text-gray-400 flex gap-2 items-center">Author: {" "} <InsertHoverCard
								username={curr_topic?.topic?.creator_username as string}
								type={"username"}
							/></div>}</div>
						</div>

						<div className="*:data-[slot=avatar]:ring-background flex -space-x-2 *:data-[slot=avatar]:ring-2 *:data-[slot=avatar]:grayscale">
							{curr_topic?.topic?.collaborators.map((each: any,idx: any) => (
								<InsertHoverCard
									key={idx}
									username={each?.username as string}
									type={"avatar"}
								/>
							))}
						</div>
					</div>

					<div className="flex justify-between gap-6">
						<div className="max-w-[50%] break-words text-gray-700 italic text-sm">{curr_topic?.topic?.about}</div>
						<div className="flex flex-col lg:flex-row gap-2 items-center">
							{
								!isTopicLoading && status === "authenticated" && session?.user.username === curr_topic?.topic?.creator_username &&
								<Button variant="outline" className="rounded-md w-fit" >
									<UserPlus className="h-4 w-4" />
								</Button>
							}

							{
								!isTopicLoading && status === "authenticated" && (session?.user.username === curr_topic?.topic?.creator_username || curr_topic?.topic?.collaborators.find((each: any) => each.username === session?.user?.username)) && (
									<Button
										className="rounded-md w-fit"
										variant={"default"}
									>
										<CirclePlus className="h-4 w-4" />
									</Button>
								)
							}

							{
								!isTopicLoading && status === "authenticated" && session?.user.username === curr_topic?.topic?.creator_username &&
								<Button variant="destructive" className="rounded-md w-fit" >
									<Trash2 className="h-4 w-4" />
								</Button>
							}
						</div>
					</div>
				</div>
			</div>

		</div>
	);
};
