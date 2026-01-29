'use client'
import { toast } from "@/components/ui/use-toast";
import { questionSchema, topicSchema } from "@/schemas/topicSchema";
import { ApiResponse } from "@/types/ApiResponse";
import { HeatmapDateValues, Topic } from "@/types/types";
import axios from "axios";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import React, { createContext, useContext, useEffect, useReducer } from "react";
import { z } from "zod";
import { ref as databaseRef, get, onValue, set } from 'firebase/database'
import db from "@/firebaseConfig";
import InsertTopicReducer from "../reducer/InsertTopicReducer";


interface InsertTopicProviderProps {
    // information states
    all_topics: Topic[]
    user_Topics: Topic[]
    user_heatmapValues: HeatmapDateValues[]

    // loading states
    isAllSheetsLoading: boolean
    isTopicsLoading: boolean
    isHeatmapLoading: boolean

    curr_topic: any
    isTopicLoading: boolean

    // states
    addTopic: (data: z.infer<typeof topicSchema>) => void
    addProblem: (data: z.infer<typeof questionSchema>, currentTopicId: string) => void
    deleteProblem: (topic_id: string, problem_id: string) => void
    deleteTopic: (topic_id: string) => void
    updateHeatmapActivity: (date: string) => void
    fetchTopicById: (topic_id: string) => void
    addCollaborator: (add_whom_username: string, add_whom_name: string) => void
    fetchAllTopicPosts: () => void
    editProblem: (topic_id: string, problem_id: string, question: z.infer<typeof questionSchema>) => void
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

    fetchTopicById: () => { },
    addCollaborator: () => { },
    fetchAllTopicPosts: () => { },
    editProblem: () => { },
}

const InsertTopicContext = createContext<InsertTopicProviderProps | null>(null)


