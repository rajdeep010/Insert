"use client";
import * as React from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { CalendarCheck2, Clock3, FileText, Lightbulb, Rocket, Search, Send, Loader2 } from "lucide-react";
import "../../swiper.css";
import Link from "next/link";
import BlogWriteSidebar from "@/components/BlogWriteSidebar";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import { useBlog } from "@/app/context/BlogProvider";
import { useInsertProjects } from "@/app/context/InsertProjectProvider";

/* Consistent surface styles */
const surface =
	"relative rounded-2xl border border-black/[0.08] dark:border-white/[0.08] bg-white/60 dark:bg-gray-900/40 backdrop-blur-xl supports-[backdrop-filter]:bg-white/40 transition-colors";
const hoverable = "transition-colors hover:border-black/20 dark:hover:border-white/30";

const MAX_LEN = 300;

const Write = () => {
	const { allBlogs } = useBlog();
	const { sendFeedback } = useInsertProjects();

	const [mode, setMode] = React.useState<"message" | "suggestion">("message");
	const [text, setText] = React.useState("");
	const [sending, setSending] = React.useState(false);

	const remaining = MAX_LEN - text.length;

	const messageBoxRef = React.useRef<HTMLDivElement>(null);
  	const textareaRef = React.useRef<HTMLTextAreaElement>(null);

	const handleSend = async () => {
		if (!text.trim()) return;
		setSending(true);
		try {
			await sendFeedback({ type: mode, text: text.trim() });
			setText("");
		} finally {
			setSending(false);
		}
	};

	return (
		<>
			<div className="absolute top-5 left-5">
				<BlogWriteSidebar />
			</div>

			<div className="py-16 flex flex-col justify-center items-center">
				<div className="w-4/5 px-6 lg:w-2/5 flex flex-col gap-12">
					{/* Message / Suggestion */}
					<div className="flex flex-col gap-4">
						<p className="text-2xl text-center font-semibold">Welcome, Rajdeep Mallick</p>

						<div ref={messageBoxRef} className={`${surface} ${hoverable} p-4 lg:p-5 shadow-none`}>
							<div className="flex items-center justify-between gap-3 mb-3">
								<div className="flex items-center gap-2">
									{/* <span className="text-xs uppercase tracking-wider font-semibold px-2 py-1 rounded bg-purple-200/70 dark:bg-purple-800/60 text-purple-900 dark:text-purple-200">
										{mode === "suggestion" ? "Suggestion" : "Message"}
									</span> */}
								</div>
								<div className="inline-flex items-center gap-2 rounded-lg border border-black/10 dark:border-white/10 p-1 bg-white/70 dark:bg-gray-900/40">
									<Button
										type="button"
										size="sm"
										variant={mode === "message" ? "default" : "ghost"}
										className={`h-8 px-3 ${mode === "message" ? "" : "opacity-80"}`}
										onClick={() => setMode("message")}
										aria-pressed={mode === "message"}
									>
										Message
									</Button>
									<Button
										type="button"
										size="sm"
										variant={mode === "suggestion" ? "default" : "ghost"}
										className={`h-8 px-3 ${mode === "suggestion" ? "" : "opacity-80"}`}
										onClick={() => setMode("suggestion")}
										aria-pressed={mode === "suggestion"}
									>
										Suggestion
									</Button>
								</div>
							</div>

							<div className="grid w-full gap-3">
								<Textarea
									value={text}
									onChange={(e) => {
										const v = e.target.value.slice(0, MAX_LEN);
										setText(v);
									}}
									maxLength={MAX_LEN}
									className="h-[9rem] resize-none w-full placeholder:text-sm lg:placeholder:text-md bg-transparent"
									placeholder={
										mode === "suggestion"
											? "Share your idea or suggestion (max 300 characters)…"
											: "Describe your message or ask for help (max 300 characters)…"
									}
								/>

								<div className="flex items-center justify-between">
									<span className="text-xs text-gray-500 dark:text-gray-400">
										{mode === "suggestion" ? "You’re in suggestion mode." : "You’re in message mode."}
									</span>
									<span className={`text-xs ${remaining < 20 ? "text-orange-600" : "text-gray-500"} dark:text-gray-400`}>
										{text.length}/{MAX_LEN}
									</span>
								</div>

								<Button
									onClick={handleSend}
									disabled={sending || text.trim().length === 0}
									className="self-start gap-2"
								>
									{sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
									Send message
								</Button>
							</div>
						</div>
					</div>

					{/* Recently visited */}
					<div className="flex flex-col gap-2">
						<div className="flex items-center gap-2">
							<Clock3 className="h-4 w-4 opacity-30" />
							<span className="text-sm opacity-60">Recently visited</span>
						</div>
						<div className="w-full py-2">
							<Carousel>
								<CarouselContent className="-ml-1">
									{allBlogs.map((blog, index) => (
										<CarouselItem key={index} className="pl-1 lg:basis-1/3">
											<div className="p-1">
												<Card className={`${surface} shadow-none`}>
													<CardContent className="flex aspect-square items-start justify-start p-6">
														<div className="flex flex-col items-start justify-start gap-4">
															<FileText className="h-8 w-8 text-gray-500 dark:text-gray-400" />
															<Link className="text-lg font-semibold hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors" href={`/blog/${blog?.blogUrl}`}>
																{blog?.blogTitle}
															</Link>
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

					{/* Upcoming Events */}
					<div className="flex flex-col gap-4">
						<div className="flex items-center gap-2">
							<CalendarCheck2 className="h-4 w-4 opacity-30" />
							<span className="text-sm opacity-60">Upcoming Events</span>
						</div>

						<div
							className={`${surface} shadow-none rounded-md flex flex-col lg:flex-row justify-evenly items-center min-h-fit`}
						>
							<div className="flex flex-row lg:flex-col items-start justify-start gap-4 px-6 py-12 text-left w-full lg:w-2/5">
								<Rocket className="h-12 w-12 p-2 rounded-md bg-slate-200 dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-700" />
								<div>
									<p className="text-lg mb-1">Integrating AI Features</p>
									<p className="text-xs opacity-60">Add AI to help writing and summarize blogs</p>
									{/* <Link href={"/posts/blog"} className="text-blue-500 text-xs hover:underline">
										Insert Blogs
									</Link> */}
								</div>
							</div>

							<div className="hidden lg:block border-[1px] border-black/10 dark:border-white/10 min-h-[100px]" />
							<div className="block lg:hidden border-[1px] border-black/10 dark:border-white/10 min-w-[200px]" />

							<div className="flex flex-row lg:flex-col items-start justify-start gap-4 px-6 py-12 text-left w-full lg:w-2/5">
								<Lightbulb className="h-12 w-12 p-2 rounded-md bg-slate-200 dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-700" />
								<div>
									<p className="text-lg">Any Ideas or Suggestion?</p>
									<p className="text-xs opacity-60">Write to us how we can do better</p>
									<button onClick={() => {
                      setMode("suggestion");
                      // smooth scroll to top, then focus textarea
                      window.scrollTo({ top: 0, behavior: "smooth" });
                      setTimeout(() => textareaRef.current?.focus(), 350);
                    }} className="text-blue-500 text-xs hover:underline">
										Suggest
									</button>
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