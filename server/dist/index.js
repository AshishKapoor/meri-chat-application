"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = __importDefault(require("http"));
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const socket_io_1 = require("socket.io");
const db_1 = require("./db");
const config_1 = require("./config");
const socketHandlers_1 = require("./handlers/socketHandlers");
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    origin: config_1.config.corsOrigin,
    credentials: true,
}));
app.use(express_1.default.json());
app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
});
const httpServer = http_1.default.createServer(app);
const io = new socket_io_1.Server(httpServer, {
    cors: {
        origin: config_1.config.corsOrigin,
        methods: ["GET", "POST"],
        credentials: true,
    },
});
(0, socketHandlers_1.registerSocketHandlers)(io);
const start = async () => {
    try {
        await (0, db_1.connectDB)();
        httpServer.listen(config_1.config.port, () => {
            console.log(`Server listening on port ${config_1.config.port}`);
        });
    }
    catch (error) {
        console.error("Failed to start server", error);
        process.exit(1);
    }
};
start();
