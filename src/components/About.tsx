"use client";

import React from "react";
import { WobbleCard } from "./ui/wobble-card";
import Image from "next/image";

export function About() {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 max-w-7xl mx-auto w-full my-16 px-4">
            <WobbleCard
                containerClassName="col-span-1 lg:col-span-2 h-full bg-pink-800 min-h-[500px] lg:min-h-[300px]"
                className=""
            >
                <div className="max-w-xs">
                    <h2 className="text-left text-balance text-base md:text-xl lg:text-3xl font-semibold tracking-[-0.015em] text-white">
                        Craft & Collaborate on Coding Sheets with Insert
                    </h2>
                    <p className="mt-4 text-left text-sm lg:text-base/4 text-neutral-200">
                        Create, share, and collaborate on custom problem sheets — with public, private modes built in. Coding just got more connected.
                    </p>
                </div>
                <Image
                    src="https://res.cloudinary.com/dgxeg3sju/image/upload/v1753474718/05969d69-43c7-4200-beca-173029a48450.png"
                    width={500}
                    height={500}
                    alt="linear demo image"
                    className="absolute -right-4 lg:-right-[10%] filter -bottom-10 object-contain rounded-2xl"
                />
            </WobbleCard>
            <WobbleCard containerClassName="col-span-1 min-h-[300px]">
                <h2 className="max-w-80  text-left text-balance text-base md:text-xl lg:text-3xl font-semibold tracking-[-0.015em] text-white">
                    Build slow. Ship fast. Iterate smarter.
                </h2>
                <p className="mt-4 max-w-[26rem] text-left text-sm lg:text-base/4 text-neutral-200">
                    It&apos;s not just pixels and commits — it&apos;s the craft, the chaos, and the coffee.
                    Embrace the bumps, celebrate the breakthroughs.

                </p>
            </WobbleCard>
            <WobbleCard containerClassName="col-span-1 lg:col-span-3 bg-teal-700  min-h-[500px] lg:min-h-[600px] xl:min-h-[300px]">
                <div className="max-w-lg">
                    <h2 className="max-w-lg md:max-w-lg  text-left text-balance text-base md:text-xl lg:text-3xl font-semibold tracking-[-0.015em] text-white">
                        Signup for cutting-edge art of writing Blogs with Insert
                    </h2>
                    <p className="mt-4 max-w-[46rem] text-left text-sm lg:text-base/4 text-neutral-200">
                        Whether you&apos;re sharing ideas or documenting deep dives, our editor adapts to your flow — crisp, intuitive, and always in sync with your thoughts.
                    </p>
                </div>
                <Image
                    src="https://res.cloudinary.com/dgxeg3sju/image/upload/v1753474830/4440e28b-4269-42b1-9536-179d06eb8f80.png"
                    width={500}
                    height={500}
                    alt="linear demo image"
                    className="absolute -right-10 lg:-right-[5%] -bottom-10 object-contain rounded-2xl"
                />
            </WobbleCard>
            <WobbleCard containerClassName="col-span-1 min-h-[300px] bg-amber-600">
                <h2 className="max-w-80 text-left text-balance text-base md:text-xl lg:text-3xl font-semibold tracking-[-0.015em] text-white">
                    Releases on autopilot
                </h2>
                <p className="mt-4 max-w-[26rem] text-left text-sm lg:text-base/4 text-yellow-50">
                    Add a keyword to your commit and get a clean, linked release blog —
                    keep committing, we&apos;ll handle the rest.
                </p>
            </WobbleCard>
            <WobbleCard
                containerClassName="col-span-1 lg:col-span-2 h-full bg-blue-800 min-h-[480px] lg:min-h-[300px]"
                className=""
            >
                <div className="max-w-sm">
                    <h2 className="text-left text-balance text-base md:text-xl lg:text-3xl font-semibold tracking-[-0.015em] text-white">
                        Project dashboard that stays in sync
                    </h2>
                    <p className="mt-4 text-left text-sm lg:text-base/4 text-neutral-200">
                        Import your GitHub repo once and keep committing as usual. Insert tracks keywords,
                        compiles commits, and drafts a publish‑ready release blog for review.
                    </p>
                </div>
                <Image
                    src="/insert_project.png"
                    width={560}
                    height={560}
                    alt="Insert project dashboard"
                    className="absolute -right-10 lg:-right-[20%] -bottom-[40%] object-contain rounded-2xl"
                />
            </WobbleCard>
        </div>
    );
}
