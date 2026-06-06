"use client";

import { useState } from "react";
import { Bell, Loader2 } from "lucide-react";

import NotificationCenterV2 from "@/components/notifications-v2/NotificationCenterV2";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useNotificationsV2 } from "@/features/notification-v2/context/NotificationProviderV2";
import { cn } from "@/lib/utils";

export default function NotificationBellV2() {
	const [open, setOpen] = useState(false);
	const { unreadCount, connectionState, isInitialLoading, hasLoadedOnce, refreshNotificationsV2 } = useNotificationsV2();

	const handleOpenChange = (nextOpen: boolean) => {
		setOpen(nextOpen);
		if (nextOpen && !hasLoadedOnce) {
			void refreshNotificationsV2();
		}
	};

	return (
		<Sheet open={open} onOpenChange={handleOpenChange}>
			<SheetTrigger asChild>
				<button
					aria-label="Open notifications"
					className={cn(
						"relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-border/70 bg-background/80 shadow-sm transition-colors hover:bg-muted/60",
						connectionState === "connected" && "border-sky-200/80 dark:border-sky-900/60"
					)}
				>
					{isInitialLoading ? <Loader2 className="h-4.5 w-4.5 animate-spin" /> : <Bell className="h-5 w-5" />}
					{unreadCount > 0 && (
						<span className="absolute -right-1 -top-1 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1.5 text-[10px] font-semibold text-white shadow-sm">
							{unreadCount > 99 ? "99+" : unreadCount}
						</span>
					)}
				</button>
			</SheetTrigger>
			<SheetContent side="right" className="w-full border-l border-border/60 bg-background/95 p-0 backdrop-blur sm:max-w-xl">
				<NotificationCenterV2 />
			</SheetContent>
		</Sheet>
	);
}
