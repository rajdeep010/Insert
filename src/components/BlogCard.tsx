import React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";

interface BlogCardProps {
  image: string;
  title: string;
  description: string;
  content: string;
}

const BlogCard = () => {
  const description = "Lorem ipsum dolor sit amet consectetur adipisicing elit. Lorem ipsum dolor sit amet consectetur adipisicing elit. Lorem ipsum dolor sit amet consectetur adipisicing elit. blanditiis velit cum sit impedit eveniet delectus..."
  const image = "https://github.com/shadcn.png"
  const content = "Lorem ipsum dolor sit amet consectetur "
  const title = "Hello world"

  return (
    <Card className="w-full shadow-lg dark:shadow-lg dark:shadow-gray-800">
      <CardHeader className="p-0">
        <Image
          height={100}
          width={200}
          src={image}
          alt={title}
          className="w-full h-48 object-cover rounded-t-md"
        />
      </CardHeader>
      <CardContent className="p-4">
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
        <p className="text-sm text-gray-700 mb-3">{content}</p>
        <CardDescription className="text-sm text-gray-500 mb-2">
          {description}
        </CardDescription>
        {/* <p className="text-sm text-gray-700">{content}</p> */}
        <Button variant="default" className="mt-4">
          Read More
        </Button>
      </CardContent>
    </Card>
  );
};

export default BlogCard;
