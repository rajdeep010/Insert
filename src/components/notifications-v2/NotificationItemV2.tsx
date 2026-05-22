"use client";

import { Loader2, CircleCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { NotificationItemV2Data } from "@/types/notifications-v2";

const formatTimestamp = (value: string) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return "Just now";
    }

    return new Intl.DateTimeFormat("en", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
    }).format(date);
};

export default function NotificationItemV2({
    notification,
    onMarkAsRead,
    isMarking,
}: {
    notification: NotificationItemV2Data;
    onMarkAsRead: (id: string) => Promise<void>;
    isMarking: boolean;
}) {
    return (
        <div
            className={cn(
                "rounded-2xl border px-4 py-3.5 transition-colors",
                notification.read
                    ? "border-border/70 bg-background"
                    : "border-sky-200/80 bg-gradient-to-br from-sky-50 via-background to-background dark:border-sky-900/60 dark:from-sky-950/40"
            )}
        >
            <div className="flex items-start gap-3">
                <div className={cn("mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full", notification.read ? "bg-transparent" : "bg-blue-500")} aria-hidden={notification.read} />
                <div className="min-w-0 flex-1">
                    <div className="space-y-[0.2]">
                        <p className="text-sm font-medium leading-6 text-foreground">{notification.payload}</p>

                        <div className="flex items-center justify-between">
                            <p className="text-xs text-muted-foreground">{formatTimestamp(notification.createdAt)}</p>
                            <div className="flex items-center justify-end">
                                {!notification.read && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-7 rounded-full px-2.5 text-xs text-muted-foreground hover:text-foreground"
                                        onClick={() => onMarkAsRead(notification.id)}
                                        disabled={isMarking}
                                    >
                                        {isMarking ? (
                                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                        ) : (
                                            <>
                                                <CircleCheck className="h-3.5 w-3.5" /> Mark as read
                                            </>
                                        )}
                                    </Button>
                                )}
                            </div>
                        </div>

                    </div>


                </div>
            </div>
        </div>
    );
}
