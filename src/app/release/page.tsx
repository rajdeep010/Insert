import Link from "next/link";
import { ArrowRight } from "lucide-react";
import InsertNavbar from "@/components/InsertNavbar";

const releases = [
	{
		version: "v6.0",
		title: "Collaboration & Realtime Notifications",
		date: "June 2026",
		slug: "v6",
		isLatest: true,
	},
	{
		version: "v5.0",
		title: "Workflow Automation & Editor Enhancements",
		date: "March 2026",
		slug: "v5",
		isLatest: false,
	},
];

export default function ReleasesPage() {
	return (
		<div className="min-h-screen bg-background text-foreground py-2" style={{ fontFamily: "'DM Sans', 'Geist', system-ui, sans-serif", background: "#0a0a0b", }}	>
			<div className="mx-auto lg:mx-20 my-10 border-b border-border/50">
				<InsertNavbar />
			</div>

			<main className="relative z-10 mx-auto max-w-3xl px-6 pb-24">
				{/* Header */}
				<div className="mb-16">
					<div className="mb-4 flex items-center gap-3">
						<span className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
							Product updates
						</span>
						<span className="h-px w-12 bg-border" />
					</div>
					<h1 className="text-4xl font-medium tracking-tight text-foreground md:text-5xl">
						Insert <span className="text-muted-foreground">Releases</span>
					</h1>
					{/* <p className="mt-4 text-lg text-muted-foreground">
						A history of updates, improvements, and new features.
					</p> */}
				</div>

				{/* Releases List */}
				<div className="flex flex-col gap-6">
					{releases.map((release) => (
						<Link
							key={release.version}
							href={`/release/${release.slug}`}
							className="group flex flex-col rounded-2xl border border-border/50 bg-background/50 p-6 transition-all hover:border-foreground/20 hover:bg-background/80"
						>
							<div className="mb-2 flex items-center justify-between">
								<div className="flex items-center gap-3">
									<span className="font-mono text-sm font-semibold text-foreground">
										{release.version}
									</span>
									{release.isLatest && (
										<span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
											Latest
										</span>
									)}
								</div>
								<span className="font-mono text-xs text-muted-foreground">
									{release.date}
								</span>
							</div>

							<div className="flex items-center justify-between gap-4">
								<h2 className="text-lg font-medium text-foreground transition-colors group-hover:text-primary">
									{release.title}
								</h2>
								<div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border bg-background transition-transform group-hover:translate-x-1">
									<ArrowRight className="h-4 w-4" />
								</div>
							</div>
						</Link>
					))}
				</div>
			</main>
		</div>
	);
}