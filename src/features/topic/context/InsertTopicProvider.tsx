'use client'

import { toast } from "@/components/ui/use-toast";
import db from "@/firebaseConfig";
import InsertTopicReducer from "@/features/topic/reducers/InsertTopicReducer";
import { questionSchema, topicSchema } from "@/schemas/topicSchema";
import axios from "axios";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef } from "react";
import type { CurrentTopicState, HeatmapDateValues, Topic } from "@/types/topic";
import { z } from "zod";
import { ref as databaseRef, get, onValue, set } from "firebase/database";

interface InsertTopicProviderProps {
	all_topics: Topic[];
	user_Topics: Topic[];
	user_heatmapValues: HeatmapDateValues[];
	isAllSheetsLoading: boolean;
	isTopicsLoading: boolean;
	isHeatmapLoading: boolean;
	curr_topic?: CurrentTopicState;
	isTopicLoading: boolean;
	addTopic: (data: z.infer<typeof topicSchema>) => void;
	addProblem: (data: z.infer<typeof questionSchema>, currentTopicId: string) => void;
	deleteProblem: (topic_id: string, problem_id: string) => void;
	deleteTopic: (topic_id: string) => void;
	updateHeatmapActivity: (date: string) => void;
	fetchTopicById: (topic_id: string, options?: { force?: boolean }) => Promise<CurrentTopicState | null | undefined>;
	fetchTopicsByUsername: (username: string) => void;
	fetchHeatmapActivity: (username: string) => void;
	addCollaborator: (add_whom_username: string, add_whom_name: string, topicid: string) => void;
	fetchAllTopicPosts: () => void;
	editProblem: (topic_id: string, problem_id: string, question: z.infer<typeof questionSchema>) => void;
}

const initialState: InsertTopicProviderProps = {
	all_topics: [],
	user_Topics: [],
	user_heatmapValues: [],
	isAllSheetsLoading: false,
	isTopicsLoading: false,
	isHeatmapLoading: false,
	curr_topic: undefined,
	isTopicLoading: false,
	addTopic: () => { },
	addProblem: () => { },
	deleteProblem: () => { },
	deleteTopic: () => { },
	updateHeatmapActivity: () => { },
	fetchTopicById: async () => null,
	fetchTopicsByUsername: () => { },
	fetchHeatmapActivity: () => { },
	addCollaborator: () => { },
	fetchAllTopicPosts: () => { },
	editProblem: () => { },
};

const InsertTopicContext = createContext<InsertTopicProviderProps | null>(null);

