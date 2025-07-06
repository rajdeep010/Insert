"use client";
import { useBlog } from "@/app/context/BlogProvider";
import InsertNavbar from "@/components/InsertNavbar";
import Navbar from "@/components/Navbar";
import { Avatar,AvatarFallback,AvatarImage } from "@/components/ui/avatar";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getLastModifiedText } from "@/helpers/last-modified";
import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuPortal,
	DropdownMenuSeparator,
	DropdownMenuShortcut,
	DropdownMenuSub,
	DropdownMenuSubContent,
	DropdownMenuSubTrigger,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";

export default function AllBlogPosts() {
	const { allBlogPosts,fetchAllBlogPosts,isAllBlogPostsLoading } = useBlog();

	useEffect(() => {
		fetchAllBlogPosts();
	},[]);

	const defaultBanner = "/insert.png";

	const formatDate = (iso: string) =>
		new Date(iso).toLocaleDateString("en-US",{
			month: "short",
			day: "numeric",
			year: "numeric",
		});

	return (
		<>
			<div className="flex flex-col gap-6 py-24 justify-center px-64">
				{!isAllBlogPostsLoading && (
					<div>
						<InsertNavbar />
					</div>
				)}

				{!isAllBlogPostsLoading && (
					<div className="flex flex-col gap-4 max-h-[72vh] overflow-y-scroll custom-small-scrollbar  shadow-gray-200 dark:shadow-gray-800">
						{allBlogPosts?.map((blog,idx) => (
							<div key={idx} className="group">

								<div className="flex justify-between px-12 py-6 hover:bg-gray-50 dark:hover:bg-gray-900 transition ease-in-out">
									<CardContent className="flex flex-col gap-2 pr-6 w-full">
										<CardHeader className="flex flex-col gap-2 px-0">
											<div className="flex items-center gap-2">
												<Avatar className="h-4 w-4">
													<AvatarImage src="https://github.com/vercel.png" />
													<AvatarFallback>VC</AvatarFallback>
												</Avatar>
												<span className="text-sm text-gray-600 z-100 hover:text-blue-500 hover:underline">
													@{blog?.creator}
												</span>
											</div>

											<Link href={`/posts/blog/${blog?.blogUrl}`}>
												<CardTitle className="text-2xl font-bold ">
													{blog?.blogTitle}
												</CardTitle>
											</Link>
										</CardHeader>

										<CardDescription className="text-md text-muted-foreground line-clamp-3">
											{blog?.blogContentText &&
												blog.blogContentText?.length > 0
												? blog?.blogContentText?.slice(0,200) + "…"
												: "No content available..."}
										</CardDescription>

										<div className="flex justify-between items-center">

											<div className="text-[12px] flex items-center gap-2 text-gray-600 mt-2">
												<div>{getLastModifiedText(blog?.lastEdited)}</div>
												<span>•</span>
												<span>
													{Math.ceil(
														(blog?.blogContentText?.split(" ").length ?? 0) /
														200
													)}{" "}
													min read
												</span>
											</div>

											{/* put dropdown menu in div, can't directly apply classname */}
											<div className="z-100 hover:bg-gray-200 dark:hover:bg-gray-800 p-2 flex justify-end rounded-md">
												<DropdownMenu>
													<DropdownMenuTrigger asChild>
														<MoreHorizontal className="h-4 w-4" />
													</DropdownMenuTrigger>
													<DropdownMenuContent className="w-56" align="start">
														<DropdownMenuGroup>
															<DropdownMenuItem disabled>
																Show less like this
															</DropdownMenuItem>
														</DropdownMenuGroup>
														<DropdownMenuGroup>
															<DropdownMenuItem
																className="text-red-500"
																disabled
															>
																Report post...
															</DropdownMenuItem>
														</DropdownMenuGroup>
													</DropdownMenuContent>
												</DropdownMenu>
											</div>
										</div>
									</CardContent>

									<div className="flex-shrink-0 overflow-hidden rounded-md">
										<Image
											src={blog?.blogBannerImage || defaultBanner}
											alt={blog?.blogTitle}
											width={160}
											height={80}
											className="h-full w-full object-cover"
										/>
									</div>
								</div>

								{idx < allBlogPosts?.length - 1 && <Separator />}
							</div>
						))}
					</div>
				)}
			</div>
		</>
	);
}
