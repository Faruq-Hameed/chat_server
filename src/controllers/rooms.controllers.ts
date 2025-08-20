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
    if (!req.body) {
      throw new BadRequestException("Missing request body!"); //to handle empty request body
    }
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
    });
    res.status(201).json({
      success: true,
      message: "Room created successfully",
      data: room,
      roomMembers,
    });
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
    const rooms = await Room.findAll({
      include: [{ model: User, as: "creator", attributes: ["id", "username"] }],
    });
    res.status(200).json({
      success: true,
      message: "Rooms fetched successfully",
      data: rooms,
    });
  } catch (error) {
    next(error);
  }
};

/**Get room by id */
export const getRoomById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const room = await Room.findByPk(req.params.roomId);
    if (!room) {
      throw new NotFoundException("Room not found");
    }
    res.status(200).json({
      success: true,
      message: "Room fetched successfully",
      data: room,
    });
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
    const { userId } = req.params;
    const rooms = await RoomMember.findAll({
      where: {
        userId,
      },
      include: [
        { model: Room, as: "room", attributes: ["id", "name"] }, //includes the room name
        // { model: User, as: "user", attributes: ["id", "username"] }, //includes the members name
      ],
    });
    res.status(200).json({
      success: true,
      message: "User rooms fetched successfully",
      data: rooms,
    });
  } catch (error) {
    next(error);
  }
};

/**Controller to get all the members of a room */
export const getRoomMembers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { roomId } = req.params;
    const room = await Room.findByPk(roomId, {
      include: {
        model: User,
        as: "creator",
        attributes: ["id", "username", "email"],
      },
    });
    if (!room) {
      throw new NotFoundException("Room not found");
    }
    const result = await RoomMember.findAndCountAll({
      where: { roomId },
      include: {
        model: User,
        as: "user",
        attributes: ["id", "username", "email"],
      },
    });

    return res.json({
      success: true,
      message: "Room members fetched successfully",
      data: { totalMembers: result.count, room, members: result.rows },
    });
  } catch (error) {
    next(error);
  }
};

/**controller to join a public room using the room id */
export const joinPublicRoomById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const roomId = req.params.roomId;
    const userId = req.user?.id;
    const [room, userAlreadyMember] = await Promise.all([
      Room.findByPk(roomId),
      RoomMember.findOne({
        where: {
          roomId,
          userId,
        },
        attributes: ["id"],
      }),
    ]);
    if (!room) {
      throw new NotFoundException("Room not found!");
    }
    if (room.isPrivate) {
      throw new ForbiddenException("Unable to join room"); //real reason hidden for security purpose
    }
    //check if the user is already a member of the room
    if (userAlreadyMember) {
      throw new ConflictException("You are already a member of the room");
    }
    await RoomMember.create({
      roomId,
      userId,
      role: "member",
    });
    res.status(200).json({
      success: true,
      message: "Joined room successfully",
      data: room,
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
    const { roomId } = req.params;
    const userId = req.user!.id;

    // check if requester is the room creator
    const room = await Room.findByPk(roomId, {
      attributes: ["createdBy", "isPrivate"], //only the createdBy and isPrivate are needed
    });
    if (!room) {
      throw new NotFoundException("Room with the id not found");
    }
    //only the person that created the room can generate the invite also cannot create for public room
    if (room.createdBy !== userId || !room.isPrivate) {
      throw new ForbiddenException("You cannot create invite for this room");
    }

    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    const token = Array.from(array)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    // destroy existing token if any
    await RoomInvite.destroy({ where: { roomId } });

    //create a new token in memory that we be used to enter the room
    const invite = new RoomInvite({
      roomId,
      createdBy: userId,
    });
    const link = `${process.env.BASE_URL}/rooms/invites/${invite.inviteCode}/join`;
    invite.inviteCode = link;
    await invite.save();
    res.json({
      success: true,
      message: "Invite created successfully",
      data: {
        invite,
        link,
      },
    }); //This can also be sent to email of other user possibly
  } catch (err) {
    next(err);
  }
};

/**Controller to get a room invite by the creator */
export const getRoomInviteByCreator = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const roomId = req.params.roomId;
    const userId = req.user!.id;
    //only the person who created the room invite can see the invite
    const invite = await RoomInvite.findOne({
      where: { roomId, createdBy: userId },
      include: { model: Room },
    });
    if (!invite) throw new NotFoundException("Invite not found for the room");

    res.json({
      success: true,
      message: "invite fetched successfully",
      data: invite,
    });
  } catch (error) {}
};

/**Controller to join a private room using the invite token */
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

    // check membership
    const existing = await RoomMember.findOne({
      where: { userId, roomId: invite.roomId },
    });
    if (existing) {
      throw new ConflictException("Already a member");
    }

    const [room] = await Promise.all([
      Room.findByPk(invite.roomId),
      RoomMember.create({
        roomId: invite.roomId,
        userId,
        role: "member",
      }),
    ]);

    res.json({
      success: true,
      message: "Joined private room successfully",
      data: room,
    });
  } catch (err) {
    next(err);
  }
};
