"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu } from "lucide-react";
import { usePathname } from "next/navigation";

import InsertIcon from "@/components/InsertIcon";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

const navItems = [{ title: "About", href: "#about" }, { title: "Features", href: "#features" }, { title: "Pricing", href: "#pricing" }, { title: "Releases", href: "/release" }];

export function Navbar() {
    const pathname = usePathname();
    const [open, setOpen] = useState(false);
    const authHref = pathname === "/sign-up" ? "/sign-in" : "/sign-up";
    const authLabel = pathname === "/sign-up" ? "Sign in" : "Get started";
    return <header className="fixed inset-x-0 top-4 z-50 px-4">
        <div className="mx-auto flex h-16 max-w-[1480px] items-center justify-between rounded-2xl border border-slate-200/80 bg-white/80 px-4 shadow-[0_12px_50px_-30px_rgba(15,23,42,0.6)] backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-950/75 sm:px-5">
            <Link href="/" className="flex items-center gap-2.5">
                <InsertIcon width={34} height={34} className="rounded-xl border border-slate-200 bg-white p-1 dark:border-slate-700" />
                <span className="text-2xl tracking-[-0.02em]">Insert</span>
            </Link>
            <nav className="hidden items-center gap-1 md:flex">{navItems.map((item) => <Link key={item.href} href={item.href} className="rounded-md px-3 py-2 text-sm text-slate-500 transition hover:bg-slate-100 hover:text-slate-950 dark:hover:bg-slate-900 dark:hover:text-white">{item.title}</Link>)}
            </nav>
            <div className="hidden items-center gap-2 md:flex">
                <Button variant="ghost" asChild className="rounded-md"><Link href="/sign-in">Sign in</Link></Button>
                <Button asChild className="rounded-md"><Link href={authHref}>{authLabel}</Link></Button>
            </div>
            <Sheet open={open} onOpenChange={setOpen}><SheetTrigger asChild><Button variant="outline" size="icon" className="rounded-md md:hidden" aria-label="Open navigation">
                <Menu className="h-5 w-5" /></Button></SheetTrigger><SheetContent side="right" className="bg-slate-50 dark:bg-[#020817]">
                    <SheetHeader><SheetTitle className="flex items-center gap-2">
                        <InsertIcon width={32} height={32} className="rounded-md border bg-white p-1" />Insert</SheetTitle>
                    </SheetHeader><nav className="mt-8 space-y-1">{navItems.map((item) => <Link key={item.href} href={item.href} onClick={() => setOpen(false)} className="block rounded-md px-3 py-3 text-base hover:bg-slate-100 dark:hover:bg-slate-900">{item.title}</Link>)}</nav>
                    <div className="mt-8 grid gap-2"><Button variant="outline" asChild className="rounded-md"><Link href="/sign-in" onClick={() => setOpen(false)}>Sign in</Link></Button>
                        <Button asChild className="rounded-md"><Link href={authHref} onClick={() => setOpen(false)}>{authLabel}</Link></Button></div>
                </SheetContent>
            </Sheet>
        </div>
    </header>;
}
