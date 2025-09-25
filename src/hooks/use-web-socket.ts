import { useEffect, useRef, useState } from 'react';
import SockJS from 'sockjs-client';
import { Stomp, CompatClient } from '@stomp/stompjs';
import { WebSocketMessage } from '@/types/types';



export const useWebSocket = (projectId: string | null) => {
    const [connected, setConnected] = useState(false);
    const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
    const stompClient = useRef<CompatClient | null>(null);

    useEffect(() => {
        if (!projectId) return;

        // Connect to WebSocket
        const socket = new SockJS('http://localhost:8080/ws');
        const client = Stomp.over(socket);

        // Disable console debug messages
        client.debug = () => { };

        client?.connect({},
            (frame: any) => {
                // console.log('Connected to WebSocket:', frame);
                setConnected(true);

                // Subscribe to project-specific updates
                client?.subscribe(`/topic/release-updates/${projectId}`, (message) => {
                    const update: WebSocketMessage = JSON.parse(message.body);
                    setLastMessage(update);
                    // console.log('Received update:', update);
                });
            },
            (error: Error) => {
                console.error('WebSocket connection failed:', error);
                setConnected(false);
            }
        );

        stompClient.current = client;

        // Cleanup on unmount
        return () => {
            if (stompClient.current?.connected) {
                stompClient.current.disconnect();
            }
            setConnected(false);
        };
    }, [projectId]);

    return { connected, lastMessage };
};