"use client";
import { toast } from "@/components/ui/use-toast";
import {
	ProblemDifficulty,
	Topic,
	TopicVisibility,
	UserInfo,
} from "@/types/types";
import axios,{ AxiosError } from "axios";
import { useParams,useRouter } from "next/navigation";
import React,{ useEffect,useState } from "react";
// import { useTopics } from '@/app/context/TopicProvider'
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { useSession } from "next-auth/react";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@radix-ui/react-tooltip";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogFooter,
	DialogTitle,
	DialogDescription,
} from "@/components/ui/dialog";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { questionSchema,suggestionSchema } from "@/schemas/topicSchema";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { ApiResponse } from "@/types/ApiResponse";
import TableSkeleton from "@/components/skeletons/TableSkeleton";
import { Skeleton } from "@/components/ui/skeleton";
import { useDebounceCallback, useDebounceValue } from "usehooks-ts";
import { CirclePlus,FileInput,Loader2,Trash2,UserPlus } from "lucide-react";
import UserCard from "@/components/UserCard";
import Collaborator from "@/components/Collaborator";
import CollaboratorsSkeleton from "@/components/skeletons/CollaboratorsSkeleton";
import { NotificationData } from "@/types/types";
import { useTopics } from "@/app/context/TopicProvider";
import ProfileModal from "@/components/ProfileModal";
import InsertNavbar from "@/components/InsertNavbar";
import { ProblemsDataTable } from "@/components/ProblemTable";
import { useInsertUser } from "@/app/context/InsertUserProvider";
import InsertHoverCard from "@/components/InsertHoverCard";
import { Avatar,AvatarFallback,AvatarImage } from "@/components/ui/avatar";
import { useInsertTopics } from "@/app/context/InsertTopicProvider";
import NotFound from "@/app/not-found";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const EachTopic = () => {
	const params = useParams();
	const topic_id = params.topicid as string;
	const { data: session,status } = useSession();
	const router = useRouter();

	const {
		curr_topic,
		isTopicLoading,
		fetchTopicById,
		addProblem,
		deleteProblem,
		deleteTopic
	} = useInsertTopics();

	const { sendSuggestion } = useInsertUser();

	// Modal state
	const [currentProblemId,setCurrentProblemId] = useState<string | null>(null);
	// const [currentProblem,setCurrentProblem] = useState<any>({})

	const [isItemModalOpen,setIsItemModalOpen] = useState(false);
	const [isItemDeleteModalOpen,setIsItemDeleteModalOpen] = useState(false);
	const [isSuggestProblemOpen,setIsSuggestProblemOpen] = useState(false);

	const [isAddingProblem,setIsAddingProblem] = useState(false)
	const [isDeletingProblem,setIsDeletingProblem] = useState(false)

	// collaborator search
	const [debouncedUsername,setSearchUsername] = useDebounceValue<string>('', 500)
	const [isSearchingUsername,setIsSearchingUsername] = useState(false);
	const [searchUsernameMessage,setSearchUsernameMessage] = useState("");
	const [similarUsers,setSimilarUsers] = useState<UserInfo[]>([]);

	const debounced = useDebounceCallback(setSearchUsername,500);

	const [isTopicDeleting,setIsTopicDeleting] = useState(false)

	const [isTopicModalOpen,setIsTopicModalOpen] = useState(false);
	const [isTopicDeleteModalOpen,setIsTopicDeleteModalOpen] = useState(false);

	const handleOpenItemModal = () => setIsItemModalOpen(true);
	const handleOpenDeleteProblemModal = (problemId: string) => {
		setCurrentProblemId(problemId);
		setIsItemDeleteModalOpen(true);
	};
	const handleOpenSuggestProblem = () => setIsSuggestProblemOpen(true);

	const handleDeleteProblem = async () => {
		if (!topic_id || !currentProblemId) return;
		setIsDeletingProblem(true);
		await deleteProblem(topic_id,currentProblemId);
		setIsItemDeleteModalOpen(false);
		setIsDeletingProblem(false);
		setCurrentProblemId(null);
	};

	// ------------------------------------------
	const questionForm = useForm<z.infer<typeof questionSchema>>({
		resolver: zodResolver(questionSchema),
		defaultValues: { qname: "",url: "",difficulty: "Easy" },
	});

	const problemSubmit = async (data: z.infer<typeof questionSchema>) => {
		if (!topic_id || !session?.user?.username) return;
		setIsAddingProblem(true);
		await addProblem(data,topic_id);
		questionForm.reset()
		setIsAddingProblem(false)
		setIsItemModalOpen(false);
	};


	// ------------------------------------

	const suggestionForm = useForm<z.infer<typeof suggestionSchema>>({
		resolver: zodResolver(suggestionSchema),
		defaultValues: { problemname: "",problemurl: "" },
	});

	const suggestionSubmit = async (data: z.infer<typeof suggestionSchema>) => {
		if (!curr_topic || !session?.user?.username) return;
		await sendSuggestion(curr_topic.topic?.creator_username,{
			noti_type: "suggestion",
			from: session.user.username,
			topicid: curr_topic.topic.id,
			topicname: curr_topic.topic.title,
			read: true,
			problemname: data.problemname,
			problemurl: data.problemurl
		});
		suggestionForm.reset()
	};

	const [iscollabModalOpen,setIsCollabModalOpen] = useState(false);
	const handleCollabModal = (id: string) => {
		setIsCollabModalOpen(true);
	};

	useEffect(() => {
		if (!debouncedUsername) return;
		(async () => {
			setIsSearchingUsername(true);
			setSearchUsernameMessage("");
			try {
				const res = await axios.get<ApiResponse>(
					`/api/get-similar-users?username=${debouncedUsername}`
				);
				setSearchUsernameMessage(res.data.message);
				setSimilarUsers(res.data.similar_users || []);
			} catch (err) {
				const e = err as AxiosError<ApiResponse>;
				setSearchUsernameMessage(e.response?.data.message ?? "Error searching");
			} finally {
				setIsSearchingUsername(false);
			}
		})();
	},[debouncedUsername]);

	const handleOpenDeleteTopicModal = () => {
		setIsTopicDeleteModalOpen(true);
	};

	const handleDeleteTopic = async () => {
		if (topic_id !== null) {
			setIsTopicDeleting(true)
			await deleteTopic(topic_id)
			setIsTopicDeleting(false)
			setIsTopicDeleteModalOpen(false)
		}
	}


	if (!curr_topic) return null

	return (
		<div className="flex flex-col gap-6 py-8 lg:py-12 justify-center px-8 lg:px-64">
			<div>
				{" "}
				<InsertNavbar />{" "}
			</div>

			<div className="flex flex-col mt-6">
				<div className="flex flex-col gap-4">

					<div className="flex justify-between gap-6">
						<div className="flex flex-col gap-1">
							<div className="flex items-center gap-4">
								<p className="text-3xl font-bold">
									{curr_topic?.topic?.title}
								</p>
								<div className="flex items-center gap-2">
									{curr_topic?.topic?.visibility === "private" && (
										<Badge variant="destructive" className="flex items-center gap-2">private</Badge>
									)}
									{curr_topic?.topic?.visibility === "public" && (
										<Badge variant="default" className="bg-blue-500 text-white dark:bg-blue-600">public</Badge>
									)}
									<Badge variant="default">{curr_topic?.problems?.length} Problems</Badge>
								</div>
							</div>

							<div className="text-xs">{curr_topic && <div className="text-gray-400 flex gap-2 items-center">Author: {" "} <InsertHoverCard
								username={curr_topic?.topic?.creator_username as string}
								type={"username"}
							/></div>}</div>
						</div>

						<div className="*:data-[slot=avatar]:ring-background flex -space-x-2 *:data-[slot=avatar]:ring-2 *:data-[slot=avatar]:grayscale">
							{curr_topic?.topic?.collaborators.map((each: any,idx: any) => (
								<InsertHoverCard
									key={idx}
									username={each?.username as string}
									type={"avatar"}
								/>
							))}
						</div>
					</div>

					<div className="flex justify-between gap-6">
						<div className="max-w-[50%] break-words text-gray-700 italic text-sm">{curr_topic?.topic?.about}</div>
						<div className="flex flex-col lg:flex-row gap-2 items-center">
							{
								!isTopicLoading && status === "authenticated" && session?.user.username === curr_topic?.topic?.creator_username &&
								<Button variant="outline" className="rounded-md w-fit" onClick={() => handleCollabModal(topic_id)}>
									<UserPlus className="h-4 w-4" />
								</Button>
							}

							{
								!isTopicLoading && status === "authenticated" && (session?.user.username === curr_topic?.topic?.creator_username || curr_topic?.topic?.collaborators.find((each: any) => each.username === session?.user?.username)) && (
									<Button
										onClick={() => handleOpenItemModal()}
										className="rounded-md w-fit"
										variant={"default"}
									>
										<CirclePlus className="h-4 w-4" />
									</Button>
								)
							}

							{
								!isTopicLoading && status === "authenticated" && session?.user.username === curr_topic?.topic?.creator_username &&
								<Button variant="destructive" className="rounded-md w-fit" onClick={() => handleOpenDeleteTopicModal()}>
									<Trash2 className="h-4 w-4" />
								</Button>
							}

							{
								!isTopicLoading && status === "authenticated" && curr_topic && session.user?.username !== curr_topic?.topic?.creator_username && !curr_topic?.topic?.collaborators.find((each: any) => each.username === session?.user?.username) && (
									<Button
										onClick={() => handleOpenSuggestProblem()}
										className="rounded-md w-fit"
										variant={"outline"}
									>
										<FileInput className="h-4 w-4" />
									</Button>
								)}
						</div>
					</div>
				</div>
			</div>

			<div className="rounded-md">
				<Dialog open={iscollabModalOpen} onOpenChange={setIsCollabModalOpen}>
					<DialogContent>
						<DialogHeader className="mb-4">
							<DialogTitle>Add collaborator</DialogTitle>
							<DialogDescription>Start typing the username below...</DialogDescription>
						</DialogHeader>
						<Input
							placeholder="Search username"
							onChange={(e) => {
								setSearchUsername(e.target.value);
								debounced(e.target.value);
							}}
						/>
						{isSearchingUsername && <Loader2 className="animate-spin" />}
						<p
							className={`text-sm ${searchUsernameMessage === "Found"
								? "text-green-500"
								: "text-red-500"
								}`}
						>
							{searchUsernameMessage}
						</p>

						<div className="flex flex-col gap-2 p-2 overflow-y-scroll custom-small-scrollbar">
							{similarUsers?.map((user,idx) => (
								<>
									<UserCard
										key={idx}
										user={user}
										topicid={topic_id}
										topic={curr_topic?.topic}
										collaborators={curr_topic?.topic?.collaborators}
									/>
									<Separator className="my-1" />
								</>
							))}
						</div>
					</DialogContent>
				</Dialog>

				<Dialog open={isItemModalOpen} onOpenChange={setIsItemModalOpen}>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>Add Problem</DialogTitle>
							<DialogDescription>Enter the following details to add problem</DialogDescription>
						</DialogHeader>
						<Form {...questionForm}>
							<form
								onSubmit={questionForm.handleSubmit(problemSubmit)}
								className="space-y-6"
							>
								<FormField
									control={questionForm.control}
									name="qname"
									render={({ field }) => (
										<FormItem>
											<FormControl>
												<Input placeholder="Problem Name" {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={questionForm.control}
									name="url"
									render={({ field }) => (
										<FormItem>
											<FormControl>
												<Input placeholder="URL" {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={questionForm.control}
									name="difficulty"
									render={({ field }) => (
										<FormItem>
											<FormControl>
												<Select
													onValueChange={field.onChange}
													value={field.value}
												>
													<SelectTrigger>
														<SelectValue placeholder="Difficulty" />
													</SelectTrigger>
													<SelectContent>
														<SelectGroup>
															<SelectItem value="Easy">Easy</SelectItem>
															<SelectItem value="Easy-Med">Easy-Med</SelectItem>
															<SelectItem value="Medium">Medium</SelectItem>
															<SelectItem value="Med-Hard">Med-Hard</SelectItem>
															<SelectItem value="Hard">Hard</SelectItem>
															<SelectItem value="Advanced">Advanced</SelectItem>
														</SelectGroup>
													</SelectContent>
												</Select>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<DialogFooter>
									<Button type="submit" variant="default" disabled={isAddingProblem}>
										{isAddingProblem ? (
											<>
												<Loader2 className='mr-2 h-4 w-4 animate-spin' /> Please Wait
											</>
										) : ('Save')}
									</Button>
									<Button
										disabled={isAddingProblem}
										variant="destructive"
										onClick={() => setIsItemModalOpen(false)}
									>
										Cancel
									</Button>
								</DialogFooter>
							</form>
						</Form>
					</DialogContent>
				</Dialog>

				<Dialog
					open={isItemDeleteModalOpen}
					onOpenChange={setIsItemDeleteModalOpen}
				>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>Delete Problem</DialogTitle>
							<DialogDescription>
								Are you sure you want to delete this problem? This action cannot
								be undone.
							</DialogDescription>
						</DialogHeader>
						<DialogFooter>
							<Button variant="destructive" disabled={isDeletingProblem} onClick={handleDeleteProblem}>
								{isDeletingProblem ? (
									<>
										<Loader2 className='mr-2 h-4 w-4 animate-spin' /> Please Wait
									</>
								) : ('Delete')}
							</Button>
							<Button
								disabled={isDeletingProblem}
								variant="default"
								onClick={() => setIsItemDeleteModalOpen(false)}
							>
								Cancel
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>

				<Dialog
					open={isSuggestProblemOpen}
					onOpenChange={setIsSuggestProblemOpen}
				>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>Problem Details</DialogTitle>
						</DialogHeader>
						<Form {...suggestionForm}>
							<form
								onSubmit={suggestionForm.handleSubmit(suggestionSubmit)}
								className="space-y-6"
							>
								<FormField
									control={suggestionForm.control}
									name="problemname"
									render={({ field }) => (
										<FormItem>
											<FormControl>
												<Input placeholder="Problem Name" {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={suggestionForm.control}
									name="problemurl"
									render={({ field }) => (
										<FormItem>
											<FormControl>
												<Input placeholder="Problem URL" {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<DialogFooter>
									<Button type="submit" variant="default">
										Send
									</Button>
									<Button
										variant="destructive"
										onClick={() => setIsSuggestProblemOpen(false)}
									>
										Cancel
									</Button>
								</DialogFooter>
							</form>
						</Form>
					</DialogContent>
				</Dialog>

				<Dialog open={isTopicDeleteModalOpen} onOpenChange={setIsTopicDeleteModalOpen}>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>Confirm Delete Topic</DialogTitle>
						</DialogHeader>
						<DialogDescription>Are you sure you want to delete this topic?</DialogDescription>
						<DialogFooter>
							<Button variant="destructive" disabled={isTopicDeleting} onClick={() => setIsTopicDeleteModalOpen(false)}>Cancel</Button>
							<Button variant="default" onClick={handleDeleteTopic} disabled={isTopicDeleting}>
								{
									isTopicDeleting ? (<>
										<Loader2 className='mr-2 h-4 w-4 animate-spin' /> Please wait
									</>) : ('Confirm')
								}
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>

				{!isTopicLoading && <ProblemsDataTable
					problems={curr_topic?.problems || []}
					showDelete={
						status === "authenticated" &&
						(session?.user.username === curr_topic?.topic?.creator_username || curr_topic?.topic?.collaborators.find((each: any) => each.username === session?.user?.username))
					}
					onDelete={handleOpenDeleteProblemModal}
				/>}

				{isTopicLoading && <TableSkeleton />}
			</div>
		</div>
	);
};

export default EachTopic;
