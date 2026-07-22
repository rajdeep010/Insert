"use client";

import Link from "next/link";
import { GitHubLogoIcon, InstagramLogoIcon } from "@radix-ui/react-icons";
import { Linkedin } from "lucide-react";
import InsertIcon from "../InsertIcon";

export function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-background relative">

            <div
                className="pointer-events-none absolute inset-0 z-0 opacity-40"
                style={{
                    backgroundImage: [
                        "linear-gradient(hsl(var(--border) / 0.5) 1px, transparent 1px)",
                        "linear-gradient(90deg, hsl(var(--border) / 0.5) 1px, transparent 1px)",
                    ].join(", "),
                    backgroundSize: "48px 48px",
                }}
            />

            <div className="border-t border-border/60 py-10 mx-auto w-full max-w-7xl px-6 pb-12">
                <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">

                    {/* Brand Meta Block */}
                    <div className="max-w-sm space-y-3">
                        <div className="flex items-center gap-2.5">
                            <InsertIcon
                                height={26}
                                width={26}
                                className="rounded-md border border-border bg-white p-1 shadow-sm"
                            />
                            <p className="text-base font-semibold text-foreground tracking-tight">Insert</p>
                        </div>
                        <p className="text-sm leading-relaxed text-muted-foreground">
                            A developer workspace for writing, team collaboration with role-based access, and release workflow automation.
                        </p>
                    </div>

                    {/* Navigation Matrices */}
                    <div className="flex flex-col gap-8 sm:flex-row sm:gap-16">

                        {/* Links Column */}
                        <div className="space-y-3">
                            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground/60">
                                Product
                            </p>
                            <div className="flex flex-col gap-2.5 text-sm text-muted-foreground">
                                <Link href="/release" className="transition-colors hover:text-foreground">
                                    Releases
                                </Link>
                                <Link href="/privacy-policy" className="transition-colors hover:text-foreground">
                                    Privacy Policy
                                </Link>
                            </div>
                        </div>

                        {/* Social Presence Column */}
                        <div className="space-y-3">
                            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground/60">
                                Connect
                            </p>
                            <div className="flex items-center gap-4 text-muted-foreground">
                                <Link
                                    href="https://www.linkedin.com/in/rajdeep-mallick999/"
                                    target="_blank"
                                    aria-label="LinkedIn"
                                    className="transition-colors hover:text-foreground"
                                >
                                    <Linkedin className="h-5 w-5" />
                                </Link>
                                <Link
                                    href="https://github.com/rajdeep010"
                                    target="_blank"
                                    aria-label="GitHub"
                                    className="transition-colors hover:text-foreground"
                                >
                                    <GitHubLogoIcon className="h-5 w-5" />
                                </Link>
                                <Link
                                    href="https://www.instagram.com/rajdeepmallick010/"
                                    target="_blank"
                                    aria-label="Instagram"
                                    className="transition-colors hover:text-foreground"
                                >
                                    <InstagramLogoIcon className="h-5 w-5" />
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Closing Copyright Section */}
                <div className="mt-12 pt-6 border-t border-border/40 flex flex-col gap-3 text-xs font-mono text-muted-foreground/70 md:flex-row md:items-center md:justify-between">
                    <p>Built for crisp technical distribution and engineering logs.</p>
                    <p className="text-muted-foreground/50">© {currentYear} Insert. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
}