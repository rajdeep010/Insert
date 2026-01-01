"use client";

import React from "react";
import { WobbleCard } from "./ui/wobble-card";
import Image from "next/image";

export function About() {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 max-w-7xl mx-auto w-full my-16 px-4">
            <WobbleCard
                containerClassName="col-span-1 lg:col-span-2 h-full bg-gradient-to-br from-red-600 to-orange-600 min-h-[500px] lg:min-h-[300px]"
                className=""
            >
                <div className="max-w-xs">
                    <h2 className="text-left text-balance text-base md:text-xl lg:text-3xl font-semibold tracking-[-0.015em] text-white">
                        Create structured coding sheets
                    </h2>
                    <p className="mt-4 text-left text-sm lg:text-base/4 text-rose-50/90">
                        Build and refine problem sets with versioned drafts and workspace controls. Publish or export when ready.
                    </p>
                </div>
                <Image
                    src="https://res.cloudinary.com/dgxeg3sju/image/upload/v1753474718/05969d69-43c7-4200-beca-173029a48450.png"
                    width={500}
                    height={500}
                    alt="Sheets collaboration preview"
                    className="absolute -right-4 lg:-right-[10%] filter -bottom-10 object-contain rounded-2xl"
                />
            </WobbleCard>

            <WobbleCard containerClassName="col-span-1 min-h-[300px] bg-gradient-to-br from-blue-800 to-indigo-800">
                <h2 className="max-w-80  text-left text-balance text-base md:text-xl lg:text-3xl font-semibold tracking-[-0.015em] text-white">
                    Build slow. Ship fast. Iterate smarter.
                </h2>
                <p className="mt-4 max-w-[26rem] text-left text-sm lg:text-base/4 text-neutral-200">
                    Plan, write, and release with focus. Keep momentum without sacrificing quality.
                </p>
            </WobbleCard>

            <WobbleCard containerClassName="col-span-1 lg:col-span-3 bg-gradient-to-br from-teal-800 to-teal-600  min-h-[500px] lg:min-h-[600px] xl:min-h-[300px]">
                <div className="max-w-lg">
                    <h2 className="max-w-lg md:max-w-lg  text-left text-balance text-base md:text-xl lg:text-3xl font-semibold tracking-[-0.015em] text-white">
                        Write technical blogs and documentation with Insert
                    </h2>
                    <p className="mt-4 max-w-[46rem] text-left text-sm lg:text-base/4 text-neutral-200">
                        Draft technical articles and project docs with a clean, focused editor — rich formatting, code blocks, and simple publishing.
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

            <WobbleCard containerClassName="col-span-1 min-h-[300px] bg-gradient-to-br from-amber-600 to-orange-600">
                <h2 className="max-w-80 text-left text-balance text-base md:text-xl lg:text-3xl font-semibold tracking-[-0.015em] text-white">
                    Seamless Pro — no interruptions
                </h2>
                <p className="mt-4 max-w-[26rem] text-left text-sm lg:text-base/4 text-yellow-50">
                    Upgrade in seconds and Pro features unlock instantly: project dashboards, unlimited sheets, and automated release notes — all consistent with your workflow.
                </p>
            </WobbleCard>

            <WobbleCard
                containerClassName="col-span-1 lg:col-span-2 h-full bg-gradient-to-br from-indigo-800 to-violet-800 min-h-[480px] lg:min-h-[300px]"
                className=""
            >
                <div className="max-w-sm">
                    <div className="mb-2 inline-flex items-center gap-2">
                        <span className="inline-flex items-center rounded-full bg-indigo-600/90 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-white">
                            Pro
                        </span>
                        <span className="text-xs text-indigo-100/80">Projects</span>
                    </div>
                    <h2 className="text-left text-balance text-base md:text-xl lg:text-3xl font-semibold tracking-[-0.015em] text-white">
                        Project dashboard for automated release notes
                    </h2>
                    <p className="mt-4 text-left text-sm lg:text-base/4 text-indigo-100/90">
                        Connect a GitHub repository once. Insert analyzes commit messages, groups changes by keywords, and prepares a draft release note for review — all in one workspace.
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