export const InsertTopicProvider = ({ children }: { children: React.ReactNode }) => {
	const { data: session } = useSession();
	const sessionUsername = session?.user?.username as string | undefined;
	const router = useRouter();
	const [state, dispatch] = useReducer(InsertTopicReducer, initialState);
	const inflightTopicRequestsRef = useRef(new Map<string, Promise<CurrentTopicState | null>>());
	const inflightTopicsByUsernameRef = useRef(new Map<string, Promise<void>>());
	const inflightHeatmapByUsernameRef = useRef(new Map<string, Promise<void>>());
	const lastFetchedTopicsUsernameRef = useRef<string | null>(null);
	const lastFetchedHeatmapUsernameRef = useRef<string | null>(null);
	const currTopicRef = useRef(state.curr_topic);
	const isTopicLoadingRef = useRef(state.isTopicLoading);
	const failedTopicIdsRef = useRef(new Set<string>());

	useEffect(() => {
		currTopicRef.current = state.curr_topic;
		isTopicLoadingRef.current = state.isTopicLoading;
	}, [state.curr_topic, state.isTopicLoading]);

	const formatDate = useCallback((date: Date): string => {
		const year = date.getFullYear();
		const month = String(date.getMonth() + 1).padStart(2, "0");
		const day = String(date.getDate()).padStart(2, "0");
		return `${year}-${month}-${day}`;
	}, []);

	const updateHeatmapActivity = useCallback(async (date: string) => {
		try {
			if (!sessionUsername) return;
			const userValuesRef = databaseRef(db, `users/${sessionUsername}/values`);
			onValue(userValuesRef, async (snapshot) => {
				const data = snapshot.val() || {};
				if (data[date]) data[date].count += 1;
				else data[date] = { date, count: 1 };
				try {
					await set(userValuesRef, data);
					dispatch({ type: "UPDATE_HEATMAP_ACTIVITY", payload: { date } });
				} catch {
					toast({ title: "Error ⭕", description: "Error in setting heatmap data", variant: "destructive" });
				}
			}, { onlyOnce: true });
		} catch {
			toast({ title: "Error ⭕", description: "Error in updating heatmap", variant: "destructive" });
		}
	}, [sessionUsername]);

	const addActivity = useCallback(async () => {
		await updateHeatmapActivity(formatDate(new Date()));
	}, [formatDate, updateHeatmapActivity]);

	const fetchTopicsByUsername = useCallback(async (username: string) => {
		if (!username) return;
		if (!sessionUsername) {
			dispatch({ type: "SET_USER_TOPICS", payload: [] });
			lastFetchedTopicsUsernameRef.current = null;
			return;
		}

		if (lastFetchedTopicsUsernameRef.current === username) {
			return;
		}

		const inflightRequest = inflightTopicsByUsernameRef.current.get(username);
		if (inflightRequest) {
			return inflightRequest;
		}

		try {
			dispatch({ type: "SET_TOPICS_LOADING", payload: true });
			const request = axios.get(`/api/users/${username}/topics`)
				.then((response) => {
					dispatch({ type: "SET_USER_TOPICS", payload: response.data.success ? response.data.topics ?? [] : [] });
					lastFetchedTopicsUsernameRef.current = username;
				})
				.catch(() => {
					toast({ title: "Error ⭕", description: "Error fetching user topics", variant: "destructive" });
					dispatch({ type: "SET_USER_TOPICS", payload: [] });
					lastFetchedTopicsUsernameRef.current = null;
				})
				.finally(() => {
					inflightTopicsByUsernameRef.current.delete(username);
					dispatch({ type: "SET_TOPICS_LOADING", payload: false });
				});

			inflightTopicsByUsernameRef.current.set(username, request);
			return await request;
		} catch {
			inflightTopicsByUsernameRef.current.delete(username);
			dispatch({ type: "SET_TOPICS_LOADING", payload: false });
			lastFetchedTopicsUsernameRef.current = null;
		}
	}, [sessionUsername]);

	const addTopic = useCallback(async (data: z.infer<typeof topicSchema>) => {
		if (!sessionUsername) return;
		try {
			const response = await axios.post("/api/topics", data);
			if (!response.data.success) {
				toast({ title: "Error ⭕", description: response.data.message || "Something went wrong", variant: "destructive" });
				return;
			}
			dispatch({ type: "ADD_TOPIC", payload: response.data.topic });
			await addActivity();
			toast({ title: "New Topic Added ✅", description: "Add problems now", variant: "default" });
		} catch (error: any) {
			toast({ title: "Error ⭕", description: error?.response?.data?.message || "Error in adding topic", variant: "destructive" });
		}
	}, [addActivity, sessionUsername]);

	const deleteTopic = useCallback(async (topic_id: string) => {
		if (!sessionUsername) return;
		try {
			const response = await axios.delete(`/api/topics/${topic_id}`);
			if (!response.data.success) {
				toast({ title: "Error ⭕", description: response.data.message || "Error in deleting topic", variant: "destructive" });
				return;
			}
			dispatch({ type: "DELETE_TOPIC", payload: topic_id });
			dispatch({ type: "DELETE_ALL_TOPICS", payload: topic_id });
			toast({ title: "Topic Deleted ✅", description: "Topic deleted successfully", variant: "default" });
			await addActivity();
		} catch (error: any) {
			toast({ title: "Error ⭕", description: error?.response?.data?.message || "Something went wrong", variant: "destructive" });
		}
	}, [addActivity, sessionUsername]);

	const fetchTopicById = useCallback(async (topic_id: string, options?: { force?: boolean }) => {
		if (!topic_id) return null;

		if (!options?.force && failedTopicIdsRef.current.has(topic_id)) {
			return null;
		}

		if (!options?.force && currTopicRef.current?.topic?.id === topic_id && !isTopicLoadingRef.current) {
			return currTopicRef.current;
		}

		const inflightRequest = inflightTopicRequestsRef.current.get(topic_id);
		if (inflightRequest) {
			return inflightRequest;
		}

		try {
			dispatch({ type: "SET_LOADING_TOPIC", payload: true });
			const request = axios
				.get(`/api/topics/${topic_id}`)
				.then((response) => {
					if (!response.data.success) {
						failedTopicIdsRef.current.add(topic_id);
						toast({ title: "Error ⭕", description: response.data.message || "Topic not found", variant: "destructive" });
						router.replace("/");
						return null;
					}

					const payload = { topic: response.data.topic, problems: response.data.problems ?? [] };
					failedTopicIdsRef.current.delete(topic_id);
					dispatch({ type: "SET_CURR_TOPIC", payload });
					return payload;
				})
				.catch((error: any) => {
					if (error?.response?.status === 404) {
						failedTopicIdsRef.current.add(topic_id);
					}
					toast({ title: "Error ⭕", description: error?.response?.data?.message || "Error fetching topic", variant: "destructive" });
					if (error?.response?.status === 404) {
						router.replace("/");
					}
					return null;
				})
				.finally(() => {
					inflightTopicRequestsRef.current.delete(topic_id);
					dispatch({ type: "SET_LOADING_TOPIC", payload: false });
				});

			inflightTopicRequestsRef.current.set(topic_id, request);
			return await request;
		} catch (error: any) {
			if (error?.response?.status === 404) {
				failedTopicIdsRef.current.add(topic_id);
				router.replace("/");
			}
			toast({ title: "Error ⭕", description: error?.response?.data?.message || "Error fetching topic", variant: "destructive" });
			dispatch({ type: "SET_LOADING_TOPIC", payload: false });
			return null;
		}
	}, [router]);

	const addProblem = useCallback(async (data: z.infer<typeof questionSchema>, currentTopicId: string) => {
		if (!sessionUsername) return;
		if (data.qname.trim() === "" || data.url.trim() === "") {
			toast({ title: "Unable to Add", description: "Please fill all the fields", variant: "default" });
			return;
		}
		try {
			const response = await axios.post(`/api/topics/${currentTopicId}/problems`, { question: data });
			if (!response.data.success) {
				toast({ title: "Error ⭕", description: response.data.message || "Topic not found", variant: "destructive" });
				return;
			}
			await fetchTopicById(currentTopicId, { force: true });
			await addActivity();
			toast({ title: "Added ✅", description: "Problem is added successfully", variant: "default" });
		} catch (error: any) {
			toast({ title: "Error ⭕", description: error?.response?.data?.message || "Error in adding problem", variant: "destructive" });
		}
	}, [addActivity, fetchTopicById, sessionUsername]);

	const deleteProblem = useCallback(async (topic_id: string, problem_id: string) => {
		if (!sessionUsername) return;
		try {
			const response = await axios.delete(`/api/topics/${topic_id}/problems/${problem_id}`);
			if (!response.data.success) {
				toast({ title: "Error ⭕", description: response.data.message || "Failed to delete problem", variant: "destructive" });
				return;
			}
			dispatch({ type: "DELETE_PROBLEM_FROM_TOPIC", payload: { topic_id, problem_id } });
			await addActivity();
			toast({ title: "Deleted ✅", description: "Problem deleted successfully", variant: "default" });
		} catch (error: any) {
			toast({ title: "Error ⭕", description: error?.response?.data?.message || "Error in deleting problem", variant: "destructive" });
		}
	}, [addActivity, sessionUsername]);

	const fetchHeatmapActivity = useCallback(async (username: string) => {
		try {
			if (!sessionUsername) {
				dispatch({ type: "SET_HEATMAP_VALUES", payload: [] });
				lastFetchedHeatmapUsernameRef.current = null;
				return;
			}
			if (!username) {
				dispatch({ type: "SET_HEATMAP_VALUES", payload: [] });
				lastFetchedHeatmapUsernameRef.current = null;
				return;
			}

			if (lastFetchedHeatmapUsernameRef.current === username) {
				return;
			}

			const inflightRequest = inflightHeatmapByUsernameRef.current.get(username);
			if (inflightRequest) {
				return inflightRequest;
			}

			dispatch({ type: "SET_HEATMAP_LOADING", payload: true });
			const request = get(databaseRef(db, `users/${username}/values`))
				.then((snapshot) => {
					if (snapshot.exists()) {
						dispatch({ type: "SET_HEATMAP_VALUES", payload: Object.values(snapshot.val()) as HeatmapDateValues[] });
					} else {
						dispatch({ type: "SET_HEATMAP_VALUES", payload: [] });
					}
					lastFetchedHeatmapUsernameRef.current = username;
				})
				.catch(() => {
					toast({ title: "Error ⭕", description: "Error in fetching heatmap", variant: "destructive" });
					lastFetchedHeatmapUsernameRef.current = null;
				})
				.finally(() => {
					inflightHeatmapByUsernameRef.current.delete(username);
					dispatch({ type: "SET_HEATMAP_LOADING", payload: false });
				});

			inflightHeatmapByUsernameRef.current.set(username, request);
			return await request;
		} catch {
			toast({ title: "Error ⭕", description: "Error in fetching heatmap", variant: "destructive" });
			lastFetchedHeatmapUsernameRef.current = null;
		} finally {
			if (!inflightHeatmapByUsernameRef.current.has(username)) {
				dispatch({ type: "SET_HEATMAP_LOADING", payload: false });
			}
		}
	}, [sessionUsername]);

	const addCollaborator = useCallback(async (add_whom_username: string, add_whom_name: string, topicid: string) => {
		if (!sessionUsername) return;
		try {
			const response = await axios.post(`/api/topics/${topicid}/collaborators`, { collaborator: { username: add_whom_username, name: add_whom_name } });
			if (response.data.success) {
				toast({ title: "Done ✅", description: "Collaborator added successfully", variant: "default" });
				await fetchTopicById(topicid, { force: true });
			} else {
				toast({ title: "Error ⭕", description: response.data.message, variant: "destructive" });
			}
		} catch (error: any) {
			toast({ title: "Error ⭕", description: error?.response?.data?.message || "Something went wrong", variant: "destructive" });
		}
	}, [fetchTopicById, sessionUsername]);

	const fetchAllTopicPosts = useCallback(async () => {
		try {
			dispatch({ type: "SET_ALL_SHEETS_LOADING", payload: true });
			const response = await axios.get("/api/topics");
			dispatch({ type: "SET_ALL_TOPICS", payload: response.data.success ? response.data.topics ?? [] : [] });
		} catch {
			toast({ title: "Error ⭕", description: "Topics fetching error", variant: "destructive" });
		} finally {
			dispatch({ type: "SET_ALL_SHEETS_LOADING", payload: false });
		}
	}, []);

	const editProblem = useCallback(async (topic_id: string, problem_id: string, question: z.infer<typeof questionSchema>) => {
		if (!sessionUsername) return;
		try {
			const response = await axios.patch(`/api/topics/${topic_id}/problems/${problem_id}`, question);
			if (!response.data.success) {
				toast({ title: "Error ⭕", description: response.data.message || "Failed to edit problem", variant: "destructive" });
				return;
			}
			await fetchTopicById(topic_id, { force: true });
			toast({ title: "Edited ✅", description: "Problem edited successfully", variant: "default" });
		} catch (error: any) {
			toast({ title: "Error ⭕", description: error?.response?.data?.message || "Error in editing problem", variant: "destructive" });
		}
	}, [fetchTopicById, sessionUsername]);

	const contextValue = useMemo(() => ({
		...state,
		addTopic,
		addProblem,
		deleteProblem,
		deleteTopic,
		updateHeatmapActivity,
		fetchTopicById,
		fetchTopicsByUsername,
		fetchHeatmapActivity,
		addCollaborator,
		fetchAllTopicPosts,
		editProblem,
	}), [
		state,
		addTopic,
		addProblem,
		deleteProblem,
		deleteTopic,
		updateHeatmapActivity,
		fetchTopicById,
		fetchTopicsByUsername,
		fetchHeatmapActivity,
		addCollaborator,
		fetchAllTopicPosts,
		editProblem,
	]);

	return (
		<InsertTopicContext.Provider value={contextValue}>
			{children}
		</InsertTopicContext.Provider>
	);
};

export const useInsertTopics = () => {
	const context = useContext(InsertTopicContext);
	if (!context) throw new Error("useInsertTopics must be used with InsertTopicProvider");
	return context;
};