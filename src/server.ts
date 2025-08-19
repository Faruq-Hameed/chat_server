import dotenv from "dotenv";
import http from "http";
import { Server } from "socket.io";
dotenv.config();

import app from "./app";
import sequelize from "@/config/db";

const PORT = process.env.PORT || 5000;

//my http server
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*", //🔒 this will later restrict to frontend URL
  },
});

io.on("connection", (socket) => {
  console.log("New client connected: ", socket.id);
});

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ DB connected");
    await sequelize.sync(
      
    ); //  creates tables based on my defined models
    console.log("📦 Models synced to DB");

    server.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.log(`❌ failure on starting server: ${error}`);
  }
};

startServer();
