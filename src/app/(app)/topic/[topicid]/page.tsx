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
import { useDebounceCallback } from "usehooks-ts";
import { Loader2 } from "lucide-react";
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

const EachTopic = () => {
	const params = useParams();
	const topic_id = params.topicid as string;
	const { data: session,status } = useSession();
	const router = useRouter();

	const [curr_topic,setCurrTopic] = useState<Topic>();

	const { addProblem,deleteProblem } = useTopics();
	const { sendSuggestion } = useInsertUser()

	const [currentTopicId,setCurrentTopicId] = useState<string | null>(topic_id);
	const [currentProblemId,setCurrentProblemId] = useState<string | null>(null);
	const [isItemModalOpen,setIsItemModalOpen] = useState(false);
	const [isItemDeleteModalOpen,setIsItemDeleteModalOpen] = useState(false);
	const [iscollabModalOpen,setIsCollabModalOpen] = useState(false);
	const [isSuggestProblemOpen,setIsSuggestProblemOpen] = useState(false);

	const [topicLoading,setTopicLoading] = useState(false);

	const [searchUsername,setSearchUsername] = useState<string>("");
	const [isSearchingUsername,setIsSearchingUsername] =
		useState<boolean>(false);
	const [searchUsernameMessage,setSearchUsernameMessage] =
		useState<string>("");
	const [similarUsers,setSimilarUsers] = useState<UserInfo[]>([]);

	const debouned = useDebounceCallback(setSearchUsername,500);

	const handleOpenItemModal = (id: string) => {
		setCurrentTopicId(id);
		setIsItemModalOpen(true);
	};

	const handleCollabModal = (id: string) => {
		setCurrentTopicId(id);
		setIsCollabModalOpen(true);
	};

	const handleOpenDeleteProblemModal = (topicId: string,problemId: string) => {
		setCurrentTopicId(topicId);
		setCurrentProblemId(problemId);
		setIsItemDeleteModalOpen(true);
	};

	const checkAndFetchTopic = async () => {
		try {
			if (status === "loading") return;

			setTopicLoading(true);
			const accessResponse = await axios.get(
				`/api/check-topic-access?topicid=${topic_id}&username=${session?.user?.username}`
			);
			if (!accessResponse.data.success) {
				toast({
					title: "Error",
					description: accessResponse?.data?.message || "Something went wrong",
					variant: "destructive"
				})
				router.replace('/')
				return;
			}

			const topicResponse = await axios.get(
				`/api/get-topic-by-topicid?topic_id=${topic_id}`
			);

			if (!topicResponse) {
				toast({
					title: "Error",
					description: "Topic not found",
					variant: "destructive",
				});
				return;
			}
			setCurrTopic(topicResponse.data.curr_topic);

			console.log("this is curr_topic",topicResponse.data);
		} catch (error) {
			router.push(`/`)
		} finally {
			setTopicLoading(false);
		}
	};

	const handleDeleteProblem = async () => {
		if (currentTopicId !== null && currentProblemId !== null) {
			try {
				deleteProblem(currentTopicId,currentProblemId);
				setIsItemDeleteModalOpen(false);
				// Fetch the updated topic to refresh the UI
				const response = await axios.get(
					`/api/get-topic-by-topicid?topic_id=${currentTopicId}`
				);
				if(!response.data.success){
					toast({
						title: "Error",
						description: response?.data?.message || "Something went wrong",
						variant: "destructive"
					})
					router.replace('/')
					return
				}
				setCurrTopic(response.data.curr_topic);

				checkAndFetchTopic();
			} catch (error) {
				toast({
					title: "Error",
					description: "Error deleting the problem",
					variant: "destructive",
				});
			}
		}
	};

	const handleOpenSuggestProblem = (id: string) => {
		setCurrentTopicId(id);
		setIsSuggestProblemOpen(true);
	};

	const questionform = useForm<z.infer<typeof questionSchema>>({
		resolver: zodResolver(questionSchema),
		defaultValues: {
			qname: "",
			url: "",
			difficulty: "Easy",
		},
	});

	const suggestionform = useForm<z.infer<typeof suggestionSchema>>({
		resolver: zodResolver(suggestionSchema),
		defaultValues: {
			problemurl: "",
			problemname: "",
		},
	});

	const problemSubmit = async (data: z.infer<typeof questionSchema>) => {
		try {
			if (!topic_id) return;
			if (!session?.user?.username) return;

			addProblem(data,topic_id,session?.user?.username);
			setIsItemModalOpen(false);
			const response = await axios.get(`/api/get-topic-by-topicid?topic_id=${topic_id}`);
			setCurrTopic(response.data.curr_topic);

			checkAndFetchTopic();
		} catch (error) {
			const axiosError = error as AxiosError<ApiResponse>;
			let errorMessage = axiosError.response?.data.message;
			toast({
				title: "Problem add Failed",
				description: errorMessage,
				variant: "destructive",
			});
		} finally {
			// setIsProblemSubmitting(false)
		}
	};

	const suggestionSubmit = async (data: z.infer<typeof suggestionSchema>) => {
		if (!topic_id) return;
		if (!session?.user?.username) return;
		if (!curr_topic?.creator_username) return;

		const suggestNotify: NotificationData = {
			noti_type: "suggestion",
			from: session?.user?.username,
			topicid: curr_topic?.id,
			topicname: curr_topic?.title,
			read: true,
		};

		sendSuggestion(curr_topic?.creator_username!,suggestNotify);
	};

	useEffect(() => {
		const findSimilarUsers = async () => {
			if (searchUsername) {
				setIsSearchingUsername(true);
				setSearchUsernameMessage("");

				try {
					const response = await axios.get(`/api/get-similar-users?username=${searchUsername}`);
					setSearchUsernameMessage(response.data.message);
					setSimilarUsers(response.data.similar_users);
				} catch (error) {
					const axiosError = error as AxiosError<ApiResponse>;
					setSearchUsernameMessage(
						axiosError.response?.data.message ?? "Error seaching collaborators"
					);
				} finally {
					setIsSearchingUsername(false);
				}
			}
		};

		findSimilarUsers();
	},[searchUsername]);

	useEffect(() => {
		checkAndFetchTopic();
	},[status]);

	return (
		<div className="flex flex-col gap-6 py-24 justify-center px-64">
			<div>
				{" "}
				<InsertNavbar />{" "}
			</div>

			<div className="flex flex-col mt-6">
				{/* title and buttons */}
				{/* <div className="flex justify-between items-center gap-6"> */}

				<div className="flex flex-col gap-4">

					<div className="flex justify-between gap-6">
						<div className="flex flex-col gap-1">
							<p className="text-3xl font-bold">{curr_topic?.title}</p>
							<p className="text-xs">{curr_topic && <p className="text-gray-400 flex gap-2 items-center">Author: {" "} <InsertHoverCard
								username={curr_topic?.creator_username as string}
								type={"username"}
							/></p>}</p>
						</div>

						<div className="*:data-[slot=avatar]:ring-background flex -space-x-2 *:data-[slot=avatar]:ring-2 *:data-[slot=avatar]:grayscale">
							{curr_topic?.collaborators.map((each,idx) => (
								<InsertHoverCard
									key={idx}
									username={each?.username as string}
									type={"avatar"}
								/>
							))}
						</div>
					</div>

					<div className="flex justify-between gap-6">
						<p className="max-w-[50%] break-words text-gray-700 italic text-sm">{curr_topic?.about}</p>
						<div className="flex gap-2 items-center">
							{
								!topicLoading && status === "authenticated" && session?.user.username === curr_topic?.creator_username &&
								<Button onClick={() => handleCollabModal(topic_id)}
									className="rounded-md w-fit"
									variant={"outline"}
								>
									Add Collaborator
								</Button>
							}

							{
								!topicLoading && status === "authenticated" && (session?.user.username === curr_topic?.creator_username || curr_topic?.collaborators.find((each) => each.username === session?.user?.username)) && (
									<Button
										onClick={() => handleOpenItemModal(topic_id)}
										className="rounded-md w-fit"
										variant="default"
									>
										Add Problem
									</Button>
								)}

							{
								!topicLoading && status === "authenticated" && curr_topic && session.user?.username !== curr_topic?.creator_username && !curr_topic?.collaborators.find((each) => each.username === session?.user?.username) && (
									<Button
										onClick={() => handleOpenSuggestProblem(topic_id)}
										className="rounded-md w-fit"
										variant={"outline"}
									>
										Suggest Problem
									</Button>
								)}
						</div>
					</div>
				</div>

				{/* <div className="flex flex-col gap-4">
						<div className="mb-2 flex gap-2 items-end">
							{topicLoading 
								? <Skeleton className="h-8 w-[250px]" />
							 	: <div className="text-3xl font-sans transition hover:text-gray-600">
									{curr_topic?.title}
								</div>
							}
							{topicLoading ? (
								<Skeleton className="h-6 w-[100px]" />
							) : (
								<div className="text-[13px] mb-[2px]">
									{curr_topic &&
										`(` +
										curr_topic.problems.length +
										`${curr_topic.problems.length > 1
											? " problems"
											: " problem"
										})`}
								</div>
							)}
						</div>
						<div className="flex flex-col gap-1">
							{topicLoading && curr_topic?.creator_username ? (
								<Skeleton className="h-4 w-[200px]" />
							) : (
								<div className="text-xs text-gray-400 flex items-center gap-2">
									Created by
									<InsertHoverCard
										username={curr_topic?.creator_username as string}
										trigger={<div>@{curr_topic?.creator_username}</div>}
										type={"username"}
									/>
								</div>
							)}

							{topicLoading ? (
								<Skeleton className="h-6 w-[600px]" />
							) : (
								<div className="dark:text-gray-100 text-gray-500 font-sans">
									{curr_topic?.about}
								</div>
							)}
						</div>
					</div>

					<div className="flex items-center gap-5">
						{topicLoading && (
							<div className="flex gap-5 items-center">
								<Skeleton className="h-9 w-[140px]" />
								<Skeleton className="h-9 w-[120px]" />
							</div>
						)}

						{!topicLoading &&
							status === "authenticated" &&
							session?.user.username === curr_topic?.creator_username && (
								<Button
									onClick={() => handleCollabModal(topic_id)}
									className="rounded-md w-fit"
									variant={"outline"}
								>
									Add Collaborator
								</Button>
							)}
						{!topicLoading &&
							status === "authenticated" &&
							(session?.user.username === curr_topic?.creator_username ||
								curr_topic?.collaborators.find(
									(each) => each.username === session?.user?.username
								)) && (
								<Button
									onClick={() => handleOpenItemModal(topic_id)}
									className="rounded-md w-fit"
									variant="default"
								>
									Add Problem
								</Button>
							)}
						{!topicLoading &&
							status === "authenticated" &&
							session?.user.username !== curr_topic?.creator_username &&
							!curr_topic?.collaborators.find(
								(each) => each.username === session?.user?.username
							) && (
								<Button
									onClick={() => handleOpenSuggestProblem(topic_id)}
									className="rounded-md w-fit"
									variant={"outline"}
								>
									Suggest Problem
								</Button>
							)}
					</div> */}
				{/* </div> */}

				{/* about and collaborators */}
				{/* <div className="flex justify-end items-end">
					<div className="flex flex-col gap-2">
						{topicLoading ? (
							<Skeleton className="h-6 w-[120px]" />
						) : (
							curr_topic &&
							curr_topic?.collaborators.length > 0 && (
								<div className="text-md text-gray-400">Collaborators</div>
							)
						)}

						{topicLoading ? (
							<CollaboratorsSkeleton />
						) : (
							// <div className="flex items-center gap-3">
							<div className="*:data-[slot=avatar]:ring-background flex -space-x-2 *:data-[slot=avatar]:ring-2 *:data-[slot=avatar]:grayscale">
								{curr_topic?.collaborators.map((each, idx) => (
									<InsertHoverCard
										key={idx}
										username={each?.username as string}
										trigger={<Avatar className='cursor-pointer outline-2 outline-black'>
												<AvatarImage src={each?.username || ''} />
												<AvatarFallback>{each?.username[0]}</AvatarFallback>
											</Avatar>
										}
										type={"avatar"}
									/>
								))}
							</div>
						)}
					</div>
				</div> */}
			</div>

			<div className="rounded-md">
				<Dialog open={iscollabModalOpen} onOpenChange={setIsCollabModalOpen}>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>Add collaborator</DialogTitle>
						</DialogHeader>
						<Input
							placeholder="Search username"
							onChange={(e) => {
								setSearchUsername(e.target.value);
								debouned(e.target.value);
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

						<div className="flex flex-col gap-2 p-2 overflow-y-scroll custom-scrollbar">
							{similarUsers.map(({ username,name }) => (
								<>
									{username !== curr_topic?.creator_username && (
										<UserCard
											username={username as string}
											name={name as string}
											topicid={topic_id}
											topicname={curr_topic?.title as string}
											creator_username={curr_topic?.creator_username as string}
										/>
									)}
								</>
							))}
						</div>
					</DialogContent>
				</Dialog>

				<Dialog open={isItemModalOpen} onOpenChange={setIsItemModalOpen}>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>Problem Details</DialogTitle>
						</DialogHeader>
						<Form {...questionform}>
							<form
								onSubmit={questionform.handleSubmit(problemSubmit)}
								className="space-y-6"
							>
								<FormField
									control={questionform.control}
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
									control={questionform.control}
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
									control={questionform.control}
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
									<Button type="submit" variant="default">
										Save
									</Button>
									<Button
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
							<Button variant="destructive" onClick={handleDeleteProblem}>
								Delete
							</Button>
							<Button
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
						<Form {...suggestionform}>
							<form
								onSubmit={suggestionform.handleSubmit(suggestionSubmit)}
								className="space-y-6"
							>
								<FormField
									control={suggestionform.control}
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
									control={suggestionform.control}
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

				{!topicLoading && <ProblemsDataTable
					problems={curr_topic?.problems || []}
					showDelete={
						status === "authenticated" &&
						session?.user.username === curr_topic?.creator_username
					}
					onDelete={(problemId) =>
						handleOpenDeleteProblemModal(topic_id,problemId)
					}
				/>}

				{topicLoading && <TableSkeleton />}
			</div>
		</div>
	);
};

export default EachTopic;
