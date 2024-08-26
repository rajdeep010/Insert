import { HeatmapDateValues, Topic, UserInfo } from './types'


export interface ApiResponse{
    success: boolean;
    message: string;
    verifyCode?: string;
    userdata?: UserInfo;
    topics?: Topic[],
    heatmap?: HeatmapDateValues[]
    curr_topic?: Topic;
    similar_users?: [UserInfo],
    notifications?: []
}