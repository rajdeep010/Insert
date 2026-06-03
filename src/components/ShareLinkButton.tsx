'use client'

import { Share2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import { shareLink } from '@/lib/share'

type ShareLinkButtonProps = {
	path: string
	title: string
	text?: string
	label?: string
	className?: string
	variant?: React.ComponentProps<typeof Button>['variant']
	size?: React.ComponentProps<typeof Button>['size']
	iconOnly?: boolean
}

export default function ShareLinkButton({
	path,
	title,
	text,
	label = 'Share',
	className,
	variant = 'outline',
	size = 'sm',
	iconOnly = false,
}: ShareLinkButtonProps) {
	const { toast } = useToast()

	const handleShare = async () => {
		try {
			const result = await shareLink({ path, title, text })
			if (result.method === 'clipboard') {
				toast({
					title: 'Link copied ✅',
					description: 'Copied to clipboard',
					variant: 'default',
				})
			}
			if (result.method === 'none') {
				toast({
					title: 'Share unavailable ⭕',
					description: 'Sharing is not available on this device.',
					variant: 'destructive',
				})
			}
		} catch (error: any) {
			if (error?.name === 'AbortError') return
			toast({
				title: 'Share failed ⭕',
				description: 'Unable to share this link right now.',
				variant: 'destructive',
			})
		}
	}

	return (
		<Button type="button" variant={variant} size={size} className={className} onClick={handleShare}>
			<Share2 className="h-4 w-4" />
			{!iconOnly ? <span className=""/> : null}
		</Button>
	)
}