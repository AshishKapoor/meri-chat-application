export interface User {
  visitorId: string;
  username: string;
  isAdmin: boolean;
  isOnline: boolean;
  createdAt: string | Date;
}

export interface Channel {
  _id: string;
  name: string;
  createdBy: string;
  createdAt: string | Date;
  memberCount?: number;
}

export interface Message {
  _id: string;
  content: string;
  channelId: string;
  senderUsername: string;
  senderVisitorId: string;
  timestamp: string | Date;
  system?: boolean;
}
