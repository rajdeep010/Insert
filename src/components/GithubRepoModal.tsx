'use client'
import React, { useEffect, useMemo, useState } from 'react'
import { useSession } from 'next-auth/react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { useInsertProjects } from '@/app/context/InsertProjectProvider'
import { GitHubLogoIcon } from '@radix-ui/react-icons'
import { Eye, EyeOff, GitFork, Loader2, Search, Star } from 'lucide-react'
import { toast } from '@/components/ui/use-toast'
import InsertIcon from './InsertIcon'

interface GitHubRepo {
    id: number
    name: string
    fullName: string
    description: string | null
    htmlUrl: string
    cloneUrl: string
    defaultBranch: string
    language: string | null
    isPrivate: boolean
    fork: boolean
    stargazersCount: number
    forksCount: number
    createdAt: string
    updatedAt: string
    pushedAt: string
}

interface GithubRepoModalProps {
    isOpen: boolean
    onClose: () => void
}

// Language colors mapping
const languageColors: Record<string, string> = {
    JavaScript: '#f1e05a',
    TypeScript: '#2b7489',
    Python: '#3572A5',
    Java: '#b07219',
    'C++': '#f34b7d',
    'C#': '#239120',
    PHP: '#4F5D95',
    Ruby: '#701516',
    Go: '#00ADD8',
    Rust: '#dea584',
    Swift: '#ffac45',
    Kotlin: '#A97BFF',
    Dart: '#00B4AB',
    HTML: '#e34c26',
    CSS: '#563d7c',
    Shell: '#89e051',
    Vue: '#4FC08D',
    React: '#61DAFB',
}

const GithubRepoModal: React.FC<GithubRepoModalProps> = ({ isOpen, onClose }) => {
    const { data: session } = useSession()
    const {
        githubRepos,
        isGithubReposLoading,
        fetchProjectsByUserGithubId,
        addProject,
        isProjectLoading
    } = useInsertProjects()

    const [searchQuery, setSearchQuery] = useState('')
    const [importingRepos, setImportingRepos] = useState<Set<number>>(new Set())

    // Filter repos based on search query
    const filteredRepos = useMemo(() => {
        if (!githubRepos) return []
        return githubRepos.filter(repo =>
            repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            repo.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            repo.language?.toLowerCase().includes(searchQuery.toLowerCase())
        )
    }, [githubRepos, searchQuery])

    // Fetch repos when modal opens
    useEffect(() => {
        if (isOpen && session?.user?.githubId) {
            fetchProjectsByUserGithubId(session.user.githubId)
        }
    }, [isOpen, session?.user?.githubId])

    const handleImportRepo = async (repo: GitHubRepo) => {
        try {
            setImportingRepos(prev => new Set(prev).add(repo.id))

            const projectData = {
                name: repo.name,
                repoUrl: repo.htmlUrl,
                defaultBranch: repo.defaultBranch,
                userId: session?.user?._id,
                username: session?.user?.username,
                visibility: repo.isPrivate ? 'private' : 'public',
                description: repo.description || '',
                language: repo.language || 'Unknown'
            }

            await addProject(projectData)

            toast({
                title: "Success",
                description: `Repository "${repo.name}" imported successfully!`,
                variant: "default",
            })
        } catch (error) {
            toast({
                title: "Error",
                description: `Failed to import repository "${repo.name}"`,
                variant: "destructive",
            })
        } finally {
            setImportingRepos(prev => {
                const newSet = new Set(prev)
                newSet.delete(repo.id)
                return newSet
            })
        }
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        })
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <InsertIcon className='border-2 p-[4px] bg-white border-gray-950 dark:border-gray-800' />
                        Import Project
                    </DialogTitle>
                </DialogHeader>

                {/* Search Input */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                        type="text"
                        placeholder="Search repositories..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>

                <Separator />

                {/* Repository List */}
                <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-small-scrollbar">
                    {isGithubReposLoading ? (
                        <div className="flex items-center justify-center h-40">
                            <div className="flex items-center gap-2">
                                <Loader2 className="h-6 w-6 animate-spin" />
                                <span>Loading projects...</span>
                            </div>
                        </div>
                    ) : filteredRepos.length === 0 ? (
                        <div className="flex items-center justify-center h-40 text-gray-500">
                            {searchQuery ? 'No projects found matching your search.' : 'No projects available.'}
                        </div>
                    ) : (
                        filteredRepos.map((repo: GitHubRepo) => (
                            <Card key={repo.id} className="transition-all hover:shadow-md">
                                <CardHeader className="pb-3">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <CardTitle className="text-lg font-semibold text-blue-600 hover:text-blue-800 transition-colors">
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
                                        <Button
                                            size="sm"
                                            className="ml-4"
                                            onClick={() => handleImportRepo(repo)}
                                            disabled={importingRepos.has(repo.id) || isProjectLoading}
                                        >
                                            {importingRepos.has(repo.id) ? (
                                                <>
                                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                    Importing...
                                                </>
                                            ) : (
                                                'Import'
                                            )}
                                        </Button>
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
                        ))
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}

export default GithubRepoModal