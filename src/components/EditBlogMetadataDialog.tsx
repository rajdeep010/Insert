'use client'

import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import { useBlog } from '@/features/blog/context/BlogProvider'
import type { BlogEntry, BlogVisibility } from '@/types/blog'

type EditBlogMetadataDialogProps = {
	blog: BlogEntry | null
	open: boolean
	onOpenChange: (open: boolean) => void
}

export default function EditBlogMetadataDialog({ blog, open, onOpenChange }: EditBlogMetadataDialogProps) {
	const { updateBlogMetadata } = useBlog()
	const [title, setTitle] = useState('')
	const [visibility, setVisibility] = useState<BlogVisibility>('private')
	const [isSaving, setIsSaving] = useState(false)

	useEffect(() => {
		if (!open || !blog) return
		setTitle(blog.blogTitle || '')
		setVisibility(blog.type === 'public' ? 'public' : 'private')
	}, [blog, open])

	const handleSave = async () => {
		if (!blog?._id || !title.trim()) return
		setIsSaving(true)
		const updated = await updateBlogMetadata(blog._id, {
			blogTitle: title.trim(),
			type: visibility,
		})
		setIsSaving(false)
		if (updated) onOpenChange(false)
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Edit blog details</DialogTitle>
					<DialogDescription>Update the blog title and public or private visibility.</DialogDescription>
				</DialogHeader>
				<div className="space-y-4">
					<Input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Blog title" autoFocus />
					<Select value={visibility} onValueChange={(value: BlogVisibility) => setVisibility(value)}>
						<SelectTrigger>
							<SelectValue placeholder="Visibility" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="public">Public</SelectItem>
							<SelectItem value="private">Private</SelectItem>
						</SelectContent>
					</Select>
				</div>
				<DialogFooter>
					<Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
						Cancel
					</Button>
					<Button type="button" onClick={handleSave} disabled={isSaving || !title.trim()}>
						{isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save'}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}