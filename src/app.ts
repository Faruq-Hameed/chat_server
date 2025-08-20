import express, { Application, NextFunction, Request, Response } from "express";
import cors from "cors";
import morgan from "morgan";

import Router from "@/routers";
import { errorHandler } from "@/middlewares/errorHandler";
import { BadRequestException } from "./exceptions";

const app: Application = express();
//middlewares
app.use(cors()); //the frontend url will be allowed instead of all
app.use(express.json());
app.use(morgan("dev"));

//I am having issue validating empty request body with my joi validator
app.use((req: Request, res: Response, next: NextFunction) => {
  if(req.method === "POST" && !req.body){
    throw new BadRequestException("Missing request body!")
  }
  next();
});

app.use("/api/v1/auths", Router.authsRouter);
app.use("/api/v1/rooms", Router.roomsRouter);
// Test route
app.get("/", (req: Request, res: Response) => {
  res.json({ message: "🚀 API is running" });
});

// Error handler
app.use(errorHandler);

//wrong api request catcher
app.use((req: Request, res: Response) => {
  res.status(404).json({ message: "Page not found" });
});

export default app;
