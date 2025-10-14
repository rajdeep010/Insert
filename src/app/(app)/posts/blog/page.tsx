"use client";
import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useBlog } from "@/app/context/BlogProvider";
import InsertNavbar from "@/components/InsertNavbar";
import InsertHoverCard from "@/components/InsertHoverCard";
import { getLastModifiedText } from "@/helpers/last-modified";

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Loader2, MoreHorizontal, Search } from "lucide-react";

// ...existing code...

/* Surface styles aligned with Projects/Blogs */
const surface = "rounded-2xl border border-black/[0.08] dark:border-white/[0.08] bg-white/60 dark:bg-gray-900/40 supports-[backdrop-filter]:bg-white/40 transition-colors";
const hoverable = "transition-colors hover:border-black/20 dark:hover:border-white/30";

export default function AllBlogPosts() {
	const { allBlogPosts, fetchAllBlogPosts, isAllBlogPostsLoading } = useBlog();
	const [query, setQuery] = useState("");

	useEffect(() => {
		fetchAllBlogPosts();
	}, []);

	const defaultBanner = "/insert.png";

	const filtered = useMemo(() => {
		const q = query.trim().toLowerCase();
		if (!q) return allBlogPosts || [];
		return (allBlogPosts || []).filter((b: any) => {
			const title = (b?.blogTitle || "").toLowerCase();
			const creator = (b?.creator || "").toLowerCase();
			return title.includes(q) || creator.includes(q);
		});
	}, [allBlogPosts, query]);

	return (
		<>
			<div className="flex flex-col gap-6 py-8 lg:py-12 justify-center px-6 lg:px-56">
				{isAllBlogPostsLoading && (
					<div className="flex justify-center items-center h-[60vh]">
						<Loader2 className="h-12 w-12 animate-spin text-gray-500" />
					</div>
				)}

				{!isAllBlogPostsLoading && (
					<div>
						<InsertNavbar />
					</div>
				)}

				<div className="flex flex-col gap-3">
					<div className="flex items-center justify-between flex-wrap gap-4">
						<span className="text-[13px] uppercase tracking-wider font-semibold px-2 py-1 rounded bg-purple-200/70 dark:bg-purple-800/60 text-purple-900 dark:text-purple-200">
							Post: Blogs
						</span>
						<div className="text-xs text-gray-500 dark:text-gray-400">
							{filtered?.length ?? 0} shown{query ? ` of ${allBlogPosts?.length ?? 0}` : ""}
						</div>
					</div>

					{/* Search */}
					<div className={`${surface} ${hoverable} shadow-none p-2 pr-3 flex items-center gap-2`}>
						<div className="pl-2 pr-1 text-gray-500">
							<Search className="h-4 w-4" />
						</div>
						<Input
							value={query}
							onChange={(e) => setQuery(e.target.value)}
							placeholder="Search by title or creator..."
							className="border-0 focus-visible:ring-0 bg-transparent"
						/>
					</div>
				</div>

				{!isAllBlogPostsLoading && (
					<div className="flex flex-col gap-4 max-h-[72vh] overflow-visible custom-small-scrollbar">
						{filtered?.length === 0 && (
							<Card className={`${surface} shadow-none`}>
								<CardContent className="py-14 text-center text-sm text-gray-600 dark:text-gray-400">
									No results for “{query}”. Try a different search.
								</CardContent>
							</Card>
						)}

						{filtered?.map((blog: any, idx: number) => (
							<div key={idx} className="group">
								<Card className={`${surface} ${hoverable} shadow-none`}>
									<div className="flex justify-between px-3 lg:px-6 py-6">
										{/* Left: meta + content */}
										<CardContent className="flex flex-col gap-3 pr-6 w-full p-0">
											<CardHeader className="flex flex-col gap-3 px-0 py-0">
												<div className="flex items-center gap-2">
													<InsertHoverCard username={blog?.creator as string} type="avatar" avatarSize="small" />
													<div className="text-sm text-gray-600 hover:text-blue-500 hover:underline">
														<InsertHoverCard username={blog?.creator as string} type="username" avatarSize="small" />
													</div>
												</div>

												<div className="flex items-center gap-3">
													<Link href={`/posts/blog/${blog?.blogUrl}`}>
														<CardTitle className="text-2xl font-semibold leading-snug hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
															{blog?.blogTitle}
														</CardTitle>
													</Link>

													{blog?.type === "private" && (
														<Badge variant="destructive" className="text-[11px]">private</Badge>
													)}
													{blog?.type === "public" && (
														<Badge variant="secondary" className="text-[11px]">public</Badge>
													)}
												</div>
											</CardHeader>

											<CardDescription className="text-[15px] text-muted-foreground line-clamp-3">
												{blog?.blogContentText && blog.blogContentText?.length > 0
													? blog?.blogContentText?.slice(0, 240) + "…"
													: "No content available..."}
											</CardDescription>

											<div className="flex justify-between items-center pt-2">
												<div className="text-[12px] flex items-center gap-2 text-gray-600 dark:text-gray-400">
													<div>{getLastModifiedText(blog?.lastEdited)}</div>
													<span className="opacity-40">•</span>
													<span>
														{Math.ceil(((blog?.blogContentText?.split(" ").length ?? 0) / 200))} min read
													</span>
												</div>

												<div className="hover:bg-gray-200 dark:hover:bg-gray-800 p-2 flex justify-end rounded-md">
													<DropdownMenu>
														<DropdownMenuTrigger asChild>
															<MoreHorizontal className="h-4 w-4 cursor-pointer" />
														</DropdownMenuTrigger>
														<DropdownMenuContent className="w-56" align="start">
															<DropdownMenuGroup>
																<DropdownMenuItem disabled>Show less like this</DropdownMenuItem>
															</DropdownMenuGroup>
															<DropdownMenuGroup>
																<DropdownMenuItem className="text-red-500" disabled>
																	Report post...
																</DropdownMenuItem>
															</DropdownMenuGroup>
														</DropdownMenuContent>
													</DropdownMenu>
												</div>
											</div>
										</CardContent>

										{/* Right: large banner image */}
										<div className="flex-shrink-0 overflow-hidden rounded-md hidden lg:block">
											<Image
												src={blog?.blogBannerImage || defaultBanner}
												alt={blog?.blogTitle}
												width={180}
												height={112}
												className="h-[112px] w-[180px] object-cover"
											/>
										</div>
									</div>
								</Card>

								{/* Optional divider to keep rhythm on long lists */}
								{idx < filtered.length - 1 && <Separator className="opacity-60" />}
							</div>
						))}
					</div>
				)}
			</div>
		</>
	);
}