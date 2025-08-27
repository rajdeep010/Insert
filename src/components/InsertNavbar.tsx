"use client";
import * as React from "react";
import Link from "next/link";
import { useSession,signOut } from "next-auth/react";
import { useParams,useRouter } from "next/navigation";
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

const InsertNavbar = () => {
	const { data: session,status } = useSession();
	const params = useParams();
	const router = useRouter();
	const username = session?.user?.username;
	const param_username = params?.username as string;
	const [notifyLoader,setNotifyLoader] = React.useState(false)

	const { user,markAllRead,unreadNotifyCount,notifications,getNotifications } = useInsertUser();

	const handleGetNotifier = async () => {
		try {
			console.log('get notifications called',notifications)
			setNotifyLoader(true)
			await getNotifications()
		} catch (error) {

		} finally {
			setNotifyLoader(false)
			console.log('get notifications finished',notifications)
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
										<Separator/>
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
												(msg: any,idx: number) => (
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
										onClick={() => signOut()}
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
								{
									notifyLoader && <Loader2 className="h-4 w-4 animate-spin" />
								}

								{!notifications && !notifyLoader && (
									<>
										<div className="p-2 text-sm opacity-50">
											No notifications
										</div>
									</>
								)}

								{!notifyLoader &&
									notifications?.map(
										(msg: any,idx: number) => (
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
										)
									)
								}
							</div>
						</DropdownMenuContent>
					</DropdownMenu>
				)}
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Menu className="h-6 w-6 mx-2 outline-none border-none" />
					</DropdownMenuTrigger>
					<DropdownMenuContent className="w-56" align="start">

						{status === "authenticated" && username && <DropdownMenuGroup>
							<DropdownMenuLabel>Sections</DropdownMenuLabel>
							<DropdownMenuItem className="rounded-md hover:bg-gray-200 dark:hover:bg-gray-800 cursor-pointer">
								<Link
									href={`/u/${!param_username
										? session?.user?.username
										: param_username
										}?tab=overview`}
									className="flex gap-2 items-center"
								>
									<User2 className="h-4 w-4" /> <span>Overview</span>
								</Link>
							</DropdownMenuItem>
							<DropdownMenuItem className="rounded-md hover:bg-gray-200 dark:hover:bg-gray-800 cursor-pointer">
								<Link
									href={`/u/${!param_username
										? session?.user?.username
										: param_username
										}?tab=topics`}
									className="flex gap-2 items-center"
								>
									<FileText className="h-4 w-4" />
									<span className="text-sm">Topics</span>
								</Link>
							</DropdownMenuItem>
							<DropdownMenuItem className="rounded-md hover:bg-gray-200 dark:hover:bg-gray-800 cursor-pointer">
								<Link
									href={`/u/${!param_username
										? session?.user?.username
										: param_username
										}?tab=blogs`}
									className="flex gap-2 items-center"
								>
									<LayoutPanelTop className="h-4 w-4" />
									<span className="text-sm">Blogs</span>
								</Link>
							</DropdownMenuItem>
							<DropdownMenuItem className="rounded-md hover:bg-gray-200 dark:hover:bg-gray-800 cursor-pointer">
								<Link
									href={`/u/${!param_username
										? session?.user?.username
										: param_username
										}?tab=blogs`}
									className="flex gap-2 items-center"
								>
									<PanelsTopLeft className="h-4 w-4" />
									<span className="text-sm">Projects</span>
								</Link>
							</DropdownMenuItem>
						</DropdownMenuGroup>}

						<DropdownMenuSeparator />

						{status === "authenticated" && username && <DropdownMenuGroup>
							<DropdownMenuLabel>Posts</DropdownMenuLabel>
							<DropdownMenuItem className="rounded-md hover:bg-gray-200 dark:hover:bg-gray-800 cursor-pointer">
								<Link
									href={`/posts/topic`}
									className=" flex gap-2 items-center"
								>
									<LayoutGrid className="h-4 w-4" />
									<span className="text-sm">Topics</span>
								</Link>
							</DropdownMenuItem>
							<DropdownMenuItem className="rounded-md hover:bg-gray-200 dark:hover:bg-gray-800 cursor-pointer">
								<Link
									href={`/posts/blog`}
									className=" flex gap-2 items-center"
								>
									<LayoutGrid className="h-4 w-4" />
									<span className="text-sm">Blogs</span>
								</Link>
							</DropdownMenuItem>
							<DropdownMenuItem className="rounded-md hover:bg-gray-200 dark:hover:bg-gray-800 cursor-pointer">
								<Link
									href={`/posts/projects`}
									className=" flex gap-2 items-center"
								>
									<LayoutGrid className="h-4 w-4" />
									<span className="text-sm">Projects</span>
								</Link>
							</DropdownMenuItem>
						</DropdownMenuGroup>}

						<DropdownMenuSeparator />

						{session && status === "authenticated" && <DropdownMenuGroup>
							<DropdownMenuItem className="rounded-md hover:bg-gray-200 dark:hover:bg-gray-800 cursor-pointer">
								<Link href={`/u/${session.user?.username}`}>
									<User className="inline mr-2 h-4 w-4" />
									Profile
								</Link>
							</DropdownMenuItem>

							<DropdownMenuItem className="rounded-md hover:bg-gray-200 dark:hover:bg-gray-800 cursor-pointer">
								<Link href="/write">
									<FilePenLine className="inline mr-2 h-4 w-4" />
									Write
								</Link>
							</DropdownMenuItem>

							<DropdownMenuItem className="rounded-md hover:bg-gray-200 dark:hover:bg-gray-800 cursor-pointer">
								<Link href="mailto:insertcontact999@gmail.com">
									<Contact className="inline mr-2 h-4 w-4" />
									Contact
								</Link>
							</DropdownMenuItem>
						</DropdownMenuGroup>}

						<DropdownMenuSeparator />


						{status === "authenticated" ? (<DropdownMenuItem className="rounded-md hover:bg-gray-200 dark:hover:bg-gray-800 cursor-pointer">
							<div className="flex items-center gap-2" onClick={() => signOut()}>
								<LogOut className="h-4 w-4" /> <span>Logout</span>
							</div>

						</DropdownMenuItem>) : (
							<DropdownMenuItem className="rounded-md hover:bg-gray-200 dark:hover:bg-gray-800 cursor-pointer">
								<Link href="/sign-in" className="flex items-center gap-2">
									<LogIn className="h-4 w-4" /> <span>Login</span>
								</Link>
							</DropdownMenuItem>
						)}
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
		</nav>
	);
};

export default InsertNavbar;
