"use client";

import { usePathname, useRouter } from "next/navigation";
import { ArrowUpRight, CircleCheck, Loader2, X } from "lucide-react";

import NotificationActionButtonsV2 from "@/components/notifications-v2/NotificationActionButtonsV2";
import { Button } from "@/components/ui/button";
import {
    canOpenNotificationDestinationV2,
    formatNotificationEntityLabelV2,
    getNotificationActorPathV2,
    getNotificationDestinationPathV2,
    getNotificationDisplayMessageV2,
    getNotificationResolvedActionStateV2,
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
    onDismiss,
    onResolveAction,
    isMarking,
    isDismissing,
}: {
    notification: NotificationItemV2Data;
    onMarkAsRead: (id: string) => Promise<void>;
    onDismiss: (notification: NotificationItemV2Data) => Promise<void>;
    onResolveAction: (
        notification: NotificationItemV2Data,
        state: Exclude<NotificationLocalActionStateV2, null>
    ) => Promise<void>;
    isMarking: boolean;
    isDismissing: boolean;
}) {
    const router = useRouter();
    const pathname = usePathname();
    const isClickable = canOpenNotificationDestinationV2(notification, pathname);
    const isActionable = isNotificationActionableV2(notification);
    const entityLabel = formatNotificationEntityLabelV2(notification.entityType);
    const displayMessage = getNotificationDisplayMessageV2(notification);
    const destinationPath = getNotificationDestinationPathV2(notification);
    const actorPath = getNotificationActorPathV2(notification.actorUsername);
    const resolvedState = getNotificationResolvedActionStateV2(notification);
    const resolvedTone = resolvedState === "accepted"
        ? "border-emerald-500/20 bg-emerald-500/8"
        : resolvedState === "declined"
            ? "border-rose-500/20 bg-rose-500/8"
            : null;
    const indicatorTone = resolvedState === "accepted"
        ? "bg-emerald-500"
        : resolvedState === "declined"
            ? "bg-rose-500"
            : notification.read
                ? "bg-transparent"
                : isActionable
                    ? "bg-amber-500"
                    : "bg-sky-500";

    const handleOpen = async () => {
        if (!destinationPath) return;
        if (!notification.read) {
            await onMarkAsRead(notification.id);
        }
        router.push(destinationPath);
    };

    return (
        <div
            className={cn(
                "group relative rounded-[18px] border pl-3.5 py-3 pr-2 transition-colors",
                resolvedTone
                    ? resolvedTone
                    : notification.read
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
            {/* <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="Dismiss notification"
                className="absolute right-2 top-2 z-10 h-8 w-8 rounded-full border border-border/60 bg-background/80 text-muted-foreground opacity-100 shadow-sm backdrop-blur transition-colors hover:text-foreground md:opacity-70 md:group-hover:opacity-100"
                onClick={(event) => {
                    event.stopPropagation();
                    void onDismiss(notification);
                }}
                disabled={isDismissing}
            >
                {isDismissing ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
            </Button> */}
            <div className="flex items-start gap-3">
                <div className={cn("mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full", indicatorTone)} aria-hidden={notification.read && !resolvedState} />
                <div className="min-w-0 flex-1">
                    <div className="space-y-1">
                        <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0 space-y-1">
                                <p className="text-sm font-medium leading-5 text-foreground/95">{displayMessage}</p>
                            </div>
                            <div className="flex items-center gap-1">
                                {!notification.read && (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="h-7 rounded-full p-1 text-xs text-muted-foreground hover:text-foreground"
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
                                                <CircleCheck className="h-3.5 w-3.5" />
                                            </>
                                        )}
                                    </Button>
                                )}
                                {/* {isClickable && <ArrowUpRight className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />} */}
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] uppercase text-muted-foreground/80">
                            <div>
                                <span>{formatTimestamp(notification.createdAt)}</span>
                                {entityLabel ? <span>{entityLabel}</span> : null}
                                {notification.actorUsername && actorPath ? (
                                    <button
                                        type="button"
                                        className="rounded-full border border-border/70 px-2 py-0.5 text-[10px] font-medium normal-case tracking-normal text-muted-foreground transition-colors hover:border-foreground/20 hover:text-foreground"
                                        onClick={(event) => {
                                            event.stopPropagation();
                                            router.push(actorPath);
                                        }}
                                    >
                                        @{notification.actorUsername}
                                    </button>
                                ) : null}
                            </div>

                            <NotificationActionButtonsV2
                                notification={notification}
                                onResolveAction={onResolveAction}
                                compact
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

