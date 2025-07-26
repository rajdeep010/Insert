"use client";
import { ThreeDMarquee } from "@/components/ui/3d-marquee";
import { Button } from "./ui/button";
import Link from "next/link";
import { Spotlight } from "./ui/spotlight-new";
import { BackgroundBeams } from "./ui/background-beams";

export function Hero() {
    return (
        <div className="relative mx-auto flex h-screen w-screen  flex-col items-center justify-center overflow-hidden">
            <Spotlight/>
            <div className='text-8xl z-20 font-sans tracking-wide dark:text-white text-black'>Insert</div>

            {/* <div className='text-3xl z-20 font-sans text-white mt-[-0.5rem]'>2.0</div> */}
            <p className="relative z-20 mx-auto max-w-[70%] lg:max-w-[40%] text-center font-sans text-md lg:text-2xl my-2 font-semibold dark:text-white text-black">
                Simple, More Powerful and made for Developers
            </p>

            <div className="relative z-20 flex mt-2 flex-wrap items-center justify-center gap-4">
                <Link href='/sign-up'>
                    <Button className="rounded-md text-sm font-medium border-2 dark:border-white border-black" variant="outline">
                        Get Started
                    </Button>
                </Link>
            </div>
            <BackgroundBeams />
        </div>
    );
}
