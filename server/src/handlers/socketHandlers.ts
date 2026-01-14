import { randomUUID } from "crypto";
import { Server, Socket } from "socket.io";
import { ChannelModel } from "../models/Channel";
import { MessageModel } from "../models/Message";
import { UserModel } from "../models/User";
import { config } from "../config";
import {
  Channel,
  ClientToServerEvents,
  InterServerEvents,
  Message,
  ServerToClientEvents,
  SocketData,
} from "../types";
import { suggestChannelName } from "../utils/nameGenerator";

const TEN_DAYS_MS = 10 * 24 * 60 * 60 * 1000;

const channelMembers = new Map<string, Set<string>>();

const computeMemberCount = (channelId: string): number => {
  const set = channelMembers.get(channelId);
  return set ? set.size : 0;
};

const broadcastChannels = async (
  io: Server<
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    SocketData
  >
) => {
  const channels = await ChannelModel.find().sort({ createdAt: -1 }).lean();
  const enriched: Channel[] = channels.map((c: any) => ({
    _id: c._id.toString(),
    name: c.name,
    createdBy: c.createdBy,
    createdAt: c.createdAt,
    memberCount: computeMemberCount(c._id.toString()),
  }));
  io.emit("channels", enriched);
};

const emitSystemMessage = (
  io: Server<
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    SocketData
  >,
  channelId: string,
  content: string
) => {
  const message: Message = {
    _id: randomUUID(),
    channelId,
    content,
    senderUsername: "System",
    senderVisitorId: "system",
    timestamp: new Date(),
    system: true,
  };
  io.to(channelId).emit("system", message);
};

