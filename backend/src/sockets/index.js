import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Match from "../models/Match.js";
import Message from "../models/Message.js";
import { JWT_SECRET } from "../config/env.js";

let io = null;

export const getIO = () => io;

export const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: true,
      credentials: true,
    },
    pingTimeout: 60000,
  });

  // Authentication Middleware for Socket.IO
  io.use(async (socket, next) => {
    try {
      let token = socket.handshake.auth?.token || socket.handshake.query?.token;
      const authHeader = socket.handshake.headers?.authorization;
      if (!token && authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.split(" ")[1];
      }

      const explicitUserId =
        socket.handshake.headers?.["x-user-id"] ||
        socket.handshake.auth?.userId ||
        socket.handshake.query?.userId;

      if (token) {
        try {
          const decoded = jwt.verify(token, JWT_SECRET);
          const userId = decoded.userId || decoded.id || decoded._id;
          const user = await User.findById(userId).select("-passwordHash");
          if (user) {
            socket.user = user;
            socket.userId = user._id.toString();
            return next();
          }
        } catch {
          // If token verification fails, check if valid explicitUserId was provided (for testing/simulated role switcher)
        }
      }

      if (explicitUserId) {
        const user = await User.findById(explicitUserId).select("-passwordHash");
        if (user) {
          socket.user = user;
          socket.userId = user._id.toString();
          return next();
        }
      }

      return next(new Error("Authentication error: Valid token or User ID required"));
    } catch (err) {
      return next(new Error(`Authentication error: ${err.message}`));
    }
  });

  io.on("connection", (socket) => {
    const userId = socket.userId;
    // Join personal notification/direct messaging room
    socket.join(`user:${userId}`);

    // Join a specific match conversation room
    socket.on("join_conversation", async (data, callback) => {
      try {
        const matchId = typeof data === "string" ? data : data?.matchId;
        if (!matchId) {
          if (callback) callback({ success: false, message: "matchId is required" });
          return;
        }

        const match = await Match.findById(matchId);
        if (!match) {
          if (callback) callback({ success: false, message: "Match not found" });
          return;
        }

        // Verify Match status is ACCEPTED
        if (match.status !== "ACCEPTED") {
          if (callback) callback({ success: false, message: "Chat is only available for ACCEPTED matches" });
          return;
        }

        // Verify user is a participant
        const isParticipant =
          match.user.toString() === userId.toString() ||
          match.owner.toString() === userId.toString();

        if (!isParticipant) {
          if (callback) callback({ success: false, message: "Unauthorized: You are not a participant in this conversation" });
          return;
        }

        socket.join(`match:${matchId}`);
        if (callback) callback({ success: true, matchId });
      } catch (error) {
        if (callback) callback({ success: false, message: error.message });
      }
    });

    // Leave a specific conversation room
    socket.on("leave_conversation", (data) => {
      const matchId = typeof data === "string" ? data : data?.matchId;
      if (matchId) {
        socket.leave(`match:${matchId}`);
      }
    });

    // Send a message via Socket.IO
    socket.on("send_message", async (data, callback) => {
      try {
        const { matchId, message } = data || {};
        if (!matchId || !message || !message.trim()) {
          if (callback) callback({ success: false, message: "matchId and message content are required" });
          return;
        }

        const match = await Match.findById(matchId);
        if (!match) {
          if (callback) callback({ success: false, message: "Match not found" });
          return;
        }

        if (match.status !== "ACCEPTED") {
          if (callback) callback({ success: false, message: "Chat is only available for ACCEPTED matches" });
          return;
        }

        const isLead = match.owner.toString() === userId.toString();
        const isDev = match.user.toString() === userId.toString();

        if (!isLead && !isDev) {
          if (callback) callback({ success: false, message: "Forbidden: You are not a participant in this conversation" });
          return;
        }

        const receiverId = isLead ? match.user : match.owner;

        // 1. Persist to MongoDB
        const newMessage = await Message.create({
          match: match._id,
          project: match.project,
          sender: userId,
          receiver: receiverId,
          message: message.trim(),
        });

        const populatedMessage = await Message.findById(newMessage._id)
          .populate("sender", "name email avatar role")
          .populate("receiver", "name email avatar role");

        // 2. Broadcast to conversation room and direct receiver room
        io.to(`match:${matchId}`).emit("new_message", populatedMessage);
        io.to(`user:${receiverId.toString()}`).emit("new_message", populatedMessage);

        if (callback) {
          callback({ success: true, data: populatedMessage });
        }
      } catch (error) {
        if (callback) {
          callback({ success: false, message: error.message });
        }
      }
    });

    // Typing indicators
    socket.on("typing", (data) => {
      const { matchId } = data || {};
      if (matchId) {
        socket.to(`match:${matchId}`).emit("user_typing", {
          matchId,
          userId,
          name: socket.user?.name || "Participant",
        });
      }
    });

    socket.on("stop_typing", (data) => {
      const { matchId } = data || {};
      if (matchId) {
        socket.to(`match:${matchId}`).emit("user_stop_typing", {
          matchId,
          userId,
        });
      }
    });

    socket.on("disconnect", () => {
      // Room cleanup automatically performed by socket.io
    });
  });

  return io;
};

export default {
  initSocket,
  getIO,
};
