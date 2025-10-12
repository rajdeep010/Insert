import { useEffect, useRef, useState } from 'react';
import type { Socket } from 'socket.io-client';
import { getSocket } from '../utils/socket';
import type { WebSocketMessage } from '@/types/types';

export const useWebSocket = (projectId: string | null) => {
    const [connected, setConnected] = useState(false);
    const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
    const socketRef = useRef<Socket | null>(null);
    const currentDestinationRef = useRef<string | null>(null);
    const socket = getSocket();

    useEffect(() => {
        socketRef.current = socket;

        const onConnect = () => {
            // console.log('🟢 Connected to WebSocket server');
            setConnected(true);
        };
        const onDisconnect = () => {
            // console.log('🔴 Disconnected from WebSocket server');
            setConnected(false);
        };
        const onMessage = (payload: any) => {
            // console.log('Raw message payload:', payload);
            const parsed = typeof payload === 'string' ? JSON.parse(payload) : payload;
            // console.log('📩 New message received from server:', parsed);
            setLastMessage(parsed);
        };

        socket.on('connect', onConnect);
        socket.on('disconnect', onDisconnect);
        socket.on('message', onMessage);

        return () => {
            socket.off('connect', onConnect);
            socket.off('disconnect', onDisconnect);
            socket.off('message', onMessage);
        };

    }, []);

    useEffect(() => {
        const socket = socketRef.current;
        if (!socket) return;
        const PREFIX = '/topic/release-updates/';
        const newDest = projectId ? `${PREFIX}${projectId}` : null;
        const prevDest = currentDestinationRef.current;

        if (prevDest && prevDest !== newDest) {
            socket.emit('unsubscribe', prevDest);
            // console.log(`🚪 Unsubscribed from ${prevDest}`);
            currentDestinationRef.current = null;
        }

        if (newDest && newDest !== prevDest) {
            socket.emit('subscribe', newDest);
            // console.log(`🚀 Subscribed to ${newDest}`);
            currentDestinationRef.current = newDest;
        }

        return () => {
            if (socket && currentDestinationRef.current) {
                // console.log(`🚪 Unsubscribing from ${currentDestinationRef.current}`);
                socket.emit('unsubscribe', currentDestinationRef.current);
                currentDestinationRef.current = null;
            }
        };

    }, [projectId]);


    return { connected, lastMessage };
};
