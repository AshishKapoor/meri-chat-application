"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserModel = void 0;
const mongoose_1 = require("mongoose");
const userSchema = new mongoose_1.Schema({
    visitorId: { type: String, required: true, unique: true, index: true },
    username: { type: String, required: true },
    isAdmin: { type: Boolean, default: false },
    isOnline: { type: Boolean, default: false },
}, { timestamps: { createdAt: true, updatedAt: false } });
exports.UserModel = (0, mongoose_1.model)("User", userSchema);
