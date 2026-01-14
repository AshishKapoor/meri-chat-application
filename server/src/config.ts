import dotenv from "dotenv";

dotenv.config();

// Allow multiple origins for development (Vite may use different ports)
const defaultOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",
];

export const config = {
  port: Number(process.env.PORT) || 4000,
  mongoUri: process.env.MONGODB_URI || "mongodb://localhost:27017/chatapp",
  adminEmail: process.env.ADMIN_EMAIL || "admin@admin.com",
  adminPassword: process.env.ADMIN_PASSWORD || "admin",
  corsOrigin: process.env.CLIENT_ORIGIN
    ? process.env.CLIENT_ORIGIN.split(",")
    : defaultOrigins,
};