export const InsertTopicProvider = ({ children }: { children: React.ReactNode }) => {
    const { data: session, status } = useSession()
    const session_user_username = session?.user?.username as string

    const params = useParams()
    const param_username = params.username as string
    const topic_id = params.topicid as string;
    const router = useRouter()

    const [state, dispatch] = useReducer(InsertTopicReducer, initialState)

    const formatDate = (date: Date): string => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    const addActivity = async () => {
        const today = new Date()
        const formattedDate = formatDate(today)
        updateHeatmapActivity(formattedDate)
    }


    const getTopicsByUsername = async (username: string) => {
        if (!username) return;

        try {
            dispatch({ type: "SET_TOPICS_LOADING", payload: true });

            const response = await axios.get<ApiResponse>(
                `/api/get-topics-by-username?username=${username}`
            );

            if (response.data.success) {
                const arr = response.data.topics;
                dispatch({ type: "SET_USER_TOPICS", payload: arr });
            } else {
                dispatch({ type: "SET_USER_TOPICS", payload: [] });
            }
        } catch (error) {
            toast({
                title: "Error ⭕",
                description: "Error fetching user topics",
                variant: "destructive",
            });
        } finally {
            dispatch({ type: "SET_TOPICS_LOADING", payload: false });
        }
    };

    const addTopic = async (data: z.infer<typeof topicSchema>) => {
        if (!session?.user?.username) return

        try {
            const response = await axios.post("/api/add-topic", { topic: data });

            if (!response.data.success) {
                toast({
                    title: "Error ⭕",
                    description: response.data.message || "Something went wrong",
                    variant: "destructive",
                });
                return;
            }

            const newTopic: Topic = response.data.topic
            dispatch({ type: 'ADD_TOPIC', payload: newTopic })

            // Update heatmap activity for today
            await addActivity();

            toast({
                title: "New Topic Added ✅",
                description: "Add problems now",
                variant: "default",
            });
        } catch (error: any) {
            toast({
                title: "Error ⭕",
                description: error?.message || "Error in adding topic",
                variant: "destructive",
            });
        }
    };

    const deleteTopic = async (topic_id: string) => {
        if (!session_user_username) return;

        try {
            const response = await axios.delete('/api/delete-topic', {
                data: {
                    creator_username: session_user_username,
                    topic_id
                }
            });

            if (!response.data.success) {
                toast({
                    title: 'Error ⭕',
                    description: response.data.message || 'Error in deleting topic',
                    variant: 'destructive'
                });
                return;
            }

            dispatch({ type: "DELETE_TOPIC", payload: topic_id });
            dispatch({ type: "DELETE_ALL_TOPICS", payload: topic_id });

            toast({
                title: 'Topic Deleted ✅',
                description: 'Topic and related problems deleted successfully',
                variant: 'default'
            });

            await addActivity();

        } catch (error: any) {
            toast({
                title: 'Error ⭕',
                description: error?.response?.data?.message || 'Something went wrong',
                variant: 'destructive'
            });
        }
    }

    const addProblem = async (data: z.infer<typeof questionSchema>, currentTopicId: string) => {
        if (!session?.user?.username) return

        if (data.qname.trim() === '' || data.url.trim() === '') {
            toast({
                title: 'Unable to Add',
                description: 'Please fill all the fields',
                variant: 'default'
            });
            return;
        }

        try {
            const response = await axios.post('/api/add-problem', {
                topic_id: currentTopicId,
                question: data
            });

            if (!response.data.success) {
                toast({
                    title: 'Error ⭕',
                    description: response.data.message || 'Topic not found',
                    variant: 'destructive'
                });
                return;
            }

            dispatch({
                type: 'UPDATE_TOPICS_AFTER_PROBLEM_ADD',
                payload: {
                    topic: response.data.topic,
                    problems: response.data.problems
                }
            });

            toast({
                title: 'Added ✅',
                description: 'Problem is added successfully',
                variant: 'default'
            });

            await addActivity();

        } catch (error: any) {
            toast({
                title: 'Error ⭕',
                description: error?.response?.data?.message || 'Error in adding problem',
                variant: 'destructive'
            });
        }
    };

    const deleteProblem = async (topic_id: string, problem_id: string) => {
        if (!session_user_username) return;

        try {
            const response = await axios.delete(`/api/delete-problem`, {
                data: {
                    topic_id,
                    problem_id
                }
            });

            const resData = response.data;

            if (!resData.success) {
                toast({
                    title: 'Error ⭕',
                    description: resData.message || 'Failed to delete problem',
                    variant: 'destructive'
                });
                return;
            }

            dispatch({
                type: 'DELETE_PROBLEM_FROM_TOPIC',
                payload: {
                    topic_id,
                    problem_id
                }
            });

            await addActivity();

            toast({
                title: 'Deleted ✅',
                description: 'Problem deleted successfully',
                variant: 'default'
            });
        } catch (error: any) {
            toast({
                title: 'Error ⭕',
                description: error?.response?.data?.message || 'Error in deleting problem',
                variant: 'destructive'
            });
        }
    };

    const updateHeatmapActivity = async (date: string) => {
        try {
            const userValuesRef = databaseRef(db, `users/${session_user_username}/values`)
            onValue(userValuesRef, async (snapshot) => {
                const data = snapshot.val() || {}
                if (data[date]) data[date].count += 1
                else data[date] = { date, count: 1 }

                try {
                    await set(userValuesRef, data)

                    dispatch({
                        type: 'UPDATE_HEATMAP_ACTIVITY',
                        payload: { date }
                    })
                } catch (error) {
                    toast({
                        title: 'Error ⭕',
                        description: 'Error in setting heatmap data',
                        variant: 'destructive'
                    })
                }
            }, { onlyOnce: true })
        } catch (error) {
            toast({
                title: 'Error ⭕',
                description: 'Error in updating heatmap',
                variant: 'destructive'
            })
        }
    }

    const fetchHeatmapActivity = async (username: string) => {
        try {
            if (!username) {
                dispatch({
                    type: 'SET_HEATMAP_VALUES',
                    payload: []
                })
                return
            }

            dispatch({ type: 'SET_HEATMAP_LOADING', payload: true })

            const userValuesRef = databaseRef(db, `users/${username}/values`)
            const snapshot = await get(userValuesRef)

            if (snapshot.exists()) {
                const raw_data = snapshot.val()
                const data = Object.values(raw_data)
                const arr: HeatmapDateValues[] = data.map((elm) => {
                    return elm as HeatmapDateValues
                })

                dispatch({
                    type: 'SET_HEATMAP_VALUES',
                    payload: arr
                })
            } else {
                dispatch({
                    type: 'SET_HEATMAP_VALUES',
                    payload: []
                })
            }

        } catch (error) {
            toast({
                title: 'Error ⭕',
                description: 'Error in fetching heatmap',
                variant: 'destructive'
            })
        } finally {
            dispatch({ type: 'SET_HEATMAP_LOADING', payload: false })
        }
    }

    const fetchTopicById = async (topic_id: string) => {
        try {
            dispatch({ type: 'SET_LOADING_TOPIC', payload: true })

            const response = await axios.get(`/api/get-topic-by-topicid?topic_id=${topic_id}`)
            if (!response.data.success) {
                toast({
                    title: "Error ⭕",
                    description: response.data.message || "Topic not found",
                    variant: "destructive"
                })
                router.replace('/')
                return
            }

            dispatch({
                type: 'SET_CURR_TOPIC', payload: {
                    topic: response.data.topic,
                    problems: response.data.problems
                }
            })
        } catch (error: any) {
            toast({
                title: "Error ⭕",
                description: error?.message || "Error fetching topic",
                variant: "destructive"
            })
        } finally {
            dispatch({ type: 'SET_LOADING_TOPIC', payload: false })
        }
    }


    const addCollaborator = async (add_whom_username: string, add_whom_name: string, topicid: string) => {
        if (!session_user_username) return

        try {
            const response = await axios.post(`/api/add-collaborator`, {
                add_whom_username,
                add_whom_name
            })

            if (response.data.success) {
                toast({
                    title: "Done ✅",
                    description: "Collaborator added successfully",
                    variant: "default"
                })
            }
            else {
                toast({
                    title: "Error 🔴 ",
                    description: response.data.message,
                    variant: "destructive"
                })
            }
        } catch (error) {
            toast({
                title: "Error 🔴 ",
                description: "Something went wrong",
                variant: "destructive"
            })
        }
    }

    const fetchAllTopicPosts = async () => {
        try {
            dispatch({ type: "SET_ALL_SHEETS_LOADING", payload: true });

            const response = await axios.get(`/api/get-all-topics`);
            if (response.data.success) {
                dispatch({ type: "SET_ALL_TOPICS", payload: response.data.topics });
            } else {
                dispatch({ type: "SET_ALL_TOPICS", payload: [] });
            }
        } catch (error) {
            toast({
                title: "Error ⭕",
                description: "Topics fetching error",
                variant: "destructive",
            });
        } finally {
            dispatch({ type: "SET_ALL_SHEETS_LOADING", payload: false });
        }
    };

    const editProblem = async (topic_id: string, problem_id: string, question: z.infer<typeof questionSchema>) => {
        if (!session_user_username) return

        try {
            const response = await axios.put(`/api/edit-problem`, {
                topic_id,
                problem_id,
                question
            })

            if (!response.data.success) {
                toast({
                    title: "Error ⭕",
                    description: response.data.message || "Failed to edit problem",
                    variant: "destructive"
                })
                return
            }

            dispatch({
                type: 'UPDATE_PROBLEM_IN_TOPIC',
                payload: {
                    topic: response.data.topic,
                    problems: response.data.problems
                }
            })

            toast({
                title: "Edited ✅",
                description: "Problem edited successfully",
                variant: "default"
            })

        } catch (error: any) {
            toast({
                title: "Error ⭕",
                description: error?.response?.data?.message || "Error in editing problem",
                variant: "destructive"
            })
        }
    }


    useEffect(() => {
        if (status === "authenticated") {
            if (param_username) {
                getTopicsByUsername(param_username)
                fetchHeatmapActivity(param_username)
            }

            if (!param_username && session && session?.user && session?.user?.username) {
                getTopicsByUsername(session?.user?.username)
                fetchHeatmapActivity(session?.user?.username)
            }
        }

    }, [status, param_username])

    useEffect(() => {
        if (status === "authenticated") {

            if (topic_id) {
                fetchTopicById(topic_id)
            }
        }
    }, [status, topic_id])

    const contextValue = {
        ...state,
        addTopic,
        addProblem,
        deleteProblem,
        deleteTopic,
        updateHeatmapActivity,
        fetchTopicById,
        addCollaborator,
        fetchAllTopicPosts,
        editProblem
    }

    return (
        <InsertTopicContext.Provider value={contextValue}>
            {children}
        </InsertTopicContext.Provider>
    );
}


export const useInsertTopics = () => {
    const context = useContext(InsertTopicContext)
    if (!context) {
        throw new Error('useUser must be used with a UserProvider')
    }
    return context
}
