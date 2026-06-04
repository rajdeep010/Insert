"use client";
import * as React from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import {
	User,
	FilePenLine,
	LogIn,
	LogOut,
	User2,
	LayoutPanelTop,
	Menu,
	LayoutDashboard,
	PanelsTopLeft,
	BadgeCheck,
	FolderKanban,
	Users,
	ChevronDown,
	PenBoxIcon,
	User2Icon,
	Users2,
} from "lucide-react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import NotificationBellV2 from "@/components/notifications-v2/NotificationBellV2";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ScrollArea } from "@/components/ui/scroll-area";
import InsertIcon from "./InsertIcon";
import { cn } from "@/lib/utils";

type NavItem = {
	href: string;
	label: string;
	icon: React.ComponentType<{ className?: string }>;
};

const desktopNavButtonClassName =
	"inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-black/10 bg-white/70 px-4 text-sm font-medium text-slate-700 transition-colors hover:border-black/20 hover:bg-white dark:border-white/10 dark:bg-slate-950/40 dark:text-slate-200 dark:hover:border-white/20 dark:hover:bg-slate-950/70";

function DesktopNavDropdown({ label, items }: { label: string; items: NavItem[] }) {
	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="ghost" className={cn(desktopNavButtonClassName, "px-4")}>
					<span>{label}</span>
					<ChevronDown className="h-4 w-4" />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="start" sideOffset={10} className="w-60 rounded-md border border-black/10 bg-white/95 p-2 shadow-xl backdrop-blur dark:border-white/10 dark:bg-slate-950/95">
				{items.map(({ href, label: itemLabel, icon: Icon }) => (
					<DropdownMenuItem key={href} asChild className="cursor-pointer rounded-md px-3 py-3 focus:bg-slate-100 dark:focus:bg-slate-900">
						<Link href={href} className="flex items-center gap-3">
							<div className="rounded-md bg-slate-100 p-2 text-slate-600 dark:bg-slate-900 dark:text-slate-300">
								<Icon className="h-4 w-4" />
							</div>
							<span className="text-sm font-medium">{itemLabel}</span>
						</Link>
					</DropdownMenuItem>
				))}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

function MobileNavSection({
	title,
	items,
}: {
	title: string;
	items: NavItem[];
}) {
	return (
		<AccordionItem value={title.toLowerCase()} className="overflow-hidden rounded-3xl border border-border/60 bg-background/70 px-4">
			<AccordionTrigger className="py-4 text-left no-underline hover:no-underline">
				<div className="flex flex-1 items-center justify-between gap-3 pr-2">
					<p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">{title}</p>
					<Badge variant="secondary" className="rounded-full px-2 py-0.5 text-[10px]">
						{items.length}
					</Badge>
				</div>
			</AccordionTrigger>
			<AccordionContent className="space-y-2 pb-4">
				{items.map(({ href, label, icon: Icon }) => (
					<Link
						key={href}
						href={href}
						className="flex items-center gap-3 rounded-2xl border border-border/60 bg-background/80 px-4 py-3 transition-colors hover:bg-accent/50"
					>
						<div className="rounded-xl bg-muted p-2 text-muted-foreground">
							<Icon className="h-4 w-4" />
						</div>
						<span className="text-sm font-medium text-foreground">{label}</span>
					</Link>
				))}
			</AccordionContent>
		</AccordionItem>
	);
}

const InsertNavbar = () => {
	const { data: session, status } = useSession();
	const params = useParams();
	const router = useRouter();
	const username = session?.user?.username;
	const param_username = params?.username as string;
	const canManageCollections = !param_username || session?.user?.username === param_username;
	const profileUsername = !param_username ? session?.user?.username : param_username;

	const sectionLinks: NavItem[] = [
		{ href: `/u/${profileUsername}?tab=overview`, label: "Overview", icon: User2 },
		{ href: `/u/${profileUsername}?tab=topics`, label: "Topics", icon: LayoutDashboard },
		{ href: `/u/${profileUsername}?tab=blogs`, label: "Blogs", icon: LayoutPanelTop },
		...(canManageCollections ? [{ href: `/u/${profileUsername}?tab=collections`, label: "Collections", icon: FolderKanban }] : []),
		{ href: `/u/${profileUsername}?tab=projects`, label: "Projects", icon: PanelsTopLeft },
	];

	const workspaceLinks: NavItem[] = [
		{ href: `/u/${session?.user?.username}`, label: "Profile", icon: User },
		{ href: `/collaboration`, label: "Collaboration", icon: Users },
		{ href: `/write`, label: "Write", icon: FilePenLine },
		{ href: `/u/${profileUsername}?tab=subscribe`, label: "Subscribe", icon: BadgeCheck },
	];

	const postLinks: NavItem[] = [
		{ href: `/posts/topic`, label: "Topics", icon: LayoutDashboard },
		{ href: `/posts/blog`, label: "Blogs", icon: LayoutPanelTop },
		{ href: `/posts/collections`, label: "Collections", icon: FolderKanban },
		{ href: `/posts/projects`, label: "Projects", icon: PanelsTopLeft },
	];

	const handleLogOut = () => {
		signOut();
		router.push("/");
	};

	return (
		<nav className="flex items-center justify-between gap-6 rounded-lg border border-black/10 bg-white/70 px-4 py-3 shadow-sm backdrop-blur dark:border-white/10 dark:bg-slate-950/50 sm:px-5">
			<Link className="flex items-center gap-3 text-2xl font-sans sm:text-3xl" href="/">
				<InsertIcon className="rounded-lg border bg-white p-[4px]" />
				<span>Insert</span>
			</Link>

			<div className="hidden lg:flex items-center gap-3">
				{status === "authenticated" && username ? (
					<>
						<DesktopNavDropdown label="Sections" items={sectionLinks} />
						<DesktopNavDropdown label="Workspace" items={workspaceLinks} />
						<DesktopNavDropdown label="Posts" items={postLinks} />
						<Tooltip>
							<TooltipTrigger asChild>
								<span className="inline-flex">
									<NotificationBellV2 />
								</span>
							</TooltipTrigger>
							<TooltipContent>Notifications</TooltipContent>
						</Tooltip>
						<Tooltip>
							<TooltipTrigger asChild>
								<Button type="button" variant="ghost" className={desktopNavButtonClassName} onClick={handleLogOut}>
									<LogOut className="h-4 w-4" />
								</Button>
							</TooltipTrigger>
							<TooltipContent>Logout</TooltipContent>
						</Tooltip>
					</>
				) : (
					<Button asChild type="button" variant="ghost" className={desktopNavButtonClassName}>
						<Link href="/sign-in">
							<LogIn className="h-4 w-4" />
							Login
						</Link>
					</Button>
				)}
			</div>

			<div className="lg:hidden flex items-center gap-4">
				{status === "authenticated" && username && <NotificationBellV2 />}

				<Sheet>
					<SheetTrigger asChild>
						<button
							aria-label="Open menu"
							className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-white/70 hover:bg-white dark:border-white/10 dark:bg-slate-950/40 dark:hover:bg-slate-950/70"
						>
							<Menu className="h-5 w-5" />
						</button>
					</SheetTrigger>
					<SheetContent side="left" className="w-[92vw] max-w-[30rem] border-border/60 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,250,252,0.98))] p-0 dark:bg-[linear-gradient(180deg,rgba(2,6,23,0.98),rgba(2,6,23,1))]">
						<div className="flex h-full flex-col">
							<SheetHeader className="border-b border-border/60 px-5 py-5 pr-14 text-left">
								<div className="flex items-start justify-between gap-4">
									<div className="space-y-3">
										<Link href="/" className="flex items-center gap-3 text-2xl">
											<InsertIcon className="rounded-full border bg-white p-[4px]" />
											<span className="font-sans">Insert</span>
										</Link>
										<div className="space-y-1">
											{/* <SheetTitle className="text-base font-medium">Workspace navigation</SheetTitle> */}
											<SheetDescription>
												Move between your writing, collaboration, and public content from one place.
											</SheetDescription>
											{session?.user?.username ? (
												<div className="pt-2">
													<Badge variant="secondary" className="rounded-full px-3 py-1 text-xs font-medium">
														@{session.user.username}
													</Badge>
												</div>
											) : null}
										</div>
									</div>
								</div>

								<div className="mt-4 grid grid-cols-2 gap-2">
									<Link
										href="/write"
										className="flex items-center gap-2 rounded-2xl border border-border/60 bg-background/70 px-4 py-3 transition-colors hover:bg-accent/50"
									>
										<PenBoxIcon className="h-4 w-4" />
										<p className="text-sm font-medium text-foreground">Write</p>
										{/* <p className="mt-1 text-xs text-muted-foreground">Jump back into editing.</p> */}
									</Link>
									<Link
										href="/collaboration"
										className="flex items-center gap-2 rounded-2xl border border-border/60 bg-background/70 px-4 py-3 transition-colors hover:bg-accent/50"
									>
										<Users2 className="h-4 w-4" />
										<p className="text-sm font-medium text-foreground">Collaboration</p>
										{/* <p className="mt-1 text-xs text-muted-foreground">Manage shared workspaces.</p> */}
									</Link>
								</div>
							</SheetHeader>

							<div className="flex-1 overflow-hidden px-5 py-5">
								<ScrollArea className="h-full pr-3">
									<div className="space-y-6 pb-4">
										{status === "authenticated" && username ? (
											<Accordion type="multiple" defaultValue={["sections", "workspace"]} className="space-y-4">
												<MobileNavSection title="Sections" items={sectionLinks} />
												<MobileNavSection title="Workspace" items={workspaceLinks} />
												<MobileNavSection title="Posts" items={postLinks} />
											</Accordion>
										) : (
											<section className="rounded-3xl border border-border/60 bg-background/70 px-4 py-4">
												<p className="text-sm font-medium text-foreground">Sign in to open your workspace</p>
												<p className="mt-1 text-xs leading-5 text-muted-foreground">Access your profile, personal sections, collaboration tools, and writing space.</p>
											</section>
										)}
									</div>
								</ScrollArea>
							</div>

							<div className="border-t border-border/60 px-5 py-4">
								{status === "authenticated" ? (
									<Button type="button" variant="outline" className="h-11 w-full justify-start rounded-2xl" onClick={handleLogOut}>
										<LogOut className="mr-2 h-4 w-4" />
										Logout
									</Button>
								) : (
									<Button asChild type="button" className="h-11 w-full justify-start rounded-2xl">
										<Link href="/sign-in">
											<LogIn className="mr-2 h-4 w-4" />
											Login
										</Link>
									</Button>
								)}
							</div>
						</div>
					</SheetContent>
				</Sheet>
			</div>
		</nav>
	);
};

export default InsertNavbar;
