import { Server, Socket } from "socket.io";

export default function registerChatHandlers(io: Server, socket: Socket) {
  // Example: Join a room
  socket.on("joinRoom", (roomId: string) => {
    socket.join(roomId);
    console.log(`📥 ${socket.id} joined room ${roomId}`);
  });

  // Example: Send a message
  socket.on("chatMessage", ({ roomId, message }) => {
    console.log(`💬 Message in ${roomId}: ${message}`);
    io.to(roomId).emit("chatMessage", { sender: socket.id, message });
  });

  // Disconnect
  socket.on("disconnect", () => {
    console.log(`❌ Client disconnected: ${socket.id}`);
  });
}
