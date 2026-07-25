"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { ArrowRight, Menu } from "lucide-react";
import { usePathname } from "next/navigation";

import InsertIcon from "../InsertIcon";
import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetContent,
    SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const navItems = [
    {
        title: "About",
        href: "#about",
    },
    {
        title: "Features",
        href: "#features",
    },
    {
        title: "Pricing",
        href: "#pricing",
    },
];

export function Navbar() {
    const pathname = usePathname();

    const isSignUp = pathname === "/sign-up";

    const authHref = isSignUp ? "/sign-in" : "/sign-up";
    const authLabel = isSignUp ? "Login" : "Sign Up";

    return (
        <motion.header
            initial={{ y: -30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="fixed inset-x-0 top-4 z-50 px-4"
        >
            <div
                className={cn(
                    "mx-auto flex max-w-7xl items-center justify-between transition-all duration-300",
                    "rounded-2xl border border-border/30 px-6 py-3 shadow-[0_0_20px_rgba(0,0,0,0.18)]"
                )}
            >
                <Link
                    href="/"
                    className="group flex items-center gap-3 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                >
                    <motion.div
                        whileHover={{ rotate: -3, scale: 1.05 }}
                        transition={{ duration: 0.2 }}
                    >
                        <InsertIcon
                            width={28}
                            height={28}
                            className="rounded-md border border-border bg-white p-[2px]"
                        />
                    </motion.div>

                    <span className="text-base font-semibold tracking-tight">
                        Insert
                    </span>
                </Link>

                <nav className="hidden items-center gap-10 md:flex">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="group relative text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                        >
                            {item.title}

                            <span className="absolute -bottom-1 left-0 h-[2px] w-0 rounded-full bg-primary transition-all duration-300 group-hover:w-full" />
                        </Link>
                    ))}
                </nav>

                <div className="hidden items-center gap-2 md:flex">
                    <Button variant="ghost" asChild>
                        <Link href="/sign-in">
                            Sign In
                        </Link>
                    </Button>

                    <Button asChild>
                        <Link href={authHref}>
                            {authLabel}
                            {/* <ArrowRight className="ml-2 h-4 w-4" /> */}
                        </Link>
                    </Button>
                </div>

                <Sheet>
                    <SheetTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="md:hidden"
                        >
                            <Menu className="h-5 w-5" />
                        </Button>
                    </SheetTrigger>

                    <SheetContent side="right">
                        <div className="mt-10 flex flex-col gap-8">
                            {navItems.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className="text-lg font-medium"
                                >
                                    {item.title}
                                </Link>
                            ))}

                            <div className="mt-4 space-y-3">
                                <Button
                                    variant="outline"
                                    className="w-full"
                                    asChild
                                >
                                    <Link href="/sign-in">
                                        Sign In
                                    </Link>
                                </Button>

                                <Button
                                    className="w-full"
                                    asChild
                                >
                                    <Link href={authHref}>
                                        {authLabel}
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </SheetContent>
                </Sheet>
            </div>
        </motion.header>
    );
}