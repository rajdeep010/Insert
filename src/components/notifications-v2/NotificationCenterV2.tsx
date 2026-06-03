"use client";

import { useMemo, useState } from "react";
import { BellRing, CircleCheck, Loader2, RefreshCw } from "lucide-react";

import NotificationItemV2 from "@/components/notifications-v2/NotificationItemV2";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SheetHeader } from "@/components/ui/sheet";
import { useNotificationsV2 } from "@/features/notification-v2/context/NotificationProviderV2";
import { isNotificationActionableV2 } from "@/lib/notification-v2";
import { NOTIFICATION_PAGE_SIZE_V2 } from "@/services/notification-v2.service";
import { cn } from "@/lib/utils";
import type { NotificationConnectionStateV2 } from "@/types/notifications-v2";

const connectionDotTone: Record<NotificationConnectionStateV2, string> = {
	idle: "bg-slate-400",
	connecting: "bg-amber-400",
	connected: "bg-emerald-500",
	reconnecting: "bg-amber-400",
	disconnected: "bg-rose-500",
	error: "bg-rose-500",
};

export default function NotificationCenterV2() {
	const {
		notifications,
		unreadCount,
		connectionState,
		isInitialLoading,
		isLoadingMore,
		error,
		hasMore,
		refreshNotificationsV2,
		loadMoreNotificationsV2,
		markAsReadV2,
		markVisibleAsReadV2,
		dismissNotificationV2,
		completeLocalActionV2,
	} = useNotificationsV2();
	const [markingIds, setMarkingIds] = useState<string[]>([]);
	const [dismissingIds, setDismissingIds] = useState<string[]>([]);
	const [isMarkingVisible, setIsMarkingVisible] = useState(false);
	const actionableNotifications = useMemo(
		() => notifications.filter((notification) => isNotificationActionableV2(notification)),
		[notifications]
	);
	const passiveNotifications = useMemo(
		() => notifications.filter((notification) => !isNotificationActionableV2(notification)),
		[notifications]
	);

	const handleMarkAsRead = async (id: string) => {
		setMarkingIds((current) => [...current, id]);
		try {
			await markAsReadV2(id);
		} finally {
			setMarkingIds((current) => current.filter((value) => value !== id));
		}
	};

	const handleMarkVisibleAsRead = async () => {
		setIsMarkingVisible(true);
		try {
			await markVisibleAsReadV2();
		} finally {
			setIsMarkingVisible(false);
		}
	};

	const handleDismiss = async (notification: typeof notifications[number]) => {
		setDismissingIds((current) => [...current, notification.id]);
		try {
			await dismissNotificationV2(notification);
		} finally {
			setDismissingIds((current) => current.filter((value) => value !== notification.id));
		}
	};

	return (
		<div className="flex h-full flex-col">
			<div className="border-b border-border/60 bg-gradient-to-br from-sky-100 via-background to-background px-5 pb-4 pt-5 dark:from-sky-950/50">
				<SheetHeader className="space-y-3 text-left">
					<div className="flex items-center justify-between gap-3">
						<div className="min-w-0">
							<div className="flex items-center gap-2">
								<BellRing className="h-4 w-4 text-muted-foreground" />
								<h2 className=" font-semibold uppercase text-foreground/90">Notifications</h2>
								<span className={cn("h-2 w-2 rounded-full", connectionDotTone[connectionState])}>
									<span className="sr-only">Connection status: {connectionState}</span>
								</span>
							</div>
							<p className="mt-1 text-xs text-muted-foreground">
								{unreadCount} unread
								{hasMore ? ` • showing latest ${NOTIFICATION_PAGE_SIZE_V2}` : ""}
							</p>
						</div>
						<div className="flex items-center gap-2 mr-4">
							<Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => refreshNotificationsV2()}>
								<RefreshCw className="h-4 w-4" />
							</Button>
							<Button
								variant="ghost"
								size="icon"
								className="h-8 w-8 rounded-full"
								onClick={handleMarkVisibleAsRead}
								disabled={isMarkingVisible || unreadCount === 0}
							>
								{isMarkingVisible ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
								<CircleCheck className="h-3.5 w-3.5" />
							</Button>
						</div>
					</div>
				</SheetHeader>
			</div>

			<ScrollArea className="flex-1 px-4 py-4">
				<div className="space-y-2.5 pb-5">
					{isInitialLoading && (
						<>
							<div className="h-20 animate-pulse rounded-2xl border bg-muted/40" />
							<div className="h-20 animate-pulse rounded-2xl border bg-muted/40" />
							<div className="h-20 animate-pulse rounded-2xl border bg-muted/40" />
						</>
					)}

					{!isInitialLoading && error && (
						<div className="rounded-[22px] border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 dark:border-rose-950 dark:bg-rose-950/40 dark:text-rose-200">
							<div className="font-medium">Notification sync failed</div>
							<p className="mt-1 text-xs opacity-80">{error}</p>
							<Button variant="outline" className="mt-4 rounded-full" onClick={() => refreshNotificationsV2()}>
								Retry
							</Button>
						</div>
					)}

					{!isInitialLoading && !error && notifications.length === 0 && (
						<div className="rounded-2xl border border-dashed border-border/70 bg-muted/20 px-6 py-10 text-center">
							<div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-background shadow-sm">
								<BellRing className="h-5 w-5 text-muted-foreground" />
							</div>
							<p className="mt-4 text-sm font-medium">No notifications yet</p>
							<p className="mt-1 text-sm text-muted-foreground">New events will appear here when they arrive.</p>
						</div>
					)}

					{!isInitialLoading && !error && actionableNotifications.length > 0 && (
						<div className="space-y-2.5">
							<div className="px-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
								Pending actions{actionableNotifications.length > 1 ? ` • ${actionableNotifications.length}` : ""}
							</div>
							{actionableNotifications.map((notification) => (
								<NotificationItemV2
									key={notification.id}
									notification={notification}
									onMarkAsRead={handleMarkAsRead}
									onDismiss={handleDismiss}
									onResolveAction={completeLocalActionV2}
									isMarking={markingIds.includes(notification.id)}
									isDismissing={dismissingIds.includes(notification.id)}
								/>
							))}
						</div>
					)}

					{!isInitialLoading && !error && passiveNotifications.length > 0 && (
						<div className="space-y-2.5">
							<div className="px-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
								Latest updates
							</div>
							{passiveNotifications.map((notification) => (
								<NotificationItemV2
									key={notification.id}
									notification={notification}
									onMarkAsRead={handleMarkAsRead}
									onDismiss={handleDismiss}
									onResolveAction={completeLocalActionV2}
									isMarking={markingIds.includes(notification.id)}
									isDismissing={dismissingIds.includes(notification.id)}
								/>
							))}
						</div>
					)}

					{hasMore && !isInitialLoading && (
						<Button
							variant="outline"
							className="mt-2 h-10 w-full rounded-full"
							onClick={() => loadMoreNotificationsV2()}
							disabled={isLoadingMore}
						>
							{isLoadingMore ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
							Load more notifications
						</Button>
					)}
				</div>
			</ScrollArea>
		</div>
	);
}
