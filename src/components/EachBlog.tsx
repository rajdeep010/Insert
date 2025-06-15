import { useBlog } from "@/app/context/BlogProvider";
import React from "react";



const EachBlog = () => {
    const {blogContent} = useBlog()

    return <div>EachBlog</div>;
};

export default EachBlog;
