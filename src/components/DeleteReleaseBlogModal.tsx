'use client'
import React, { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { AlertTriangle, Loader2, Trash2, FileText, GitCommit, Clock, X } from 'lucide-react'
import { toast } from '@/components/ui/use-toast'
import { useInsertProjects } from '@/features/project/context/InsertProjectProvider'

interface DeleteReleaseBlogModalProps {
    isOpen: boolean
    onClose: () => void
    releaseBlog: any | null
    projectId: string
    isDeleting: boolean
}

const DeleteReleaseBlogModal: React.FC<DeleteReleaseBlogModalProps> = ({
    isOpen,
    onClose,
    releaseBlog,
    projectId,
    isDeleting
}) => {
    const [confirmationText, setConfirmationText] = useState('')
    const { removeReleaseBlog } = useInsertProjects()

    const blogTitle = releaseBlog?.releaseTitle || releaseBlog?.blogTitle || 'Untitled Release'
    const isConfirmationValid = confirmationText === blogTitle

    const handleDelete = async () => {
        if (!releaseBlog || !isConfirmationValid) return

        try {
            await removeReleaseBlog(projectId, releaseBlog._id)
            onClose()
            setConfirmationText('')
        } catch (error) {
            toast({
                title: "Error ❌",
                description: "Failed to delete release blog",
                variant: "destructive",
            })
        }
    }

    const formatDate = (dateString: string) => {
        if (!dateString) return 'Not set'
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PUBLISHED':
                return 'bg-green-500'
            case 'DRAFT':
                return 'bg-yellow-500'
            case 'PROCESSING':
                return 'bg-blue-500'
            default:
                return 'bg-gray-500'
        }
    }

    const handleClose = () => {
        setConfirmationText('')
        onClose()
    }

    if (!releaseBlog) return null

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto custom-small-scrollbar">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
                        <AlertTriangle className="h-5 w-5" />
                        <span>Delete Release Blog</span>
                    </DialogTitle>
                    <DialogDescription>
                        This action cannot be undone. This will permanently delete the release blog and remove all associated data.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Warning Box */}
                    <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                            <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
                            <span className="font-medium text-red-800 dark:text-red-200">Warning</span>
                        </div>
                        <ul className="text-sm text-red-700 dark:text-red-300 space-y-1 ml-6 list-disc">
                            <li>This will permanently delete the release blog</li>
                            <li>All content and metadata will be lost</li>
                            <li>This action cannot be undone</li>
                            <li>Any external links to this blog will break</li>
                        </ul>
                    </div>

                    <Separator />

                    {/* Confirmation Input */}
                    <div className="space-y-3">
                        <Label htmlFor="confirmation" className="text-sm font-medium">
                            Type the blog title to confirm deletion:
                        </Label>
                        <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-md">
                            <code className="text-sm font-mono">{blogTitle}</code>
                        </div>
                        <Input
                            id="confirmation"
                            placeholder="Type the blog title here..."
                            value={confirmationText}
                            onChange={(e) => setConfirmationText(e.target.value)}
                            className={`${
                                confirmationText && !isConfirmationValid 
                                    ? 'border-red-500 focus:border-red-500' 
                                    : isConfirmationValid 
                                        ? 'border-green-500 focus:border-green-500' 
                                        : ''
                            }`}
                            autoComplete="off"
                        />
                        {confirmationText && !isConfirmationValid && (
                            <p className="text-sm text-red-600 dark:text-red-400">
                                The blog title doesn&apos;t match. Please type it exactly as shown above.
                            </p>
                        )}
                        {isConfirmationValid && (
                            <p className="text-sm text-green-600 dark:text-green-400">
                                ✓ Confirmation text matches. You can now delete the blog.
                            </p>
                        )}
                    </div>
                </div>

                <DialogFooter className="gap-2 pt-4">
                    <Button
                        variant="outline"
                        onClick={handleClose}
                        disabled={isDeleting}
                        className="flex-1 sm:flex-none"
                    >
                        <X className="h-4 w-4" />
                        Cancel
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={handleDelete}
                        disabled={isDeleting || !isConfirmationValid}
                        className="flex-1 sm:flex-none"
                    >
                        {isDeleting ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Deleting...
                            </>
                        ) : (
                            <>
                                <Trash2 className="h-4 w-4" />
                                Delete Blog
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default DeleteReleaseBlogModal