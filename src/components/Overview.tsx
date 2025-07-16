import React from "react";
import { Card, CardDescription, CardHeader, CardTitle } from "./ui/card";
import Link from "next/link";
import { Topic } from "@/types/types";
import { useTopics } from "@/app/context/TopicProvider";
import OverviewSkeleton from "./skeletons/OverviewSkeleton";
import { useSession } from "next-auth/react";
import { Badge } from "./ui/badge";
import { Lock } from "lucide-react";

interface OverviewProps {
  topics: Topic[];
}

const Overview = ({ topics }: OverviewProps) => {
  const { isTopicsLoading } = useTopics();
  const { data: session, status } = useSession();

  return (
    <div className="py-6">
      {isTopicsLoading && <OverviewSkeleton />}

      <div className="flex flex-col lg:grid lg:grid-cols-2 gap-5">
        {!isTopicsLoading &&
          topics &&
          topics.length > 0 &&
          topics.map(
            (topic, idx: number) =>
              (topic.visibility === "public" ||
                (status === "authenticated" &&
                  topic.creator_username === session?.user?.username &&
                  topic.visibility === "private")) && (
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
                        Math.min(topic?.about.length, 100)
                      ) + "...."}
                    </CardDescription>
                  </CardHeader>
                </Card>
              )
          )}

        {!isTopicsLoading && topics && topics.length == 0 && (
          <div className="font-bold font-sans">
            No topics !!! &nbsp; &nbsp; Create one now..
          </div>
        )}
      </div>
    </div>
  );
};

export default Overview;
