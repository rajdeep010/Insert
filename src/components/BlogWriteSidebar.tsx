"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  BookOpen,
  Loader2,
  Lock,
  Menu,
  Plus,
  Search,
  SquarePen,
  Unlock,
  Globe2,
} from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandList,
} from "@/components/ui/command";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useBlog } from "@/features/blog/context/BlogProvider";
import AddBlogModal from "./AddBlogModal";
import { Badge } from "./ui/badge";
import { ScrollArea } from "./ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BlogItem from "./BlogItem";
import InsertIcon from "./InsertIcon";
import { TopicActionButton } from "@/features/topic/components/TopicActionButton";

type BlogGroupKey = "private" | "public";

type BlogGroupConfig = {
  key: BlogGroupKey;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  emptyMessage: string;
};

const blogGroupConfig: BlogGroupConfig[] = [
  {
    key: "private",
    label: "Private drafts",
    description: "Personal notes, working ideas, and hidden drafts.",
    icon: Lock,
    emptyMessage: "No private blogs yet",
  },
  {
    key: "public",
    label: "Published space",
    description: "Public-facing blogs ready to be shared or refined.",
    icon: Unlock,
    emptyMessage: "No public blogs yet",
  },
];

const BlogWriteSidebar = () => {
  const { data: session } = useSession();
  const username = session?.user?.username;
  const { setIsAddBlogModalOpen, allBlogs, isAllBlogsLoading } = useBlog();
  const [searchValue, setSearchValue] = useState("");
  const [activeTab, setActiveTab] = useState<BlogGroupKey>("private");

  const [defaultVisibility, setDefaultVisibility] = React.useState("public");

  const openAddBlogModal = (option: "public" | "private" | "both") => {
    setIsAddBlogModalOpen(true);
    setDefaultVisibility(option);
  };

  const filteredBlogs = useMemo(() => {
    const query = searchValue.trim().toLowerCase();
    if (!query) return allBlogs;
    return allBlogs.filter((blog) =>
      String(blog?.blogTitle ?? "").toLowerCase().includes(query)
    );
  }, [allBlogs, searchValue]);

  const groupedBlogs = useMemo(
    () => ({
      private: filteredBlogs.filter((blog) => blog?.type === "private"),
      public: filteredBlogs.filter((blog) => blog?.type === "public"),
    }),
    [filteredBlogs]
  );

  const activeBlogs = groupedBlogs[activeTab];

  const renderBlogPanel = (group: BlogGroupConfig) => {
    const blogs = groupedBlogs[group.key];
    const Icon = group.icon;

    return (
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-4 rounded-2xl border border-border/60 bg-background/80 px-4 py-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="rounded-xl bg-muted p-2 text-foreground">
                <Icon className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{group.label}</p>
                <p className="text-xs text-muted-foreground">{group.description}</p>
              </div>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            className="rounded-full"
            onClick={() => openAddBlogModal(group.key)}
          >
            <Plus className="mr-1 h-4 w-4" />
            New
          </Button>
        </div>

        <div className="overflow-hidden rounded-3xl border border-border/60 bg-background/70">
          <Command className="border-0 bg-transparent shadow-none">
            <CommandList>
              <CommandEmpty className="py-10 text-center">
                <div className="space-y-3 px-6">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-foreground">{group.emptyMessage}</p>
                    <p className="text-xs text-muted-foreground">Start with a fresh {group.key === "private" ? "draft" : "post"} from the action button above.</p>
                  </div>
                </div>
              </CommandEmpty>
              {blogs.length > 0 ? (
                <CommandGroup>
                  {blogs.map((blog) => (
                    <BlogItem key={blog._id} blog={blog} />
                  ))}
                </CommandGroup>
              ) : null}
            </CommandList>
          </Command>
        </div>
      </div>
    );
  };

  return (
    <>
      <AddBlogModal defaultVisibility={defaultVisibility} />

      <Sheet>
        <SheetTrigger asChild>
          <Button type="button" variant="outline" size="icon" className="h-10 w-10 rounded-full border-border/60 bg-background/80 shadow-sm backdrop-blur">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>

        <SheetContent side="left" className="max-w-[550px] min-w-[480px] border-border/60 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,250,252,0.98))] p-0 dark:bg-[linear-gradient(180deg,rgba(2,6,23,0.98),rgba(2,6,23,1))]">
          <div className="flex h-full flex-col">
            <SheetHeader className="border-b border-border/60 px-6 py-6 text-left">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-3">
                  <Link href={`/u/${username}`} className="flex items-center gap-3 text-2xl">
                    <InsertIcon className="rounded-md border bg-white p-[2px]" />
                    <span className="font-sans">Insert</span>
                  </Link>
                  <div className="space-y-1">
                    {/* <SheetTitle className="text-xl">Writing workspace</SheetTitle> */}
                    <SheetDescription>
                      Keep drafting simple. Create fast, switch tabs, and jump back into writing.
                    </SheetDescription>
                  </div>
                </div>
                {/* <Badge variant="secondary" className="rounded-full px-3 py-1 text-xs font-medium">
                  {allBlogs.length} blog{allBlogs.length === 1 ? "" : "s"}
                </Badge> */}
              </div>

              <div className="flex flex-wrap items-center gap-2 justify-start">
                <TopicActionButton label="New private draft">
                  <Button type="button" variant="outline" size="icon" className="h-10 w-10 rounded-2xl" onClick={() => openAddBlogModal("private")}>
                    <Lock className="h-4 w-4" />
                  </Button>
                </TopicActionButton>
                <TopicActionButton label="New public post">
                  <Button type="button" variant="outline" size="icon" className="h-10 w-10 rounded-2xl" onClick={() => openAddBlogModal("public")}>
                    <Unlock className="h-4 w-4" />
                  </Button>
                </TopicActionButton>
                <TopicActionButton label="Open full blog workspace">
                  <Button asChild type="button" variant="outline" size="icon" className="h-10 w-10 rounded-2xl">
                    <Link href={`/u/${username}?tab=blogs`}>
                      <SquarePen className="h-4 w-4" />
                    </Link>
                  </Button>
                </TopicActionButton>
                <TopicActionButton label="Browse public posts">
                  <Button asChild type="button" variant="outline" size="icon" className="h-10 w-10 rounded-2xl">
                    <Link href="/posts/blog">
                      <Globe2 className="h-4 w-4" />
                    </Link>
                  </Button>
                </TopicActionButton>
              </div>
            </SheetHeader>

            <div className="flex-1 overflow-hidden px-6 py-5">
              <ScrollArea className="h-full pr-3">
                <div className="space-y-5">
                  <section className="space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      {/* <div>
                        <p className="text-sm font-medium text-foreground">Your blog library</p>
                        <p className="text-xs text-muted-foreground">Search once, then switch between private drafts and public posts.</p>
                      </div> */}
                      {isAllBlogsLoading ? <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" /> : null}
                    </div>
                    <div className="relative">
                      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        value={searchValue}
                        onChange={(event) => setSearchValue(event.target.value)}
                        placeholder="Search blogs by title"
                        className="h-11 rounded-2xl border-border/60 bg-background/70 pl-10"
                      />
                    </div>
                  </section>

                  <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as BlogGroupKey)} className="space-y-4">
                    <TabsList className="grid h-auto w-full grid-cols-2 rounded-2xl border border-border/60 bg-muted/50 p-1">
                      <TabsTrigger value="private" className="rounded-xl px-4 py-2.5 text-sm font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm">
                        <Lock className="mr-2 h-4 w-4" />
                        Private
                        <span className="ml-2 text-xs text-muted-foreground">{groupedBlogs.private.length}</span>
                      </TabsTrigger>
                      <TabsTrigger value="public" className="rounded-xl px-4 py-2.5 text-sm font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm">
                        <Unlock className="mr-2 h-4 w-4" />
                        Public
                        <span className="ml-2 text-xs text-muted-foreground">{groupedBlogs.public.length}</span>
                      </TabsTrigger>
                    </TabsList>

                    {/* <div className="flex items-center justify-between rounded-2xl border border-border/60 bg-background/60 px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="rounded-xl bg-muted p-2 text-foreground">
                          {activeTab === "private" ? <Lock className="h-4 w-4" /> : <BookOpen className="h-4 w-4" />}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            {activeTab === "private" ? "Private writing" : "Public writing"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {activeTab === "private"
                              ? "Keep drafts hidden while you shape the final idea."
                              : "Manage posts that are ready to share or refine."}
                          </p>
                        </div>
                      </div>
                      <Button type="button" variant="outline" size="sm" className="rounded-full" onClick={() => openAddBlogModal(activeTab)}>
                        <Plus className="mr-2 h-4 w-4" />
                        New {activeTab}
                      </Button>
                    </div> */}

                    {blogGroupConfig.map((group) => (
                      <TabsContent key={group.key} value={group.key} className="mt-0">
                        {renderBlogPanel(group)}
                      </TabsContent>
                    ))}
                  </Tabs>
                </div>
              </ScrollArea>
            </div>

            <div className="flex items-center justify-between border-t border-border/60 px-6 py-4">
              <Link href={`/u/${username}?tab=blogs`} className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground">
                <SquarePen className="h-4 w-4" /> Open full blog workspace
              </Link>
              <Link href="/posts/blog" className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground">
                <Globe2 className="h-4 w-4" /> Explore posts
              </Link>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};

export default BlogWriteSidebar;
