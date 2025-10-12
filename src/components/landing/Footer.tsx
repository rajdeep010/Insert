"use client";
import Link from "next/link";
import { GitHubLogoIcon, InstagramLogoIcon } from "@radix-ui/react-icons";
import { Linkedin } from "lucide-react";


export function Footer() {
    return (
        <footer className="mx-auto mt-12 w-full max-w-7xl px-4 pb-12">
            <div className="flex flex-col items-center justify-between gap-4 px-48 border-t border-black/10 pt-6 text-sm text-gray-600 dark:border-white/10 dark:text-gray-300 md:flex-row">
                <div className="flex items-center gap-2">
                    <span className="font-semibold text-black dark:text-white">Insert</span>
                    <span className="text-gray-400">•</span>
                    <span>2025</span>
                </div>

                <div className="flex items-center gap-5">
                    <Link href="https://www.linkedin.com/in/rajdeep-mallick999/" target="_blank" aria-label="LinkedIn">
                        <Linkedin className="h-5 w-5" />
                    </Link>
                    <Link href="https://github.com/rajdeep010" target="_blank" aria-label="GitHub">
                        <GitHubLogoIcon className="h-5 w-5" />
                    </Link>
                    <Link href="https://www.instagram.com/rajdeepmallick010/" target="_blank" aria-label="Instagram">
                        <InstagramLogoIcon className="h-5 w-5" />
                    </Link>
                </div>
            </div>
        </footer>
    );
}