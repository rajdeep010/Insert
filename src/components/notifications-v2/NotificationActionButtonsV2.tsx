"use client";

import { useState } from "react";
import { CircleCheck, Loader2, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getNotificationActionKindV2, getNotificationActionLabelV2 } from "@/lib/notification-v2";
import type { NotificationItemV2Data, NotificationLocalActionStateV2 } from "@/types/notifications-v2";

export default function NotificationActionButtonsV2({
	notification,
	onResolveAction,
	compact = false,
}: {
	notification: NotificationItemV2Data;
	onResolveAction: (
		notification: NotificationItemV2Data,
		state: Exclude<NotificationLocalActionStateV2, null>
	) => Promise<void>;
	compact?: boolean;
}) {
	const [pendingState, setPendingState] = useState<NotificationLocalActionStateV2>(null);
	const resolvedLabel = getNotificationActionLabelV2(notification.localActionState)
		?? (notification.actionCompleted ? "Completed" : null);
	const resolvedTone = notification.localActionState === "accepted"
		? "border-emerald-500/20 bg-emerald-500/12 text-emerald-700 dark:text-emerald-200"
		: notification.localActionState === "declined"
			? "border-rose-500/20 bg-rose-500/12 text-rose-700 dark:text-rose-200"
			: "border-border/60 bg-muted/60 text-muted-foreground";

	if (resolvedLabel) {
		return (
			<Badge variant="outline" className={`rounded-full border px-2.5 py-1 text-[11px] font-medium shadow-sm ${resolvedTone}`}>
				{resolvedLabel}
			</Badge>
		);
	}

	if (getNotificationActionKindV2(notification) !== "binary") {
		return null;
	}

	const handleResolve = async (state: NotificationLocalActionStateV2) => {
		if (!state) return;
		setPendingState(state);
		try {
			await onResolveAction(notification, state);
		} catch {
			setPendingState(null);
		}
	};

	const baseButtonClass = compact
		? "h-8 min-w-[92px] rounded-full px-3 text-xs font-medium"
		: "h-9 min-w-[108px] rounded-full px-3.5 text-xs font-medium";


	return (
		<div className="flex flex-wrap items-center gap-2">
			<Button
				type="button"
				size="sm"
				className={baseButtonClass}
				onClick={(event) => {
					event.stopPropagation();
					handleResolve("accepted");
				}}
				disabled={pendingState !== null}
			>
				{pendingState === "accepted" ? <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" /> : <CircleCheck className="mr-1 h-3.5 w-3.5" />}
				{pendingState === "accepted" ? "Accepting" : "Accept"}
			</Button>
			<Button
				type="button"
				variant="outline"
				size="sm"
				className={baseButtonClass}
				onClick={(event) => {
					event.stopPropagation();
					handleResolve("declined");
				}}
				disabled={pendingState !== null}
			>
				{pendingState === "declined" ? <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" /> : <X className="mr-1 h-3.5 w-3.5" />}
				{pendingState === "declined" ? "Declining" : "Decline"}
			</Button>
		</div>
	);
}
