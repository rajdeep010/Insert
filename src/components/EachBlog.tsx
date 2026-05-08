import { useBlog } from "@/app/context/BlogProvider";
import React from "react";



const EachBlog = () => {
    const { currentBlog } = useBlog()

    return <div>EachBlog</div>;
};

export default EachBlog;
