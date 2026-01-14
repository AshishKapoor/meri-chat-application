import React, { createContext, useContext, useMemo } from "react";
import { io, Socket } from "socket.io-client";
import { Message, Channel, User } from "../types";

// Server-to-Client events (what the server sends to client)
export type ServerToClientEvents = {
  channels: (channels: Channel[]) => void;
  message: (message: Message) => void;
  system: (message: Message) => void;
  channelDeleted: (channelId: string) => void;
  error: (error: string) => void;
};

// Client-to-Server events (what the client sends to server)
export type ClientToServerEvents = {
  register: (
    payload: { username: string; visitorId: string },
    callback: (response: { user?: User; error?: string }) => void
  ) => void;
  adminLogin: (
    payload: { email: string; password: string; visitorId: string },
    callback: (response: { user?: User; error?: string }) => void
  ) => void;
  getChannels: (callback: (channels: Channel[]) => void) => void;
  suggestChannelName: (callback: (suggestion: string) => void) => void;
  createChannel: (
    payload: { name: string; visitorId: string },
    callback: (response: { channel?: Channel; error?: string }) => void
  ) => void;
  joinChannel: (
    payload: { channelId: string; visitorId: string },
    callback: (response: { messages?: Message[]; error?: string }) => void
  ) => void;
  leaveChannel: (payload: { channelId: string }) => void;
  sendMessage: (payload: {
    channelId: string;
    content: string;
    senderVisitorId: string;
  }) => void;
  deleteChannel: (
    payload: { channelId: string; visitorId: string },
    callback: (response: { success?: boolean; error?: string }) => void
  ) => void;
};

export type ClientSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

const SocketContext = createContext<ClientSocket | null>(null);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const socket = useMemo(() => {
    const url = import.meta.env.VITE_API_URL || "http://localhost:4000";
    return io(url, {
      autoConnect: true,
      withCredentials: true,
    }) as ClientSocket;
  }, []);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};

export const useSocketContext = (): ClientSocket => {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error("SocketContext not provided");
  return ctx;
};
