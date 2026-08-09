"use client";

import * as React from "react";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { useParams, usePathname, useRouter } from "next/navigation";
import {
    BadgeCheck,
    BookOpenText,
    BriefcaseBusiness,
    ChevronRight,
    FilePenLine,
    FolderKanban,
    LayoutDashboard,
    LayoutPanelTop,
    LogIn,
    LogOut,
    Menu,
    PanelsTopLeft,
    PenLine,
    User,
    User2,
    Users,
} from "lucide-react";

import InsertIcon from "@/components/InsertIcon";
import NotificationBellV2 from "@/components/notifications-v2/NotificationBellV2";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

type NavItem = {
    href: string;
    label: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
};

const isItemActive = (pathname: string, href: string) => {
    const path = href.split("?")[0];
    return path === "/" ? pathname === path : pathname === path || pathname.startsWith(`${path}/`);
};

function MenuCard({ item, pathname, onNavigate }: { item: NavItem; pathname: string; onNavigate?: () => void }) {
    const Icon = item.icon;
    const active = isItemActive(pathname, item.href);

    return (
        <NavigationMenuLink asChild active={active}>
            <Link href={item.href} onClick={onNavigate} className={cn("group flex min-w-0 items-start gap-3 rounded-xl p-3 outline-none transition-colors hover:bg-slate-100 focus:bg-slate-100 dark:hover:bg-slate-900 dark:focus:bg-slate-900", active && "") }>
                <span className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition-colors dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400", active && "border-indigo-500/25  ")}><Icon className="h-4 w-4" /></span>
                <span className="min-w-0">
                    <span className="flex items-center gap-2 text-sm font-medium leading-none text-slate-900 dark:text-slate-100">{item.label}{active && <span className="h-1.5 w-1.5 rounded-full" />}</span>
                    <span className="mt-1.5 line-clamp-2 block text-xs leading-5 text-slate-500 dark:text-slate-400">{item.description}</span>
                </span>
            </Link>
        </NavigationMenuLink>
    );
}

function DesktopMenuGroup({ label, items, pathname }: { label: string; items: NavItem[]; pathname: string }) {
    return (
        <NavigationMenuItem>
            <NavigationMenuTrigger className="h-10 rounded-xl bg-transparent px-3 text-slate-600 hover:bg-slate-100 data-[state=open]:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-900 dark:data-[state=open]:bg-slate-900">{label}</NavigationMenuTrigger>
            <NavigationMenuContent>
                <div className="w-[520px] p-2">
                    <div className="grid grid-cols-2 gap-1">{items.map((item) => <MenuCard key={item.href} item={item} pathname={pathname} />)}</div>
                </div>
            </NavigationMenuContent>
        </NavigationMenuItem>
    );
}

function MobileGroup({ label, items, pathname, onNavigate }: { label: string; items: NavItem[]; pathname: string; onNavigate: () => void }) {
    return (
        <section>
            <div className="mb-2 flex items-center justify-between px-1"><p className="text-[10px] font-medium uppercase tracking-[0.18em] text-slate-400">{label}</p><Badge variant="secondary" className="h-5 rounded-md px-1.5 text-[9px]">{items.length}</Badge></div>
            <div className="space-y-1 rounded-2xl border border-slate-200 bg-white/60 p-1.5 dark:border-slate-800 dark:bg-slate-950/50">
                {items.map((item) => {
                    const Icon = item.icon;
                    const active = isItemActive(pathname, item.href);
                    return <Link key={item.href} href={item.href} onClick={onNavigate} className={cn("flex items-center gap-3 rounded-xl px-3 py-3 transition-colors hover:bg-slate-100 dark:hover:bg-slate-900", active && "bg-indigo-500/[0.08] dark:text-indigo-300")}><span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-900"><Icon className="h-4 w-4" /></span><span className="min-w-0 flex-1"><span className="block text-sm font-medium">{item.label}</span><span className="line-clamp-1 block text-xs text-slate-500">{item.description}</span></span><ChevronRight className="h-4 w-4 text-slate-400" /></Link>;
                })}
            </div>
        </section>
    );
}

