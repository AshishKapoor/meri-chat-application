"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.config = {
    port: Number(process.env.PORT) || 4000,
    mongoUri: process.env.MONGODB_URI || "mongodb://localhost:27017/chatapp",
    adminEmail: process.env.ADMIN_EMAIL || "admin@admin.com",
    adminPassword: process.env.ADMIN_PASSWORD || "admin",
    corsOrigin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
};
