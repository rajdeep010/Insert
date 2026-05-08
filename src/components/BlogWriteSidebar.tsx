"use client";

import React, { useEffect, useMemo } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Input } from "@/components/ui/input";
import {
  Calculator,
  Calendar,
  ChevronDown,
  CreditCard,
  DiamondMinus,
  FileText,
  Layout,
  LayoutDashboard,
  LayoutGrid,
  LayoutPanelTop,
  PanelLeft,
  PanelsTopLeft,
  Settings,
  Smile,
  User,
  User2,
} from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetFooter,
} from "@/components/ui/sheet";
import {
  Home,
  FolderPlus,
  FilePlus,
  Menu,
  Folder,
  Search,
  SquarePen,
  File,
  Share2,
} from "lucide-react";
import { useBlog } from "@/features/blog/context/BlogProvider";
import AddBlogModal from "./AddBlogModal";
import { QuestionMarkCircledIcon } from "@radix-ui/react-icons";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Separator } from "./ui/separator";
import BlogItem from "./BlogItem";
import InsertIcon from "./InsertIcon";

const BlogWriteSidebar = () => {
  const { data: session } = useSession();
  const username = session?.user?.username;
  const { setIsAddBlogModalOpen, allBlogs, isAllBlogsLoading, isBlogAdding, deleteBlog, removeBlogFromState } = useBlog();

  const [defaultVisibility, setDefaultVisibility] = React.useState("public");

  const openAddBlogModal = (option: "public" | "private" | "both") => {
    setIsAddBlogModalOpen(true);
    setDefaultVisibility(option);
  };

  const privateBlogs = useMemo(
    () => allBlogs.filter((blog) => blog?.type === "private"),
    [allBlogs]
  );

  const publicBlogs = useMemo(
    () => allBlogs.filter((blog) => blog?.type === "public"),
    [allBlogs]
  );

  const handleBlogDeleted = (blogId: string) => {
    removeBlogFromState(blogId);
  };

  return (
    <>
      <AddBlogModal defaultVisibility={defaultVisibility} />

      <Sheet>
        <SheetTrigger className="p-2">
          <Menu className="w-5 h-5" />
        </SheetTrigger>

        <SheetContent side="left" className="flex flex-col gap-6 px-6">
          <SheetHeader className="w-fit">
            <Link href={`/u/${username}`} className="flex items-center gap-2 text-2xl">
              <InsertIcon className="p-[4px] border-2 bg-white" />
              <span className="font-sans">Insert</span>
            </Link>
          </SheetHeader>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 text-sm border-2 border-gray-600 px-2 py-1 rounded-md">
                <span>Sections</span>
                <ChevronDown className="ml-auto h-4 w-4" />
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent className="w-[--radix-popper-anchor-width]">
              <Link href={`/u/${username}?tab=overview`}>
                <DropdownMenuItem className="hover:dark:bg-gray-800 hover:bg-gray-300  cursor-pointer flex gap-2 items-center">
                  <User2 className="h-4 w-4" />
                  Overview
                </DropdownMenuItem>
              </Link>

              <Link href={`/u/${username}?tab=topics`}>
                <DropdownMenuItem className="hover:dark:bg-gray-800 hover:bg-gray-300  cursor-pointer flex gap-2 items-center">
                  <FileText className="h-4 w-4" />
                  Topics
                </DropdownMenuItem>
              </Link>

              <Link href={`/u/${username}?tab=blogs`}>
                <DropdownMenuItem className="hover:dark:bg-gray-800 hover:bg-gray-300 cursor-pointer flex gap-2 items-center">
                  <LayoutPanelTop className="h-4 w-4" />
                  Blogs
                </DropdownMenuItem>
              </Link>

              <Link href={`/u/${username}?tab=projects`}>
                <DropdownMenuItem className="hover:dark:bg-gray-800 hover:bg-gray-300 cursor-pointer flex gap-2 items-center">
                  <PanelsTopLeft className="h-4 w-4" />
                  Projects
                </DropdownMenuItem>
              </Link>

              <Separator className="my-1 mx-2" />

              <DropdownMenuLabel>Posts</DropdownMenuLabel>

              <Link href={`/posts/blog`}>
                <DropdownMenuItem className="hover:dark:bg-gray-800 hover:bg-gray-300  cursor-pointer flex gap-2 items-center">
                  <LayoutGrid className="h-4 w-4" />
                  Blog
                </DropdownMenuItem>
              </Link>

              <Link href={`/posts/topic`}>
                <DropdownMenuItem className="hover:dark:bg-gray-800 hover:bg-gray-300  cursor-pointer flex gap-2 items-center">
                  <LayoutGrid className="h-4 w-4" />
                  Topic
                </DropdownMenuItem>
              </Link>

              <Link href={`/posts/projects`}>
                <DropdownMenuItem className="hover:dark:bg-gray-800 hover:bg-gray-300  cursor-pointer flex gap-2 items-center">
                  <LayoutGrid className="h-4 w-4" />
                  Project
                </DropdownMenuItem>
              </Link>

            </DropdownMenuContent>
          </DropdownMenu>

          <div className="overflow-y-scroll flex flex-col gap-16 custom-small-scrollbar h-[90vh]">
            <div className="h-80 min-h-80">
              <div className="flex items-center justify-between mb-2 pl-2 pr-[-0.5rem]">
                <span className="font-semibold">Private</span>
                <div className="flex gap-2">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <FilePlus
                        className="w-5 h-5 pr-[-0.5rem] opacity-50 hover:opacity-100 transition-opacity cursor-pointer hover:text-gray-500"
                        onClick={() => openAddBlogModal("private")}
                      />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Add Private Blog</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>

              <Command className="rounded-lg border shadow-md min-w-fit overflow-y-scroll custom-small-scrollbar">
                <CommandInput placeholder="Type to search..." />
                <CommandList>
                  <CommandEmpty>No private blog found</CommandEmpty>
                  {privateBlogs && privateBlogs.length > 0 && (
                    <CommandGroup heading="Suggestions">
                      {privateBlogs.map((blog) => (
                        <BlogItem
                          key={blog._id}
                          blog={blog}
                          onBlogDeleted={handleBlogDeleted}
                        />
                      ))}
                    </CommandGroup>
                  )}
                </CommandList>
              </Command>
            </div>

            <div className="h-80 min-h-80">
              <div className="flex items-center justify-between mb-2 pl-2 pr-[-0.5rem]">
                <span className="font-semibold">Public</span>
                <div className="flex gap-2">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <FilePlus
                        className="w-5 h-5 pr-[-0.5rem] opacity-50 hover:opacity-100 transition-opacity cursor-pointer hover:text-gray-500"
                        onClick={() => openAddBlogModal("public")}
                      />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Add Public Blog</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>
              <Command className="rounded-lg border shadow-md min-w-fit overflow-y-scroll custom-small-scrollbar">
                <CommandInput placeholder="Type to search..." />
                <CommandList>
                  <CommandEmpty>No public blog found</CommandEmpty>
                  {publicBlogs && publicBlogs.length > 0 && (
                    <CommandGroup heading="Suggestions">
                      {publicBlogs.map((blog) => (
                        <BlogItem
                          key={blog._id}
                          blog={blog}
                          onBlogDeleted={handleBlogDeleted}
                        />
                      ))}
                    </CommandGroup>
                  )}
                </CommandList>
              </Command>
            </div>
          </div>

          <div className="py-1 items-center flex justify-between">
            <Tooltip>
              <TooltipTrigger asChild>
                <Share2 className="h-4 w-4 cursor-pointer" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Share Insert</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <QuestionMarkCircledIcon className="h-4 w-4 cursor-pointer" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Help & Contact Insert</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};

export default BlogWriteSidebar;
