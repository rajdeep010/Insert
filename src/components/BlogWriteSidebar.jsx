'use client'

import React from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { Input } from '@/components/ui/input'
import {
    Sheet,
    SheetTrigger,
    SheetContent,
    SheetHeader,
} from '@/components/ui/sheet'
import {
    Home,
    FolderPlus,
    FilePlus,
    Menu,
    Folder,
    Search,
    SquarePen,
    File,
} from 'lucide-react'

const BlogWriteSidebar = () => {
    const { data: session } = useSession()
    const username = session?.user?.username || 'username'

    return (
        <Sheet>
            <SheetTrigger className="p-2">
                <Menu className="w-5 h-5" />
            </SheetTrigger>

            <SheetContent side="left" className="flex flex-col gap-0 px-0">
                <SheetHeader>
                    <Link className="flex gap-2 text-2xl" href={`/`}>
                        <span className="font-sans">Insert</span>
                    </Link>
                </SheetHeader>

                {/* Large space after Insert */}
                {/* <div className="h-8" /> */}

                {/* Home link */}
                {/* <Link href={`/u/${username}`}>
                    <div className="flex items-center gap-2 text-sm cursor-pointer pl-2">
                        <Home className="w-5 h-5" />
                        <span>Home</span>
                    </div>
                </Link> */}

                {/* Extra space after Home */}
                <div className="h-12" />

                {/* Search input */}
                <Input
                    placeholder="Search..."
                    className="p-2 text-sm mb-4"
                />

                <div className="h-4" />

                <div className='h-48 min-h-48'>
                    <div className="flex items-center justify-between mb-2 pl-2 pr-[-0.5rem]">
                        <span className="font-semibold">Private</span>
                        <div className='flex gap-2'>
                            <Search className="w-5 h-5 opacity-50 hover:opacity-100 transition-opacity cursor-pointer hover:text-gray-500" />
                            <FilePlus className="w-5 h-5 pr-[-0.5rem] opacity-50 hover:opacity-100 transition-opacity cursor-pointer hover:text-gray-500" />
                        </div>
                    </div>
                    <div className="ml-8 space-y-2 text-sm text-gray-500">

                        <div className="flex justify-between items-center cursor-pointer">
                            <div className="flex items-center gap-2">
                                <File className="w-5 h-5 " />
                                <span>Express JS Advance</span>
                            </div>
                            <div className="opacity-50 hover:opacity-100 transition-opacity cursor-pointer pr-[-10px]">
                                <SquarePen className="w-5 h-5" />
                            </div>
                        </div>

                        <div className="flex justify-between items-center cursor-pointer">
                            <div className="flex items-center gap-2">
                                <File className="w-5 h-5 " />
                                <span>Getting Started with Next JS</span>
                            </div>
                            <div className="opacity-50 hover:opacity-100 transition-opacity cursor-pointer pr-[-10px]">
                                <SquarePen className="w-5 h-5" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="h-8" />

                <div className='h-48 min-h-48'>
                    <div className="flex items-center justify-between mb-2 pl-2 pr-[-0.5rem]">
                        <span className="font-semibold">Private</span>
                        <div className='flex gap-2'>
                            <Search className="w-5 h-5 opacity-50 hover:opacity-100 transition-opacity cursor-pointer hover:text-gray-500" />
                            <FilePlus className="w-5 h-5 pr-[-0.5rem] opacity-50 hover:opacity-100 transition-opacity cursor-pointer hover:text-gray-500" />
                        </div>
                    </div>
                    <div className="ml-8 space-y-2 text-sm text-gray-500">

                        <div className="flex justify-between items-center cursor-pointer">
                            <div className="flex items-center gap-2">
                                <File className="w-5 h-5 " />
                                <span>Express JS Advance</span>
                            </div>
                            <div className="opacity-50 hover:opacity-100 transition-opacity cursor-pointer pr-[-10px]">
                                <SquarePen className="w-5 h-5" />
                            </div>
                        </div>

                        <div className="flex justify-between items-center cursor-pointer">
                            <div className="flex items-center gap-2">
                                <File className="w-5 h-5 " />
                                <span>Getting Started with Next JS</span>
                            </div>
                            <div className="opacity-50 hover:opacity-100 transition-opacity cursor-pointer pr-[-10px]">
                                <SquarePen className="w-5 h-5" />
                            </div>
                        </div>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    )
}

export default BlogWriteSidebar