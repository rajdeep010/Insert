"use client";

import { ExternalLink, Loader2, X } from "lucide-react";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import NotificationActionButtonsV2 from "@/components/notifications-v2/NotificationActionButtonsV2";
import { Button } from "@/components/ui/button";
import { useNotificationsV2 } from "@/features/notification-v2/context/NotificationProviderV2";
import {
	canOpenNotificationDestinationV2,
	formatNotificationEntityLabelV2,
	getNotificationActorPathV2,
	getNotificationDestinationLabelV2,
	getNotificationDestinationPathV2,
	getNotificationDisplayMessageV2,
	isNotificationActionableV2,
} from "@/lib/notification-v2";

export default function NotificationContextBannerV2() {
	const router = useRouter();
	const pathname = usePathname();
	const [dismissingIds, setDismissingIds] = useState<string[]>([]);
	const {
		contextualNotifications,
		completeLocalActionV2,
		dismissNotificationV2,
		markAsReadV2,
	} = useNotificationsV2();

	const notifications = contextualNotifications.filter((item) => isNotificationActionableV2(item));

	if (!notifications.length) {
		return null;
	}

	const handleDismiss = async (notification: typeof notifications[number]) => {
		setDismissingIds((current) => [...current, notification.id]);
		try {
			await dismissNotificationV2(notification);
		} finally {
			setDismissingIds((current) => current.filter((value) => value !== notification.id));
		}
	};

	return (
		<div className="mx-auto w-full max-w-6xl px-4 pt-4 sm:px-6 lg:px-8">
			<div className="w-full rounded-2xl border border-amber-500/20 bg-amber-500/10 px-3 py-2.5 shadow-sm">
				<div className="space-y-1.5">
					<div className="space-y-1.5">
						{notifications.map((notification) => {
							const entityLabel = formatNotificationEntityLabelV2(notification.entityType);
							const canOpenDestination = canOpenNotificationDestinationV2(notification, pathname);
							const displayMessage = getNotificationDisplayMessageV2(notification);
							const destinationPath = getNotificationDestinationPathV2(notification);
							const actorPath = getNotificationActorPathV2(notification.actorUsername);
							const isDismissing = dismissingIds.includes(notification.id);

							return (
								<div key={notification.id} className="group relative flex flex-col gap-2 bg-transparent px-1.5 py-1 pr-8">
									<Button
										type="button"
										variant="ghost"
										size="icon"
										aria-label="Dismiss notification"
										className="absolute right-0 top-0 h-7 w-7 text-muted-foreground opacity-100 transition-colors hover:bg-transparent hover:text-foreground md:opacity-60 md:group-hover:opacity-100"
										onClick={(event) => {
											event.stopPropagation();
											void handleDismiss(notification);
										}}
										disabled={isDismissing}
									>
										{isDismissing ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
									</Button>
									<div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
										<div className="min-w-0 space-y-1 md:flex md:min-w-0 md:items-center md:gap-2 md:space-y-0">
											<p className="text-sm font-medium leading-5 text-foreground/95">{displayMessage}</p>
											<div className="flex flex-wrap items-center gap-1.5 md:shrink-0">
												{notification.actorUsername && actorPath ? (
													<button
														type="button"
														className="inline-flex w-fit items-center rounded-full border border-border/60 px-2 py-0.5 text-[11px] font-medium text-muted-foreground transition-colors hover:border-foreground/25 hover:text-foreground"
														onClick={() => {
															router.push(actorPath);
														}}
													>
														@{notification.actorUsername}
													</button>
												) : null}
												{canOpenDestination && destinationPath ? (
													<button
														type="button"
														className="inline-flex w-fit items-center gap-1 text-[11px] text-muted-foreground underline underline-offset-4"
														onClick={() => {
															void markAsReadV2(notification.id);
															router.push(destinationPath);
														}}
													>
														<ExternalLink className="h-3.5 w-3.5" /> {getNotificationDestinationLabelV2(notification)}
													</button>
												) : null}
											</div>
										</div>
										<div className="flex items-center gap-2 md:shrink-0 md:self-center">
											<NotificationActionButtonsV2
												notification={notification}
												onResolveAction={completeLocalActionV2}
												compact
											/>
										</div>
									</div>
								</div>
							);
						})}
					</div>
				</div>
			</div>
		</div>
	);
}

