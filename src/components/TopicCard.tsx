import { Card,CardHeader,CardTitle,CardDescription,CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import InsertHoverCard from "@/components/InsertHoverCard";
import { getLastModifiedText } from "@/helpers/last-modified";

interface TopicCardProps {
    topic: {
        id: string;
        title: string;
        about?: string;
        visibility: "public" | "private";
        creator_username: string;
        collaborators: { username: string; name?: string }[];
        createdAt: string | Date;
    };
}

export default function TopicCard({ topic }: TopicCardProps) {
    const { id,title,about,visibility,creator_username,collaborators,createdAt } = topic;
    const createdDate = typeof createdAt === 'string' ? new Date(createdAt) : createdAt;
    const timeAgo = getLastModifiedText(createdDate);

    return (
        <Card className="w-full hover:shadow-lg transition-shadow rounded-2xl">
            <CardHeader className="flex flex-col gap-2 px-6 pt-4">
                <div className="flex items-center justify-between">
                    <Link href={`/topic/${id}`}>
                        <CardTitle className="text-xl font-semibold hover:underline">
                            {title}
                        </CardTitle>
                    </Link>
                    <Badge variant={visibility === 'public' ? 'default' : 'destructive'} className="capitalize">
                        {visibility}
                    </Badge>
                </div>
                {about && (
                    <CardDescription className="text-sm text-muted-foreground line-clamp-3">
                        {about.length > 80 ? `${about.slice(0,80)}…` : about}
                    </CardDescription>
                )}
            </CardHeader>

            <CardFooter className="flex flex-wrap items-center justify-between px-6 pb-4">
                <div className="flex items-center space-x-2">
                    <InsertHoverCard username={creator_username} type="avatar" avatarSize="small" />
                    <span className="text-sm text-gray-600 hover:text-blue-500 hover:underline">
                        <InsertHoverCard username={creator_username} type="username" />
                    </span>
                    <span className="text-[12px] text-gray-500">• {timeAgo}</span>
                </div>

                {collaborators.length > 0 && (
                    <div className="flex -space-x-2">
                        {collaborators.map((col,idx) => (
                            <InsertHoverCard
                                key={idx}
                                username={col.username}
                                type="avatar"
                                avatarSize="small"
                            />
                        ))}
                    </div>
                )}
            </CardFooter>
        </Card>
    );
}
