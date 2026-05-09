import { io, Socket } from 'socket.io-client';
import { externalServices } from '@/lib/config/services';

let socket: Socket | null = null;

export const getSocket = () => {
    if (!socket) {
        socket = io(externalServices.project.websocketUrl, {
            withCredentials: true,
            transports: ['websocket'],
        });
    }
    return socket;
};