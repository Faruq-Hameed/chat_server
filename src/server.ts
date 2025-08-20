import 'module-alias/register';
import dotenv from "dotenv";
import http from "http";
dotenv.config();

import app from "./app";
import sequelize from "@/config/db";
import { initSocket } from "./sockets";

const PORT = process.env.PORT || 5000;

//my http server
const server = http.createServer(app);

initSocket(server);

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
