'use client'
import React, { useEffect, useState } from 'react'
import {
    Star,
    GitBranch,
    ExternalLink,
    Calendar,
    Users,
    BookOpen,
    Tag,
    Clock,
    Eye,
    GitCommit,
    Download,
    Loader2
} from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useInsertProjects } from '@/app/context/InsertProjectProvider'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ProjectResponse } from '@/types/types'




export default function page() {
    const params = useParams()
    const { curr_project, releaseBlogs, isProjectLoading } = useInsertProjects()


    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
    }

    const formatRelativeTime = (dateString: string) => {
        const date = new Date(dateString)
        const now = new Date()
        const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

        if (diffInHours < 24) {
            return `${diffInHours} hours ago`
        } else {
            const diffInDays = Math.floor(diffInHours / 24)
            return `${diffInDays} days ago`
        }
    }

    if (!curr_project) return null

    return (
        <div className="max-w-6xl mx-auto p-6 space-y-8">
            {/* Project Header */}
            
            {curr_project && <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
                <CardHeader className="pb-6">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                            <Avatar className="h-16 w-16">
                                <AvatarImage src={`https://github.com/${curr_project.username}.png`} />
                                <AvatarFallback>{curr_project.username.slice(0, 2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <CardTitle className="text-3xl font-bold text-gray-900 dark:text-white">
                                        {curr_project.name}
                                    </CardTitle>
                                    <Badge variant={curr_project.visibility === 'private' ? 'destructive' : 'secondary'}>
                                        {curr_project.visibility}
                                    </Badge>
                                </div>
                                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                                    <span>{curr_project.username}</span>
                                    <span>•</span>
                                    <span>Updated {formatRelativeTime(curr_project.updatedAt)}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <Button variant="outline" size="sm">
                                <Star className="h-4 w-4 mr-2" />
                                Star
                            </Button>
                            <Button asChild size="sm">
                                <Link href={curr_project.repoUrl} target="_blank" rel="noopener noreferrer">
                                    <ExternalLink className="h-4 w-4 mr-2" />
                                    View Repository
                                </Link>
                            </Button>
                        </div>
                    </div>

                    <CardDescription className="text-lg text-gray-700 dark:text-gray-300 mt-4">
                        {curr_project.description || 'No description available for this project.'}
                    </CardDescription>

                    {/* Project Stats */}
                    <div className="flex items-center gap-6 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-2">
                            <GitBranch className="h-4 w-4 text-gray-500" />
                            <span className="text-sm text-gray-600 dark:text-gray-400">{curr_project.defaultBranch}</span>
                        </div>
                        {curr_project.language && (
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                                <span className="text-sm text-gray-600 dark:text-gray-400">{curr_project.language}</span>
                            </div>
                        )}
                        <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-500" />
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                Created {formatDate(curr_project.createdAt)}
                            </span>
                        </div>
                        {curr_project.lastMonitoredCommitSha && (
                            <div className="flex items-center gap-2">
                                <GitCommit className="h-4 w-4 text-gray-500" />
                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                    {curr_project.lastMonitoredCommitSha.substring(0, 7)}
                                </span>
                            </div>
                        )}
                    </div>
                </CardHeader>
            </Card>}

            {curr_project && <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Release Blogs */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <BookOpen className="h-6 w-6" />
                            Release Blogs
                        </h2>
                        <Badge variant="outline" className="text-sm">
                            {releaseBlogs?.length || 0} releases
                        </Badge>
                    </div>

                    {releaseBlogs && releaseBlogs.length > 0 ? (
                        <div className="space-y-4">
                            {releaseBlogs.map((blog) => (
                                <Card key={blog.id} className="hover:shadow-md transition-shadow duration-200">
                                    <CardHeader className="pb-4">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <CardTitle className="text-xl font-semibold">
                                                        {blog.title}
                                                    </CardTitle>
                                                    {blog.version && (
                                                        <Badge variant="secondary" className="text-xs">
                                                            <Tag className="h-3 w-3 mr-1" />
                                                            {blog.version}
                                                        </Badge>
                                                    )}
                                                </div>

                                                <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                                                    <div className="flex items-center gap-1">
                                                        <Clock className="h-4 w-4" />
                                                        {formatDate(blog.publishedAt)}
                                                    </div>
                                                    {blog.author && (
                                                        <div className="flex items-center gap-2">
                                                            <Avatar className="h-5 w-5">
                                                                <AvatarImage src={blog.author.avatar} />
                                                                <AvatarFallback>
                                                                    {blog.author.name.slice(0, 2).toUpperCase()}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                            <span>{blog.author.name}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {blog.content && (
                                            <CardDescription className="mt-3 text-gray-600 dark:text-gray-300 leading-relaxed">
                                                {blog.content.length > 200
                                                    ? `${blog.content.substring(0, 200)}...`
                                                    : blog.content
                                                }
                                            </CardDescription>
                                        )}

                                        {/* Blog Stats */}
                                        <div className="flex items-center justify-between pt-3 mt-3 border-t border-gray-200 dark:border-gray-700">
                                            <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                                                {blog.viewCount && (
                                                    <div className="flex items-center gap-1">
                                                        <Eye className="h-3 w-3" />
                                                        {blog.viewCount} views
                                                    </div>
                                                )}
                                                {blog.downloadCount && (
                                                    <div className="flex items-center gap-1">
                                                        <Download className="h-3 w-3" />
                                                        {blog.downloadCount} downloads
                                                    </div>
                                                )}
                                            </div>

                                            {blog.tags && blog.tags.length > 0 && (
                                                <div className="flex items-center gap-2">
                                                    {blog.tags.slice(0, 3).map((tag: any, index: number) => (
                                                        <Badge key={index} variant="outline" className="text-xs">
                                                            {tag}
                                                        </Badge>
                                                    ))}
                                                    {blog.tags.length > 3 && (
                                                        <span className="text-xs text-gray-500">
                                                            +{blog.tags.length - 3}
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </CardHeader>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <Card>
                            <CardContent className="flex items-center justify-center h-48">
                                <div className="text-center">
                                    <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                        No release blogs yet
                                    </h3>
                                    <p className="text-gray-500 dark:text-gray-400 mt-2">
                                        Release blogs will appear here when they are published.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Project Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Users className="h-5 w-5" />
                                Project Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="text-gray-500 dark:text-gray-400">Owner</span>
                                    <p className="font-medium">{curr_project.username}</p>
                                </div>
                                <div>
                                    <span className="text-gray-500 dark:text-gray-400">Visibility</span>
                                    <p className="font-medium capitalize">{curr_project.visibility}</p>
                                </div>
                                <div>
                                    <span className="text-gray-500 dark:text-gray-400">Language</span>
                                    <p className="font-medium">{curr_project.language || 'N/A'}</p>
                                </div>
                                <div>
                                    <span className="text-gray-500 dark:text-gray-400">Default Branch</span>
                                    <p className="font-medium">{curr_project.defaultBranch}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Quick Actions */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Quick Actions</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <Button asChild className="w-full" variant="outline">
                                <Link href={curr_project.repoUrl} target="_blank">
                                    <ExternalLink className="h-4 w-4 mr-2" />
                                    View Repository
                                </Link>
                            </Button>
                            <Button className="w-full" variant="outline">
                                <Star className="h-4 w-4 mr-2" />
                                Star Project
                            </Button>
                            <Button className="w-full" variant="outline">
                                <BookOpen className="h-4 w-4 mr-2" />
                                Documentation
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>}
        </div>
    )
}

