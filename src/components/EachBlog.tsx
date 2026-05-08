import { useBlog } from "@/features/blog/context/BlogProvider";
import React from "react";



const EachBlog = () => {
    const { currentBlog } = useBlog()

    return <div>EachBlog</div>;
};

export default EachBlog;
