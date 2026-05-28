"use client";

import { useState } from "react";
import { CheckCheck, CircleCheck, X } from "lucide-react";
import { toast } from "sonner";

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
	onResolveAction: (id: string, state: NotificationLocalActionStateV2) => void;
	compact?: boolean;
}) {
	const [pendingState, setPendingState] = useState<NotificationLocalActionStateV2>(null);
	const resolvedLabel = getNotificationActionLabelV2(notification.localActionState)
		?? (notification.actionCompleted ? "Completed" : null);

	if (resolvedLabel) {
		return (
			<Badge variant="secondary" className="rounded-full px-2.5 py-1 text-[11px] font-medium">
				{resolvedLabel}
			</Badge>
		);
	}

	if (getNotificationActionKindV2(notification) !== "binary") {
		return null;
	}

	const handleResolve = (state: NotificationLocalActionStateV2) => {
		if (!state) return;
		setPendingState(state);
		onResolveAction(notification.id, state);
		toast.success(state === "accepted" ? "Request accepted locally" : "Request declined locally", {
			description: "Backend action APIs can be wired into this same UI later.",
		});
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
				<CircleCheck className="mr-1 h-3.5 w-3.5" />
				Accept
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
				<X className="mr-1 h-3.5 w-3.5" />
				Decline
			</Button>
		</div>
	);
}
