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
	cloudinary: {
		cloudName: cloudinaryCloudName,
		uploadPreset: cloudinaryUploadPreset,
		uploadUrl: cloudinaryCloudName
			? `https://api.cloudinary.com/v1_1/${cloudinaryCloudName}/image/upload`
			: "",
	},
}