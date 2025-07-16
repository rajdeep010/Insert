

export default function InsertTopicReducer(state: any,action: any) {
    switch (action.type) {
    case "SET_ALL_SHEETS_LOADING":
        return { ...state,isAllSheetsLoading: action.payload };

    case "SET_ALL_TOPICS":
        return { ...state,all_topics: action.payload };

    case "SET_TOPICS_LOADING":
        return { ...state,isTopicsLoading: action.payload };

    case "SET_USER_TOPICS":
        return { ...state,user_Topics: action.payload };

    case 'ADD_TOPIC':
        return {
            ...state,
            user_Topics: [action.payload,...state.user_Topics],
            all_topics: [action.payload,...state.all_topics],
        }

    case "DELETE_TOPIC":
        return {
            ...state,
            user_Topics: state.user_Topics.filter((topic: any) => topic.id !== action.payload)
        };

    case "DELETE_ALL_TOPICS":
        return {
            ...state,
            all_topics: state.all_topics.filter((topic: any) => topic.id !== action.payload)
        };

    case "UPDATE_TOPICS_AFTER_PROBLEM_ADD":
        return {
            ...state,
            user_Topics: state.user_Topics.map((topic: any) =>
                topic.id === action.payload.topic_id
                    ? { ...topic,problems: action.payload.topics.find((t: any) => t.id === topic.id)?.problems || topic.problems }
                    : topic
            )
        };

    case "DELETE_PROBLEM_FROM_TOPIC":
        return {
            ...state,
            user_Topics: state.user_Topics.map((topic: any) =>
                topic.id === action.payload.topic_id
                    ? {
                        ...topic,
                        problems: topic.problems.filter((p: any) => p.id !== action.payload.problem_id)
                    }
                    : topic
            )
        };

    case 'SET_HEATMAP_VALUES': {
        return {
            ...state,
            user_heatmapValues: action.payload
        }
    }

    case 'UPDATE_HEATMAP_ACTIVITY': {
        const existing = state.user_heatmapValues.find((v: any) => v.date === action.payload.date)

        let updatedHeatmap;
        if (existing) {
            updatedHeatmap = state.user_heatmapValues.map((val: any) =>
                val.date === action.payload.date ? { ...val,count: val.count + 1 } : val
            )
        } else {
            updatedHeatmap = [...state.user_heatmapValues,{ date: action.payload.date,count: 1 }]
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


    default:
        return state;
    }
}