import { Router } from "express";

import {
  createUserController,
  loginController,
  getUsers,
  getUserById,
} from "@/controllers/users.controllers";

const usersRouter = Router();

usersRouter.post("/", createUserController);
usersRouter.post("/login", loginController);
usersRouter.get("/", getUsers);
usersRouter.get("/:id", getUserById);

export default usersRouter;
