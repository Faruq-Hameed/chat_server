import express, { Application, Request, Response } from "express";
import cors from "cors";
import morgan from "morgan";

const app: Application = express();

//middlewares
app.use(cors()) //the frontend url will be allowed instead of all
app.use(express.json());
app.use(morgan("dev"))


// Test route
app.get("/", (req: Request, res: Response) => {
  res.json({ message: "🚀 API is running" });
});

export default app;