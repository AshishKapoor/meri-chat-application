import mongoose from "mongoose";
import { config } from "./config";

export const connectDB = async (): Promise<void> => {
  await mongoose.connect(config.mongoUri, {
    serverSelectionTimeoutMS: 10000,
  });
};

export const disconnectDB = async (): Promise<void> => {
  await mongoose.disconnect();
};
