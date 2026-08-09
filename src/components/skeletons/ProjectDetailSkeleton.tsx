import { Skeleton } from "@/components/ui/skeleton"

const ProjectDetailSkeleton = () => {
	return (
		<main className="relative min-h-screen overflow-hidden bg-slate-50 text-slate-950 dark:bg-[#020817] dark:text-slate-50">
			<div className="pointer-events-none absolute inset-0 opacity-60 dark:opacity-100 [background-image:linear-gradient(to_right,rgba(100,116,139,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(100,116,139,0.08)_1px,transparent_1px)] [background-size:48px_48px]" />
			<div className="relative mx-auto w-full max-w-[1560px] px-4 py-2 sm:px-8 lg:px-12 lg:py-2">
				<div className="space-y-6">
					<Skeleton className="h-14 w-full rounded-2xl" />
					<div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(330px,0.52fr)] lg:items-end lg:py-12">
						<div className="space-y-4">
							<Skeleton className="h-12 w-4/5" />
							<Skeleton className="h-4 w-2/3" />
							<Skeleton className="h-4 w-1/2" />
						</div>
						<div className="rounded-2xl border border-slate-200/80 bg-white/70 p-4 dark:border-slate-800/90 dark:bg-slate-950/55">
							<div className="flex items-center justify-between gap-3">
								<Skeleton className="h-14 w-14 rounded-full" />
								<div className="flex flex-wrap gap-2">
									<Skeleton className="h-9 w-24 rounded-lg" />
									<Skeleton className="h-9 w-28 rounded-lg" />
								</div>
							</div>
							<div className="mt-4 grid grid-cols-3 gap-2">
								{Array.from({ length: 3 }).map((_, idx) => (
									<div key={`project-detail-metric-${idx}`} className="rounded-xl border border-slate-200/75 bg-white/70 px-4 py-3 dark:border-slate-800/80 dark:bg-slate-950/45">
										<Skeleton className="h-3 w-16" />
										<Skeleton className="mt-2 h-4 w-24" />
									</div>
								))}
							</div>
						</div>
					</div>
				</div>
			</div>
		</main>
	)
}

export default ProjectDetailSkeleton