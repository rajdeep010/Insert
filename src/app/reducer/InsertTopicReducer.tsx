

export default function InsertTopicReducer(state: any, action: any) {
    switch (action.type) {
        case "SET_ALL_SHEETS_LOADING":
            return { ...state, isAllSheetsLoading: action.payload };

        case "SET_ALL_TOPICS":
            return { ...state, all_topics: action.payload };

        case "SET_TOPICS_LOADING":
            return { ...state, isTopicsLoading: action.payload };

        case "SET_USER_TOPICS":
            return { ...state, user_Topics: action.payload };

        case 'ADD_TOPIC':
            return {
                ...state,
                user_Topics: [action.payload, ...state.user_Topics],
                all_topics: [action.payload, ...state.all_topics],
            }

        case "DELETE_TOPIC":
            return {
                ...state,
                user_Topics: state.user_Topics?.filter((topic: any) => topic.id !== action.payload)
            };

        case "DELETE_ALL_TOPICS":
            return {
                ...state,
                all_topics: state.all_topics?.filter((topic: any) => topic.id !== action.payload)
            };

        case "UPDATE_TOPICS_AFTER_PROBLEM_ADD": {
            // console.log('after adding problem: ',action.payload,state.user_Topics)
            const updatedUserTopics = state.user_Topics?.map((topic: any) =>
                topic?.id === action.payload?.topic?.id
                    ? {
                        ...topic,
                        problems: action.payload?.problems,
                    }
                    : topic
            );

            // console.log('this is updated user topics: ',updatedUserTopics)

            const res = {
                ...state,
                user_Topics: updatedUserTopics,
                curr_topic:
                    state.curr_topic?.topic?.id === action.payload?.topic?.id
                        ? {
                            ...state.curr_topic,
                            problems: action.payload.problems,
                        }
                        : state.curr_topic,
            };
            // console.log('this is curr topic: ',res.curr_topic)
            return res
        }

        case "DELETE_PROBLEM_FROM_TOPIC": {
            const { topic_id, problem_id } = action.payload;
            // console.log('payload', topic_id, problem_id)

            const updatedUserTopics = state.user_Topics?.map((topic: any) =>
                topic?.id === topic_id
                    ? {
                        ...topic,
                        problems: topic.problems?.filter(
                            (p: any) => {
                                // console.log('this is p:', p)
                                return p._id !== problem_id
                            }
                        ),
                    }
                    : topic
            );

            const updatedCurrTopic =
                state.curr_topic?.topic?.id === topic_id
                    ? {
                        ...state.curr_topic,
                        problems: state.curr_topic.problems?.filter(
                            (p: any) => p._id !== problem_id
                        ),
                    }
                    : state.curr_topic;

            return {
                ...state,
                user_Topics: updatedUserTopics,
                curr_topic: updatedCurrTopic,
            };
        }

        case 'UPDATE_HEATMAP_ACTIVITY': {
            const existing = state.user_heatmapValues?.find((v: any) => v.date === action.payload.date)

            let updatedHeatmap;
            if (existing) {
                updatedHeatmap = state.user_heatmapValues?.map((val: any) =>
                    val.date === action.payload.date ? { ...val, count: val.count + 1 } : val
                )
            } else {
                updatedHeatmap = [...state.user_heatmapValues, { date: action.payload.date, count: 1 }]
            }

            return {
                ...state,
                user_heatmapValues: updatedHeatmap
            }
        }

        case 'SET_HEATMAP_VALUES': {
            return {
                ...state,
                user_heatmapValues: action.payload
            }
        }

        case 'SET_HEATMAP_LOADING': {
            return {
                ...state,
                isHeatmapLoading: action.payload
            }
        }

        case 'SET_LOADING_TOPIC': {
            return {
                ...state,
                isTopicLoading: action.payload
            }
        }

        case 'SET_CURR_TOPIC': {
            return {
                ...state,
                curr_topic: action.payload
            }
        }

        case "UPDATE_PROBLEM_IN_TOPIC": {
            const topicId = action.payload?.topic?.id;

            const updatedUserTopics = state.user_Topics?.map((topic: any) =>
                topic?.id === topicId
                    ? { ...topic, problems: action.payload?.problems }
                    : topic
            );

            const updatedCurrTopic =
                state.curr_topic?.topic?.id === topicId
                    ? { ...state.curr_topic, problems: action.payload?.problems }
                    : state.curr_topic;

            return {
                ...state,
                user_Topics: updatedUserTopics,
                curr_topic: updatedCurrTopic,
            };
        }

        default:
            return state;
    }
}