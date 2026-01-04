"use client";
import * as React from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import { RiMenu3Line } from "react-icons/ri";
import {
	MessageSquare,
	User,
	FilePenLine,
	Contact,
	LogIn,
	LogOut,
	User2,
	FileText,
	LayoutPanelTop,
	Layout,
	CircleCheckBig,
	Menu,
	Loader2,
	LayoutDashboard,
	PanelsTopLeft,
	LayoutPanelLeft,
	LayoutGrid,
	BadgeCheck,
} from "lucide-react";
import {
	NavigationMenu,
	NavigationMenuContent,
	NavigationMenuItem,
	NavigationMenuLink,
	NavigationMenuList,
	NavigationMenuTrigger,
	navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import DeclineInviteCard from "./DeclineInviteCard";
import AcceptedInviteCard from "./AcceptedInviteCard";
import { Button } from "@/components/ui/button"
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
} from "@/components/ui/dropdown-menu"
import SuggestionNotificationCard from "./SuggestionNotificationCard";
import InviteNotificationCard from "./InviteNotificationCard";
import { useInsertUser } from "@/app/context/InsertUserProvider";
import { Separator } from "./ui/separator";
import Dashboard from "./Dashboard";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import InsertIcon from "./InsertIcon";



const InsertNavbar = () => {
	const { data: session, status } = useSession();
	const params = useParams();
	const router = useRouter();
	const username = session?.user?.username;
	const param_username = params?.username as string;
	const [notifyLoader, setNotifyLoader] = React.useState(false)

	const { user, markAllRead, unreadNotifyCount, notifications, getNotifications } = useInsertUser();

	const handleLogOut = () => {
		signOut();
		router.push("/");
	}

	const handleGetNotifier = async () => {
		try {
			setNotifyLoader(true)
			await getNotifications()
		} catch (error) {

		} finally {
			setNotifyLoader(false)
		}
	}

	return (
		<nav className="flex justify-between items-center gap-10">
			<Link
				className="flex items-center gap-2 text-5xl font-sans"
				href={`/`}
			>
				Insert
			</Link>

			<div className="hidden lg:flex items-center gap-6">
				<NavigationMenu>
					<NavigationMenuList>
						{status === "authenticated" && username && (
							<NavigationMenuItem>
								<NavigationMenuTrigger>Sections</NavigationMenuTrigger>
								<NavigationMenuContent>
									<ul className="flex flex-col gap-2 w-[220px] p-2">
										<li>
											<NavigationMenuLink asChild>
												<Link
													href={`/u/${!param_username
														? session?.user?.username
														: param_username
														}?tab=overview`}
													className="rounded-md px-2 py-1 hover:bg-gray-200 dark:hover:bg-gray-800 cursor-pointer flex gap-2 items-center"
												>
													<User2 className="h-4 w-4" />
													<span className="text-sm">Overview</span>
												</Link>
											</NavigationMenuLink>
										</li>
										<li>
											<NavigationMenuLink asChild>
												<Link
													href={`/u/${!param_username
														? session?.user?.username
														: param_username
														}?tab=topics`}
													className="rounded-md px-2 py-1 hover:bg-gray-200 dark:hover:bg-gray-800 cursor-pointer flex gap-2 items-center"
												>
													<LayoutDashboard className="h-4 w-4" />
													<span className="text-sm">Topics</span>
												</Link>
											</NavigationMenuLink>
										</li>
										<li>
											<NavigationMenuLink asChild>
												<Link
													href={`/u/${!param_username
														? session?.user?.username
														: param_username
														}?tab=blogs`}
													className="rounded-md px-2 py-1 hover:bg-gray-200 dark:hover:bg-gray-800 cursor-pointer flex gap-2 items-center"
												>
													<LayoutPanelTop className="h-4 w-4" />
													<span className="text-sm">Blogs</span>
												</Link>
											</NavigationMenuLink>
										</li>
										<li>
											<NavigationMenuLink asChild>
												<Link
													href={`/u/${!param_username
														? session?.user?.username
														: param_username
														}?tab=projects`}
													className="rounded-md px-2 py-1 hover:bg-gray-200 dark:hover:bg-gray-800 cursor-pointer flex gap-2 items-center"
												>
													<PanelsTopLeft className="h-4 w-4" />
													<span className="text-sm">Projects</span>
												</Link>
											</NavigationMenuLink>
										</li>
										<Separator />
										<li>
											<NavigationMenuLink asChild>
												<Link
													href={`/u/${session.user?.username}`}
													className="rounded-md px-2 py-1 hover:bg-gray-200 dark:hover:bg-gray-800 cursor-pointer flex gap-2 items-center"
												>
													<User className="h-4 w-4" />
													<span className="text-sm">Profile</span>
												</Link>
											</NavigationMenuLink>
										</li>
										<li>
											<NavigationMenuLink asChild>
												<Link
													href={`/write`}
													className="rounded-md px-2 py-1 hover:bg-gray-200 dark:hover:bg-gray-800 cursor-pointer flex gap-2 items-center"
												>
													<FilePenLine className="h-4 w-4" />
													<span className="text-sm">Write</span>
												</Link>
											</NavigationMenuLink>
										</li>
										<li>
											<NavigationMenuLink asChild>
												<Link
													href={`/u/${!param_username
														? session?.user?.username
														: param_username
														}?tab=subscribe`}
													className="rounded-md px-2 py-1 hover:bg-gray-200 dark:hover:bg-gray-800 cursor-pointer flex gap-2 items-center"
												>
													<BadgeCheck className="h-4 w-4" />
													<span className="text-sm">Subscribe</span>
												</Link>
											</NavigationMenuLink>
										</li>
									</ul>
								</NavigationMenuContent>
							</NavigationMenuItem>
						)}

						{status === "authenticated" && username && (
							<NavigationMenuItem>
								<NavigationMenuTrigger>Posts</NavigationMenuTrigger>
								<NavigationMenuContent>
									<ul className="flex flex-col gap-2 w-[220px] p-2">
										<li>
											<NavigationMenuLink asChild>
												<Link
													href={`/posts/topic`}
													className="rounded-md px-2 py-1 hover:bg-gray-200 dark:hover:bg-gray-800 cursor-pointer flex gap-2 items-center"
												>
													<LayoutDashboard className="h-4 w-4" />
													<span className="text-sm">Topics</span>
												</Link>
											</NavigationMenuLink>
										</li>
										<li>
											<NavigationMenuLink asChild>
												<Link
													href={`/posts/blog`}
													className="rounded-md px-2 py-1 hover:bg-gray-200 dark:hover:bg-gray-800 cursor-pointer flex gap-2 items-center"
												>
													<LayoutPanelTop className="h-4 w-4" />
													<span className="text-sm">Blogs</span>
												</Link>
											</NavigationMenuLink>
										</li>
										<li>
											<NavigationMenuLink asChild>
												<Link
													href={`/posts/projects`}
													className="rounded-md px-2 py-1 hover:bg-gray-200 dark:hover:bg-gray-800 cursor-pointer flex gap-2 items-center"
												>
													<PanelsTopLeft className="h-4 w-4" />
													<span className="text-sm">Projects</span>
												</Link>
											</NavigationMenuLink>
										</li>
									</ul>
								</NavigationMenuContent>
							</NavigationMenuItem>
						)}

						{/* Profile & Write & Contact */}
						{session && status === "authenticated" && (
							<>
								<NavigationMenuItem>
									<NavigationMenuLink
										asChild
										className={navigationMenuTriggerStyle()}
									>
										<Link href="mailto:insertcontact999@gmail.com">
											<Contact className="inline mr-2 h-4 w-4" />
											Contact
										</Link>
									</NavigationMenuLink>
								</NavigationMenuItem>
							</>
						)}

						{status === "authenticated" && username && (
							<DropdownMenu onOpenChange={(open) => open && handleGetNotifier()}>
								<DropdownMenuTrigger
									className={`flex items-center border-none outline-none ${unreadNotifyCount > 0 && "notify"}`}
									unread-count={unreadNotifyCount}
								>
									<MessageSquare className="h-6 w-6 mx-2" />
								</DropdownMenuTrigger>

								<DropdownMenuContent className="max-w-[300px] max-h-[300px] overflow-y-scroll custom-small-scrollbar">
									<DropdownMenuLabel className="flex items-center justify-between">
										<div>Notifications</div>
										{notifications &&
											notifications.length > 0 && (
												<div
													className="p-1 cursor-pointer flex items-center gap-1 text-xs underline text-blue-400"
													onClick={() => markAllRead(session?.user?.username!)}
												>
													<CircleCheckBig className="h-4 w-4" /> Mark all read
												</div>
											)
										}
									</DropdownMenuLabel>
									<DropdownMenuSeparator />
									<div>
										{
											notifyLoader && <Loader2 className="h-4 w-4 animate-spin" />
										}
										{!notifyLoader && notifications && notifications?.length === 0 && (
											<>
												<div className="p-2 text-xs opacity-50">
													No notifications
												</div>
											</>
										)}
										{!notifyLoader && notifications &&
											notifications?.map(
												(msg: any, idx: number) => (
													<DropdownMenuItem key={idx}>
														{msg?.actionType === "collab-request" && (
															<>
																<InviteNotificationCard
																	key={idx}
																	from={msg.from as string}
																	to={msg.to as string}
																	topicid={msg.topicId as string}
																	topicname={msg.topicName as string}
																	notifyid={msg._id as string}
																	read={msg.read}
																	fromUserId={msg?.fromUserId}
																	toUserId={msg?.toUserId}
																/>
																<DropdownMenuSeparator />
															</>
														)}

														{msg?.actionType === "suggestion" && (
															<>
																<SuggestionNotificationCard
																	key={idx}
																	from={msg.from as string}
																	to={msg.to as string}
																	topicid={msg.topicId as string}
																	problemurl={msg.problemUrl as string}
																	topicname={msg.topicName as string}
																	read={msg.read}
																/>
																<DropdownMenuSeparator />
															</>
														)}

														{msg?.actionType === "collab-accept" && (
															<>
																<AcceptedInviteCard
																	key={idx}
																	from={msg.from as string}
																	to={msg.to as string}
																	topicid={msg.topicId as string}
																	topicname={msg.topicName as string}
																	read={msg.read}
																/>
																<DropdownMenuSeparator />
															</>
														)}

														{msg?.actionType === "collab-decline" && (
															<>
																<DeclineInviteCard
																	key={idx}
																	from={msg.from as string}
																	topicid={msg.topicId as string}
																	topicname={msg.topicName as string}
																	read={msg.read}
																/>
															</>
														)}
													</DropdownMenuItem>
												)
											)}
									</div>
								</DropdownMenuContent>
							</DropdownMenu>
						)}

						{/* Auth */}
						<NavigationMenuItem>
							{status === "authenticated" ? (
								<NavigationMenuLink
									asChild
									className={navigationMenuTriggerStyle()}
								>
									<button
										onClick={handleLogOut}
										className="flex items-center gap-2 w-full px-2 py-1"
									>
										<LogOut className="h-4 w-4" />
										Logout
									</button>
								</NavigationMenuLink>
							) : (
								<NavigationMenuLink
									asChild
									className={navigationMenuTriggerStyle()}
								>
									<Link href="/sign-in" className="flex items-center gap-2">
										<LogIn className="inline mr-2 h-4 w-4" />
										Login
									</Link>
								</NavigationMenuLink>
							)}
						</NavigationMenuItem>
					</NavigationMenuList>
				</NavigationMenu>
			</div>

			<div className="lg:hidden flex items-center gap-6">
				{status === "authenticated" && username && (
					<DropdownMenu onOpenChange={(open) => open && handleGetNotifier()}>
						<DropdownMenuTrigger
							className={`flex items-center border-none outline-none ${unreadNotifyCount > 0 && "notify"}`}
							unread-count={unreadNotifyCount}
						>
							<MessageSquare className="h-6 w-6 mx-2" />
						</DropdownMenuTrigger>

						<DropdownMenuContent className="max-w-[300px] max-h-[300px] overflow-y-scroll custom-small-scrollbar">
							<DropdownMenuLabel className="flex items-center justify-between">
								<div>Notifications</div>
								{notifications &&
									notifications.length > 0 && (
										<div
											className="p-1 cursor-pointer flex items-center gap-1 text-xs underline text-blue-400"
											onClick={() => markAllRead(session?.user?.username!)}
										>
											<CircleCheckBig className="h-4 w-4" /> Mark all read
										</div>
									)}
							</DropdownMenuLabel>
							<DropdownMenuSeparator />
							<div>
								{notifyLoader && <Loader2 className="h-4 w-4 animate-spin" />}

								{!notifyLoader && notifications && notifications.length === 0 && (
									<div className="p-2 text-xs opacity-50">No notifications</div>
								)}

								{!notifyLoader &&
									notifications?.map((msg: any, idx: number) => (
										<DropdownMenuItem key={idx}>
											{msg?.actionType === "collab-request" && (
												<>
													<InviteNotificationCard
														key={idx}
														from={msg?.from as string}
														to={msg.to as string}
														topicid={msg?.topicId as string}
														topicname={msg?.topicName as string}
														notifyid={msg?._id as string}
														read={msg?.read}
														fromUserId={msg?.fromUserId}
														toUserId={msg?.toUserId}
													/>
													<DropdownMenuSeparator />
												</>
											)}

											{msg?.actionType === "suggestion" && (
												<>
													<SuggestionNotificationCard
														key={idx}
														from={msg?.from as string}
														to={msg.to as string}
														topicid={msg?.topicId as string}
														problemurl={msg?.problemUrl as string}
														topicname={msg?.topicName as string}
														read={msg?.read}
													/>
													<DropdownMenuSeparator />
												</>
											)}

											{msg?.actionType === "collab-accept" && (
												<>
													<AcceptedInviteCard
														key={idx}
														from={msg?.from as string}
														to={msg.to as string}
														topicid={msg?.topicId as string}
														topicname={msg?.topicName as string}
														read={msg?.read}
													/>
													<DropdownMenuSeparator />
												</>
											)}

											{msg?.actionType === "collab-decline" && (
												<>
													<DeclineInviteCard
														key={idx}
														from={msg?.from as string}
														topicid={msg?.topicId as string}
														topicname={msg?.topicName as string}
														read={msg?.read}
													/>
												</>
											)}
										</DropdownMenuItem>
									))}
							</div>
						</DropdownMenuContent>
					</DropdownMenu>
				)}

				<Sheet>
					<SheetTrigger asChild>
						<button
							aria-label="Open menu"
							className="inline-flex h-9 w-9 items-center justify-center rounded-md hover:bg-muted dark:hover:bg-muted/50"
						>
							<Menu className="h-5 w-5 mx-2" />
						</button>
					</SheetTrigger>
					<SheetContent side="left" className="w-[85vw] sm:max-w-sm p-0">
						<div className="p-4 border-b">
							<Link href={`/`} className="flex items-center gap-2 text-2xl">
								<InsertIcon className="p-[4px] border-2 bg-white" />
								<span className="font-sans">Insert</span>
							</Link>
							{session && (
								<div className="mt-2 text-sm text-muted-foreground">
									Signed in as @{session.user?.username}
								</div>
							)}
						</div>

						<div className="p-2">
							{status === "authenticated" && username && (
								<>
									<div className="px-3 py-2 text-xs uppercase tracking-wide text-muted-foreground">
										Sections
									</div>
									<div className="space-y-1">
										<Link
											href={`/u/${!param_username ? session?.user?.username : param_username}?tab=overview`}
											className="flex items-center gap-2 rounded-md px-3 py-2 hover:bg-muted"
										>
											<User2 className="h-4 w-4" /> <span>Overview</span>
										</Link>
										<Link
											href={`/u/${!param_username ? session?.user?.username : param_username}?tab=topics`}
											className="flex items-center gap-2 rounded-md px-3 py-2 hover:bg-muted"
										>
											<FileText className="h-4 w-4" /> <span>Topics</span>
										</Link>
										<Link
											href={`/u/${!param_username ? session?.user?.username : param_username}?tab=blogs`}
											className="flex items-center gap-2 rounded-md px-3 py-2 hover:bg-muted"
										>
											<LayoutPanelTop className="h-4 w-4" /> <span>Blogs</span>
										</Link>
										<Link
											href={`/u/${!param_username ? session?.user?.username : param_username}?tab=projects`}
											className="flex items-center gap-2 rounded-md px-3 py-2 hover:bg-muted"
										>
											<PanelsTopLeft className="h-4 w-4" /> <span>Projects</span>
										</Link>
									</div>

									<div className="px-3 pt-4 pb-2 text-xs uppercase tracking-wide text-muted-foreground">
										Posts
									</div>
									<div className="space-y-1">
										<Link
											href={`/posts/topic`}
											className="flex items-center gap-2 rounded-md px-3 py-2 hover:bg-muted"
										>
											<LayoutGrid className="h-4 w-4" /> <span>Topics</span>
										</Link>
										<Link
											href={`/posts/blog`}
											className="flex items-center gap-2 rounded-md px-3 py-2 hover:bg-muted"
										>
											<LayoutGrid className="h-4 w-4" /> <span>Blogs</span>
										</Link>
										<Link
											href={`/posts/projects`}
											className="flex items-center gap-2 rounded-md px-3 py-2 hover:bg-muted"
										>
											<LayoutGrid className="h-4 w-4" /> <span>Projects</span>
										</Link>
									</div>
								</>
							)}

							{session && status === "authenticated" && (
								<>
									<div className="px-3 pt-4 pb-2 text-xs uppercase tracking-wide text-muted-foreground">
										Account
									</div>
									<div className="space-y-1">
										<Link
											href={`/u/${session.user?.username}`}
											className="flex items-center gap-2 rounded-md px-3 py-2 hover:bg-muted"
										>
											<User className="h-4 w-4" /> <span>Profile</span>
										</Link>
										<Link
											href="/write"
											className="flex items-center gap-2 rounded-md px-3 py-2 hover:bg-muted"
										>
											<FilePenLine className="h-4 w-4" /> <span>Write</span>
										</Link>
										<Link
											href="mailto:insertcontact999@gmail.com"
											className="flex items-center gap-2 rounded-md px-3 py-2 hover:bg-muted"
										>
											<Contact className="h-4 w-4" /> <span>Contact</span>
										</Link>
									</div>
								</>
							)}
						</div>

						<div className="mt-auto p-4 border-t">
							{status === "authenticated" ? (
								<button
									onClick={handleLogOut}
									className="flex w-full items-center gap-2 rounded-md px-3 py-2 hover:bg-muted"
								>
									<LogOut className="h-4 w-4" /> <span>Logout</span>
								</button>
							) : (
								<Link
									href="/sign-in"
									className="flex w-full items-center gap-2 rounded-md px-3 py-2 hover:bg-muted"
								>
									<LogIn className="h-4 w-4" /> <span>Login</span>
								</Link>
							)}
						</div>
					</SheetContent>
				</Sheet>
			</div>

		</nav>
	);
};

export default InsertNavbar;
