import { useEffect, useRef, useState } from 'react';
import type { Socket } from 'socket.io-client';
import { getSocket } from '../utils/socket';
import type { WebSocketMessage } from '@/types/socket';

export const useWebSocket = (projectId: string | null) => {
    const [connected, setConnected] = useState(false);
    const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
    const socketRef = useRef<Socket | null>(null);
    const currentDestinationRef = useRef<string | null>(null);
    const socket = getSocket();

    useEffect(() => {
        socketRef.current = socket;

        const onConnect = () => {
            setConnected(true);
        };
        const onDisconnect = () => {
            setConnected(false);
        };
        const onMessage = (payload: any) => {
            const parsed = typeof payload === 'string' ? JSON.parse(payload) : payload;
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
            currentDestinationRef.current = null;
        }

        if (newDest && newDest !== prevDest) {
            socket.emit('subscribe', newDest);
            currentDestinationRef.current = newDest;
        }

        return () => {
            if (socket && currentDestinationRef.current) {
                socket.emit('unsubscribe', currentDestinationRef.current);
                currentDestinationRef.current = null;
            }
        };

    }, [projectId]);


    return { connected, lastMessage };
};
