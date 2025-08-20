import { Router } from "express";

import {
  createRoomController,
  getRoomById,
  getRooms,
  joinPublicRoom,
  getRoomsByUserId,
} from "@/controllers/rooms.controllers";
import { uuidValidator } from "@/middlewares/uuidValidator";
import { authenticator } from "@/middlewares/auth";

const roomsRouter = Router();
roomsRouter.use(authenticator);

roomsRouter.post("/", createRoomController);
roomsRouter.post("/join/:id", [uuidValidator, joinPublicRoom]);

roomsRouter.get("/", getRooms);
roomsRouter.get("/:id", [uuidValidator, getRoomById]);
roomsRouter.get("/users/:id", [uuidValidator, getRoomsByUserId]);

export default roomsRouter;
