"use client";

import { ExternalLink } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

import NotificationActionButtonsV2 from "@/components/notifications-v2/NotificationActionButtonsV2";
import { Badge } from "@/components/ui/badge";
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
	const {
		contextualNotifications,
		completeLocalActionV2,
		markAsReadV2,
	} = useNotificationsV2();

	const notifications = contextualNotifications.filter((item) => isNotificationActionableV2(item));

	if (!notifications.length) {
		return null;
	}

	return (
		<div className="mx-auto w-full max-w-6xl px-4 pt-4 sm:px-6 lg:px-8">
			<div className="w-full rounded-[20px] border border-amber-500/20 bg-amber-500/10 px-4 py-3 shadow-sm">
				<div className="space-y-2">
					<div className="space-y-2">
						{notifications.map((notification) => {
							const entityLabel = formatNotificationEntityLabelV2(notification.entityType);
							const canOpenDestination = canOpenNotificationDestinationV2(notification, pathname);
							const displayMessage = getNotificationDisplayMessageV2(notification);
							const destinationPath = getNotificationDestinationPathV2(notification);
							const actorPath = getNotificationActorPathV2(notification.actorUsername);

							return (
								<div key={notification.id} className="flex flex-col gap-3 rounded-[16px] bg-transparent px-2 py-1">
									<div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
										<div className="min-w-0 space-y-1">
											<p className="text-sm font-medium leading-5 text-foreground/95">{displayMessage}</p>
											<div className="flex flex-wrap items-center gap-2">
												{notification.actorUsername && actorPath ? (
													<button
														type="button"
														className="inline-flex w-fit items-center rounded-full border border-border/70 px-2.5 py-1 text-xs font-medium text-muted-foreground transition-colors hover:border-foreground/20 hover:text-foreground"
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
														className="inline-flex w-fit items-center gap-1 text-xs text-muted-foreground underline underline-offset-4"
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
										<div className="flex items-center gap-2 md:shrink-0 md:self-start">
											<NotificationActionButtonsV2
												notification={notification}
												onResolveAction={completeLocalActionV2}
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

