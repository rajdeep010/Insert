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
import { GitBranch, Eye, EyeOff, GitFork, Star, Loader2, AlertCircle } from 'lucide-react'
import { GitHubRepo } from '@/types/types'
import { languageColors } from '@/types/master-data'
import { toast } from '@/components/ui/use-toast'
import { useInsertProjects } from '@/app/context/InsertProjectProvider'
import InsertIcon from './InsertIcon'

interface ImportConfigModalProps {
    isOpen: boolean
    onClose: () => void
    repo: GitHubRepo | null
    onConfirm: (config: ImportConfig) => void
    isCreating: boolean
}

interface ImportConfig {
    defaultBranch: string
    monitorCommits: boolean
    releaseTriggerKeyword: string
    visibility: 'public' | 'private'
}

const ImportConfigModal: React.FC<ImportConfigModalProps> = ({
    isOpen,
    onClose,
    repo,
    onConfirm,
    isCreating
}) => {
    const { data: session } = useSession()
    const [config, setConfig] = useState<ImportConfig>({
        defaultBranch: '',
        monitorCommits: true,
        releaseTriggerKeyword: '',
        visibility: 'private'
    })

    const [branches, setBranches] = useState<string[]>([])
    const [isFetchingBranches, setIsFetchingBranches] = useState(false)
    const [branchesError, setBranchesError] = useState<string | null>(null)

    const { fetchRepositoryBranches } = useInsertProjects()

    // Fetch branches when modal opens and repo is selected
    useEffect(() => {
        const fetchBranches = async () => {
            if (!repo || !session?.user?.githubAccessToken || !isOpen) return

            setIsFetchingBranches(true)
            setBranchesError(null)

            try {
                // Extract owner from full name (e.g., "rajdeep010/insert-project-service" -> "rajdeep010")
                const owner = repo?.fullName.split('/')[0]
                const repoName = repo?.name

                const fetchedBranches = await fetchRepositoryBranches(
                    owner,
                    repoName
                )

                setBranches(fetchedBranches)

                // Set default branch if available
                if (fetchedBranches.length > 0) {
                    const defaultBranch = repo.defaultBranch && fetchedBranches.includes(repo.defaultBranch)
                        ? repo.defaultBranch
                        : fetchedBranches[0]

                    setConfig(prev => ({
                        ...prev,
                        defaultBranch
                    }))
                }
            } catch (error) {
                console.error('Failed to fetch branches:', error)
                setBranchesError('Failed to fetch repository branches')

                // Fallback to default branches
                const fallbackBranches = [repo.defaultBranch || 'main', 'master', 'develop'].filter(Boolean)
                setBranches(fallbackBranches)
                setConfig(prev => ({
                    ...prev,
                    defaultBranch: repo.defaultBranch || 'main'
                }))

                toast({
                    title: "Warning",
                    description: "Could not fetch repository branches. Using default options.",
                    variant: "destructive",
                })
            } finally {
                setIsFetchingBranches(false)
            }
        }

        fetchBranches()
    }, [repo, session?.user?.githubAccessToken, isOpen])

    useEffect(() => {
        if (repo) {
            setConfig(prev => ({
                ...prev,
                visibility: repo.isPrivate ? 'private' : 'public'
            }))
        }
    }, [repo])

    const handleSubmit = () => {
        onConfirm(config)
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        })
    }

    if (!repo) return null

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto custom-small-scrollbar">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <InsertIcon className='bg-white p-[4px] border-2'/>
                        <span>Configure Import Settings</span>
                    </DialogTitle>
                    <DialogDescription className="sr-only">
                                                
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Repository Preview */}
                    <Card className="border-2 border-blue-200 dark:border-blue-800">
                        <CardHeader className="pb-3">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <CardTitle className="text-lg font-semibold text-blue-600">
                                            {repo.name}
                                        </CardTitle>
                                        <Badge variant={repo.isPrivate ? "destructive" : "secondary"} className="text-xs">
                                            {repo.isPrivate ? (
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
                                        {repo.fork && (
                                            <Badge variant="outline" className="text-xs">
                                                <GitFork className="h-3 w-3 mr-1" />
                                                Fork
                                            </Badge>
                                        )}
                                    </div>
                                    <CardDescription className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                                        {repo.description || 'No description available'}
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4 text-sm text-gray-500">
                                    {repo.language && (
                                        <div className="flex items-center gap-1">
                                            <div
                                                className="w-3 h-3 rounded-full"
                                                style={{ backgroundColor: languageColors[repo.language] || '#586069' }}
                                            />
                                            <span>{repo.language}</span>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-1">
                                        <Star className="h-3 w-3" />
                                        <span>{repo.stargazersCount}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <GitFork className="h-3 w-3" />
                                        <span>{repo.forksCount}</span>
                                    </div>
                                </div>
                                <div className="text-xs text-gray-400">
                                    Updated {formatDate(repo.updatedAt)}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Separator />

                    {/* Configuration Form */}
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
                                                    {branch === repo.defaultBranch && (
                                                        <Badge variant="outline" className="text-xs ml-1">
                                                            default
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
                                    Track commits and automatically generate release notes
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
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-4">
                        <Button
                            variant="outline"
                            onClick={onClose}
                            className="flex-1"
                            disabled={isCreating}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            className="flex-1"
                            disabled={isCreating || !config.defaultBranch || !config.releaseTriggerKeyword || isFetchingBranches}
                        >
                            {isCreating ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Please Wait...
                                </>
                            ) : (
                                'Create Project'
                            )}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}

export default ImportConfigModal