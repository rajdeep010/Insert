"use client";

import { usePathname, useRouter } from "next/navigation";
import { ArrowUpRight, CircleCheck, Loader2 } from "lucide-react";

import NotificationActionButtonsV2 from "@/components/notifications-v2/NotificationActionButtonsV2";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	canOpenNotificationDestinationV2,
    formatNotificationEntityLabelV2,
    isNotificationActionableV2,
} from "@/lib/notification-v2";
import { cn } from "@/lib/utils";
import type { NotificationItemV2Data, NotificationLocalActionStateV2 } from "@/types/notifications-v2";

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
    onResolveAction,
    isMarking,
}: {
    notification: NotificationItemV2Data;
    onMarkAsRead: (id: string) => Promise<void>;
    onResolveAction: (id: string, state: NotificationLocalActionStateV2) => void;
    isMarking: boolean;
}) {
    const router = useRouter();
    const pathname = usePathname();
    const isClickable = canOpenNotificationDestinationV2(notification, pathname);
    const isActionable = isNotificationActionableV2(notification);
    const entityLabel = formatNotificationEntityLabelV2(notification.entityType);

    const handleOpen = async () => {
        if (!notification.actionUrl) return;
        if (!notification.read) {
            await onMarkAsRead(notification.id);
        }
        router.push(notification.actionUrl);
    };

    return (
        <div
            className={cn(
                "rounded-[18px] border px-3.5 py-3 transition-colors",
                notification.read
                    ? "border-border/60 bg-background/90"
                    : isActionable
                        ? "border-amber-500/20 bg-amber-500/10"
                        : "border-border/60 bg-background/95",
                isClickable && "cursor-pointer hover:border-foreground/20"
            )}
            role={isClickable ? "button" : undefined}
            tabIndex={isClickable ? 0 : undefined}
            onClick={isClickable ? () => { void handleOpen(); } : undefined}
            onKeyDown={isClickable ? (event) => {
                if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    void handleOpen();
                }
            } : undefined}
        >
            <div className="flex items-start gap-3">
                <div className={cn("mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full", notification.read ? "bg-transparent" : isActionable ? "bg-amber-500" : "bg-sky-500")} aria-hidden={notification.read} />
                <div className="min-w-0 flex-1">
                    <div className="space-y-2.5">
                        <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0 space-y-1">
                                {/* <div className="flex flex-wrap items-center gap-2">
                                    {isActionable && (
                                        <Badge variant="outline" className="rounded-full border-amber-500/20 bg-amber-500/10 px-2 py-0.5 text-[10px] uppercase tracking-[0.14em] text-amber-700 dark:text-amber-200">
                                            Needs action
                                        </Badge>
                                    )}
                                </div> */}
                                <p className="text-sm font-medium leading-5 text-foreground/95">{notification.message}</p>
                            </div>
                            {isClickable && <ArrowUpRight className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />}
                        </div>

                        <div className="flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-[0.14em] text-muted-foreground/80">
                            <span>{formatTimestamp(notification.createdAt)}</span>
                            {entityLabel ? <span>{entityLabel}</span> : null}
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <NotificationActionButtonsV2
                                notification={notification}
                                onResolveAction={onResolveAction}
                                compact
                            />

                            {!notification.read && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 rounded-full px-2 text-xs text-muted-foreground hover:text-foreground"
                                    onClick={(event) => {
                                        event.stopPropagation();
                                        void onMarkAsRead(notification.id);
                                    }}
                                    disabled={isMarking}
                                >
                                    {isMarking ? (
                                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                    ) : (
                                        <>
                                            <CircleCheck className="mr-1 h-3.5 w-3.5" /> Read
                                        </>
                                    )}
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

