"use client";
import Link from "next/link";
import { Button } from "../ui/button";

export function CTA() {
    return (
        <section className="mx-auto my-12 max-w-5xl px-4">
            <div className="relative overflow-hidden rounded-3xl border border-black/10 bg-black p-8 text-white dark:border-white/10">
                <div className="relative z-10">
                    <h3 className="text-2xl font-bold md:text-3xl">
                        Ready to automate your release notes?
                    </h3>
                    <p className="mt-2 text-sm text-gray-300">
                        Connect GitHub and publish your first release blog in minutes.
                    </p>
                    <div className="mt-5 flex flex-wrap gap-3">
                        <Link href="/sign-up">
                            <Button className="bg-white text-black hover:bg-gray-100">
                                Get Started
                            </Button>
                        </Link>
                        <Link href="#project-service">
                            <Button variant="outline" className="border-white text-white">
                                Learn more
                            </Button>
                        </Link>
                    </div>
                </div>

                <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
            </div>
        </section>
    );
}