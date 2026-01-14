import { Document } from "mongoose";

export interface User {
  visitorId: string;
  username: string;
  isAdmin: boolean;
  isOnline: boolean;
  createdAt: Date;
}

export interface Channel {
  _id: string;
  name: string;
  createdBy: string;
  createdAt: Date;
  memberCount?: number;
}

export interface Message {
  _id: string;
  content: string;
  channelId: string;
  senderUsername: string;
  senderVisitorId: string;
  timestamp: Date;
  system?: boolean;
}

export type UserDocument = User & Document;
export type ChannelDocument = Channel & Document;
export type MessageDocument = Message & Document;

export interface AdminCredentials {
  email: string;
  password: string;
}

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

export type ServerToClientEvents = {
  channels: (channels: Channel[]) => void;
  message: (message: Message) => void;
  system: (message: Message) => void;
  channelDeleted: (channelId: string) => void;
  error: (error: string) => void;
};

export type InterServerEvents = Record<string, never>;
export interface SocketData {
  visitorId?: string;
  username?: string;
  isAdmin?: boolean;
  currentChannelId?: string;
}
