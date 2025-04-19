import http from 'http';
import { WebSocketService } from './websocket.service';

let webSocketService: WebSocketService;

export function initializeWebSocket(server: http.Server) {
  webSocketService = new WebSocketService(server);
  return webSocketService;
}

export function getWebSocketService() {
  if (!webSocketService) {
    throw new Error('WebSocket service not initialized');
  }
  return webSocketService;
}
