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
import { GitBranch, Eye, EyeOff, Loader2, AlertCircle, Settings } from 'lucide-react'
import { toast } from '@/components/ui/use-toast'
import { useInsertProjects } from '@/features/project/context/InsertProjectProvider'

interface EditProjectModalProps {
    isOpen: boolean
    onClose: () => void
    project: any | null          // Pass the project object directly (NOT wrapped in { project: ... })
    isUpdating: boolean
}

interface ProjectUpdateConfig {
    name: string
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
        name: '',
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

    // Initialize config from project (direct object now)
    useEffect(() => {
        if (project) {
            const initialConfig: ProjectUpdateConfig = {
                name: project.name || '',
                defaultBranch: project.defaultBranch || '',
                monitorCommits: project.monitorCommits ?? false,
                releaseTriggerKeyword: project.releaseTriggerKeyword || '',
                visibility: project.visibility || 'private'
            }
            setConfig(initialConfig)
            setHasChanges(false)
        }
    }, [project])

    // Fetch branches when modal opens
    useEffect(() => {
        const fetchBranches = async () => {
            if (!project || !session?.user?.githubAccessToken || !isOpen) return

            setIsFetchingBranches(true)
            setBranchesError(null)

            try {
                const repoUrl: string | undefined = project.repoUrl
                if (!repoUrl) throw new Error('Missing repoUrl')
                const urlParts = repoUrl.replace('https://github.com/', '').split('/')
                const owner = urlParts[0]
                const repoName = project.name

                const fetchedBranches = await fetchRepositoryBranches(owner, repoName)
                setBranches(fetchedBranches)
            } catch (error) {
                setBranchesError('Failed to fetch repository branches')
                const fallbackBranches = [
                    project?.defaultBranch,
                    'main',
                    'master',
                    'develop'
                ].filter((b, i, arr) => b && arr.indexOf(b) === i) as string[]
                setBranches(fallbackBranches)
                toast({
                    title: 'Warning',
                    description: 'Could not fetch repository branches. Using fallback options.',
                    variant: 'destructive'
                })
            } finally {
                setIsFetchingBranches(false)
            }
        }

        fetchBranches()
    }, [project, session?.user?.githubAccessToken, isOpen, fetchRepositoryBranches])

    // Detect changes
    useEffect(() => {
        if (!project) return
        const changed =
            config.name !== project.name ||
            config.defaultBranch !== project.defaultBranch ||
            config.monitorCommits !== project.monitorCommits ||
            config.releaseTriggerKeyword !== project.releaseTriggerKeyword ||
            config.visibility !== project.visibility
        setHasChanges(changed)
    }, [config, project])

    const handleSubmit = async () => {
        if (!project || !hasChanges) return
        try {
            const updatedProject = {
                ...project,
                name: config.name,
                defaultBranch: config.defaultBranch,
                monitorCommits: config.monitorCommits,
                releaseTriggerKeyword: config.releaseTriggerKeyword,
                visibility: config.visibility,
                updatedAt: new Date().toISOString()
            }
            await updateProject(updatedProject)
            toast({
                title: 'Success ✅',
                description: 'Project settings updated successfully',
                variant: 'default'
            })
            onClose()
        } catch {
            toast({
                title: 'Error ❌',
                description: 'Failed to update project settings',
                variant: 'destructive'
            })
        }
    }

    if (!project) return null

    return (
        <Dialog
            open={isOpen}
            onOpenChange={(open) => {
                if (!open) onClose()
            }}
        >
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto custom-small-scrollbar">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Settings className="h-5 w-5" />
                        <span>Edit Project Settings</span>
                    </DialogTitle>
                    <DialogDescription />
                </DialogHeader>

                <div className="space-y-6">
                    <div className="space-y-6">
                        {/* Project Name */}
                        <div className="space-y-2">
                            <Label htmlFor="project-name" className="text-sm font-medium">
                                Project Name
                            </Label>
                            <Input
                                id="project-name"
                                placeholder="Project Name"
                                value={config.name}
                                onChange={(e) =>
                                    setConfig((p) => ({ ...p, name: e.target.value }))
                                }
                            />
                        </div>

                        {/* Branch */}
                        <div className="space-y-2">
                            <Label htmlFor="branch" className="text-sm font-medium">
                                Select Branch to Monitor
                            </Label>
                            <Select
                                value={config.defaultBranch}
                                onValueChange={(value) =>
                                    setConfig((p) => ({ ...p, defaultBranch: value }))
                                }
                                disabled={isFetchingBranches}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue
                                        placeholder={
                                            isFetchingBranches ? 'Loading branches...' : 'Select a branch'
                                        }
                                    />
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
                                                    {branch === project.defaultBranch && (
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

                        {/* Monitor Commits */}
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
                                onCheckedChange={(checked) =>
                                    setConfig((p) => ({ ...p, monitorCommits: checked }))
                                }
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
                                onChange={(e) =>
                                    setConfig((p) => ({
                                        ...p,
                                        releaseTriggerKeyword: e.target.value
                                    }))
                                }
                                placeholder="e.g. RELEASE, VERSION, DEPLOY"
                                className="w-full"
                            />
                            <p className="text-xs text-gray-500">
                                Commits containing this keyword will trigger release blog generation
                            </p>
                        </div>

                        {/* Visibility */}
                        <div className="space-y-2">
                            <Label htmlFor="visibility" className="text-sm font-medium">
                                Project Visibility
                            </Label>
                            <Select
                                value={config.visibility}
                                onValueChange={(value: 'public' | 'private') =>
                                    setConfig((p) => ({ ...p, visibility: value }))
                                }
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

                        {/* Unsaved Changes */}
                        {hasChanges && (
                            <div className="p-3 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
                                <p className="text-sm text-blue-700 dark:text-blue-300">
                                    ⚡ You have unsaved changes
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Actions */}
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
                            disabled={
                                isUpdating ||
                                !hasChanges ||
                                !config.defaultBranch ||
                                !config.releaseTriggerKeyword ||
                                isFetchingBranches
                            }
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