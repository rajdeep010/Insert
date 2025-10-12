import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

const NEXT_PROJECT_SERVICE_WEBSOCKET_URL = 'https://insert-projects-service.onrender.com';

export const getSocket = () => {
    if (!socket) {
        socket = io(NEXT_PROJECT_SERVICE_WEBSOCKET_URL, {
            withCredentials: true,
            transports: ['websocket'],
        });
    }
    return socket;
};