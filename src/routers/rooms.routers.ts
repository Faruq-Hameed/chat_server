import { Router } from "express";

import {
  createRoomController,
  getRoomById,
  getRooms,
  joinPublicRoomById,
  getRoomsByUserId,
  createInvite,
  joinPrivateRoom,
  getRoomInviteByCreator,
  getRoomMembers,
} from "@/controllers/rooms.controllers";
import { uuidValidator } from "@/middlewares/uuidValidator";
import { authenticator } from "@/middlewares/auth";

const roomsRouter = Router();
roomsRouter.use(authenticator);

roomsRouter.post("/", createRoomController);
roomsRouter.get("/", getRooms);
roomsRouter.get("/:roomId", [uuidValidator, getRoomById]);
roomsRouter.get("/:roomId/users", [uuidValidator, getRoomMembers]); //get room members by room id
roomsRouter.get("/users/:userId", [uuidValidator, getRoomsByUserId]);

roomsRouter.post("/:roomId/join", [uuidValidator, joinPublicRoomById]); //join public room by room id

roomsRouter.post("/:roomId/invites", [uuidValidator, createInvite]); //create invite token by room id
roomsRouter.get("/:roomId/invites", [uuidValidator, getRoomInviteByCreator]); //get invite token by room id by the creator

roomsRouter.post("/invites/:token/join", joinPrivateRoom);

export default roomsRouter;
