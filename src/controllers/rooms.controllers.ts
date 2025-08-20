import { Request, Response, NextFunction } from "express";
import { Room, RoomMember, User } from "@/models";
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from "@/exceptions/";

import { createRoomValidator } from "@/utils/validators/room.validator";

/**controller to create a room */
export const createRoomController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { error, value } = createRoomValidator(req.body);
    if (error) {
      throw new BadRequestException(error.details[0].message);
    }
    const userId = req.user?.id;
    const room = await Room.create({
      ...value,
      createdBy: userId,
    });
    //adding the owner has a member to the room automatically
    const roomMembers = await RoomMember.create({
      roomId: room.id,
      userId: userId,
      role: "admin",
    });
    res
      .status(201)
      .send({ message: "Room created successfully", room, roomMembers });
  } catch (error) {
    next(error);
  }
};

export const joinPublicRoom = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const roomId = req.params.id;
    const userId = req.user?.id;
    const room = await Room.findByPk(roomId, {
      attributes: ["id", "isPrivate"],
      include: [
        {
          model: RoomMember,
          where: { userId },
        },
      ],
    });
    if (!room) {
      throw new NotFoundException("Room not found!");
    }
    if (room.isPrivate) {
      throw new ForbiddenException("Unable to join room"); //real reason hidden for security purpose
    }
    //check if the user is already a member of the room
    if (room.members.length > 0) {
      throw new ConflictException("You are already a member of the room");
    }
    await RoomMember.create({
      roomId,
      userId,
      role: "member",
    });
    res.status(200).send({ message: "Joined room successfully" });
  } catch (error) {
    next(error);
  }
};

export const getRooms = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const rooms = await Room.findAll();
    res.status(200).send(rooms);
  } catch (error) {
    next(error);
  }
};

export const getRoomById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const room = await Room.findByPk(req.params.id);
    res.status(200).send(room);
  } catch (error) {
    next(error);
  }
};

/**Get rooms by user id */
export const getRoomsByUserId = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.params.id;
    const rooms = await RoomMember.findAll({
      where: {
        userId,
      },
      include: {
        model: Room,
      },
    });
    res.status(200).send({
      message: "User rooms fetched successfully",
      rooms,
    });
  } catch (error) {
    next(error);
  }
};

// export const joinRoom = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   try {
//     const { error, value } = Joi.validate(req.body,
