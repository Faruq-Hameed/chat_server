import express from "express";
import dotenv from "dotenv";
import http from "http";
import { Server } from "socket.io";

import app from "./app";
import sequelize from "@/config/db";

dotenv.config();
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
    // await sequelize.authenticate();
    // console.log("✅ DB connected");

    server.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.log(`❌ failure on starting server: ${error}`);
  }
};

startServer()
