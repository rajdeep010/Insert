import React from "react";
import { Card,CardDescription,CardHeader,CardTitle } from "./ui/card";
import Link from "next/link";
import { Topic } from "@/types/types";
import { useTopics } from "@/app/context/TopicProvider";
import OverviewSkeleton from "./skeletons/OverviewSkeleton";
import { useSession } from "next-auth/react";
import { Badge } from "./ui/badge";
import { Lock } from "lucide-react";
import { useInsertTopics } from "@/app/context/InsertTopicProvider";
import { useInsertUser } from "@/app/context/InsertUserProvider";


const Overview = () => {
	// const { isTopicsLoading } = useTopics();
	const { isTopicsLoading,user_Topics } = useInsertTopics();
	const {user} = useInsertUser()
	const { data: session, status } = useSession();

	return (
		<div className="py-6">
			{isTopicsLoading && <OverviewSkeleton />}

			<div className="flex flex-col lg:grid lg:grid-cols-2 gap-4">
				{!isTopicsLoading &&
					user_Topics &&
					user_Topics.length > 0 &&
					user_Topics.slice(0,4).map((topic,idx: number) =>
					(
						<Card key={idx}>
							<CardHeader className="flex flex-col gap-2 text-wrap break-all">
								<div className="flex items-center gap-4">
									<CardTitle>
										<Link
											className="transition hover:text-blue-400 hover:cursor-pointer text-md-lg-screen"
											href={`/topic/${topic.id}`}
										>
											{topic?.title}
										</Link>
									</CardTitle>
									{topic?.visibility === "private" && (
										<Badge variant="destructive" className="flex items-center gap-2">
											private
										</Badge>
									)}
									{topic?.visibility === "public" && (
										<Badge
											variant="default"
											className="bg-blue-500 text-white dark:bg-blue-600"
										>
											public
										</Badge>
									)}
								</div>
								<CardDescription className="text-xs">
									{topic?.about.substring(
										0,
										Math.min(topic?.about.length,100)
									) + "...."}
								</CardDescription>
							</CardHeader>
						</Card>
					)
					)}

				{!isTopicsLoading && status === "authenticated" && user_Topics && user_Topics.length == 0 && (
					<div className="font-bold font-sans flex items-center">
						No topics !!! &nbsp; &nbsp; <Link href={`/u/${user?.username}?tab=topics`} className="text-xs text-blue-600 mt-12">Create one now...</Link>
					</div>
				)}
			</div>
			{!isTopicsLoading && status === "authenticated" && user_Topics && user_Topics.length > 0 && <Link href={`/u/${user?.username}?tab=topics`} className="text-xs text-blue-600 mt-12">Show more...</Link>}
		</div>
	);
};

export default Overview;
