'use client'

import Script from "next/script";

import { BlogProvider } from "@/features/blog/context/BlogProvider";
import { NotificationProvider } from "@/features/notification/context/NotificationProvider";
import { InsertPaymentProvider } from "@/features/payment/context/InsertPaymentProvider";
import { InsertProjectProvider } from "@/features/project/context/InsertProjectProvider";
import { InsertTopicProvider } from "@/features/topic/context/InsertTopicProvider";
import { InsertUserProvider } from "@/features/user/context/InsertUserProvider";

export default function AppFeatureProviders({ children }: { children: React.ReactNode }) {
	return (
		<NotificationProvider>
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
		</NotificationProvider>
	)
}