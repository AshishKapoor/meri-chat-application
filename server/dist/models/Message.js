"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageModel = void 0;
const mongoose_1 = require("mongoose");
const messageSchema = new mongoose_1.Schema({
    content: { type: String, required: true },
    channelId: { type: String, required: true, index: true },
    senderUsername: { type: String, required: true },
    senderVisitorId: { type: String, required: true },
    timestamp: { type: Date, default: Date.now, index: true },
    system: { type: Boolean, default: false },
}, { timestamps: false });
// TTL: 10 days
messageSchema.index({ timestamp: 1 }, { expireAfterSeconds: 864000 });
exports.MessageModel = (0, mongoose_1.model)("Message", messageSchema);
