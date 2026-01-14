import { Schema, model } from "mongoose";
import { Channel, ChannelDocument } from "../types";

const channelSchema = new Schema<ChannelDocument>(
  {
    name: { type: String, required: true },
    createdBy: { type: String, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const ChannelModel = model<ChannelDocument>("Channel", channelSchema);
