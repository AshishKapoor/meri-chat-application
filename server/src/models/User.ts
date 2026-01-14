import { Schema, model } from "mongoose";
import { User, UserDocument } from "../types";

const userSchema = new Schema<UserDocument>(
  {
    visitorId: { type: String, required: true, unique: true, index: true },
    username: { type: String, required: true },
    isAdmin: { type: Boolean, default: false },
    isOnline: { type: Boolean, default: false },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const UserModel = model<UserDocument>("User", userSchema);
