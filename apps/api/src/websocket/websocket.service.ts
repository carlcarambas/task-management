import { Server } from 'socket.io';
import http from 'http';
import jwt from 'jsonwebtoken';

export class WebSocketService {
  private io: Server;
  private connectedUsers = new Map<string, any>();

  constructor(server: http.Server) {
    this.io = new Server(server, {
      cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:4200',
        methods: ['GET', 'POST'],
        credentials: true,
      },
    });

    // disabling this for testing and dev purposes
    this.setupMiddleware(); // enabling this will require a token to be sent with each request
    this.setupConnectionHandlers();
  }

  private setupMiddleware() {
    this.io.use((socket, next) => {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Unauthorized'));
      }

      jwt.verify(
        token,
        process.env.JWT_SECRET || '',
        (err: any, decoded: any) => {
          if (err) return next(new Error('Invalid token'));
          socket.data.user = decoded;
          next();
        }
      );
    });
  }

  private setupConnectionHandlers() {
    this.io.on('connection', (socket) => {
      const userId = socket.data.user?._id;
      console.log(`User connected: ${userId}`);

      if (userId) {
        this.connectedUsers.set(userId, socket);
      }

      socket.on('disconnect', () => {
        if (userId) {
          this.connectedUsers.delete(userId);
        }
        console.log(`User disconnected: ${userId}`);
      });
    });
  }

  public sendToUser(userId: string, event: string, data: any) {
    const socket = this.connectedUsers.get(userId);
    if (socket) {
      socket.emit(event, data);
    }
  }

  public broadcast(event: string, data: any) {
    this.io.emit(event, data);
  }

  public getIoInstance() {
    return this.io;
  }
}
