import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function getSocket(): Socket {
    if (typeof window === 'undefined') {
        throw new Error('getSocket() can only be called in the browser');
    }

    if (!socket) {
        const URL = process.env.NEXT_PUBLIC_SOCKET_URL ?? '[http://localhost:4000](http://localhost:4000)';
        socket = io(URL, {
            transports: ['websocket'],
            reconnection: true,
            reconnectionAttempts: Infinity,
            reconnectionDelay: 1000,
        });
    }

    return socket;
}
