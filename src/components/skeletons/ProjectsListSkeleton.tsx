import React from 'react'
import { Card, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

const ProjectCardSkeleton = () => (
  <Card className="rounded-2xl border border-black/[0.08] bg-white/60 p-0 shadow-none dark:border-white/[0.08] dark:bg-gray-900/40">
    <CardHeader className="p-5 pb-4">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1 space-y-3">
          <div className="flex items-center gap-3">
            <Skeleton className="h-6 w-56" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>

          <div className="flex items-center gap-2">
            <Skeleton className="h-6 w-24 rounded-md" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-24" />
          </div>

          <div className="space-y-2 pt-1">
            <Skeleton className="h-4 w-[95%]" />
            <Skeleton className="h-4 w-[82%]" />
          </div>
        </div>

        <Skeleton className="h-8 w-8" />
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-gray-200 pt-4 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-3 w-3 rounded-full" />
          <Skeleton className="h-3 w-24" />
        </div>
        <Skeleton className="h-3 w-20" />
      </div>
    </CardHeader>
  </Card>
)

const ProjectsListSkeleton = ({ count = 4 }: { count?: number }) => {
  return (
    <div className="my-1 flex max-h-[70vh] w-full flex-col gap-3 overflow-y-auto pr-1 custom-small-scrollbar">
      {Array.from({ length: count }).map((_, idx) => (
        <ProjectCardSkeleton key={`project-skeleton-${idx}`} />
      ))}
    </div>
  )
}

export default ProjectsListSkeleton
