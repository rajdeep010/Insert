"use client";

import Link from "next/link";
import { motion } from "motion/react";
import {
	ArrowRight,
	CalendarDays,
	Sparkles,
	Bell,
	GitBranch,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const releases = [
	{
		version: "v6.0",
		date: "June 2026",
		latest: true,
		href: "/release/v6",
		title: "Collaboration & Realtime Notifications",
		description:
			"Role-based collaboration, realtime notifications, workspace switching and a redesigned collaboration workflow.",
		features: [
			"Collaboration",
			"Notifications",
			"Workspace Switching",
			"Role Management",
		],
		icon: Bell,
	},
	{
		version: "v5.0",
		date: "March 2026",
		latest: false,
		href: "/release/v5",
		title: "Workflow Automation & Editor Enhancements",
		description:
			"Automation workflows, improved editor experience, GitHub integration and workspace improvements.",
		features: [
			"Automation",
			"GitHub",
			"Editor",
			"Dark Mode",
		],
		icon: GitBranch,
	},
];

export default function ReleasePage() {
	return (
		<main className="relative min-h-screen overflow-hidden bg-background">

			<section className="mx-auto max-w-7xl px-6 pt-10">

				<motion.div
					initial={{ opacity: 0, y: 25 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: .6 }}
					className="mx-auto max-w-3xl text-center"
				>

					<Badge
						variant="secondary"
						className="mb-4 rounded-full px-4 py-1"
					>
						<Sparkles className="mr-2 h-3.5 w-3.5" />
						Product Updates
					</Badge>

					<h1 className="text-5xl font-bold tracking-tight md:text-6xl">
						Insert{" "}
						<span className="text-muted-foreground">
							Releases
						</span>
					</h1>

				</motion.div>

				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{
						delay: .25,
						duration: .6,
					}}
					className="mx-auto mt-24 max-w-5xl space-y-8"
				>

					{releases.map((release, index) => {

						const Icon = release.icon;

						return (

							<motion.div
								key={release.version}
								initial={{
									opacity: 0,
									y: 35,
								}}
								whileInView={{
									opacity: 1,
									y: 0,
								}}
								viewport={{
									once: true,
								}}
								transition={{
									delay: index * .12,
								}}
							>

								<Card className="group overflow-hidden rounded-3xl border-border/60 dark:bg-black/40 bg-background/20 backdrop-blur-xl transition-all duration-300  hover:border-primary/30 hover:shadow-2xl">

									<Link
										href={release.href}
										className="block p-8"
									>

										<div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">

											<div className="flex-1">

												<div className="mb-5 flex flex-wrap items-center gap-3">

													<Badge
														variant="outline"
														className="font-mono"
													>
														{release.version}
													</Badge>

													{release.latest && (
														<Badge className="rounded-full">
															Latest
														</Badge>
													)}

													<div className="flex items-center gap-2 text-sm text-muted-foreground">

														<CalendarDays className="h-4 w-4" />

														{release.date}

													</div>

												</div>

												<div className="flex items-start gap-4">

													<div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">

														<Icon className="h-5 w-5 text-primary" />

													</div>

													<div>

														<h2 className="text-2xl font-semibold tracking-tight">

															{release.title}

														</h2>

														<p className="mt-3 max-w-2xl text-muted-foreground leading-7">

															{release.description}

														</p>

													</div>

												</div>

												<div className="mt-8 flex flex-wrap gap-2">

													{release.features.map((feature) => (

														<Badge
															key={feature}
															variant="secondary"
															className="rounded-md px-3 py-1 text-sm"
														>
															{feature}
														</Badge>

													))}

												</div>

											</div>

											<motion.div
												whileHover={{
													x: 6,
												}}
												className="flex justify-end"
											>

												<Button
													size="icon"
													className="h-12 w-12 rounded-full"
												>
													<ArrowRight className="h-5 w-5" />
												</Button>

											</motion.div>

										</div>

									</Link>

								</Card>

							</motion.div>

						);

					})}

				</motion.div>

				{/* What's Next */}

				<motion.section
					initial={{ opacity: 0, y: 30 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{ duration: 0.6 }}
					className="mx-auto mt-32 max-w-5xl"
				>
					<Card className="overflow-hidden rounded-3xl border-border/60 bg-background/40 backdrop-blur-xl">

						<div className="relative overflow-hidden p-10 md:p-14">

							<div className="absolute right-0 top-0 h-72 w-72 rounded-full bg-primary/10 blur-[120px]" />

							<Badge className="mb-6 rounded-full">
								Coming Next
							</Badge>

							<h2 className="max-w-2xl text-4xl font-bold tracking-tight md:text-5xl">
								We're just getting started.
							</h2>

							<p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
								Every release focuses on making Insert a better workspace
								for developers. Expect AI-powered workflows, improved
								collaboration, smarter editors, and much more.
							</p>

							<div className="mt-10 flex flex-wrap gap-3">

								<Badge variant="secondary">
									AI Features
								</Badge>

								<Badge variant="secondary">
									Better Performance
								</Badge>

								<Badge variant="secondary">
									Editor Improvements
								</Badge>

								<Badge variant="secondary">
									More Integrations
								</Badge>

							</div>

							<div className="mt-10 flex gap-4">

								<Button asChild size="lg">
									<Link href="/sign-up">
										Get Started
									</Link>
								</Button>

								<Button
									variant="outline"
									size="lg"
									asChild
								>
									<Link href="/">
										Back Home
									</Link>
								</Button>

							</div>

						</div>

					</Card>
				</motion.section>

				{/* Footer */}

				<footer className="mx-auto mt-24 max-w-7xl border-t border-border/50 py-10">

					<div className="flex flex-col items-center justify-between gap-6 text-sm text-muted-foreground md:flex-row">

						<div className="flex items-center gap-2">
							<span className="font-semibold text-foreground">
								Insert
							</span>
							<span>•</span>
							<span>Release Notes</span>
						</div>

						<div className="flex items-center gap-8">

							<Link
								href="/"
								className="transition-colors hover:text-foreground"
							>
								Home
							</Link>

							<Link
								href="/#features"
								className="transition-colors hover:text-foreground"
							>
								Features
							</Link>

							<Link
								href="/sign-up"
								className="transition-colors hover:text-foreground"
							>
								Get Started
							</Link>

						</div>

					</div>

				</footer>
			</section>
		</main>
	);
}