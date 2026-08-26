import { io } from 'socket.io-client';
import env from '@config/env';

let socket = null;

/**
 * Returns a singleton Socket.IO client connected to backend
 */
export const getSocket = () => {
  if (!socket) {
    socket = io(env.API_BASE_URL || 'http://localhost:5000', {
      withCredentials: true,
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
      transports: ['websocket', 'polling'],
    });

    socket.on('connect', () => {
      console.log('🔌 Connected to live notifications socket:', socket.id);
    });

    socket.on('connect_error', (err) => {
      console.warn('⚠️ Notification socket connection error:', err.message);
    });
  }
  return socket;
};

export default getSocket;
