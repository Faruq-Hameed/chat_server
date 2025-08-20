// sockets/index.ts
import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import { TokenException } from "@/exceptions";
import { Room, RoomMember, Message, User } from "@/models"; // Adjust import paths

let io: Server;

// Track online users
const onlineUsers = new Map<string, { socketId: string; userId: string; username: string }>();

export const initSocket = (server: any) => {
  io = new Server(server, {
    cors: {
      origin: "*", // 🔒 Restrict to frontend URL in production
    },
  });

  // 🔑 JWT auth middleware for sockets
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;

      if (!token) {
        throw new TokenException();
      }

      const payload = jwt.verify(token, process.env.JWT_SECRET!) as any;
      (socket as any).user = payload; // attach user
      next();
    } catch (error) {
      next(error as Error);
    }
  });

  io.on("connection", (socket) => {
    const user = (socket as any).user;
    console.log("✅ User connected:", user);

    // Add user to online users map
    onlineUsers.set(user.id, {
      socketId: socket.id,
      userId: user.id,
      username: user.username,
    });

    // Broadcast user online status
    socket.broadcast.emit("user_status", {
      userId: user.id,
      username: user.username,
      status: "online",
      timestamp: new Date().toISOString(),
    });

    // ✅ JOIN ROOM EVENT
    socket.on("join_room", async ({ roomId }) => {
      try {
        // Verify user is a member of the room
        const membership = await RoomMember.findOne({
          where: { roomId, userId: user.id }
        });

        if (!membership) {
          socket.emit("error", { message: "Not authorized to join this room" });
          return;
        }

        socket.join(roomId);
        console.log(`👥 User ${user.username} joined room ${roomId}`);

        // Notify others in the room
        socket.to(roomId).emit("user_joined", {
          userId: user.id,
          username: user.username,
          roomId,
          timestamp: new Date().toISOString(),
        });

        // Send confirmation to the user
        socket.emit("room_joined", {
          roomId,
          message: "Successfully joined room",
        });
      } catch (error) {
        console.error("Error joining room:", error);
        socket.emit("error", { message: "Failed to join room" });
      }
    });

    // ✅ SEND MESSAGE EVENT
    socket.on("send_message", async ({ roomId, content, messageType = "text" }) => {
      try {
        // Verify user is a member of the room
        const membership = await RoomMember.findOne({
          where: { roomId, userId: user.id }
        });

        if (!membership) {
          socket.emit("error", { message: "Not authorized to send messages to this room" });
          return;
        }

        // Create message in database
        const message = await Message.create({
          roomId,
          userId: user.id,
          content,
          messageType,
        });

        const messageData = {
          id: message.id,
          roomId,
          userId: user.id,
          username: user.username,
          content,
          messageType,
          createdAt: message.createdAt,
          timestamp: new Date().toISOString(),
        };

        // Broadcast to all users in the room (including sender)
        io.to(roomId).emit("receive_message", messageData);

        console.log(`💬 Message sent in room ${roomId} by ${user.username}`);
      } catch (error) {
        console.error("Error sending message:", error);
        socket.emit("error", { message: "Failed to send message" });
      }
    });

    // ✅ TYPING INDICATOR
    socket.on("typing", ({ roomId, isTyping }) => {
      // Broadcast to others in the room (exclude sender)
      socket.to(roomId).emit("user_typing", {
        userId: user.id,
        username: user.username,
        roomId,
        isTyping,
        timestamp: new Date().toISOString(),
      });
    });

    // ✅ LEAVE ROOM EVENT
    socket.on("leave_room", ({ roomId }) => {
      socket.leave(roomId);
      
      // Notify others in the room
      socket.to(roomId).emit("user_left", {
        userId: user.id,
        username: user.username,
        roomId,
        timestamp: new Date().toISOString(),
      });

      console.log(`👋 User ${user.username} left room ${roomId}`);
    });

    // ✅ GET ONLINE USERS IN ROOM
    socket.on("get_room_users", async ({ roomId }) => {
      try {
        const roomMembers = await RoomMember.findAll({
          where: { roomId },
          include: [
            {
              model: User, as: "user", // Adjust model name as needed
              attributes: ['id', 'username'],
            }
          ]
        });

        const roomUsers = roomMembers.map(member => ({
          userId: member.userId,
          username: member.user.username,
          isOnline: onlineUsers.has(member.userId),
        }));

        socket.emit("room_users", {
          roomId,
          users: roomUsers,
        });
      } catch (error) {
        console.error("Error getting room users:", error);
        socket.emit("error", { message: "Failed to get room users" });
      }
    });

    // ✅ DISCONNECT EVENT
    socket.on("disconnect", () => {
      console.log("❌ User disconnected:", user.username);

      // Remove from online users
      onlineUsers.delete(user.id);

      // Broadcast user offline status
      socket.broadcast.emit("user_status", {
        userId: user.id,
        username: user.username,
        status: "offline",
        timestamp: new Date().toISOString(),
      });
    });
  });

  return io;
};

// Helper function to get online users count
export const getOnlineUsersCount = (): number => {
  return onlineUsers.size;
};

// Helper function to check if user is online
export const isUserOnline = (userId: string): boolean => {
  return onlineUsers.has(userId);
};

// Helper function to send message to specific user
export const sendToUser = (userId: string, event: string, data: any) => {
  const user = onlineUsers.get(userId);
  if (user) {
    io.to(user.socketId).emit(event, data);
  }
};

export { io };