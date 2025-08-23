'use client'
import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { GitBranch, Eye, EyeOff, Loader2, AlertCircle, Settings } from 'lucide-react'
import { toast } from '@/components/ui/use-toast'
import { useInsertProjects } from '@/app/context/InsertProjectProvider'
import InsertIcon from './InsertIcon'

interface EditProjectModalProps {
    isOpen: boolean
    onClose: () => void
    project: any | null
    isUpdating: boolean
}

interface ProjectUpdateConfig {
    defaultBranch: string
    monitorCommits: boolean
    releaseTriggerKeyword: string
    visibility: 'public' | 'private'
}

const EditProjectModal: React.FC<EditProjectModalProps> = ({
    isOpen,
    onClose,
    project,
    isUpdating
}) => {
    const { data: session } = useSession()
    const [config, setConfig] = useState<ProjectUpdateConfig>({
        defaultBranch: '',
        monitorCommits: true,
        releaseTriggerKeyword: '',
        visibility: 'private'
    })

    const [branches, setBranches] = useState<string[]>([])
    const [isFetchingBranches, setIsFetchingBranches] = useState(false)
    const [branchesError, setBranchesError] = useState<string | null>(null)
    const [hasChanges, setHasChanges] = useState(false)

    const { fetchRepositoryBranches, updateProject } = useInsertProjects()

    // Initialize config when project data is available
    useEffect(() => {
        if (project?.project) {
            const initialConfig = {
                defaultBranch: project.project.defaultBranch || '',
                monitorCommits: project.project.monitorCommits || false,
                releaseTriggerKeyword: project.project.releaseTriggerKeyword || '',
                visibility: project.project.visibility || 'private'
            }
            setConfig(initialConfig)
            setHasChanges(false)
        }
    }, [project])

    // Fetch branches when modal opens
    useEffect(() => {
        const fetchBranches = async () => {
            if (!project?.project || !session?.user?.githubAccessToken || !isOpen) return

            setIsFetchingBranches(true)
            setBranchesError(null)

            try {
                // Extract owner and repo name from repoUrl
                const repoUrl = project.project.repoUrl
                const urlParts = repoUrl.replace('https://github.com/', '').split('/')
                const owner = urlParts[0]
                const repoName = urlParts[1]

                const fetchedBranches = await fetchRepositoryBranches(
                    owner,
                    repoName,
                    session.user.githubAccessToken
                )

                setBranches(fetchedBranches)
            } catch (error) {
                console.error('Failed to fetch branches:', error)
                setBranchesError('Failed to fetch repository branches')

                // Fallback to current branch and common defaults
                const fallbackBranches = [
                    project.project.defaultBranch,
                    'main',
                    'master',
                    'develop'
                ].filter((branch, index, arr) => branch && arr.indexOf(branch) === index)

                setBranches(fallbackBranches)

                toast({
                    title: "Warning",
                    description: "Could not fetch repository branches. Using fallback options.",
                    variant: "destructive",
                })
            } finally {
                setIsFetchingBranches(false)
            }
        }

        fetchBranches()
    }, [project, session?.user?.githubAccessToken, isOpen])

    // Check for changes
    useEffect(() => {
        if (!project?.project) return

        const hasConfigChanges =
            config.defaultBranch !== project.project.defaultBranch ||
            config.monitorCommits !== project.project.monitorCommits ||
            config.releaseTriggerKeyword !== project.project.releaseTriggerKeyword ||
            config.visibility !== project.project.visibility

        setHasChanges(hasConfigChanges)
    }, [config, project])

    const handleSubmit = async () => {
        if (!project?.project || !hasChanges) return

        try {
            const updatedProject = {
                ...project.project,
                defaultBranch: config.defaultBranch,
                monitorCommits: config.monitorCommits,
                releaseTriggerKeyword: config.releaseTriggerKeyword,
                visibility: config.visibility,
                updatedAt: new Date().toISOString()
            }

            await updateProject(updatedProject)

            toast({
                title: "Success ✅",
                description: "Project settings updated successfully",
                variant: "default",
            })

            onClose()
        } catch (error) {
            toast({
                title: "Error ❌",
                description: "Failed to update project settings",
                variant: "destructive",
            })
        }
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    if (!project?.project) return null

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto custom-small-scrollbar">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Settings className="h-5 w-5" />
                        <span>Edit Project Settings</span>
                    </DialogTitle>
                    <DialogDescription>
                        {/* Update your project configuration and monitoring settings */}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Project Overview - Read Only */}
                    {/* <Card className="border-2 border-gray-200 dark:border-gray-700">
                        <CardHeader className="pb-3">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <CardTitle className="text-lg font-semibold">
                                            {project.project.name}
                                        </CardTitle>
                                        <Badge variant={project.project.visibility === 'private' ? "destructive" : "secondary"} className="text-xs">
                                            {project.project.visibility === 'private' ? (
                                                <>
                                                    <EyeOff className="h-3 w-3 mr-1" />
                                                    Private
                                                </>
                                            ) : (
                                                <>
                                                    <Eye className="h-3 w-3 mr-1" />
                                                    Public
                                                </>
                                            )}
                                        </Badge>
                                    </div>
                                    <CardDescription className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                                        {project.project.username} • {project.project.language || 'Unknown'}
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                            <div className="flex items-center justify-between text-sm text-gray-500">
                                <div>
                                    <span className="font-medium">Repository:</span> {project.project.repoUrl.replace('https://github.com/', '')}
                                </div>
                                <div>
                                    <span className="font-medium">Updated:</span> {formatDate(project.project.updatedAt)}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Separator /> */}

                    {/* Editable Configuration */}
                    <div className="space-y-6">
                        {/* Branch Selection */}
                        <div className="space-y-2">
                            <Label htmlFor="branch" className="text-sm font-medium">
                                Default Branch to Monitor
                            </Label>
                            <Select
                                value={config.defaultBranch}
                                onValueChange={(value) => setConfig(prev => ({ ...prev, defaultBranch: value }))}
                                disabled={isFetchingBranches}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder={isFetchingBranches ? "Loading branches..." : "Select a branch"} />
                                </SelectTrigger>
                                <SelectContent>
                                    {isFetchingBranches ? (
                                        <SelectItem value="loading" disabled>
                                            <div className="flex items-center gap-2">
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                Loading branches...
                                            </div>
                                        </SelectItem>
                                    ) : (
                                        branches.map((branch) => (
                                            <SelectItem key={branch} value={branch}>
                                                <div className="flex items-center gap-2">
                                                    <GitBranch className="h-4 w-4" />
                                                    {branch}
                                                    {branch === project.project.defaultBranch && (
                                                        <Badge variant="outline" className="text-xs ml-1">
                                                            current
                                                        </Badge>
                                                    )}
                                                </div>
                                            </SelectItem>
                                        ))
                                    )}
                                </SelectContent>
                            </Select>
                            {branchesError && (
                                <div className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
                                    <AlertCircle className="h-3 w-3" />
                                    <span>{branchesError}</span>
                                </div>
                            )}
                            <p className="text-xs text-gray-500">
                                This branch will be monitored for commits and releases
                            </p>
                        </div>

                        {/* Monitor Commits Toggle */}
                        <div className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="space-y-1">
                                <Label htmlFor="monitor-commits" className="text-sm font-medium">
                                    Monitor Commits
                                </Label>
                                <p className="text-xs text-gray-500">
                                    Track commits and automatically generate release blogs
                                </p>
                            </div>
                            <Switch
                                id="monitor-commits"
                                checked={config.monitorCommits}
                                onCheckedChange={(checked) => setConfig(prev => ({ ...prev, monitorCommits: checked }))}
                            />
                        </div>

                        {/* Release Trigger Keyword */}
                        <div className="space-y-2">
                            <Label htmlFor="trigger-keyword" className="text-sm font-medium">
                                Release Trigger Keyword
                            </Label>
                            <Input
                                id="trigger-keyword"
                                value={config.releaseTriggerKeyword}
                                onChange={(e) => setConfig(prev => ({ ...prev, releaseTriggerKeyword: e.target.value }))}
                                placeholder="e.g. RELEASE, VERSION, DEPLOY"
                                className="w-full"
                            />
                            <p className="text-xs text-gray-500">
                                Commits containing this keyword will trigger release blog generation
                            </p>
                        </div>

                        {/* Visibility Setting */}
                        <div className="space-y-2">
                            <Label htmlFor="visibility" className="text-sm font-medium">
                                Project Visibility
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
                                Control who can view your project and its release blogs
                            </p>
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
                            disabled={isUpdating || !hasChanges || !config.defaultBranch || !config.releaseTriggerKeyword || isFetchingBranches}
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

export default EditProjectModal