import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import { TokenException } from "@/exceptions";
import { RoomMember, Message, User, Room } from "@/models";
import { canSendMessagePerRoom } from "./sockets.helper";

let io: Server;

// Track all online users
export const onlineUsers = new Map<
  string,
  { socketId: string; userId: string; username: string }
>();

export const initSocket = (server: any) => {
  io = new Server(server, {
    cors: {
      origin: "*", // if production it will be restrict to frontend URL in production
    },
  });

  // JWT auth middleware that check for auth token for sockets
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

    // JOIN ROOM EVENT
    socket.on("join_room", async ({ roomId }) => {
      try {
        // Verify user is a member of the room
        const membership = await RoomMember.findOne({
          where: { roomId, userId: user.id },
        });

        if (!membership) {
          return socket.emit("error", {
            type: "NOT_AUTHORIZED",
            message: "Not authorized to join this room",
          });
        }
        //joining room after verifying he's a member
        socket.join(roomId);

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
        socket.emit("error", {
          type: "SERVER_ERROR",
          message: "Failed to join room",
        });
      }
    });

    // ✅ SEND MESSAGE EVENT
    socket.on("send_message", async ({ roomId, content }) => {
      try {
        //ignore empty message
        if (!content || content.trim().length === 0) {
          return;
        }
        // Check if user has not exceed message sending for the room
        if (!canSendMessagePerRoom(user.id, roomId)) {
          return socket.emit("error", {
            //i'm returning so that the catch error won't override
            type: "RATE_LIMIT",
            message: "Too many messages, slow down.",
          });
        }
        // Verify user is a member of the room
        const membership = await RoomMember.findOne({
          where: { roomId, userId: user.id },
        });

        if (!membership) {
          return socket.emit("error", {
            type: "NOT_AUTHORIZED",
            message: "Not authorized to send messages to this room",
          });
        }

        // Create message in database
        const message = await Message.create({
          roomId,
          userId: user.id,
          content,
        });

        const messageData = {
          id: message.id,
          roomId,
          userId: user.id,
          username: user.username,
          content,
          createdAt: message.createdAt,
          timestamp: new Date().toISOString(),
        };

        // Broadcast to all users in the room (including sender)
        io.to(roomId).emit("receive_message", messageData);
      } catch (error) {
        socket.emit("error", {
          type: "SERVER_ERROR",
          message: "Failed to send message",
        });
      }
    });

    //mark message as read once someone in the room read it
    socket.on("message_read", async ({ messageId, roomId }) => {
      const message = await Message.findByPk(messageId);
      if (!message) return;

      if (message.status !== "read") {//
        await message.update({ status: "read" });

        io.to(roomId).emit("message_status_updated", {
          messageId,
          status: "read",
          readerId: user.id,
          timestamp: new Date().toISOString(),
        });
      }
      return;
    });

    // TYPING INDICATOR WHEN A USER START TYPING (to be activated by the client)
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

    // LEAVE ROOM EVENT
    socket.on("leave_room", ({ roomId }) => {
      socket.leave(roomId);

      // Notify others in the room
      socket.to(roomId).emit("user_left", {
        userId: user.id,
        username: user.username,
        roomId,
        type: "temporary", // optional to indicate for temporary leave
        timestamp: new Date().toISOString(),
      });
    });

    // GET ONLINE USERS IN ROOM
    socket.on("get_room_users", async ({ roomId }) => {
      try {
        const roomMembers = await RoomMember.findAll({
          where: { roomId },
          include: [
            {
              model: User,
              as: "user",
              attributes: ["id", "username"],
            },
          ],
        });

        //mapping for room users that are in the onlineUsers
        const roomUsers = roomMembers.map((member) => ({
          userId: member.userId,
          username: member.user.username,
          isOnline: onlineUsers.has(member.userId),
        }));

        socket.emit("room_users", {
          roomId,
          users: roomUsers,
        });
      } catch (error) {
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

export { io };
