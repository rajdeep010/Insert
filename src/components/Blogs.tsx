import React,{ useMemo } from "react";
import BlogCard from "./BlogCard";
import { useBlog } from "@/app/context/BlogProvider";
import { AppWindowIcon,CodeIcon } from "lucide-react";
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
import { Tabs,TabsContent,TabsList,TabsTrigger } from "@/components/ui/tabs";
import Image from "next/image";
import Link from "next/link";

const Blogs = () => {
  const { allBlogs } = useBlog();

  const privateBlogs = useMemo(
    () => allBlogs.filter((blog) => blog?.type === "private"),
    [allBlogs]
  );

  const publicBlogs = useMemo(
    () => allBlogs.filter((blog) => blog?.type === "public"),
    [allBlogs]
  );

  const defaultBanner = "/insert.png"

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
              publicBlogs?.map((blog,index) => (
                <Link
                  key={index}
                  target="__blank"
                  href={`/blog/${blog?.blogUrl}`}
                  className="cursor-pointer transition ease-in-out duration-200 hover:bg-gray-100 dark:hover:bg-gray-800 hover:shadow-lg rounded-md block"
                >
                  <Card className="w-full shadow-lg dark:shadow-lg dark:shadow-gray-800 max-h-[400px] min-h-[350px] grow flex flex-col">
                    <CardHeader className="p-0">
                      <Image
                        height={400}
                        width={400}
                        src={blog?.blogBannerImage || defaultBanner}
                        alt={blog?.blogTitle}
                        className="w-full h-48 object-cover rounded-t-md"
                      />
                    </CardHeader>
                    <CardContent className="p-4 flex-1 flex flex-col">
                      <CardTitle className="text-3xl font-normal mb-4">
                        {blog?.blogTitle}
                      </CardTitle>
                      <CardDescription className="text-sm text-gray-500 mb-2">
                        {blog?.blogContentText
                          ? blog.blogContentText.slice(0,150) + "..."
                          : <span>&nbsp;</span> }
                      </CardDescription>

                    </CardContent>
                  </Card>
                </Link>
              ))}

              { publicBlogs && publicBlogs?.length === 0 && 
                    <div className="text-gray-500 mt-6">No public blogs...</div>
              }
          </TabsContent>


          <TabsContent value="private" className="w-full grid grid-cols-1 sm:grid-cols-2 gap-4">
            {privateBlogs &&
              privateBlogs?.map((blog,index) => (
                <Link
                  key={index}
                  target="__blank"
                  href={`/blog/${blog?.blogUrl}`}
                  className="cursor-pointer transition ease-in-out duration-200 hover:bg-gray-100 dark:hover:bg-gray-800 hover:shadow-lg rounded-md block"
                >
                  <Card className="w-full shadow-lg dark:shadow-lg dark:shadow-gray-800 max-h-[400px] min-h-[350px] grow flex flex-col">
                    <CardHeader className="p-0">
                      <Image
                        height={400}
                        width={400}
                        src={blog?.blogBannerImage || defaultBanner}
                        alt={blog?.blogTitle}
                        className="w-full h-48 object-cover rounded-t-md"
                      />
                    </CardHeader>
                    <CardContent className="p-4 flex-1 flex flex-col">
                      <CardTitle className="text-3xl font-normal mb-4">
                        {blog?.blogTitle}
                      </CardTitle>
                      <CardDescription className="text-sm text-gray-500 mb-2">
                        {blog?.blogContentText
                          ? blog.blogContentText.slice(0,150) + "..."
                          : <span>&nbsp;</span> }
                      </CardDescription>
                    </CardContent>
                  </Card>
                </Link>
              ))}

              { privateBlogs && privateBlogs?.length === 0 && 
                    <div className="text-gray-500 mt-6">No private blogs...</div>
              }
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default Blogs;
