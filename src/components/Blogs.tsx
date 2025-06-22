import React from "react";
import BlogCard from "./BlogCard";

const Blogs = () => {
  return (
    <>
        <div className="grid w-full h-[80vh] grid-cols-1 sm:grid-cols-2 gap-4 shadow-md dark:shadow-gray-800 py-6 pr-4 scrollbar-thin overflow-y-scroll">
            <BlogCard/>
            <BlogCard/>
            <BlogCard/>
            <BlogCard/>
            <BlogCard/>
        </div>
    </>
  );
};

export default Blogs;
