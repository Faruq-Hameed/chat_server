import { Request, Response, NextFunction } from "express";
import { User } from "@/models";
import {
  comparePassword,
  createUserValidator,
  loginValidator,
} from "@/utils/validators/user.validators";
import { BadRequestException, ConflictException, NotFoundException } from "@/exceptions/";
import { createAuthToken } from "@/utils/token";
import { Op } from "sequelize";

export const createUserController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { error, value } = createUserValidator(req.body);
    if (error) {
      throw new BadRequestException(error.details[0].message);
    }

    const existingUser = await User.findOne({
      where: {
        [Op.or]: [{ username: value.username }, { email: value.email }],
      },
      attributes: ["id"],
    });

    if (existingUser) {
      throw new ConflictException("username or email already exists");
    }

    const user = await User.create(value);
    const token = createAuthToken({ id: user.id, username: user.username });
    res.status(201).json({
      success: true,
      message: "user created successfully",
      data: { user, token },
    });
  } catch (error) {
    next(error);
  }
};

/**Login controller expecting email and password
 */
export const loginController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { error, value } = loginValidator(req.body);
    if (error) {
      throw new BadRequestException(error.details[0].message);
    }

    const user = await User.findOne({ where: { email: value.email } });
    if (!user) {
      throw new NotFoundException("Invalid login credentials");
    }
    if (!comparePassword(value.password, user.password)) {
      throw new BadRequestException("Invalid login credentials");
    }
    const token = createAuthToken({ id: user.id, username: user.username });
    res.status(200).json({
      success: true,
      message: "Login successful",
      data: { user, token },
    });
  } catch (error) {
    next(error);
  }
};

//get all users
export const getUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const users = await User.findAll();
    res.status(200).json({
      success: true,
      message: "Users fetched successfully",
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

export const getUserById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id);
    if (!user) {
      throw new Error("User not found");
    }
    res.status(200).json({
      success: true,
      message: "User fetched successfully",
      data: user,
    });
  } catch (error) {
    next(error);
  }
};
