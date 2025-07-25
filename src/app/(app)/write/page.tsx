"use client";
import * as React from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { CalendarCheck2,Clock3,FileText,Lightbulb,Rocket } from "lucide-react";
import '../../swiper.css'
import Link from "next/link";
import BlogWriteSidebar from "@/components/BlogWriteSidebar";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import { useBlog } from "@/app/context/BlogProvider";

const Write = () => {
	const {allBlogs} = useBlog()

	return (
		<>
			<div className="absolute top-5 left-5">
				<BlogWriteSidebar />
			</div>

			<div className="py-16 flex flex-col justify-center items-center">
				<div className="w-4/5 px-6 lg:w-2/5 flex flex-col gap-12 ">

					<div className="flex flex-col gap-4">
						<p className="text-2xl text-center font-semibold">
							Welcome, Rajdeep Mallick
						</p>
						<div className="grid w-full gap-4">
							<Textarea
								className="h-[8rem] resize-none w-full placeholder:text-sm lg:placeholder:text-md"
								placeholder="Type your message for us (this feature will be released soon)"
								disabled
							/>
							<Button variant={"outline"} disabled>Send message</Button>
						</div>
					</div>

					<div className="flex flex-col gap-2">
						<div className="flex items-center gap-2">
							<Clock3 className="h-4 w-4 opacity-30" />
							<span className="text-sm opacity-30">Recently visited</span>
						</div>
						<div className="w-full py-2">
							<Carousel>
								<CarouselContent className="-ml-1">
									{allBlogs.map((blog,index) => (
										<CarouselItem key={index} className="pl-1 lg:basis-1/3">
											<div className="p-1">
												<Card className="bg-slate-100 dark:bg-slate-900 shadow-sm shadow-gray-200 dark:shadow-gray-800">
													<CardContent className="flex aspect-square items-center justify-center p-6">
														<div className="flex flex-col items-start justify-start gap-4">
															<FileText className="h-8 w-8 text-gray-500 dark:text-gray-400" />
															<Link className="text-lg font-semibold" href={`/blog/${blog?.blogUrl}`}>{blog?.blogTitle}</Link>
														</div>
													</CardContent>
												</Card>
											</div>
										</CarouselItem>
									))}
								</CarouselContent>
								<CarouselPrevious />
								<CarouselNext />
							</Carousel>
						</div>
					</div>

					<div className="flex flex-col gap-4">
						<div className="flex  items-center gap-2">
							<CalendarCheck2 className="h-4 w-4 opacity-30" />
							<span className="text-sm opacity-30">Upcoming Events</span>
						</div>

						<div className="rounded-md flex flex-col lg:flex-row justify-evenly items-center bg-slate-100 dark:bg-slate-900 min-h-fit shadow-sm shadow-gray-200 dark:shadow-gray-800">
							<div className="flex flex-row lg:flex-col items-start justify-start gap-4 px-6 py-12 text-left w-full lg:w-2/5">
								<Rocket className="h-12 w-12 p-2 rounded-md bg-slate-200 dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-700" />
								<div>
									<p className="text-lg mb-3 lg:mb-0">Integrating AI Features</p>
									<p className="text-xs opacity-50">Add AI to help writing and summarize blogs</p>
									<Link href={'/'} className="text-blue-500 text-xs mt-[-10px] hover:underline">Insert Blogs</Link>
								</div>
							</div>

							<div className="hidden lg:block border-[1px] border-gray-700 min-h-[100px]"></div>
							<div className="block lg:hidden border-[1px] border-gray-700 min-w-[200px]"></div>

							<div className="flex flex-row lg:flex-col items-start justify-start gap-4 px-6 py-12 text-left w-full lg:w-2/5">
								<Lightbulb className="h-12 w-12 p-2 rounded-md bg-slate-200 dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-700" />
								<div>
									<p className="text-lg">Any Ideas or Suggestion?</p>
									<p className="text-xs opacity-50">Write to us how we can do better</p>
									<Link href={'/'} className="text-blue-500 text-xs mt-[-10px] hover:underline">Suggest</Link>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</>
	);
};

export default Write;
