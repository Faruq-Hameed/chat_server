import { Request, Response, NextFunction } from "express";
import { Room, RoomMember, RoomInvite, User } from "@/models";
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

/**Controller to create a room invite by the creator or admin */
export const createInvite = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id: roomId } = req.params;
    const userId = req.user!.id;

    // check if requester is an admin
    const member = await RoomMember.findOne({ where: { userId, roomId } });
    if (!member || member.role !== "admin") {
      throw new ForbiddenException("Only admins can invite");
    }

    const token = crypto.getRandomValues(new Uint8Array(16));
    const invite = await RoomInvite.create({
      roomId,
      createdBy: userId,
      token,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // expires in 7 days
    });

    res.json({ link: `https://yourapp.com/join/${invite.token}` });
  } catch (err) {
    next(err);
  }
};

export const getRoomInviteByCreator = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const roomId = req.params.id;
    const userId = req.user!.id;
    //only the person who created the room invite can see the invite
    const invite = await RoomInvite.findOne({
      where: { roomId, createdBy: userId },
      include: { model: Room },
    });
    if (!invite) throw new NotFoundException("Invite not found for the room");

    res.json(invite);
  } catch (error) {}
};

export const joinPrivateRoom = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { token } = req.params;
    const userId = req.user!.id;

    const invite = await RoomInvite.findOne({ where: { token } });
    if (!invite) throw new NotFoundException("Invalid invite");
    if (invite.expiresAt < new Date())
      throw new ForbiddenException("Invite expired");

    // check membership
    const existing = await RoomMember.findOne({
      where: { userId, roomId: invite.roomId },
    });
    if (existing) {
      throw new ConflictException("Already a member");
    }

    await RoomMember.create({
      roomId: invite.roomId,
      userId,
      role: "member",
    });

    res.json({ message: "Joined private room successfully" });
  } catch (err) {
    next(err);
  }
};
