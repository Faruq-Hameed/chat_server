import express, { Application, Request, Response } from "express";
import cors from "cors";
import morgan from "morgan";

import authsRouter from "./routers/users.routers";
import { errorHandler } from "./middlewares/errorHandler";

const app: Application = express();

//middlewares
app.use(cors()); //the frontend url will be allowed instead of all
app.use(express.json());
app.use(morgan("dev"));

app.use("/api/v1/auths", authsRouter);
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
