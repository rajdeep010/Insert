import React from 'react'

import { Skeleton } from '../ui/skeleton'

const TableSkeleton = () => {
    const skeletonRows = Array.from({ length: 5 })

    return (
        <div className="flex flex-col gap-6">
            <section className="flex flex-col gap-4 py-1">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0 space-y-3">
                        <div className="flex flex-wrap items-center gap-2">
                            <Skeleton className="h-7 w-24 rounded-full" />
                            <Skeleton className="h-7 w-28 rounded-full" />
                            <Skeleton className="h-7 w-36 rounded-full" />
                        </div>
                        <Skeleton className="h-9 w-full max-w-xl rounded-xl" />
                        <div className="flex flex-wrap items-center gap-3">
                            <Skeleton className="h-5 w-32 rounded-md" />
                            <Skeleton className="h-5 w-28 rounded-md" />
                        </div>
                        <Skeleton className="h-4 w-full max-w-3xl rounded-md" />
                        <Skeleton className="h-4 w-full max-w-2xl rounded-md" />
                    </div>

                    <div className="flex flex-wrap gap-2 lg:justify-end">
                        <Skeleton className="h-10 w-32 rounded-xl" />
                        <Skeleton className="h-10 w-32 rounded-xl" />
                        <Skeleton className="h-10 w-28 rounded-xl" />
                    </div>
                </div>

                <div className="flex items-center gap-3 overflow-hidden pt-1">
                    <div className="flex -space-x-2">
                        <Skeleton className="h-9 w-9 rounded-full ring-2 ring-background" />
                        <Skeleton className="h-9 w-9 rounded-full ring-2 ring-background" />
                        <Skeleton className="h-9 w-9 rounded-full ring-2 ring-background" />
                    </div>
                    <Skeleton className="h-4 w-56 rounded-md" />
                </div>
            </section>

            <section className="overflow-hidden rounded-3xl border border-border/60 bg-card/70 shadow-sm">
                <div className="flex flex-col gap-4 border-b border-border/60 px-4 py-4 sm:px-5 lg:flex-row lg:items-center lg:justify-between">
                    <div className="space-y-2">
                        <Skeleton className="h-6 w-28 rounded-md" />
                        <Skeleton className="h-4 w-52 rounded-md" />
                    </div>
                    <Skeleton className="h-10 w-full max-w-sm rounded-xl" />
                </div>

                <div className="hidden grid-cols-[minmax(0,2.1fr)_180px_minmax(0,1fr)_176px] gap-3 border-b border-border/60 px-4 py-3 text-sm md:grid sm:px-5">
                    <Skeleton className="h-5 w-24 rounded-md" />
                    <Skeleton className="h-5 w-20 rounded-md" />
                    <Skeleton className="h-5 w-20 rounded-md" />
                    <Skeleton className="ml-auto h-5 w-16 rounded-md" />
                </div>

                <div className="flex flex-col gap-3 px-4 py-4 sm:px-5">
                    {skeletonRows.map((_, index) => (
                        <div key={index} className="grid gap-3 rounded-2xl border border-border/60 bg-background/60 px-4 py-4 md:grid-cols-[minmax(0,2.1fr)_180px_minmax(0,1fr)_176px] md:items-center">
                            <div className="space-y-2">
                                <Skeleton className="h-5 w-full max-w-[18rem] rounded-md" />
                                <Skeleton className="h-4 w-24 rounded-md md:hidden" />
                            </div>
                            <div className="flex md:justify-start">
                                <Skeleton className="h-7 w-24 rounded-full" />
                            </div>
                            <Skeleton className="h-4 w-full max-w-[10rem] rounded-md" />
                            <div className="flex justify-end gap-2">
                                <Skeleton className="h-9 w-9 rounded-xl" />
                                <Skeleton className="h-9 w-9 rounded-xl" />
                                <Skeleton className="h-9 w-9 rounded-xl" />
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    )
}

export default TableSkeleton
