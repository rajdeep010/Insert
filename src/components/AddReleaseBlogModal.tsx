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
import { useBlog } from "@/app/context/BlogProvider";
import { useInsertProjects } from "@/app/context/InsertProjectProvider";



const AddReleaseBlogModal = ({defaultVisibility, onClose}: any) => {

    const {isReleaseBlogLoading, addReleaseBlog, curr_project } = useInsertProjects();


	const handleAddBlogModalOpen = () => {
		onClose(!defaultVisibility)
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
		await addReleaseBlog(curr_project?.id, {
            title: data.title, 
            visibility: data.visibility
        })
        onClose(true)
	}

	useEffect(() => {
        blogform.reset({
            title: '',
            visibility: defaultVisibility === "private" ? "private" : "public",
        });
    }, [defaultVisibility, blogform])

	return (<>
		<Dialog open={defaultVisibility} onOpenChange={handleAddBlogModalOpen}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Add Release Blog</DialogTitle>
				</DialogHeader>
				<Form {...blogform}>
					<form onSubmit={blogform.handleSubmit(blogSubmit)} className='space-y-6'>
						<FormField
							control={blogform.control}
							name="title"
							render={({ field }) => (
								<FormItem>
									<FormControl>
										<Input autoFocus placeholder="Release Blog Title" {...field} onChange={(e) => field.onChange(e)} />
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
									isReleaseBlogLoading ? (<>
										<Loader2 className='mr-2 h-4 w-4 animate-spin' />
									</>) : ('Save')
								}
							</Button>
							<Button variant="destructive" disabled={isReleaseBlogLoading} onClick={() => onClose(true)}>Cancel</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	</>
	)
};

export default AddReleaseBlogModal;
