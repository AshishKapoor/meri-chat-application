"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerSocketHandlers = void 0;
const crypto_1 = require("crypto");
const Channel_1 = require("../models/Channel");
const Message_1 = require("../models/Message");
const User_1 = require("../models/User");
const config_1 = require("../config");
const nameGenerator_1 = require("../utils/nameGenerator");
const TEN_DAYS_MS = 10 * 24 * 60 * 60 * 1000;
const channelMembers = new Map();
const computeMemberCount = (channelId) => {
    const set = channelMembers.get(channelId);
    return set ? set.size : 0;
};
const broadcastChannels = async (io) => {
    const channels = await Channel_1.ChannelModel.find().sort({ createdAt: -1 }).lean();
    const enriched = channels.map((c) => ({
        _id: c._id.toString(),
        name: c.name,
        createdBy: c.createdBy,
        createdAt: c.createdAt,
        memberCount: computeMemberCount(c._id.toString()),
    }));
    io.emit("channels", enriched);
};
const emitSystemMessage = (io, channelId, content) => {
    const message = {
        _id: (0, crypto_1.randomUUID)(),
        channelId,
        content,
        senderUsername: "System",
        senderVisitorId: "system",
        timestamp: new Date(),
        system: true,
    };
    io.to(channelId).emit("system", message);
};
const registerSocketHandlers = (io) => {
    io.on("connection", (socket) => {
        socket.on("register", async (payload, callback) => {
            const { username, visitorId } = payload;
            try {
                let user = await User_1.UserModel.findOne({ visitorId });
                if (!user) {
                    user = new User_1.UserModel({
                        visitorId,
                        username,
                        isAdmin: false,
                        isOnline: true,
                    });
                }
                else {
                    user.username = username;
                    user.isOnline = true;
                }
                await user.save();
                socket.data.visitorId = visitorId;
                socket.data.username = user.username;
                socket.data.isAdmin = user.isAdmin;
                callback({
                    user: {
                        visitorId,
                        username: user.username,
                        isAdmin: user.isAdmin,
                        isOnline: true,
                        createdAt: user.createdAt,
                    },
                });
                await broadcastChannels(io);
            }
            catch (error) {
                callback({ error: "Failed to register" });
            }
        });
        socket.on("adminLogin", async (payload, callback) => {
            const { email, password, visitorId } = payload;
            if (email !== config_1.config.adminEmail ||
                password !== config_1.config.adminPassword) {
                callback({ error: "Invalid admin credentials" });
                return;
            }
            try {
                const user = await User_1.UserModel.findOneAndUpdate({ visitorId }, { $set: { isAdmin: true, isOnline: true, username: "Admin" } }, { new: true, upsert: true, setDefaultsOnInsert: true });
                socket.data.visitorId = visitorId;
                socket.data.username = user.username;
                socket.data.isAdmin = true;
                callback({
                    user: {
                        visitorId,
                        username: user.username,
                        isAdmin: true,
                        isOnline: true,
                        createdAt: user.createdAt,
                    },
                });
            }
            catch (error) {
                callback({ error: "Failed to set admin" });
            }
        });
        socket.on("getChannels", async (callback) => {
            await broadcastChannels(io);
            const channels = await Channel_1.ChannelModel.find()
                .sort({ createdAt: -1 })
                .lean();
            callback(channels.map((c) => ({
                _id: c._id.toString(),
                name: c.name,
                createdBy: c.createdBy,
                createdAt: c.createdAt,
                memberCount: computeMemberCount(c._id.toString()),
            })));
        });
        socket.on("suggestChannelName", (callback) => {
            callback((0, nameGenerator_1.suggestChannelName)());
        });
        socket.on("createChannel", async (payload, callback) => {
            const { name, visitorId } = payload;
            try {
                const channel = await Channel_1.ChannelModel.create({
                    name,
                    createdBy: visitorId,
                });
                await broadcastChannels(io);
                callback({
                    channel: {
                        _id: channel._id.toString(),
                        name: channel.name,
                        createdBy: channel.createdBy,
                        createdAt: channel.createdAt,
                        memberCount: computeMemberCount(channel._id.toString()),
                    },
                });
            }
            catch (error) {
                callback({ error: "Failed to create channel" });
            }
        });
        socket.on("joinChannel", async (payload, callback) => {
            const { channelId, visitorId } = payload;
            try {
                const channel = await Channel_1.ChannelModel.findById(channelId);
                if (!channel) {
                    callback({ error: "Channel not found" });
                    return;
                }
                socket.join(channelId);
                socket.data.currentChannelId = channelId;
                const members = channelMembers.get(channelId) || new Set();
                members.add(socket.id);
                channelMembers.set(channelId, members);
                await broadcastChannels(io);
                const since = new Date(Date.now() - TEN_DAYS_MS);
                const messages = await Message_1.MessageModel.find({
                    channelId,
                    timestamp: { $gte: since },
                })
                    .sort({ timestamp: 1 })
                    .lean();
                callback({
                    messages: messages.map((m) => ({
                        _id: m._id.toString(),
                        content: m.content,
                        channelId: m.channelId,
                        senderUsername: m.senderUsername,
                        senderVisitorId: m.senderVisitorId,
                        timestamp: m.timestamp,
                        system: m.system,
                    })),
                });
                if (socket.data.username) {
                    emitSystemMessage(io, channelId, `${socket.data.username} joined`);
                }
            }
            catch (error) {
                callback({ error: "Failed to join channel" });
            }
        });
        socket.on("leaveChannel", async (payload) => {
            const { channelId } = payload;
            socket.leave(channelId);
            const members = channelMembers.get(channelId);
            if (members) {
                members.delete(socket.id);
                if (members.size === 0) {
                    channelMembers.delete(channelId);
                }
            }
            await broadcastChannels(io);
            if (socket.data.username) {
                emitSystemMessage(io, channelId, `${socket.data.username} left`);
            }
        });
        socket.on("sendMessage", async (payload) => {
            const { channelId, content, senderVisitorId } = payload;
            if (!content.trim())
                return;
            try {
                const user = await User_1.UserModel.findOne({
                    visitorId: senderVisitorId,
                });
                const senderUsername = user?.username || "Guest";
                const message = await Message_1.MessageModel.create({
                    channelId,
                    content,
                    senderVisitorId,
                    senderUsername,
                    timestamp: new Date(),
                });
                io.to(channelId).emit("message", {
                    _id: message._id.toString(),
                    content: message.content,
                    channelId: message.channelId,
                    senderUsername: message.senderUsername,
                    senderVisitorId: message.senderVisitorId,
                    timestamp: message.timestamp,
                });
            }
            catch (error) {
                socket.emit("error", "Failed to send message");
            }
        });
        socket.on("deleteChannel", async (payload, callback) => {
            const { channelId, visitorId } = payload;
            try {
                const channel = await Channel_1.ChannelModel.findById(channelId);
                if (!channel) {
                    callback({ error: "Channel not found" });
                    return;
                }
                const requester = await User_1.UserModel.findOne({ visitorId });
                if (!requester) {
                    callback({ error: "User not found" });
                    return;
                }
                const canDelete = requester.isAdmin || channel.createdBy === visitorId;
                if (!canDelete) {
                    callback({ error: "Not allowed" });
                    return;
                }
                await Message_1.MessageModel.deleteMany({ channelId });
                await Channel_1.ChannelModel.findByIdAndDelete(channelId);
                channelMembers.delete(channelId);
                io.to(channelId).emit("channelDeleted", channelId);
                await broadcastChannels(io);
                callback({ success: true });
            }
            catch (error) {
                callback({ error: "Failed to delete channel" });
            }
        });
        socket.on("disconnect", async () => {
            const { visitorId, currentChannelId, username } = socket.data;
            if (visitorId) {
                await User_1.UserModel.findOneAndUpdate({ visitorId }, { $set: { isOnline: false } });
            }
            if (currentChannelId && username) {
                emitSystemMessage(io, currentChannelId, `${username} disconnected`);
            }
            if (currentChannelId) {
                const members = channelMembers.get(currentChannelId);
                if (members) {
                    members.delete(socket.id);
                    if (members.size === 0)
                        channelMembers.delete(currentChannelId);
                }
                await broadcastChannels(io);
            }
        });
    });
};
exports.registerSocketHandlers = registerSocketHandlers;
