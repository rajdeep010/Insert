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
} from "lucide-react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import NotificationBellV2 from "@/components/notifications-v2/NotificationBellV2";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import InsertIcon from "./InsertIcon";
import { cn } from "@/lib/utils";

type NavItem = {
	href: string;
	label: string;
	icon: React.ComponentType<{ className?: string }>;
};

const desktopNavButtonClassName =
	"inline-flex h-10 items-center justify-center gap-2 rounded-full border border-black/10 bg-white/70 px-4 text-sm font-medium text-slate-700 transition-colors hover:border-black/20 hover:bg-white dark:border-white/10 dark:bg-slate-950/40 dark:text-slate-200 dark:hover:border-white/20 dark:hover:bg-slate-950/70";

function DesktopNavDropdown({ label, items }: { label: string; items: NavItem[] }) {
	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="ghost" className={cn(desktopNavButtonClassName, "px-4")}>
					<span>{label}</span>
					<ChevronDown className="h-4 w-4" />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="start" sideOffset={10} className="w-60 rounded-2xl border border-black/10 bg-white/95 p-2 shadow-xl backdrop-blur dark:border-white/10 dark:bg-slate-950/95">
				{items.map(({ href, label: itemLabel, icon: Icon }) => (
					<DropdownMenuItem key={href} asChild className="cursor-pointer rounded-xl px-3 py-3 focus:bg-slate-100 dark:focus:bg-slate-900">
						<Link href={href} className="flex items-center gap-3">
							<div className="rounded-lg bg-slate-100 p-2 text-slate-600 dark:bg-slate-900 dark:text-slate-300">
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
		<nav className="flex items-center justify-between gap-6 rounded-full border border-black/10 bg-white/70 px-4 py-3 shadow-sm backdrop-blur dark:border-white/10 dark:bg-slate-950/50 sm:px-5">
			<Link className="flex items-center gap-3 text-2xl font-sans sm:text-3xl" href="/">
				<InsertIcon className="rounded-full border bg-white p-[4px]" />
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
					<SheetContent side="left" className="w-[85vw] sm:max-w-sm p-0">
						<div className="border-b p-4">
							<Link href="/" className="flex items-center gap-3 text-2xl">
								<InsertIcon className="rounded-full border bg-white p-[4px]" />
								<span className="font-sans">Insert</span>
							</Link>
							{session && (
								<div className="mt-2 text-sm text-muted-foreground">Signed in as @{session.user?.username}</div>
							)}
						</div>

						<div className="p-3">
							{status === "authenticated" && username && (
								<>
									<div className="px-3 py-2 text-xs uppercase tracking-wide text-muted-foreground">Sections</div>
									<div className="space-y-1">
										{sectionLinks.map(({ href, label, icon: Icon }) => (
											<Link key={href} href={href} className="flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-muted">
												<Icon className="h-4 w-4" />
												<span>{label}</span>
											</Link>
										))}
									</div>

									<div className="px-3 pb-2 pt-4 text-xs uppercase tracking-wide text-muted-foreground">Workspace</div>
									<div className="space-y-1">
										{workspaceLinks.map(({ href, label, icon: Icon }) => (
											<Link key={href} href={href} className="flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-muted">
												<Icon className="h-4 w-4" />
												<span>{label}</span>
											</Link>
										))}
									</div>

									<div className="px-3 pb-2 pt-4 text-xs uppercase tracking-wide text-muted-foreground">Posts</div>
									<div className="space-y-1">
										{postLinks.map(({ href, label, icon: Icon }) => (
											<Link key={href} href={href} className="flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-muted">
												<Icon className="h-4 w-4" />
												<span>{label}</span>
											</Link>
										))}
									</div>
								</>
							)}

							<div className="px-3 pt-4">
								{status === "authenticated" ? (
									<Tooltip>
										<TooltipTrigger asChild>
											<button onClick={handleLogOut} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-muted">
												<LogOut className="h-4 w-4" />
											</button>
										</TooltipTrigger>
										<TooltipContent>Logout</TooltipContent>
									</Tooltip>
								) : (
									<Link href="/sign-in" className="flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-muted">
										<LogIn className="h-4 w-4" />
										<span>Login</span>
									</Link>
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
