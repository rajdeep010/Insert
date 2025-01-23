'use client'
import { toast } from "@/components/ui/use-toast";
import { questionSchema, topicSchema } from "@/schemas/topicSchema";
import { ApiResponse } from "@/types/ApiResponse";
import { HeatmapDateValues, Topic } from "@/types/types";
import axios from "axios";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import React, { createContext, useContext, useEffect, useState } from "react";
import { string, z } from "zod";
import { ref as databaseRef, get, onValue, set } from 'firebase/database'
import db from "@/firebaseConfig";



interface TopicProviderProps {
    // information states
    all_topics: Topic[]
    user_Topics: Topic[]
    user_heatmapValues: HeatmapDateValues[]

    // loading states
    isAllSheetsLoading: boolean
    isTopicsLoading: boolean
    isHeatmapLoading: boolean

    // states
    addTopic: (data: z.infer<typeof topicSchema>, creator_username: string, creator_name: string) => {}
    addProblem: (data: z.infer<typeof questionSchema>, currentTopicId: string, creator_username: string) => {}
    deleteProblem: (topic_id: string, problem_id: string) => {}
    deleteTopic: (topic_id: string) => {}
    updateHeatmapActivity: (date: string) => void
}

const TopicContext = createContext<TopicProviderProps | null>(null)

