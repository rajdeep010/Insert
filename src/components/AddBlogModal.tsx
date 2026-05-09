'use client'
import React,{ useContext, useEffect, useState } from "react";
import { Dialog,DialogContent,DialogHeader,DialogFooter,DialogTitle,DialogDescription } from "@/components/ui/dialog";
import { Input } from '@/components/ui/input'
import { Form,FormControl,FormField,FormItem,FormLabel,FormMessage } from '@/components/ui/form';
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import { Select,SelectContent,SelectGroup,SelectItem,SelectLabel,SelectTrigger,SelectValue,} from "@/components/ui/select"
import { blogSchema } from "@/schemas/blogSchema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useBlog } from "@/features/blog/context/BlogProvider";



const AddBlogModal = ({defaultVisibility}: any) => {
	const {isBlogAdding, addBlog, isAddBlogModalOpen, setIsAddBlogModalOpen} = useBlog()

	const handleAddBlogModalOpen = () => {
		setIsAddBlogModalOpen(!isAddBlogModalOpen)
	}

	const blogform = useForm<z.infer<typeof blogSchema>>(
		{
			resolver: zodResolver(blogSchema),
			defaultValues: {
				title: '',
				visibility: defaultVisibility == "private" ? "private" : "public",
			}
		}
	)

	const blogSubmit = async (data: z.infer<typeof blogSchema>) => {
		addBlog(data.title, data.visibility)
	}

	useEffect(() => {
        blogform.reset({
            title: '',
            visibility: defaultVisibility === "private" ? "private" : "public",
        });
    }, [defaultVisibility, blogform])

	return (<>
		<Dialog open={isAddBlogModalOpen} onOpenChange={handleAddBlogModalOpen}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Blog Details</DialogTitle>
					<DialogDescription>Create a new blog and choose whether it starts public or private.</DialogDescription>
				</DialogHeader>
				<Form {...blogform}>
					<form onSubmit={blogform.handleSubmit(blogSubmit)} className='space-y-6'>
						<FormField
							control={blogform.control}
							name="title"
							render={({ field }) => (
								<FormItem>
									<FormControl>
										<Input autoFocus placeholder="Blog Title" {...field} onChange={(e) => field.onChange(e)} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={blogform.control}
							name="visibility"
							render={({ field }) => (
								<FormItem>
									<FormControl>
										<Select onValueChange={field.onChange} value={field.value}>
											<SelectTrigger>
												<SelectValue placeholder="Visibility" onChange={(e) => field.onChange(e)} />
											</SelectTrigger>
											<SelectContent>
												<SelectGroup>
													<SelectItem value="public">Public</SelectItem>
													<SelectItem value="private">Private</SelectItem>
												</SelectGroup>
											</SelectContent>
										</Select>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<DialogFooter>
							<Button type="submit" variant="default">
								{
									isBlogAdding ? (<>
										<Loader2 className='mr-2 h-4 w-4 animate-spin' />
									</>) : ('Save')
								}
							</Button>
							<Button variant="destructive" disabled={isBlogAdding} onClick={() => setIsAddBlogModalOpen(false)}>Cancel</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	</>
	)
};

export default AddBlogModal;
