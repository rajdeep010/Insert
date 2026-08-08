import { Skeleton } from "@/components/ui/skeleton"

const ReleaseBlogCardSkeleton = () => (
	<div className="rounded-2xl border border-slate-200/80 bg-white/75 p-5 dark:border-slate-800/80 dark:bg-slate-950/55">
		<div className="flex items-start justify-between gap-4">
			<div className="min-w-0 flex-1 space-y-3">
				<Skeleton className="h-6 w-3/5" />
				<div className="flex flex-wrap items-center gap-2">
					<Skeleton className="h-5 w-24 rounded-full" />
					<Skeleton className="h-5 w-20 rounded-full" />
				</div>
				<Skeleton className="h-4 w-full" />
				<Skeleton className="h-4 w-[88%]" />
			</div>
			<div className="flex gap-2">
				<Skeleton className="h-8 w-8 rounded-md" />
				<Skeleton className="h-8 w-8 rounded-md" />
			</div>
		</div>
	</div>
)

const ReleaseBlogsSkeleton = ({ count = 4 }: { count?: number }) => {
	return (
		<div className="custom-small-scrollbar max-h-[58vh] space-y-3 overflow-y-auto pr-1">
			{Array.from({ length: count }).map((_, idx) => (
				<ReleaseBlogCardSkeleton key={`release-blog-skeleton-${idx}`} />
			))}
		</div>
	)
}

export default ReleaseBlogsSkeleton