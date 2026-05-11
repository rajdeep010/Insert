export type ShareLinkOptions = {
	path: string
	title: string
	text?: string
}

const toAbsoluteUrl = (path: string) => {
	if (typeof window === 'undefined') return path
	return new URL(path, window.location.origin).toString()
}

const escapeHtml = (value: string) =>
	value
		.replaceAll('&', '&amp;')
		.replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;')
		.replaceAll('"', '&quot;')
		.replaceAll("'", '&#39;')

export async function shareLink({ path, title, text }: ShareLinkOptions) {
	const url = toAbsoluteUrl(path)
	const plainText = text ? `${text}\n${url}` : `${title}\n${url}`
	const htmlText = `<a href="${escapeHtml(url)}">${escapeHtml(title)}</a>`

	if (typeof navigator !== 'undefined' && navigator.clipboard) {
		if (typeof ClipboardItem !== 'undefined' && navigator.clipboard.write) {
			await navigator.clipboard.write([
				new ClipboardItem({
					'text/plain': new Blob([plainText], { type: 'text/plain' }),
					'text/html': new Blob([htmlText], { type: 'text/html' }),
				}),
			])
			return { method: 'clipboard' as const, url }
		}

		if (navigator.clipboard.writeText) {
			await navigator.clipboard.writeText(plainText)
			return { method: 'clipboard' as const, url }
		}
	}

	return { method: 'none' as const, url }
}