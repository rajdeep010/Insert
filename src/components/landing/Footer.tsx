"use client";
import Link from "next/link";
import { GitHubLogoIcon, InstagramLogoIcon } from "@radix-ui/react-icons";
import { Linkedin } from "lucide-react";
import InsertIcon from "../InsertIcon";


export function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="mx-auto mt-16 w-full max-w-7xl px-4 pb-10 md:px-6 lg:px-8">
            <div className="border-t border-black/10 py-8 dark:border-white/10">
                <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
                    <div className="max-w-sm space-y-2">
                        <div className="flex items-center gap-2">
                            <InsertIcon height={24} width={24} className="rounded-sm border border-gray-900 p-[1px] dark:border-gray-700 dark:bg-white" />
                            <p className="text-lg">Insert</p>
                        </div>
                        <p className="text-sm leading-6 text-gray-600 dark:text-gray-300">
                            A developer workspace for coding sheets, blogs, and release workflow automation
                        </p>
                    </div>

                    <div className="flex flex-col gap-8 sm:flex-row sm:gap-12">
                        <div className="space-y-3">
                            <p className="text-xs font-medium uppercase tracking-[0.18em] text-gray-500 dark:text-gray-400">
                                Links
                            </p>
                            <div className="flex flex-col gap-2 text-sm text-gray-600 dark:text-gray-300">
                                <Link href="/release" className="transition-colors hover:text-black dark:hover:text-white">
                                    Releases
                                </Link>
                                <Link href="/privacy-policy" className="transition-colors hover:text-black dark:hover:text-white">
                                    Privacy Policy
                                </Link>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <p className="text-xs font-medium uppercase tracking-[0.18em] text-gray-500 dark:text-gray-400">
                                Social
                            </p>
                            <div className="flex items-center gap-4 text-gray-500 dark:text-gray-300">
                                <Link href="https://www.linkedin.com/in/rajdeep-mallick999/" target="_blank" aria-label="LinkedIn" className="transition-colors hover:text-black dark:hover:text-white">
                                    <Linkedin className="h-5 w-5" />
                                </Link>
                                <Link href="https://github.com/rajdeep010" target="_blank" aria-label="GitHub" className="transition-colors hover:text-black dark:hover:text-white">
                                    <GitHubLogoIcon className="h-5 w-5" />
                                </Link>
                                <Link href="https://www.instagram.com/rajdeepmallick010/" target="_blank" aria-label="Instagram" className="transition-colors hover:text-black dark:hover:text-white">
                                    <InstagramLogoIcon className="h-5 w-5" />
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-8 flex flex-col gap-2 text-sm text-gray-500 dark:text-gray-400 md:flex-row md:items-center md:justify-between">
                    <p>Built for cleaner publishing and release notes.</p>
                    <p>© {currentYear} Insert</p>
                </div>
            </div>
        </footer>
    );
}