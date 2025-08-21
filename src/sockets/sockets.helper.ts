import { io, onlineUsers } from ".";

// Helper function to get online users count
export const getOnlineUsersCount = (): number => {
  return onlineUsers.size;
};

// Helper function to check if user is online
export const isUserOnline = (userId: string): boolean => {
  return onlineUsers.has(userId);
};

// Helper function to send message to specific user
export const sendToUser = (userId: string, event: string, data: any) => {
  const user = onlineUsers.get(userId);
  if (user) {
    io.to(user.socketId).emit(event, data);
  }
};

// helpers/rateLimiter.ts
type MessageRecord = {
  timestamps: number[];
};

const messageLimits: Record<string, MessageRecord> = {}; 
// key will be `${userId}:${roomId}`

/**
 * Check if user is allowed to send a message in a room
 * @param userId string
 * @param roomId string
 * @param limit number (max messages)
 * @param interval number (ms window)
 */
export function canSendMessagePerRoom(
  userId: string,
  roomId: string,
  limit = 5,
  interval = 10000
): boolean {
  const key = `${userId}:${roomId}`;
  const now = Date.now();

  if (!messageLimits[key]) {
    messageLimits[key] = { timestamps: [] };
  }

  // keep only timestamps within interval
  messageLimits[key].timestamps = messageLimits[key].timestamps.filter(
    (t) => now - t < interval
  );

  if (messageLimits[key].timestamps.length >= limit) {
    return false; //  too many messages
  }

  messageLimits[key].timestamps.push(now);
  return true; // allowed
}