export const registerSocketHandlers = (
  io: Server<
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    SocketData
  >
): void => {
  io.on(
    "connection",
    (
      socket: Socket<
        ClientToServerEvents,
        ServerToClientEvents,
        InterServerEvents,
        SocketData
      >
    ) => {
      socket.on(
        "register",
        async (
          payload: Parameters<ClientToServerEvents["register"]>[0],
          callback: Parameters<ClientToServerEvents["register"]>[1]
        ) => {
          const { username, visitorId } = payload;
          try {
            let user = await UserModel.findOne({ visitorId });
            if (!user) {
              user = new UserModel({
                visitorId,
                username,
                isAdmin: false,
                isOnline: true,
              });
            } else {
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
          } catch (error) {
            callback({ error: "Failed to register" });
          }
        }
      );

      socket.on(
        "adminLogin",
        async (
          payload: Parameters<ClientToServerEvents["adminLogin"]>[0],
          callback: Parameters<ClientToServerEvents["adminLogin"]>[1]
        ) => {
          const { email, password, visitorId } = payload;
          if (
            email !== config.adminEmail ||
            password !== config.adminPassword
          ) {
            callback({ error: "Invalid admin credentials" });
            return;
          }
          try {
            const user = await UserModel.findOneAndUpdate(
              { visitorId },
              { $set: { isAdmin: true, isOnline: true, username: "Admin" } },
              { new: true, upsert: true, setDefaultsOnInsert: true }
            );
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
          } catch (error) {
            callback({ error: "Failed to set admin" });
          }
        }
      );

      socket.on(
        "getChannels",
        async (
          callback: Parameters<ClientToServerEvents["getChannels"]>[0]
        ) => {
          await broadcastChannels(io);
          const channels = await ChannelModel.find()
            .sort({ createdAt: -1 })
            .lean();
          callback(
            channels.map((c: any) => ({
              _id: c._id.toString(),
              name: c.name,
              createdBy: c.createdBy,
              createdAt: c.createdAt,
              memberCount: computeMemberCount(c._id.toString()),
            }))
          );
        }
      );

      socket.on(
        "suggestChannelName",
        (
          callback: Parameters<ClientToServerEvents["suggestChannelName"]>[0]
        ) => {
          callback(suggestChannelName());
        }
      );

      socket.on(
        "createChannel",
        async (
          payload: Parameters<ClientToServerEvents["createChannel"]>[0],
          callback: Parameters<ClientToServerEvents["createChannel"]>[1]
        ) => {
          const { name, visitorId } = payload;
          try {
            const channel = await ChannelModel.create({
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
          } catch (error) {
            callback({ error: "Failed to create channel" });
          }
        }
      );

      socket.on(
        "joinChannel",
        async (
          payload: Parameters<ClientToServerEvents["joinChannel"]>[0],
          callback: Parameters<ClientToServerEvents["joinChannel"]>[1]
        ) => {
          const { channelId, visitorId } = payload;
          try {
            const channel = await ChannelModel.findById(channelId);
            if (!channel) {
              callback({ error: "Channel not found" });
              return;
            }

            socket.join(channelId);
            socket.data.currentChannelId = channelId;
            const members = channelMembers.get(channelId) || new Set<string>();
            members.add(socket.id);
            channelMembers.set(channelId, members);
            await broadcastChannels(io);

            const since = new Date(Date.now() - TEN_DAYS_MS);
            const messages = await MessageModel.find({
              channelId,
              timestamp: { $gte: since },
            })
              .sort({ timestamp: 1 })
              .lean();

            callback({
              messages: messages.map((m: any) => ({
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
              emitSystemMessage(
                io,
                channelId,
                `${socket.data.username} joined`
              );
            }
          } catch (error) {
            callback({ error: "Failed to join channel" });
          }
        }
      );

      socket.on(
        "leaveChannel",
        async (
          payload: Parameters<ClientToServerEvents["leaveChannel"]>[0]
        ) => {
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
        }
      );

      socket.on(
        "sendMessage",
        async (payload: Parameters<ClientToServerEvents["sendMessage"]>[0]) => {
          const { channelId, content, senderVisitorId } = payload;
          if (!content.trim()) return;
          try {
            const user = await UserModel.findOne({
              visitorId: senderVisitorId,
            });
            const senderUsername = user?.username || "Guest";
            const message = await MessageModel.create({
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
          } catch (error) {
            socket.emit("error", "Failed to send message");
          }
        }
      );

      socket.on(
        "deleteChannel",
        async (
          payload: Parameters<ClientToServerEvents["deleteChannel"]>[0],
          callback: Parameters<ClientToServerEvents["deleteChannel"]>[1]
        ) => {
          const { channelId, visitorId } = payload;
          try {
            const channel = await ChannelModel.findById(channelId);
            if (!channel) {
              callback({ error: "Channel not found" });
              return;
            }
            const requester = await UserModel.findOne({ visitorId });
            if (!requester) {
              callback({ error: "User not found" });
              return;
            }
            const canDelete =
              requester.isAdmin || channel.createdBy === visitorId;
            if (!canDelete) {
              callback({ error: "Not allowed" });
              return;
            }

            await MessageModel.deleteMany({ channelId });
            await ChannelModel.findByIdAndDelete(channelId);
            channelMembers.delete(channelId);
            io.to(channelId).emit("channelDeleted", channelId);
            await broadcastChannels(io);
            callback({ success: true });
          } catch (error) {
            callback({ error: "Failed to delete channel" });
          }
        }
      );

      socket.on("disconnect", async () => {
        const { visitorId, currentChannelId, username } = socket.data;
        if (visitorId) {
          await UserModel.findOneAndUpdate(
            { visitorId },
            { $set: { isOnline: false } }
          );
        }
        if (currentChannelId && username) {
          emitSystemMessage(io, currentChannelId, `${username} disconnected`);
        }
        if (currentChannelId) {
          const members = channelMembers.get(currentChannelId);
          if (members) {
            members.delete(socket.id);
            if (members.size === 0) channelMembers.delete(currentChannelId);
          }
          await broadcastChannels(io);
        }
      });
    }
  );
};
