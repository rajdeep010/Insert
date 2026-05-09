"use client";
import Link from "next/link";
import InsertIcon from "../InsertIcon";
import { usePathname } from "next/navigation";

export function Navbar() {
    const pathname = usePathname();
    const isSignUp = pathname === "/sign-up";
    const isSignIn = pathname === "/sign-in";

    const authHref = isSignUp ? "/sign-in" : "/sign-up";
    const authLabel = isSignUp ? "Sign In" : "Sign Up";

    return (
        <header className="fixed inset-x-0 top-0 z-30 mx-auto w-full border-b border-transparent backdrop-blur">
            <nav className="mx-auto flex h-14 w-full max-w-7xl items-center justify-between px-4">
                <Link href="/" className="flex items-center gap-2">
                    <InsertIcon height={24} width={24} className="rounded-sm border border-gray-900 p-[1px] dark:border-gray-700 dark:bg-white" />
                    <span className="text-sm font-semibold text-black dark:text-white">Insert</span>
                </Link>

                <div className="hidden items-center gap-6 text-sm text-gray-700 dark:text-gray-300 md:flex" />

                <div className="flex items-center gap-3">
                    <Link
                        href="/release"
                        className={pathname === "/release"
                            ? "rounded-full bg-gradient-to-r from-slate-900 to-slate-700 px-3.5 py-1.5 text-sm font-medium text-white shadow-sm dark:from-white dark:to-gray-200 dark:text-black"
                            : "rounded-full bg-black/[0.04] px-3.5 py-1.5 text-sm font-medium text-black transition-colors hover:bg-black/[0.08] dark:bg-white/10 dark:text-white dark:hover:bg-white/15"
                        }
                    >
                        Releases
                    </Link>
                    <Link
                        href={authHref}
                        className="rounded-md border border-black/10 px-3 py-1.5 text-sm font-medium text-black hover:bg-gray-50 dark:border-white/10 dark:text-white dark:hover:bg-white/10"
                    >
                        {authLabel}
                    </Link>
                </div>
            </nav>
        </header>
    );
}

