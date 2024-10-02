import { io, Socket } from 'socket.io-client';
export let socket: Socket;


class SocketService {
  setupSocketConnection() {
    socket = io(import.meta.env.VITE_BASE_ENDPOINT, {
      transports: ['websocket'],
      secure: true,
    });
    this.socketConnectionEvents();
  }

  socketConnectionEvents() {
    socket.on('connect', () => {
      console.log('Connected to the server');
    });
    socket.on('disconnect', (reason: Socket.DisconnectReason) => {
      console.log('Disconnected from the server', reason);
      console.log('Reconnecting to the server');
      socket.connect();
    });
    socket.on('connect_error', (error: Error) => {
      console.log('Connection error', error);
      console.log('Reconnecting to the server');
      socket.connect();
    });
  }
}

export const socketService = new SocketService();
