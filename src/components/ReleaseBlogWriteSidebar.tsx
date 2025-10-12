"use client";

import React, { useMemo } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import {
  Command,
  CommandInput,
  CommandList,
  CommandGroup,
  CommandEmpty,
  CommandItem,
} from "@/components/ui/command";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
} from "@/components/ui/sheet";
import {
  Menu,
  Loader2,
  FileEdit,
  CheckCircle,
  GitCommit,
  Clock,
  ArrowLeftFromLine,
  XCircle,
  AlertCircle,
  Plus,
} from "lucide-react";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import InsertIcon from "./InsertIcon";
import AddReleaseBlogModal from "./AddReleaseBlogModal";
import { useInsertProjects } from "@/app/context/InsertProjectProvider";
import { getLastModifiedText } from "@/helpers/last-modified";
import { cn } from "@/lib/utils";

type ReleaseBlogStatus = "PUBLISHED" | "DRAFT" | "PROCESSING" | "ERROR" | "COMPLETED";

interface ReleaseBlog {
  _id: string;
  blogTitle?: string;
  releaseTitle?: string;
  status: ReleaseBlogStatus;
  commitId?: string;
  createdAt?: string;
  blogContentText?: string;
}

interface ReleaseBlogItemProps {
  blog: ReleaseBlog;
  isCurrent: boolean;
  onSelect: (id: string) => void;
}

const statusStyles: Record<ReleaseBlogStatus | "DEFAULT", string> = {
  PUBLISHED: "bg-green-500/90 hover:bg-green-500",
  DRAFT: "bg-yellow-500/90 hover:bg-yellow-500",
  PROCESSING: "bg-blue-500/90 hover:bg-blue-500",
  ERROR: "bg-red-500/90 hover:bg-red-500",
  COMPLETED: "bg-emerald-500/90 hover:bg-emerald-500",
  DEFAULT: "bg-gray-500/90 hover:bg-gray-500",
};

const buildStatusIcon = (status: ReleaseBlogStatus) => {
  switch (status) {
    case "PUBLISHED":
    case "COMPLETED":
      return <CheckCircle className="h-3 w-3 text-green-500" />;
    case "PROCESSING":
      return <Clock className="h-3 w-3 text-blue-500" />;
    case "ERROR":
      return <XCircle className="h-3 w-3 text-red-500" />;
    default:
      return <AlertCircle className="h-3 w-3 text-gray-400" />;
  }
};

const ReleaseBlogItem = ({ blog, isCurrent, onSelect }: ReleaseBlogItemProps) => {
  const title = blog.blogTitle || blog.releaseTitle || "Untitled Release";
  return (
    <CommandItem
      value={`${title} ${blog.commitId || ""} ${blog.status}`}
      onSelect={() => onSelect(blog._id)}
      className={cn(
        "group px-3 py-2 rounded-md cursor-pointer transition-colors flex flex-col gap-1",
        "data-[selected=true]:bg-indigo-50 dark:data-[selected=true]:bg-indigo-950/30",
        isCurrent && "ring-1 ring-indigo-400/60 bg-indigo-50 dark:bg-indigo-950/30"
      )}
    >
      <div className="flex items-start gap-2 w-full">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="truncate text-sm font-medium">{title}</span>
            <Badge
              className={cn(
                "text-[10px] font-medium tracking-wide text-white",
                statusStyles[blog.status] || statusStyles.DEFAULT,
                "shadow-sm"
              )}
            >
              {blog.status}
            </Badge>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-muted-foreground mt-1">
            {blog.commitId && (
              <span className="inline-flex items-center gap-1">
                <GitCommit className="h-3 w-3" />
                <code className="bg-muted/60 px-1 rounded">
                  {blog.commitId.slice(0, 7)}
                </code>
              </span>
            )}
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>
                {blog.createdAt ? getLastModifiedText(blog.createdAt) : "—"}
              </span>
            </span>
            <span className="ml-auto">{buildStatusIcon(blog.status)}</span>
          </div>
        </div>
      </div>
    </CommandItem>
  );
};

