// controllers/messageController.ts
import { Request, Response, NextFunction } from "express";
import { BadRequestException, NotFoundException, ForbiddenException } from "@/exceptions";
import { Room, Message, RoomMember, User } from "@/models";
import { io } from "@/sockets";

export const createMessage = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { roomId, content } = req.body;
    const userId = req.user?.id;

    if (!roomId || !content) {
      throw new BadRequestException("Missing required fields");
    }

    // Check if room exists
    const room = await Room.findByPk(roomId);
    if (!room) {
      throw new NotFoundException("Room not found");
    }

    // Verify user is a member of the room
    const membership = await RoomMember.findOne({
      where: { roomId, userId }
    });

    if (!membership) {
      throw new ForbiddenException("You are not a member of this room");
    }

    // Create message
    const message = await Message.create({
      roomId,
      userId,
      content,
    });

    // Prepare message data for socket emission
    const messageData = {
      id: message.id,
      roomId,
      userId,
      username: req.user!.username,
      content,
      createdAt: message.createdAt,
      timestamp: new Date().toISOString(),
    };

    // ✅ Emit socket event to all users in the room
    io.to(roomId).emit("receive_message", messageData);

    res.status(201).json({
      success: true,
      message: "Message sent successfully",
      data: messageData,
    });
  } catch (error) {
    next(error);
  }
};

export const getRoomMessages = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { roomId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    const userId = req.user?.id;

    // Verify user is a member of the room
    const membership = await RoomMember.findOne({
      where: { roomId, userId }
    });

    if (!membership) {
      throw new ForbiddenException("You are not a member of this room");
    }

    const offset = (Number(page) - 1) * Number(limit);

    const messages = await Message.findAndCountAll({
      where: { roomId },
      include: [
        {
          model: User, as: "sender", 
          attributes: ['id', 'username'],
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: Number(limit),
      offset: offset,
    });

    res.status(200).json({
      success: true,
      data: {
        messages: messages.rows.reverse(), // Reverse to show oldest first
        pagination: {
          currentPage: Number(page),
          totalPages: Math.ceil(messages.count / Number(limit)),
          totalMessages: messages.count,
          hasNextPage: offset + Number(limit) < messages.count,
          hasPrevPage: Number(page) > 1,
        }
      },
    });
  } catch (error) {
    next(error);
  }
};

// Mark messages as read
export const markMessagesAsRead = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { roomId } = req.params;
    const userId = req.user?.id;

    // Verify user is a member of the room
    const membership = await RoomMember.findOne({
      where: { roomId, userId }
    });

    if (!membership) {
      throw new ForbiddenException("You are not a member of this room");
    }

    // Update last read timestamp for the user in this room
    await Message.update(
      { lastReadAt: new Date() },
      { where: { roomId, userId } }
    );

    // Emit read receipt to other users in the room
    io.to(roomId).emit("messages_read", {
      userId,
      username: req.user!.username,
      roomId,
    });

    res.status(200).json({
      success: true,
      message: "Messages marked as read",
    });
  } catch (error) {
    next(error);
  }
};