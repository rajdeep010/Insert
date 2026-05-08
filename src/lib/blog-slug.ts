export const escapeRegex = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const normalizeBlogSlug = (value: string) => {
	return value
		.trim()
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/-+/g, "-")
		.replace(/^-|-$/g, "")
}

export const createBlogSlug = (title: string, suffix?: string) => {
	const baseSlug = normalizeBlogSlug(title)
	if (!suffix) return baseSlug
	return `${baseSlug}-${suffix}`
}