"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChannelModel = void 0;
const mongoose_1 = require("mongoose");
const channelSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    createdBy: { type: String, required: true },
}, { timestamps: { createdAt: true, updatedAt: false } });
exports.ChannelModel = (0, mongoose_1.model)("Channel", channelSchema);
