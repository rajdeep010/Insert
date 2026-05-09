import type { HeatmapDateValues, Topic } from './topic'
import type { UserInfo } from './user'


export interface ApiResponse{
    success: boolean;
    message: string;
    verifyCode?: string;
    userdata?: UserInfo;
    topics?: Topic[],
    heatmap?: HeatmapDateValues[]
    curr_topic?: Topic;
    users?: UserInfo[];
    similar_users?: UserInfo[]
}