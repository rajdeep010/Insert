"use client";
import { ThreeDMarquee } from "@/components/ui/3d-marquee";
import { Button } from "./ui/button";
import Link from "next/link";
import { Spotlight } from "./ui/spotlight-new";

export function ThreeDMarqueeDemoSecond() {
    const images = [
        "https://res.cloudinary.com/dgxeg3sju/image/upload/v1753474491/31d46a44-bd00-4eac-85e3-a31b42e08f28.png",
        "https://res.cloudinary.com/dgxeg3sju/image/upload/v1753474718/05969d69-43c7-4200-beca-173029a48450.png",
        "https://res.cloudinary.com/dgxeg3sju/image/upload/v1753474830/4440e28b-4269-42b1-9536-179d06eb8f80.png",
        "https://res.cloudinary.com/dgxeg3sju/image/upload/v1753474932/1c94ae34-4c35-40d8-b699-cb4cce5c20b2.png",
        "https://res.cloudinary.com/dgxeg3sju/image/upload/v1753475010/52b47260-89ec-4576-b33d-05bd1dfd8328.png",
        "https://res.cloudinary.com/dgxeg3sju/image/upload/v1753474830/4440e28b-4269-42b1-9536-179d06eb8f80.png",
        "https://res.cloudinary.com/dgxeg3sju/image/upload/v1753475062/63b9bd80-30d4-4730-a9c5-3f040ca08513.png",
        "https://res.cloudinary.com/dgxeg3sju/image/upload/v1753475010/52b47260-89ec-4576-b33d-05bd1dfd8328.png",
        "https://res.cloudinary.com/dgxeg3sju/image/upload/v1753474830/4440e28b-4269-42b1-9536-179d06eb8f80.png",
        "https://res.cloudinary.com/dgxeg3sju/image/upload/v1753475062/63b9bd80-30d4-4730-a9c5-3f040ca08513.png",
        "https://res.cloudinary.com/dgxeg3sju/image/upload/v1753475519/c76939bd-fc4d-426b-b247-0c1db4966016.png",
        "https://res.cloudinary.com/dgxeg3sju/image/upload/v1753475010/52b47260-89ec-4576-b33d-05bd1dfd8328.png",
        "https://res.cloudinary.com/dgxeg3sju/image/upload/v1753474830/4440e28b-4269-42b1-9536-179d06eb8f80.png",
        "https://res.cloudinary.com/dgxeg3sju/image/upload/v1753475062/63b9bd80-30d4-4730-a9c5-3f040ca08513.png",
        "https://res.cloudinary.com/dgxeg3sju/image/upload/v1753475519/c76939bd-fc4d-426b-b247-0c1db4966016.png",
        "https://res.cloudinary.com/dgxeg3sju/image/upload/v1753475062/63b9bd80-30d4-4730-a9c5-3f040ca08513.png",
        "https://res.cloudinary.com/dgxeg3sju/image/upload/v1753474830/4440e28b-4269-42b1-9536-179d06eb8f80.png",
        "https://res.cloudinary.com/dgxeg3sju/image/upload/v1753475062/63b9bd80-30d4-4730-a9c5-3f040ca08513.png",
        "https://res.cloudinary.com/dgxeg3sju/image/upload/v1753475010/52b47260-89ec-4576-b33d-05bd1dfd8328.png",
        "https://res.cloudinary.com/dgxeg3sju/image/upload/v1753475519/c76939bd-fc4d-426b-b247-0c1db4966016.png",
        "https://res.cloudinary.com/dgxeg3sju/image/upload/v1753475062/63b9bd80-30d4-4730-a9c5-3f040ca08513.png",
        "https://res.cloudinary.com/dgxeg3sju/image/upload/v1753475010/52b47260-89ec-4576-b33d-05bd1dfd8328.png",
        "https://res.cloudinary.com/dgxeg3sju/image/upload/v1753475062/63b9bd80-30d4-4730-a9c5-3f040ca08513.png",
        "https://res.cloudinary.com/dgxeg3sju/image/upload/v1753474718/05969d69-43c7-4200-beca-173029a48450.png",
        "https://res.cloudinary.com/dgxeg3sju/image/upload/v1753475519/c76939bd-fc4d-426b-b247-0c1db4966016.png",
        "https://res.cloudinary.com/dgxeg3sju/image/upload/v1753474830/4440e28b-4269-42b1-9536-179d06eb8f80.png",
        "https://res.cloudinary.com/dgxeg3sju/image/upload/v1753474932/1c94ae34-4c35-40d8-b699-cb4cce5c20b2.png",
        "https://res.cloudinary.com/dgxeg3sju/image/upload/v1753475010/52b47260-89ec-4576-b33d-05bd1dfd8328.png",
        "https://res.cloudinary.com/dgxeg3sju/image/upload/v1753474830/4440e28b-4269-42b1-9536-179d06eb8f80.png",
        "https://res.cloudinary.com/dgxeg3sju/image/upload/v1753475062/63b9bd80-30d4-4730-a9c5-3f040ca08513.png",
        "https://res.cloudinary.com/dgxeg3sju/image/upload/v1753474830/4440e28b-4269-42b1-9536-179d06eb8f80.png",
        
    ];
    return (
        <div className="relative mx-auto flex h-screen w-screen  flex-col items-center justify-center overflow-hidden">
            <Spotlight/>
            <div className='text-8xl z-20 font-sans tracking-wide text-white'>Insert</div>

            <div className='text-3xl z-20 font-sans text-white mt-[-0.5rem]'>2.0</div>
            <p className="relative z-20 mx-auto max-w-[40%] text-center font-sans text-2xl my-2 font-semibold text-white dark:text-gray-400">
                Simple, more powerful and made for developers
            </p>

            <div className="relative z-20 flex mt-2 flex-wrap items-center justify-center gap-4">
                <Link href='/sign-up'>
                    <Button className="rounded-md text-sm font-medium bg-white text-black" variant="outline">
                        Get Started
                    </Button>
                </Link>
            </div>

            {/* overlay */}
            <div className="absolute inset-0 z-10 h-full w-full bg-black/80 dark:bg-black/40" />
            <ThreeDMarquee
                className="pointer-events-none absolute inset-0 h-screen w-screen"
                images={images}
            />
        </div>
    );
}
