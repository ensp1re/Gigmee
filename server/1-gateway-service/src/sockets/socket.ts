import { IMessageDocument, winstonLogger } from '@ensp1re/gigme-shared';
import { config } from '@gateway/config';
import { GatewayCache } from '@gateway/redis/gateway.cache';
import { Server, Socket } from 'socket.io';
import { io, Socket as SocketClient } from 'socket.io-client';
import { Logger } from 'winston';

const log: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'gatewaySocket', 'debug');
let chatSocketClient: SocketClient;

export class SocketIOAppHandler {
  private io: Server;
  private gatewayCache: GatewayCache;

  constructor(io: Server) {
    this.io = io;
    this.gatewayCache = new GatewayCache();
    this.chatSocketServiceIOConnection();
  }

  public listen(): void {
    // if chat service restart then connect to it again
    this.chatSocketServiceIOConnection();
    this.io.on('connection', (socket: Socket) => {
      socket.on('getLoggedInUsers', async () => {
        const response = await this.gatewayCache.getLoggedInUsersFromCache('loggedInUsers');
        this.io.emit('online', response);
      });
      socket.on('loggedInUsers', async (username: string) => {
        const response = await this.gatewayCache.saveLoggedInUserToCache('loggedInUsers', username);
        this.io.emit('online', response);
      });
      socket.on('removeLoggedInUser', async (username: string) => {
        const response = await this.gatewayCache.deleteLoggedInUserFromCache('loggedInUsers', username);
        this.io.emit('online', response);
      });
      socket.on('category', async (category: string, username: string) => {
        await this.gatewayCache.saveUserSelectedCategory(`selectedCategories:${username}`, category);
      });
    });
  }

  private chatSocketServiceIOConnection(): void {
    try {
      chatSocketClient = io(`${config.MESSAGE_BASE_URL}`, {
        transports: ['websocket', 'polling'],
        secure: true
      });

      chatSocketClient.on('connect', () => {
        log.info('GatewayService Connected to chat socket service');
      });

      chatSocketClient.on('disconnect', (error: SocketClient.DisconnectReason) => {
        log.log('error', 'GatewayService Disconnected from chat socket service. Maybe ChatService is not launched: ', error);
        chatSocketClient.connect();
      });

      chatSocketClient.on('connect_error', (error: Error) => {
        log.log('error', 'GatewayService Disconnected from chat socket service error. Maybe ChatService is not launched: ', error);
        chatSocketClient.connect();
      });

      // chat service custom events

      chatSocketClient.on('message received', (message: IMessageDocument) => {
        this.io.emit('message received', message);
      });
    } catch (error) {
      log.log('error', 'GatewayService is not be able to connect to ChatService. Try again...', error);
    }
  }
}
