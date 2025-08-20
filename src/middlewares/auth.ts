import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { ForbiddenException, TokenException } from "@/exceptions";

// // Extend Express Request interface to include 'user'
// declare global {
//   namespace Express {
//     interface Request {
//       user?: any;
//     }
//   }
// }

export function authenticator(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

  if (!token) {
    throw new ForbiddenException("Access token required");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    req.user = decoded;
    next();
  } catch (error) {
    throw new TokenException()
  }
}
