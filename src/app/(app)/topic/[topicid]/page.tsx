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
import { useInsertTopics } from "@/app/context/InsertTopicProvider";

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
	} = useInsertTopics();

	const { sendSuggestion } = useInsertUser();

	// Modal state
	const [currentProblemId,setCurrentProblemId] = useState<string | null>(null);
	const [isItemModalOpen,setIsItemModalOpen] = useState(false);
	const [isItemDeleteModalOpen,setIsItemDeleteModalOpen] = useState(false);
	const [isSuggestProblemOpen,setIsSuggestProblemOpen] = useState(false);

	// collaborator search
	const [searchUsername,setSearchUsername] = useState("");
	const [isSearchingUsername,setIsSearchingUsername] = useState(false);
	const [searchUsernameMessage,setSearchUsernameMessage] = useState("");
	const [similarUsers,setSimilarUsers] = useState<UserInfo[]>([]);
	const debounced = useDebounceCallback(setSearchUsername,500);

	// ————————————————————————————————————————————————
	// 2) Handlers

	const handleOpenItemModal = () => setIsItemModalOpen(true);
	const handleOpenDeleteProblemModal = (problemId: string) => {
		setCurrentProblemId(problemId);
		setIsItemDeleteModalOpen(true);
	};
	const handleOpenSuggestProblem = () => setIsSuggestProblemOpen(true);

	const handleDeleteProblem = async () => {
		if (!topic_id || !currentProblemId) return;
		await deleteProblem(topic_id, currentProblemId);
		setIsItemDeleteModalOpen(false);
	};

	const questionForm = useForm<z.infer<typeof questionSchema>>({
		resolver: zodResolver(questionSchema),
		defaultValues: { qname: "",url: "",difficulty: "Easy" },
	});

	const problemSubmit = async (data: z.infer<typeof questionSchema>) => {
		if (!topic_id || !session?.user?.username) return;
		await addProblem(data,topic_id,session.user.username);
		setIsItemModalOpen(false);
	};

	const suggestionForm = useForm<z.infer<typeof suggestionSchema>>({
		resolver: zodResolver(suggestionSchema),
		defaultValues: { problemname: "",problemurl: "" },
	});

	const suggestionSubmit = (data: z.infer<typeof suggestionSchema>) => {
		if (!curr_topic || !session?.user?.username) return;
		sendSuggestion(curr_topic.topic?.creator_username,{
			noti_type: "suggestion",
			from: session.user.username,
			topicid: curr_topic.topic.id,
			topicname: curr_topic.topic.title,
			read: true,
		});
	};

	const [iscollabModalOpen,setIsCollabModalOpen] = useState(false);
	const handleCollabModal = (id: string) => {
		setIsCollabModalOpen(true);
	};

	// ————————————————————————————————————————————————
	// 3) Optional collaborator search (unchanged)

	useEffect(() => {
		if (!searchUsername) return;
		(async () => {
			setIsSearchingUsername(true);
			setSearchUsernameMessage("");
			try {
				const res = await axios.get<ApiResponse>(
					`/api/get-similar-users?username=${searchUsername}`
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
	},[searchUsername]);

	// ————————————————————————————————————————————————
	// 4) Render
	if (isTopicLoading || !curr_topic) return <p>Loading topic…</p>;

	return (
		<div className="flex flex-col gap-6 py-12 lg:py-24 justify-center px-12 lg:px-64">
			<div>
				{" "}
				<InsertNavbar />{" "}
			</div>

			<div className="flex flex-col mt-6">
				<div className="flex flex-col gap-4">

					<div className="flex justify-between gap-6">
						<div className="flex flex-col gap-1">
							<p className="text-3xl font-bold">{curr_topic?.topic?.title}</p>
							<p className="text-xs">{curr_topic && <p className="text-gray-400 flex gap-2 items-center">Author: {" "} <InsertHoverCard
								username={curr_topic?.topic?.creator_username as string}
								type={"username"}
							/></p>}</p>
						</div>

						<div className="*:data-[slot=avatar]:ring-background flex -space-x-2 *:data-[slot=avatar]:ring-2 *:data-[slot=avatar]:grayscale">
							{curr_topic?.topic?.collaborators.map((each: any, idx: any) => (
								<InsertHoverCard
									key={idx}
									username={each?.username as string}
									type={"avatar"}
								/>
							))}
						</div>
					</div>

					<div className="flex justify-between gap-6">
						<p className="max-w-[50%] break-words text-gray-700 italic text-sm">{curr_topic?.topic?.about}</p>
						<div className="flex flex-col lg:flex-row gap-2 items-center">
							{
								!isTopicLoading && status === "authenticated" && session?.user.username === curr_topic?.topic?.creator_username &&
								<Button onClick={() => handleCollabModal(topic_id)}
									className="rounded-md w-fit"
									variant={"outline"}
								>
									Add Collaborator
								</Button>
							}

							{
								!isTopicLoading && status === "authenticated" && (session?.user.username === curr_topic?.topic?.creator_username || curr_topic?.topic?.collaborators.find((each: any) => each.username === session?.user?.username)) && (
									<Button
										onClick={() => handleOpenItemModal()}
										className="rounded-md w-fit"
										variant={"default"}
									>
										Add Problem
									</Button>
								)}

							{
								!isTopicLoading && status === "authenticated" && curr_topic && session.user?.username !== curr_topic?.topic?.creator_username && !curr_topic?.topic?.collaborators.find((each: any) => each.username === session?.user?.username) && (
									<Button
										onClick={() => handleOpenSuggestProblem()}
										className="rounded-md w-fit"
										variant={"outline"}
									>
										Suggest Problem
									</Button>
								)}
						</div>
					</div>
				</div>
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

						<div className="flex flex-col gap-2 p-2 overflow-y-scroll custom-scrollbar">
							{similarUsers.map(({ username,name }) => (
								<>
									{username !== curr_topic?.topic?.creator_username && (
										<UserCard
											username={username as string}
											name={name as string}
											topicid={topic_id}
											topicname={curr_topic?.topic?.title as string}
											creator_username={curr_topic?.topic?.creator_username as string}
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

				{!isTopicLoading && <ProblemsDataTable
					problems={curr_topic?.problems || []}
					showDelete={
						status === "authenticated" &&
						session?.user.username === curr_topic?.topic?.creator_username
					}
					onDelete={(problemId) =>
						handleOpenDeleteProblemModal(problemId)
					}
				/>}

				{isTopicLoading && <TableSkeleton />}
			</div>
		</div>
	);
};

export default EachTopic;
