"use client";
import Link from "next/link";
import InsertIcon from "../InsertIcon";

export function Navbar() {
    return (
        <header className="fixed inset-x-0 top-0 z-30 mx-auto w-full border-b border-transparent bg-white/70 backdrop-blur dark:bg-black/40">
            <nav className="mx-auto flex h-14 w-full max-w-7xl items-center justify-between px-4">
                <Link href="/" className="flex items-center gap-2">
                    <InsertIcon height={24} width={24} className="rounded-sm border border-gray-900 p-[1px] dark:border-gray-700 dark:bg-white" />
                    <span className="text-sm font-semibold text-black dark:text-white">Insert</span>
                </Link>

                <div className="hidden items-center gap-6 text-sm text-gray-700 dark:text-gray-300 md:flex">
                    {/* <Link href="#about">About</Link> */}
                </div>

                <div className="flex items-center gap-3">
                    <Link
                        href="/sign-up"
                        className="rounded-md border border-black/10 px-3 py-1.5 text-sm font-medium text-black hover:bg-gray-50 dark:border-white/10 dark:text-white dark:hover:bg-white/10"
                    >
                        Sign Up
                    </Link>
                </div>
            </nav>
        </header>
    );
}