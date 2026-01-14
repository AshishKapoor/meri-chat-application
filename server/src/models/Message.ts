import { Schema, model } from "mongoose";
import { Message, MessageDocument } from "../types";

const messageSchema = new Schema<MessageDocument>(
  {
    content: { type: String, required: true },
    channelId: { type: String, required: true, index: true },
    senderUsername: { type: String, required: true },
    senderVisitorId: { type: String, required: true },
    timestamp: { type: Date, default: Date.now, index: true },
    system: { type: Boolean, default: false },
  },
  { timestamps: false }
);

// TTL: 10 days
messageSchema.index({ timestamp: 1 }, { expireAfterSeconds: 864000 });

export const MessageModel = model<MessageDocument>("Message", messageSchema);
