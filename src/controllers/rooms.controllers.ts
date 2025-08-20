import { Request, Response, NextFunction } from "express";
import { User } from "@/models";
import {
  comparePassword,
  createUserValidator,
  loginValidator,
} from "@/utils/validators/user.validators";
import { BadRequestException, NotFoundException } from "@/exceptions/";
import { createAuthToken } from "@/utils/token";
import { Op } from "sequelize";

const createRoom = async (req: Request, res: Response, next: NextFunction) => {
  try {
  } catch (error) {
    next(error);
  }
};
