import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '../../store/authSlice';

type SocketContextType = {
  socket: Socket | null;
  notifications: any[];
  addNotification: (notification: any) => void;
};

const SocketContext = createContext<SocketContextType>({
  socket: null,
  notifications: [],
  addNotification: () => null,
});

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const { user } = useAuthStore();

  useEffect(() => {
    if (!user?.token) return;

    // Create socket connection with proper configuration
    const newSocket = io(
      'http://localhost:3333', // websocket server
      {
        // path: '/socket.io',
        transports: ['websocket'],
        auth: {
          token: user?.token,
        },
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      }
    );

    newSocket.on('connect', () => {
      console.log('Socket connected');
      setSocket(newSocket);
    });

    newSocket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    newSocket.on('connect_error', (err) => {
      console.error('Connection error:', err);
    });

    newSocket.on('notification', (notification) => {
      setNotifications((prev) => [...prev, notification]);
    });

    return () => {
      newSocket.disconnect();
    };
  }, [user?.token]);

  const addNotification = (notification: any) => {
    setNotifications((prev) => [...prev, notification]);
  };

  return (
    <SocketContext.Provider value={{ socket, notifications, addNotification }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
