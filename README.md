# Chat Backend API

A Node.js/Express backend for a chat application, featuring user authentication, room management (public/private), invites, and real-time communication via WebSockets.

---

## Features

- **User Authentication**: Register, login, and JWT-based authentication.
- **Room Management**: Create, join, and leave public or private chat rooms.
- **Room Invites**: Generate and manage invite tokens for private rooms.
- **Room Membership**: Track and manage room members.
- **Real-Time Messaging**: Uses Socket.IO for real-time chat and events.
- **Validation**: Uses Joi for input validation and custom middlewares for UUID validation.
- **Database**: Sequelize ORM with PostgreSQL (or other supported dialects).
- **Error Handling**: Custom exceptions and centralized error handling.

---
Chat Backend – Get Started

This project is a real-time chat backend built with:

Node.js + Express → REST API (rooms, users, invites)

Sequelize + MySQL → Database models

Socket.IO → Real-time messaging, presence, typing indicators

JWT Authentication → Auth for both HTTP and WebSockets

📦 Prerequisites

Node.js >=18 (Render uses v22, supported ✅)

MySQL (use Aiven, PlanetScale, Render PostgreSQL, or Docker local)

Yarn or npm

🔧 Installation
# Clone repo
git clone [https://github.com/your-username/chat-backend.git](https://github.com/Faruq-Hameed/chat_server)
cd chat-backend

# Install dependencies
yarn install
# or
npm install

🛠️ Development
# Run with live reload
npm run dev


# Build and start:

npm run build
npm run start


## Project Structure

```
src/
│
├── config/           # Database and environment configuration
├── controllers/      # Express route controllers (business logic)
├── middlewares/      # Express middlewares (auth, validation, etc.)
├── models/           # Sequelize models (User, Room, RoomMember, RoomInvite)
├── routes/           # Express route definitions
├── sockets/          # Socket.IO setup and event handlers
├── utils/            # Utility functions (JWT, helpers, etc.)
├── app.ts            # Express app setup
├── server.ts         # Entry point, server and DB initialization
└── exceptions/       # Custom error classes
```

---

## POSTMAN DOCUMENTATION
[POSTMAN DOCUMENTATION](https://www.postman.com/myecurrencyng/workspace/tasks/collection/24456065-70404e87-7c8e-4af4-87cf-523c0c99a1bb?action=share&source=copy-link&creator=24456065)
# Deployed on render

[HOST_URL](https://chat-server-dpo7.onrender.com)

## Key Endpoints

### Auth

- `POST /api/v1/auth/register` — Register a new user
- `POST /api/v1/auth/login` — Login and receive JWT

### Rooms

- `POST /api/v1/rooms` — Create a new room
- `GET /api/v1/rooms` — List all rooms
- `GET /api/v1/rooms/:roomId` — Get room by ID
- `POST /api/v1/rooms/:roomId/join` — Join a public room
- `POST /api/v1/rooms/:roomId/invites` — Create invite for a private room (creator only)
- `POST /api/v1/rooms/invites/:token/join` — Join a private room via invite
- `POST /api/v1/rooms/:roomId/leave` — Leave a room

### Members

- `GET /api/v1/rooms/:roomId/members` — List members of a room
- `GET /api/v1/users/:userId/rooms` — List rooms a user belongs to

### Messages

- `POST /api/v1/:roomId/messages/read` — update message status to read
- `GET /api/v1/rooms/:roomId/messages` — List messages in a room

---

# Socket.IO Events Documentation

## Client-to-Server Events (Emit)

### 1. `join_room`

**Purpose**: Join a chat room to receive real-time updates

```typescript
socket.emit("join_room", { roomId: "room-uuid" });
```

### 2a. `send_message`

**Purpose**: Send a message to a room

```typescript
socket.emit("send_message", {
  roomId: "room-uuid",
  content: "Hello everyone!",
});
```

### 2b. `message_read`

**Purpose**: Send a message to a room

```typescript
socket.emit("send_message", {
 {
  "messageId": "uuid-of-message",
  "roomId": "uuid-of-room"
}
});
```
Message event summary
| Event                    | Direction       | Purpose                 |
| ------------------------ | --------------- | ----------------------- |
| `send_message`           | Client → Server | Send a new message      |
| `receive_message`        | Server → Room   | Broadcast new message   |
| `message_read`           | Client → Server | Mark a message as read  |
| `message_status_updated` | Server → Room   | Broadcast status change |

Broadcast Event: message_status_updated
{
  "messageId": "uuid-of-message",
  "status": "read",
  "readerId": "uuid-of-reader",
  "timestamp": "2025-08-21T10:16:10Z"
}

### 3. `typing`

**Purpose**: Indicate user is typing

```typescript
// Start typing
socket.emit("typing", {
  roomId: "room-uuid",
  isTyping: true,
});

// Stop typing
socket.emit("typing", {
  roomId: "room-uuid",
  isTyping: false,
});
```

### 4. `leave_room`

**Purpose**: Leave a chat room

```typescript
socket.emit("leave_room", { roomId: "room-uuid" });
```

### 5. `get_room_users`

**Purpose**: Get list of users in a room

```typescript
socket.emit("get_room_users", { roomId: "room-uuid" });
```

---

## Server-to-Client Events (Listen)

### 1. `receive_message`

**Purpose**: Receive new messages in subscribed rooms

```typescript
socket.on("receive_message", (data) => {
  // data structure:
  // { id: "message-id", roomId: "room-uuid", userId: "user-id", username: "sender-name", content: "message content", createdAt: "2023-...", timestamp: "2023-..."
  // }
});
```

### 2. `user_joined`

**Purpose**: Notification when someone joins the current room

```typescript
socket.on("user_joined", (data) => {
  console.log("User joined:", data);
  // data structure:
  // { userId: "user-id", username: "user-name", roomId: "room-uuid", timestamp: "2023-..."
  // }
});
```

### 3. `user_typing`

**Purpose**: Typing indicators from other users

```typescript
socket.on("user_typing", (data) => {
  if (data.isTyping) {
    showTypingIndicator(data.username);
  } else {
    hideTypingIndicator(data.username);
  }
  // data structure:
  // { userId: "user-id", username: "user-name", roomId: "room-uuid", isTyping: true/false, timestamp: "2023-..."
  // }
});
```

### 4. `user_status`

**Purpose**: Online/offline status of users

```typescript
socket.on("user_status", (data) => {
  updateUserStatus(data.userId, data.status);
  // data structure:
  // { userId: "user-id", username: "user-name", status: "online" | "offline", timestamp: "2023-..."
  // }
});
```

### 5. `room_joined`

**Purpose**: Confirmation of successful room join

```typescript
socket.on("room_joined", (data) => {
  console.log("Successfully joined room:", data.roomId);
});
```

### 6. `user_left`

**Purpose**: Notification when someone leaves the room

```typescript
socket.on("user_left", (data) => {
  console.log("User left:", data.username);
});
```

### 7. `room_users`

**Purpose**: List of users in the room (response to `get_room_users`)

```typescript
socket.on("room_users", (data) => {
  console.log("Room users:", data.users);
  // data structure:
  // { roomId: "room-uuid", users: [{ userId: "user-id", username: "user-name", isOnline: true]
  // }
});
```

### 8. `messages_read`

**Purpose**: Read receipts when someone reads messages

```typescript
socket.on("messages_read", (data) => {
  updateReadStatus(data.userId, data.readAt);
});
```

### 9. `error`

**Purpose**: Socket-level errors

```typescript
socket.on("error", (error) => {
  console.error("Socket error:", error.message);
  showErrorToUser(error.message);
});
```

---

## Frontend Integration Example

```typescript
// Initialize socket with JWT token
const socket = io("https://chat-server-dpo7.onrender.com", {
  auth: {
    token: localStorage.getItem("authToken"),
  },
});

// Join a room after successful HTTP join
const joinRoom = async (roomId: string) => {
  try {
    // First, join via HTTP endpoint
    const response = await fetch(`/api/v1/rooms/${roomId}/join`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      // Then connect via socket for real-time updates
      socket.emit("join_room", { roomId });
    }
  } catch (error) {
    console.error("Failed to join room:", error);
  }
};

// Send message (With max 5 messages in 10 seconds per user per room)
const sendMessage = (roomId: string, content: string) => {
  socket.emit("send_message", { roomId, content });
};

// Listen for messages
socket.on("receive_message", (message) => {
  // Add message to chat UI
  addMessageToChat(message);
});

// Handle typing indicators
let typingTimeout: NodeJS.Timeout;
const handleTyping = (roomId: string) => {
  socket.emit("typing", { roomId, isTyping: true });

  clearTimeout(typingTimeout);
  typingTimeout = setTimeout(() => {
    socket.emit("typing", { roomId, isTyping: false });
  }, 2000);
};
```
