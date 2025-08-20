import { BadRequestException } from "@/exceptions";
import { Request, Response, NextFunction } from "express";

// Simple UUID v4 regex (matches standard UUIDs)
function isUuid(id: string): boolean {
  const uuidV4Regex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidV4Regex.test(id);
}
/**Middleware to validate the UUID in the request parameters. */
export function uuidValidator(req: Request, res: Response, next: NextFunction) {
  const { id } = req.params;
  if (!id || !isUuid(id)) {
     throw new BadRequestException("Invalid or missing UUID in parameters.")
  }
  next();
}