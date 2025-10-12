"use client";
import React from "react";
import Image from "next/image";
import { WobbleCard } from "../ui/wobble-card";

export function About() {
    return (
        <section id="about" className="mx-auto my-16 w-full max-w-7xl px-4">
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                <WobbleCard
                    containerClassName="col-span-1 lg:col-span-2 h-full bg-pink-800 min-h-[480px] lg:min-h-[300px]"
                    className=""
                >
                    <div className="max-w-xl">
                        <h2 className="text-left text-balance text-base md:text-xl lg:text-3xl font-semibold tracking-[-0.015em] text-white">
                            A simple, focused place to write and collaborate
                        </h2>
                        <p className="mt-4 text-left text-sm lg:text-base/4 text-neutral-200">
                            Draft posts and coding sheets with a clean editor. Share publicly or keep things private — built for developers who value speed and clarity.
                        </p>
                    </div>
                    <Image
                        src="https://res.cloudinary.com/dgxeg3sju/image/upload/v1753474718/05969d69-43c7-4200-beca-173029a48450.png"
                        width={520}
                        height={520}
                        alt="Editor preview"
                        className="absolute -right-4 lg:-right-[10%] grayscale filter -bottom-10 object-contain rounded-2xl"
                    />
                </WobbleCard>

                <WobbleCard containerClassName="col-span-1 min-h-[300px]">
                    <h2 className="max-w-80 text-left text-balance text-base md:text-xl lg:text-3xl font-semibold tracking-[-0.015em] text-white">
                        Project Service, built in
                    </h2>
                    <p className="mt-4 max-w-[26rem] text-left text-sm lg:text-base/4 text-neutral-200">
                        Import your GitHub repo once. Any commit with your keyword — like
                        “#release” — generates a release blog with commit summaries, links,
                        and highlights. Faster UI, microservices under the hood.
                    </p>
                </WobbleCard>

                <WobbleCard containerClassName="col-span-1 lg:col-span-3 bg-blue-900 min-h-[440px] lg:min-h-[520px] xl:min-h-[300px]">
                    <div className="max-w-sm">
                        <h2 className="max-w-sm md:max-w-lg text-left text-balance text-base md:text-xl lg:text-3xl font-semibold tracking-[-0.015em] text-white">
                            Ship thoughtfully, iterate quickly
                        </h2>
                        <p className="mt-4 max-w-[28rem] text-left text-sm lg:text-base/4 text-neutral-200">
                            Keep momentum with a workflow that respects your time — write,
                            commit, publish. Edit generated release posts before they go live.
                        </p>
                    </div>
                    <Image
                        src="https://res.cloudinary.com/dgxeg3sju/image/upload/v1753474830/4440e28b-4269-42b1-9536-179d06eb8f80.png"
                        width={520}
                        height={520}
                        alt="Release automation preview"
                        className="absolute -right-10 lg:-right-[10%] -bottom-10 object-contain rounded-2xl"
                    />
                </WobbleCard>
            </div>
        </section>
    );
}