// Category keys
type CategoryKey = "processing" | "drafts" | "published";

const categoryMeta: Record<
  CategoryKey,
  { label: string; icon: React.ReactNode; match: (b: ReleaseBlog) => boolean }
> = {
  processing: {
    label: "Processing",
    icon: <Clock className="h-3 w-3 text-blue-500" />,
    match: (b) => b.status === "PROCESSING",
  },
  drafts: {
    label: "Drafts",
    icon: <FileEdit className="h-3 w-3" />,
    match: (b) => b.status === "DRAFT" || b.status === "COMPLETED",
  },
  published: {
    label: "Published",
    icon: <CheckCircle className="h-3 w-3 text-green-500" />,
    match: (b) => b.status === "PUBLISHED",
  },
};

const mapStatusToCategory = (status: ReleaseBlogStatus): CategoryKey => {
  if (status === "PROCESSING") return "processing";
  if (status === "PUBLISHED") return "published";
  return "drafts"; // DRAFT / COMPLETED / ERROR -> drafts bucket (adjust if you want ERROR separate)
};

const ReleaseBlogWriteSidebar = () => {
  useSession(); // currently unused but retained
  const { curr_project, isProjectLoading } = useInsertProjects();
  const router = useRouter();
  const params = useParams();

  const projectId = params.id as string;
  const currentReleaseBlogId = params.releaseBlogId as string;
  const [isAddReleaseBlogModalOpen, setIsAddReleaseBlogModalOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const [selectedCategories, setSelectedCategories] = React.useState<Set<string>>(
    () => new Set(["processing", "drafts", "published"])
  );

  const toggleCategory = (key: CategoryKey) => {
    setSelectedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      if (next.size === 0) {
        // Prevent all empty: optional; comment out if you want to allow zero
        return new Set<CategoryKey>(); // allow empty to show prompt
      }
      return next;
    });
  };

  const handleBlogSelect = (blogId: string) => {
    if (blogId !== currentReleaseBlogId) {
      router.push(`/project/${projectId}/edit/${blogId}`);
    }
  };

  const handleBackToProject = () => router.push(`/project/${projectId}`);

  const releaseBlogs: ReleaseBlog[] = useMemo(
    () =>
      (curr_project?.releaseBlogs as ReleaseBlog[] | undefined)
        ?.slice()
        .sort(
          (a, b) =>
            new Date(b.createdAt || "").getTime() -
            new Date(a.createdAt || "").getTime()
        ) || [],
    [curr_project?.releaseBlogs]
  );

  // Filter by selected categories first
  const categoryFiltered = useMemo(
    () =>
      releaseBlogs.filter((b) =>
        selectedCategories.has(mapStatusToCategory(b.status))
      ),
    [releaseBlogs, selectedCategories]
  );

  // Apply search inside category-filtered
  const visibleBlogs = useMemo(() => {
    if (!search.trim()) return categoryFiltered;
    const q = search.toLowerCase();
    return categoryFiltered.filter(
      (b) =>
        (b.blogTitle || "").toLowerCase().includes(q) ||
        (b.releaseTitle || "").toLowerCase().includes(q) ||
        (b.commitId || "").toLowerCase().includes(q)
    );
  }, [categoryFiltered, search]);

  // Group AFTER search for display
  const grouped = useMemo(() => {
    const base: Record<CategoryKey, ReleaseBlog[]> = {
      processing: [],
      drafts: [],
      published: [],
    };
    for (const b of visibleBlogs) {
      base[mapStatusToCategory(b.status)].push(b);
    }
    return base;
  }, [visibleBlogs]);

  const anyErrorItems = releaseBlogs.some((b) => b.status === "ERROR");

  return (
    <>
      <AddReleaseBlogModal
        defaultVisibility={isAddReleaseBlogModalOpen}
        onClose={() => setIsAddReleaseBlogModalOpen(false)}
      />

      <Sheet>
        <SheetTrigger className="p-2 z-[2000]">
          <Menu className="w-10 h-10 p-2 border rounded-md bg-background" />
        </SheetTrigger>

        <SheetContent
          side="left"
          className="flex flex-col gap-4 px-4 max-w-[400px] w-full pb-3"
        >
          <SheetHeader className="flex justify-between gap-4 pt-2">
            <div className="flex items-center gap-2">
              <InsertIcon className="p-[4px] border bg-white rounded-full" />
              <span className="font-semibold text-xl tracking-tight">Insert</span>
            </div>
          </SheetHeader>

            {curr_project && (
              <div className="space-y-3">
                <div className="rounded-lg border bg-muted/30 px-3 py-2">
                  <h4
                    className="font-medium text-sm truncate"
                    title={curr_project?.name}
                  >
                    {curr_project?.name}
                  </h4>
                  {curr_project?.description && (
                    <p
                      className="text-xs text-muted-foreground line-clamp-2 mt-1"
                      title={curr_project.description}
                    >
                      {curr_project.description}
                    </p>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-1"
                    onClick={handleBackToProject}
                  >
                    <ArrowLeftFromLine className="h-4 w-4" />
                    Back
                  </Button>
                  <Button
                    size="sm"
                    className="flex items-center gap-1"
                    onClick={() => setIsAddReleaseBlogModalOpen(true)}
                    disabled={isProjectLoading}
                  >
                    <Plus className="h-4 w-4" />
                    Add
                  </Button>
                </div>
              </div>
            )}

          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap gap-1.5">
              {(Object.keys(categoryMeta) as CategoryKey[]).map((k) => {
                const active = selectedCategories.has(k);
                return (
                  <button
                    key={k}
                    onClick={() => toggleCategory(k)}
                    className={cn(
                      "inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                      active
                        ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                        : "bg-muted/40 hover:bg-muted text-foreground/70"
                    )}
                    aria-pressed={active}
                  >
                    {categoryMeta[k].icon}
                    {categoryMeta[k].label}
                    <span className="ml-0.5 rounded bg-black/10 dark:bg-white/10 px-1">
                      {releaseBlogs.filter(categoryMeta[k].match).length}
                    </span>
                  </button>
                );
              })}
            </div>

            <Command className="rounded-md border shadow-sm">
              <CommandInput
                placeholder="Search selected releases..."
                value={search}
                onValueChange={setSearch}
                className="text-sm"
              />
              <CommandList className="max-h-[55vh] overflow-y-auto">
                {selectedCategories.size === 0 && (
                  <CommandEmpty className="py-8 text-xs text-muted-foreground">
                    Select at least one category above.
                  </CommandEmpty>
                )}

                {selectedCategories.size > 0 && visibleBlogs.length === 0 && (
                  <CommandEmpty className="py-8 text-xs text-muted-foreground">
                    {search
                      ? "No matches found in selected categories."
                      : "No items in selected categories."}
                  </CommandEmpty>
                )}

                {(Object.keys(categoryMeta) as CategoryKey[])
                  .filter((k) => selectedCategories.has(k) && grouped[k].length > 0)
                  .map((k) => (
                    <CommandGroup
                      key={k}
                      heading={
                        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          {categoryMeta[k].icon}
                          {categoryMeta[k].label}
                          <span className="text-[10px] font-normal">
                            {grouped[k].length}
                          </span>
                        </div>
                      }
                      className="px-2"
                    >
                      {grouped[k].map((blog) => (
                        <ReleaseBlogItem
                          key={blog._id}
                          blog={blog}
                          isCurrent={blog._id === currentReleaseBlogId}
                          onSelect={handleBlogSelect}
                        />
                      ))}
                    </CommandGroup>
                  ))}
              </CommandList>
            </Command>

            {anyErrorItems && (
              <div className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2">
                <XCircle className="h-4 w-4 text-destructive mt-0.5" />
                <p className="text-xs leading-relaxed">
                  Some items failed to process. Re-open or re-run generation.
                </p>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};

export default ReleaseBlogWriteSidebar;