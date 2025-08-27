'use client'
import React, { use, useMemo, useState } from "react";
import BlogCard from "./BlogCard";
import { useBlog } from "@/app/context/BlogProvider";
import { AppWindowIcon, CodeIcon, Edit, Loader2, MoreHorizontal, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Image from "next/image";
import Link from "next/link";
import BlogItem from "./BlogItem";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "./ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";



const Blogs = () => {
  const [currBlog, setCurrBlog] = useState<any>(null);

  const { allBlogs, removeBlogFromState, deleteBlog } = useBlog();

  const [deleting, setIsDeleting] = useState(false);
  const handleDeleteBlog = async (blogId: string) => {
    try {
      setIsDeleting(true);
      await deleteBlog(blogId);
    } catch (error) {
      setIsDeleting(false);
    } finally {
      setIsDeleting(false)
    }
  };

  const privateBlogs = useMemo(
    () => allBlogs.filter((blog) => blog?.type === "private"),
    [allBlogs]
  );

  const publicBlogs = useMemo(
    () => allBlogs.filter((blog) => blog?.type === "public"),
    [allBlogs]
  );

  const defaultBanner = "/insert.png"
  const handleBlogDeleted = (blogId: string) => {
    removeBlogFromState(blogId);
  };



  return (
    <div className="w-full">
      <Tabs defaultValue="public">
        <TabsList className="w-fit mt-4 text-lg font-medium">
          <TabsTrigger value="public">Public</TabsTrigger>
          <TabsTrigger value="private">Private</TabsTrigger>
        </TabsList>
        <div className="shadow-md dark:shadow-gray-800 px-4 h-[80vh] scrollbar-thin overflow-y-scroll">
          <TabsContent value="public" className="w-full grid grid-cols-1 sm:grid-cols-2 gap-4 mb-[-4px]">
            {publicBlogs &&
              publicBlogs?.map((blog, index) => (
                <Link
                  key={index}
                  target="__blank"
                  href={`/blog/${blog?.blogUrl}`}
                  className="cursor-pointer transition ease-in-out duration-200 hover:bg-gray-100 dark:hover:bg-gray-800 hover:shadow-lg rounded-md block"
                >
                  <Card className="w-full shadow-lg dark:shadow-lg dark:shadow-gray-800 max-h-[400px] min-h-[350px] grow flex flex-col relative">
                    <CardHeader className="p-0">
                      <Image
                        height={400}
                        width={400}
                        src={blog?.blogBannerImage || defaultBanner}
                        alt={blog?.blogTitle}
                        className="w-full h-48 object-cover rounded-t-md"
                      />
                    </CardHeader>
                    <CardContent className="p-4 flex-1 flex flex-col relative">
                      <CardTitle className="text-3xl font-normal mb-4">
                        {blog?.blogTitle}
                      </CardTitle>

                      <div className="flex flex-col flex-1">
                        <CardDescription className="text-sm text-gray-500 mb-2">
                          {blog?.blogContentText
                            ? blog.blogContentText.slice(0, 150) + "..."
                            : <span>&nbsp;</span>}
                        </CardDescription>
                      </div>

                      {/* BlogItem positioned at bottom right corner */}
                      <div className="absolute bottom-4 right-4 z-50">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <MoreHorizontal className="h-6 w-6 p-1 border-[1px] rounded-md" onClick={() => setCurrBlog(blog)} />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent side="right" align="start">
                            <DropdownMenuItem className="flex items-center gap-2 p-2 cursor-pointer">
                              <Edit className="h-4 w-4" />
                              <span>Edit Blog</span>
                            </DropdownMenuItem>
                            {/* <DropdownMenuSeparator/> */}
                            <DropdownMenuItem
                              className="flex items-center gap-2 p-2 text-red-500 focus:text-red-600 cursor-pointer hover:dark:bg-gray-800 hover:bg-gray-200"
                              onClick={() => handleDeleteBlog(blog?._id)}>

                              <Trash2 className="h-4 w-4" />
                              <span>Delete Blog</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}

            {publicBlogs && publicBlogs?.length === 0 &&
              <div className="text-gray-500 mt-6">No public blogs...</div>
            }
          </TabsContent>


          <TabsContent value="private" className="w-full grid grid-cols-1 sm:grid-cols-2 gap-4">
            {privateBlogs &&
              privateBlogs?.map((blog, index) => (
                <Link
                  key={index}
                  target="__blank"
                  href={`/blog/${blog?.blogUrl}`}
                  className="cursor-pointer transition ease-in-out duration-200 hover:bg-gray-100 dark:hover:bg-gray-800 hover:shadow-lg rounded-md block"
                >
                  <Card className="w-full shadow-lg dark:shadow-lg dark:shadow-gray-800 max-h-[400px] min-h-[350px] grow flex flex-col relative">
                    <CardHeader className="p-0">
                      <Image
                        height={400}
                        width={400}
                        src={blog?.blogBannerImage || defaultBanner}
                        alt={blog?.blogTitle}
                        className="w-full h-48 object-cover rounded-t-md"
                      />
                    </CardHeader>
                    <CardContent className="p-4 flex-1 flex flex-col relative">
                      <CardTitle className="text-3xl font-normal mb-4">
                        {blog?.blogTitle}
                      </CardTitle>

                      <div className="flex flex-col flex-1">
                        <CardDescription className="text-sm text-gray-500 mb-2">
                          {blog?.blogContentText
                            ? blog.blogContentText.slice(0, 150) + "..."
                            : <span>&nbsp;</span>}
                        </CardDescription>
                      </div>

                      {/* BlogItem positioned at bottom right corner */}
                      <div className="absolute bottom-4 right-4 z-50">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <MoreHorizontal className="h-6 w-6 p-1 border-[1px] rounded-md" onClick={() => setCurrBlog(blog)} />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent side="right" align="start">

                            <Link href={`/blog/${blog?.blogUrl}`}>
                              <DropdownMenuItem className="flex items-center gap-2 p-2 cursor-pointer" disabled={deleting}>
                                <Edit className="h-4 w-4" />
                                <span>Edit Blog</span>
                              </DropdownMenuItem>
                            </Link>

                            <DropdownMenuItem
                              className="flex items-center gap-2 p-2 text-red-500 focus:text-red-600 cursor-pointer hover:dark:bg-gray-800 hover:bg-gray-200"
                              onClick={() => handleDeleteBlog(blog._id)}
                              disabled={deleting}  
                            >

                              <Trash2 className="h-4 w-4" />
                              <span>Delete Blog</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}

            {privateBlogs && privateBlogs?.length === 0 &&
              <div className="text-gray-500 mt-6">No private blogs...</div>
            }


          </TabsContent>
        </div>
      </Tabs>


    </div>
  );
};

export default Blogs;