export default function InsertNavbar() {
    const { data: session, status } = useSession();
    const params = useParams();
    const pathname = usePathname();
    const router = useRouter();
    const [mobileOpen, setMobileOpen] = React.useState(false);
    const username = session?.user?.username;
    const paramUsername = params?.username as string | undefined;
    const profileUsername = paramUsername || username || "me";
    const canManageCollections = !paramUsername || username === paramUsername;

    const sectionLinks: NavItem[] = [
        { href: `/u/${profileUsername}?tab=overview`, label: "Overview", description: "Profile summary and recent activity.", icon: User2 },
        { href: `/u/${profileUsername}?tab=topics`, label: "Topics", description: "Structured sheets and coding problems.", icon: LayoutDashboard },
        { href: `/u/${profileUsername}?tab=blogs`, label: "Blogs", description: "Technical articles and personal notes.", icon: LayoutPanelTop },
        ...(canManageCollections ? [{ href: `/u/${profileUsername}?tab=collections`, label: "Collections", description: "Reusable topic and blog bundles.", icon: FolderKanban }] : []),
        { href: `/u/${profileUsername}?tab=projects`, label: "Projects", description: "Repositories and release journals.", icon: PanelsTopLeft },
    ];

    const workspaceLinks: NavItem[] = [
        { href: `/u/${username || profileUsername}`, label: "Profile", description: "Open your public Insert profile.", icon: User },
        { href: "/collaboration", label: "Collaboration", description: "Manage shared work and access.", icon: Users },
        { href: "/write", label: "Write", description: "Create and manage technical blogs.", icon: FilePenLine },
        { href: `/u/${profileUsername}?tab=subscribe`, label: "Subscription", description: "Review your Insert plan and access.", icon: BadgeCheck },
    ];

    const exploreLinks: NavItem[] = [
        { href: "/posts/topic", label: "Topics", description: "Discover community coding sheets.", icon: LayoutDashboard },
        { href: "/posts/blog", label: "Blogs", description: "Read writing from the community.", icon: BookOpenText },
        { href: "/posts/collections", label: "Collections", description: "Browse curated learning bundles.", icon: FolderKanban },
        { href: "/posts/projects", label: "Projects", description: "Explore builds and release updates.", icon: BriefcaseBusiness },
    ];

    const handleLogOut = async () => {
        await signOut({ redirect: false });
        setMobileOpen(false);
        router.push("/");
        router.refresh();
    };

    return (
        <nav aria-label="Primary navigation" className="relative z-40 flex h-16 items-center justify-between gap-4 rounded-2xl border-slate-200/80 bg-white/75 px-3 shadow-[0_10px_40px_-28px_rgba(15,23,42,0.55)] backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-950/65 sm:px-4">
            <Link href="/" aria-label="Insert home" className="group flex shrink-0 items-center gap-2.5 rounded-xl pr-2 outline-none focus-visible:ring-2 focus-visible:ring-indigo-500">
                <InsertIcon className="h-6 w-6 rounded-xl border border-slate-200 bg-white p-1 transition-transform group-hover:-rotate-3 dark:border-slate-700" />
                <span className="text-2xl tracking-[-0.02em]">Insert</span>
            </Link>

            <div className="hidden min-w-0 flex-1 items-center justify-end gap-2 lg:flex">
                {status === "authenticated" && username ? (
                    <>
                        <NavigationMenu className="mr-1">
                            <NavigationMenuList className="space-x-2 px-2 py-1">
                                <DesktopMenuGroup label="Sections" items={sectionLinks} pathname={pathname} />
                                <DesktopMenuGroup label="Workspace" items={workspaceLinks} pathname={pathname} />
                                <DesktopMenuGroup label="Explore" items={exploreLinks} pathname={pathname} />
                            </NavigationMenuList>
                        </NavigationMenu>
                        <Button asChild size="sm" className="h-10 px-4"><Link href="/write"><PenLine className="h-4 w-4" />Write</Link></Button>
                        <Tooltip><TooltipTrigger asChild><span className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white/70 dark:border-slate-800 dark:bg-slate-950/60"><NotificationBellV2 /></span></TooltipTrigger><TooltipContent>Notifications</TooltipContent></Tooltip>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild><Button variant="outline" className="h-10 rounded-xl px-3"><span className="flex h-6 w-6 items-center justify-center rounded-lg bg-indigo-500/10 text-xs font-semibold uppercase dark:text-indigo-300">{username.slice(0, 1)}</span><span className="max-w-28 truncate">{username}</span></Button></DropdownMenuTrigger>
                            <DropdownMenuContent align="end" sideOffset={10} className="w-60 rounded-xl p-2">
                                <DropdownMenuLabel><span className="block text-xs font-normal text-slate-500">Signed in as</span><span className="mt-1 block truncate">@{username}</span></DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild className="rounded-lg"><Link href={`/u/${username}`}><User className="mr-2 h-4 w-4" />View profile</Link></DropdownMenuItem>
                                <DropdownMenuItem className="rounded-lg text-red-600 focus:text-red-600" onClick={handleLogOut}><LogOut className="mr-2 h-4 w-4" />Sign out</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </>
                ) : status === "unauthenticated" ? (
                    <Button asChild className="h-10 rounded-xl px-5"><Link href="/sign-in"><LogIn className="mr-2 h-4 w-4" />Sign in</Link></Button>
                ) : <span className="h-10 w-24 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-900" />}
            </div>

            <div className="flex items-center gap-2 lg:hidden">
                {status === "authenticated" && username && <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800"><NotificationBellV2 /></span>}
                <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                    <SheetTrigger asChild><Button variant="outline" size="icon" className="h-10 w-10 rounded-xl" aria-label="Open navigation"><Menu className="h-5 w-5"/></Button></SheetTrigger>
                    <SheetContent side="right" className="w-[92vw] max-w-md border-slate-200 bg-slate-50 p-0 dark:border-slate-800 dark:bg-[#020817]">
                        <div className="flex h-full flex-col">
                            <SheetHeader className="border-b border-slate-200 px-5 py-5 text-left dark:border-slate-800">
                                <SheetTitle className="flex items-center gap-2.5"><InsertIcon className="h-9 w-9 rounded-xl border bg-white p-1" /><span className="text-xl">Insert</span></SheetTitle>
                                <SheetDescription>{username ? `Your workspace and community navigation, @${username}.` : "Sign in to open your Insert workspace."}</SheetDescription>
                            </SheetHeader>
                            <ScrollArea className="flex-1"><div className="space-y-6 p-5">{status === "authenticated" && username ? <><MobileGroup label="Sections" items={sectionLinks} pathname={pathname} onNavigate={() => setMobileOpen(false)} /><MobileGroup label="Workspace" items={workspaceLinks} pathname={pathname} onNavigate={() => setMobileOpen(false)} /><MobileGroup label="Explore" items={exploreLinks} pathname={pathname} onNavigate={() => setMobileOpen(false)} /></> : <div className="rounded-2xl border border-slate-200 bg-white p-5 text-sm dark:border-slate-800 dark:bg-slate-950">Sign in to access your profile, writing tools, and collaboration workspace.</div>}</div></ScrollArea>
                            <div className="border-t border-slate-200 p-5 dark:border-slate-800">{status === "authenticated" ? <Button variant="outline" className="h-11 w-full justify-start rounded-xl text-red-600" onClick={handleLogOut}><LogOut className="mr-2 h-4 w-4" />Sign out</Button> : <Button asChild className="h-11 w-full rounded-xl"><Link href="/sign-in" onClick={() => setMobileOpen(false)}><LogIn className="mr-2 h-4 w-4" />Sign in</Link></Button>}</div>
                        </div>
                    </SheetContent>
                </Sheet>
            </div>
        </nav>
    );
}
