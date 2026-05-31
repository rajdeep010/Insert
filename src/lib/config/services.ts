const trimTrailingSlash = (value: string) => value.replace(/\/+$/, "")

const projectServiceOrigin = trimTrailingSlash(
	process.env.NEXT_PUBLIC_PROJECT_SERVICE_ORIGIN ??
		"https://insert-projects-service.onrender.com"
)

const paymentServiceOrigin = trimTrailingSlash(
	process.env.NEXT_PUBLIC_PAYMENT_SERVICE_ORIGIN ??
		"https://insert-payment-service.onrender.com"
)

const notificationServiceOrigin = trimTrailingSlash(
	process.env.NEXT_PUBLIC_NOTIFICATION_SERVICE_ORIGIN ??
		"https://insert-notification-service.onrender.com"
)

const notificationServiceV2Origin = trimTrailingSlash(
	process.env.NEXT_PUBLIC_NOTIFICATION_SERVICE_V2_ORIGIN ??
		"http://localhost:8080"
)

const collaborationServiceOrigin = trimTrailingSlash(
	process.env.NEXT_PUBLIC_COLLABORATION_SERVICE_ORIGIN ??
		"http://localhost:8081"
)

const appOrigin = trimTrailingSlash(
	process.env.NEXT_PUBLIC_APP_ORIGIN ??
		process.env.NEXTAUTH_URL ??
		(process.env.NODE_ENV === "production"
			? "https://insertshare.vercel.app"
			: "http://localhost:3001")
)

const cloudinaryCloudName = process.env.NEXT_PUBLIC_CLOUD_NAME ?? ""
const cloudinaryUploadPreset = process.env.NEXT_PUBLIC_CLOUD_PRESET ?? ""

export const externalServices = {
	project: {
		origin: projectServiceOrigin,
		baseUrl: `${projectServiceOrigin}/v1`,
		apiBaseUrl: `${projectServiceOrigin}/v1/api`,
		websocketUrl: projectServiceOrigin,
	},
	payment: {
		origin: paymentServiceOrigin,
		baseUrl: `${paymentServiceOrigin}/v1`,
	},
	notification: {
		origin: notificationServiceOrigin,
	},
	notificationV2: {
		origin: notificationServiceV2Origin,
		apiBaseUrl: notificationServiceV2Origin,
		websocketUrl: `${notificationServiceV2Origin}/ws`,
	},
	collaboration: {
		origin: collaborationServiceOrigin,
		apiBaseUrl: `${collaborationServiceOrigin}/api/v1`,
	},
	app: {
		origin: appOrigin,
	},
	cloudinary: {
		cloudName: cloudinaryCloudName,
		uploadPreset: cloudinaryUploadPreset,
		uploadUrl: cloudinaryCloudName
			? `https://api.cloudinary.com/v1_1/${cloudinaryCloudName}/image/upload`
			: "",
	},
}