export const TopicProvider = ({ children }: { children: React.ReactNode }) => {
    const { data: session, status } = useSession()
    const session_user_username = session?.user?.username as string

    const params = useParams()
    const param_username = params.username as string    

    //! information states
    const [user_Topics, setUserTopics] = useState<Topic[]>([])
    const [all_topics, setAllTopics] = useState<Topic[]>([])
    const [user_heatmapValues, setUserHeatmapValues] = useState<HeatmapDateValues[]>([])

    //! loading states
    const [isAllSheetsLoading, setIsAllSheetsLoading] = useState<boolean>(false)
    const [isTopicsLoading, setIsTopicsLoading] = useState<boolean>(false)
    const [isHeatmapLoading, setHeatmapLoading] = useState<boolean>(false)


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

    const fetchAllTopics = async () => {
        try {
            setIsAllSheetsLoading(true)
            const response = await axios.get(`/api/get-all-topics`)
            if (response.data.success) {
                setAllTopics(response.data.topics)
            } else {
                setAllTopics([])
            }
        } catch (error) {
            toast({
                title: 'Error ⭕', 
                description: 'Topics fetching error',
                variant: 'destructive'
            })
        }
        finally{
            setIsAllSheetsLoading(false)
        }
    }

    const fetchTopics = async (username: string) => {
        setIsTopicsLoading(true)
        try {
            if (!username) return

            const response = await axios.get<ApiResponse>(`/api/get-topics-by-username?username=${username}`)

            if(response.data.success)
            {
                const arr = response.data.topics as Topic[]
                setUserTopics(arr)
            }

        } catch (error) {
        }finally{
            setIsTopicsLoading(false)
        }
    }

    const addTopic = async (data: z.infer<typeof topicSchema>, creator_username: string, creator_name: string) => {
        try {
            const response = await axios.post('/api/add-topic', {
                creator_username, 
                creator_name,
                topic: data
            })

            // // console.log(session_user_username, session, creator_username, creator_name)

            if(!response.data.success){
                toast({
                    title: 'Error ⭕',
                    description: 'Something went wrong',
                    variant: 'destructive'
                })
                return
            }

            await fetchTopics(creator_username)
            await fetchAllTopics()
            await addActivity()

            toast({
                title: 'New Topic Added ✅',
                description: 'Add problems now',
                variant: 'default'
            })
        } catch (error) {
            toast({
                title: 'Error ⭕',
                description: 'Error in adding topic',
                variant: 'destructive'
            })
        }
    }

    const deleteTopic = async (topic_id: string) => {
        try {
            if (!session_user_username) return

            const response = await axios.delete(`/api/delete-topic`, {
                data: {
                    creator_username: session_user_username,
                    topic_id
                }
            })
            

            if(!response){
                toast({
                    title: 'Error ⭕',
                    description: 'Error in deleting topic',
                    variant: 'destructive'
                })
                return
            }

            toast({
                title: 'Topic Deleted ✅',
                description: 'Topic is deleted sucessfully',
                variant: 'default'
            })

            fetchTopics(session_user_username)
            fetchAllTopics()
            addActivity()

        } catch (error) {
            toast({
                title: 'Error ⭕',
                description: 'Error in deleting topic',
                variant: 'destructive'
            })
        }
    }

    const addProblem = async (data: z.infer<typeof questionSchema>, currentTopicId: string, creator_username: string) => {
        try {
            if (!creator_username) return

            if (data.qname === '' || data.url == '') {
                toast({
                    title: 'Unable to add',
                    description: 'Please fill all the fields',
                    variant: 'default'
                })
                return
            }

            const response = await axios.post('/api/add-problem', {
                creator_username: session_user_username, 
                topic_id: currentTopicId,
                question: data
            })

            if(!response.data.success){
                toast({
                    title: 'Error ⭕',
                    description: 'Topic not found',
                    variant: 'destructive'
                })
                return
            }

            fetchTopics(creator_username)
            fetchAllTopics()
            addActivity()

            toast({
                title: 'Added ✅',
                description: 'Problem is added sucessfully',
                variant: 'default'
            })
        } catch (error) {
            toast({
                title: 'Error ⭕',
                description: 'Error in adding problem',
                variant: 'destructive'
            })
        }
    }

    const deleteProblem = async (topic_id: string, problem_id: string) => {
        try {
            if (!session_user_username) return

            const response = await axios.delete(`/api/delete-problem`, {
                data: {
                    creator_username: session_user_username,
                    topic_id,
                    problem_id,
                }
            })

            if(!response){
                toast({
                    title: 'Error ⭕',
                    description: 'Topic not found',
                    variant: 'destructive'
                })
                return
            }
            
            fetchTopics(session_user_username)
            fetchAllTopics()
            addActivity()

            toast({
                title: 'Deleted ✅',
                description: 'Problem deleted successfully',
                variant: 'default'
            })
        } catch (error) {
            toast({
                title: 'Error ⭕',
                description: 'Error in deleting problem',
                variant: 'destructive'
            })
        }
    }

    const updateHeatmapActivity = async (date: string) => {
        try {
            const userValuesRef = databaseRef(db, `users/${session_user_username}/values`)
            onValue(userValuesRef, async (snapshot) => {
                const data = snapshot.val() || {}
                if (data[date]) data[date].count += 1
                else data[date] = { date, count: 1 }

                try {
                    await set(userValuesRef, data)
                    fetchHeatmapActivity(session_user_username)
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
                setUserHeatmapValues([])
                return 
            }

            setHeatmapLoading(true)
            const userValuesRef = databaseRef(db, `users/${username}/values`)
            const snapshot = await get(userValuesRef)

            if (snapshot.exists()) {
                const raw_data = snapshot.val()
                const data = Object.values(raw_data)
                const arr: HeatmapDateValues[] = data.map((elm) => {
                    return elm as HeatmapDateValues
                })

                setUserHeatmapValues(arr)
            }
            else {
                setUserHeatmapValues([])
            }

        } catch (error) {
            toast({
                title: 'Error',
                description: 'Error in fetching heatmap',
                variant: 'default'
            })
        } finally {
            setHeatmapLoading(false)
        }
    }


    useEffect(() => {
        fetchTopics(param_username)
        fetchAllTopics()
        fetchHeatmapActivity(param_username)
    }, [param_username])

    return (
        <TopicContext.Provider value={{ isHeatmapLoading, updateHeatmapActivity, user_heatmapValues, isAllSheetsLoading, isTopicsLoading, all_topics, addProblem, deleteProblem, user_Topics, addTopic, deleteTopic }}>
            {children}
        </TopicContext.Provider>
    )
}

export const useTopics = () => {
    const context = useContext(TopicContext)
    if (!context) {
        throw new Error('useUser must be used with a UserProvider')
    }
    return context
}


