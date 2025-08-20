import { Server, Socket } from "socket.io";
import { Message } from "@/models";

export default function registerChatHandlers(io: Server, socket: Socket) {
  // ✅ Join Room
  socket.on("join_room", (roomId: string) => {
    socket.join(roomId);
    console.log(`👤 User ${socket.id} joined room ${roomId}`);

    // notify others
    socket.to(roomId).emit("user_status", {
      userId: socket.id,
      status: "online",
    });
  });

  // ✅ Send Message
  socket.on(
    "send_message",
    async (data: { roomId: string; userId: string; content: string }) => {
      const { roomId, userId, content } = data;
      const message = await Message.create({
        roomId,
        userId,
        content,
      });


      // Broadcast to room
      io.to(roomId).emit("receive_message", {
        id: message.id,
        roomId,
        userId,
        content,
        status: message.status,
        createdAt: message.createdAt,
      });
    }
  );

  // ✅ Typing indicator
  socket.on("typing", (roomId: string) => {
    socket.to(roomId).emit("typing", { userId: socket.id });
  });

  // ✅ Mark as Read
  socket.on("read_message", async (messageId: string) => {
    const message = await Message.findByPk(messageId);
    if (message) {
      message.status = "read";
      await message.save();

      io.to(message.roomId).emit("message_read", {
        id: message.id,
        roomId: message.roomId,
        userId: message.userId,
        status: "read",
      });
    }
  });

  // ✅ Disconnect → set offline
  socket.on("disconnect", () => {
    io.emit("user_status", { userId: socket.id, status: "offline" });
  });
}
