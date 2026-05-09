"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from "./ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { CommandItem } from "./ui/command";
import {
    File,
    SquarePen,
    MoreHorizontal,
    Edit,
    Trash2,
    Loader2
} from "lucide-react";
import { toast } from "./ui/use-toast";
import { useBlog } from "@/features/blog/context/BlogProvider";
import type { BlogEntry } from "@/types/blog";

interface BlogItemProps {
    blog: BlogEntry;
}

const BlogItem: React.FC<BlogItemProps> = ({ blog }) => {
    const { data: session } = useSession();
    const username = session?.user?.username;

    // State for delete confirmation dialog
    const [deleteConfirm, setDeleteConfirm] = useState({
        isOpen: false,
        isDeleting: false
    });

    const { deleteBlog } = useBlog();

    // Handle delete confirmation
    const handleDeleteBlog = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDeleteConfirm({
            isOpen: true,
            isDeleting: false
        });
    };

    // Confirm delete action
    const confirmDelete = async () => {
        try {
            if (!blog._id) {
                return;
            }

            setDeleteConfirm(prev => ({ ...prev, isDeleting: true }));
            await deleteBlog(blog._id);
        } catch (error: any) {
            setDeleteConfirm(prev => ({ ...prev, isDeleting: false }));
        } finally{
            setDeleteConfirm({
                isOpen: false,
                isDeleting: false
            });
        }
    };

    // Cancel delete action
    const cancelDelete = () => {
        setDeleteConfirm({
            isOpen: false,
            isDeleting: false
        });
    };

    // Handle dropdown trigger click
    const handleDropdownClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
    };

    return (
        <>
            <CommandItem className="flex justify-between items-center cursor-pointer group p-2">
                <div className="flex items-center gap-2 flex-1">
                    <File className="w-5 h-5" />
                    <span className="truncate">{blog?.blogTitle}</span>
                </div>

                <div className="flex items-center gap-1">
                    {/* Three-dot menu */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button 
                                className="opacity-50 hover:opacity-100 transition-opacity p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                                onClick={handleDropdownClick}
                            >
                                <MoreHorizontal className="w-4 h-4" />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem asChild className="hover:dark:bg-gray-800 hover:bg-gray-200">
                                <Link
                                    href={`/blog/${blog.blogUrl}`}
                                    className="flex items-center gap-2 cursor-pointer w-full"
                                >
                                    <Edit className="h-4 w-4" />
                                    Edit Blog
                                </Link>
                            </DropdownMenuItem>
                            {/* <DropdownMenuSeparator /> */}
                            <DropdownMenuItem
                                className="text-red-500 focus:text-red-600 cursor-pointer hover:dark:bg-gray-800 hover:bg-gray-200"
                                onClick={handleDeleteBlog}
                            >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete Blog
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </CommandItem>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteConfirm.isOpen} onOpenChange={cancelDelete}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle className="text-red-600 flex items-center gap-2">
                            <Trash2 className="h-5 w-5" />
                            Delete Blog
                        </DialogTitle>
                        <DialogDescription className="text-sm text-gray-600 mt-3">
                            This action cannot be undone. This will permanently delete the blog
                            <span className="font-semibold text-black dark:text-white mx-1">
                                &quot;{blog.blogTitle}&quot;
                            </span>
                            and all of its content.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-md p-3 mt-4">
                        <p className="text-sm text-red-800 dark:text-red-200">
                            <strong>Warning:</strong> This will permanently remove the blog and all associated data.
                        </p>
                    </div>

                    <DialogFooter className="gap-2 mt-6">
                        <Button
                            variant="outline"
                            onClick={cancelDelete}
                            disabled={deleteConfirm.isDeleting}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={confirmDelete}
                            disabled={deleteConfirm.isDeleting}
                            className="gap-2"
                        >
                            {deleteConfirm.isDeleting ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Deleting...
                                </>
                            ) : (
                                <>
                                    <Trash2 className="h-4 w-4" />
                                    Delete Blog
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default BlogItem;