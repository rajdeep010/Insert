'use client'
import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Eye, EyeOff, Loader2, Settings, FileText, GitCommit } from 'lucide-react'
import { toast } from '@/components/ui/use-toast'
import { useInsertProjects } from '@/app/context/InsertProjectProvider'

interface EditReleaseBlogModalProps {
    isOpen: boolean
    onClose: () => void
    releaseBlog: any | null
    projectId: string
    isUpdating: boolean
}

interface ReleaseBlogUpdateConfig {
    releaseTitle: string
    visibility: 'public' | 'private'
    status: 'DRAFT' | 'PROCESSING' | 'PUBLISHED'
}

const EditReleaseBlogModal: React.FC<EditReleaseBlogModalProps> = ({
    isOpen,
    onClose,
    releaseBlog,
    projectId,
    isUpdating
}) => {
    const { data: session } = useSession()
    const [config, setConfig] = useState<ReleaseBlogUpdateConfig>({
        releaseTitle: '',
        visibility: 'private',
        status: 'DRAFT'
    })

    const [hasChanges, setHasChanges] = useState(false)

    const { updateReleaseBlog } = useInsertProjects()

    // Initialize config when releaseBlog data is available
    useEffect(() => {
        if (releaseBlog) {
            const initialConfig = {
                releaseTitle: releaseBlog.releaseTitle || releaseBlog.blogTitle || '',
                visibility: releaseBlog.visibility || 'private',
                status: releaseBlog.status || 'DRAFT'
            }
            setConfig(initialConfig)
            setHasChanges(false)
        }
    }, [releaseBlog])

    // Check for changes
    useEffect(() => {
        if (!releaseBlog) return

        const hasConfigChanges =
            config.releaseTitle !== (releaseBlog.releaseTitle || releaseBlog.blogTitle || '') ||
            config.visibility !== (releaseBlog.visibility || 'private') ||
            config.status !== (releaseBlog.status || 'DRAFT')

        setHasChanges(hasConfigChanges)
    }, [config, releaseBlog])

    const handleSubmit = async () => {
        if (!releaseBlog || !hasChanges) return

        console.log('projectid, releaseblog', projectId, releaseBlog)

        try {
            await updateReleaseBlog(projectId, releaseBlog._id, {
                releaseTitle: config.releaseTitle,
                visibility: config.visibility,
                status: config.status,
            })

            onClose()
        } catch (error) {
            toast({
                title: "Error ❌",
                description: "Failed to update release blog",
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

    if (!releaseBlog) return null

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto custom-small-scrollbar">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Settings className="h-5 w-5" />
                        <span>Edit Release Blog</span>
                    </DialogTitle>
                    <DialogDescription>
                        Update your release blog settings and metadata
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Current Blog Info */}
                    <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                        <div className="flex items-center gap-2 mb-3">
                            <FileText className="h-4 w-4" />
                            <span className="font-medium text-sm">Current Blog Info</span>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="text-gray-500 dark:text-gray-400">Created</span>
                                <p className="font-medium">{formatDate(releaseBlog.createdAt)}</p>
                            </div>
                            <div>
                                <span className="text-gray-500 dark:text-gray-400">Last Edited</span>
                                <p className="font-medium">{formatDate(releaseBlog.lastEdited)}</p>
                            </div>
                            {releaseBlog.commitId && (
                                <div className="col-span-2">
                                    <span className="text-gray-500 dark:text-gray-400">Commit ID</span>
                                    <div className="flex items-center gap-2 mt-1">
                                        <GitCommit className="h-3 w-3" />
                                        <code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                                            {releaseBlog.commitId}
                                        </code>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <Separator />

                    {/* Editable Configuration */}
                    <div className="space-y-6">
                        {/* Release Title */}
                        <div className="space-y-2">
                            <Label htmlFor="release-title" className="text-sm font-medium">
                                Release Title
                            </Label>
                            <Input
                                id="release-title"
                                placeholder="Enter release title"
                                value={config.releaseTitle}
                                onChange={(e) => setConfig(prev => ({ ...prev, releaseTitle: e.target.value }))}
                            />
                            <p className="text-xs text-gray-500">
                                This title will be displayed in the project's release list
                            </p>
                        </div>

                        {/* Visibility Setting */}
                        <div className="space-y-2">
                            <Label htmlFor="visibility" className="text-sm font-medium">
                                Visibility
                            </Label>
                            <Select
                                value={config.visibility}
                                onValueChange={(value: 'public' | 'private') => setConfig(prev => ({ ...prev, visibility: value }))}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="public">
                                        <div className="flex items-center gap-2">
                                            <Eye className="h-4 w-4" />
                                            Public - Visible to everyone
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="private">
                                        <div className="flex items-center gap-2">
                                            <EyeOff className="h-4 w-4" />
                                            Private - Only visible to you
                                        </div>
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-gray-500">
                                Control who can view this release blog
                            </p>
                        </div>

                        {/* Status Setting */}
                        <div className="space-y-2">
                            <Label htmlFor="status" className="text-sm font-medium">
                                Status
                            </Label>
                            <Select
                                value={config.status}
                                onValueChange={(value: 'DRAFT' | 'PUBLISHED' | 'PROCESSING') => setConfig(prev => ({ ...prev, status: value }))}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="DRAFT">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                                            Draft - Work in progress
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="PUBLISHED">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 bg-green-500 rounded-full" />
                                            Published - Live now
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="PROCESSING">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 bg-blue-500 rounded-full" />
                                            Processing - Being generated
                                        </div>
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-gray-500">
                                Set the current state of your release blog
                            </p>
                        </div>

                        {/* Current Status Display */}
                        <div className="p-3 border rounded-lg">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">Current Status</span>
                                <Badge className={`${getStatusColor(releaseBlog.status)} text-white text-xs`}>
                                    {releaseBlog.status}
                                </Badge>
                            </div>
                            {releaseBlog.errorMessage && (
                                <p className="text-xs text-red-600 dark:text-red-400 mt-2">
                                    Error: {releaseBlog.errorMessage}
                                </p>
                            )}
                        </div>

                        {/* Changes Indicator */}
                        {hasChanges && (
                            <div className="p-3 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
                                <p className="text-sm text-blue-700 dark:text-blue-300">
                                    ⚡ You have unsaved changes
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-4">
                        <Button
                            variant="outline"
                            onClick={onClose}
                            className="flex-1"
                            disabled={isUpdating}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            className="flex-1"
                            disabled={isUpdating || !hasChanges || !config.releaseTitle.trim()}
                        >
                            {isUpdating ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Updating...
                                </>
                            ) : (
                                'Save Changes'
                            )}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}

export default EditReleaseBlogModal