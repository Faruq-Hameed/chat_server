import { Router } from "express";

import {
  createUserController,
  loginController,
  getUsers,
  getUserById,
} from "@/controllers/auths.controllers";

const authsRouter = Router();

authsRouter.post("/", createUserController);
authsRouter.post("/login", loginController);
authsRouter.get("/", getUsers);
authsRouter.get("/:id", getUserById);

export default authsRouter;
