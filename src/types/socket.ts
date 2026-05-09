export interface WebSocketMessage {
    projectId: string;
    status: "BUILDING" | "READY" | "ERROR";
    message: string;
    timestamp: string;
    releaseBlog?: any;
}

export interface WebSocketState {
    connected: boolean;
    messages: Record<string, WebSocketMessage>;
    syncing: Record<string, boolean>;
}

export enum WebSocketActionType {
    CONNECT = "WEBSOCKET_CONNECT",
    DISCONNECT = "WEBSOCKET_DISCONNECT",
    MESSAGE_RECEIVED = "WEBSOCKET_MESSAGE_RECEIVED",
    SYNC_START = "WEBSOCKET_SYNC_START",
    SYNC_END = "WEBSOCKET_SYNC_END",
}

export interface WebSocketAction {
    type: WebSocketActionType;
    payload?: any;
}