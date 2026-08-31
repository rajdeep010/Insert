'use client'

import Script from "next/script";

import NotificationContextBannerV2 from "@/components/notifications-v2/NotificationContextBannerV2";
import { BlogProvider } from "@/features/blog/context/BlogProvider";
import { CollaborationProviderV2 } from "@/features/collaboration-v2/context/CollaborationProviderV2";
import { NotificationProviderV2 } from "@/features/notification-v2/context/NotificationProviderV2";
import { InsertPaymentProvider } from "@/features/payment/context/InsertPaymentProvider";
import { InsertProjectProvider } from "@/features/project/context/InsertProjectProvider";
import { InsertTopicProvider } from "@/features/topic/context/InsertTopicProvider";
import { InsertUserProvider } from "@/features/user/context/InsertUserProvider";

export default function AppFeatureProviders({ children }: { children: React.ReactNode }) {
	return (
		<NotificationProviderV2>
			<CollaborationProviderV2>
				<NotificationContextBannerV2 />
				<InsertUserProvider>
					<InsertTopicProvider>
						<InsertProjectProvider>
							<InsertPaymentProvider>
								<BlogProvider>
									<Script
										src="https://checkout.razorpay.com/v1/checkout.js"
										strategy="afterInteractive"
									/>
									{children}
								</BlogProvider>
							</InsertPaymentProvider>
						</InsertProjectProvider>
					</InsertTopicProvider>
				</InsertUserProvider>
			</CollaborationProviderV2>
		</NotificationProviderV2>
	)
}