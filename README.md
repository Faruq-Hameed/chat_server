chat-backend/
│── src/
│   ├── config/
│   │   └── db.ts              # Database connection (Sequelize or Prisma)
│   ├── controllers/           # Route handlers (auth, rooms, messages)
│   ├── middleware/            # JWT auth, rate limiter, etc.
│   ├── models/                # Sequelize/Prisma models (users, rooms, messages)
│   ├── routes/                # Express routes (auth, rooms, chat)
│   ├── sockets/               # Socket.IO event handlers
│   │   └── chat.socket.ts
│   ├── utils/                 # Helper functions (token, validators)
│   ├── app.ts                 # Express app setup
│   └── server.ts              # Entry point (http + socket.io)
├── docker-compose.yml         # Docker setup for MySQL + backend
├── Dockerfile                 # Backend container
├── package.json
├── tsconfig.json
└── .env                       # Environment variables


UUIDs as IDs instead of auto-increment integers. In fact, for a chat app where you’ll be sharing room IDs or message IDs with clients, UUIDs are safer and easier (avoids predictable sequential IDs).

For room, only the person that created it can create an invite token and also fectch the invite token. It can be extended to allow admin but I didnt consider that during this implemnteaion. Also once arow is created, the creator authomatically join the room.

# Socket.IO Events Documentation

## Client-to-Server Events (Emit)

### 1. `join_room`
**Purpose**: Join a chat room to receive real-time updates
```typescript
socket.emit("join_room", { roomId: "room-uuid" });
```

### 2. `send_message`
**Purpose**: Send a message to a room
```typescript
socket.emit("send_message", {
  roomId: "room-uuid",
  content: "Hello everyone!",
  messageType: "text" // optional, defaults to "text"
});
```

### 3. `typing`
**Purpose**: Indicate user is typing
```typescript
// Start typing
socket.emit("typing", {
  roomId: "room-uuid",
  isTyping: true
});

// Stop typing
socket.emit("typing", {
  roomId: "room-uuid",
  isTyping: false
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
  console.log("New message:", data);
  // data structure:
  // {
  //   id: "message-id",
  //   roomId: "room-uuid",
  //   userId: "user-id",
  //   username: "sender-name",
  //   content: "message content",
  //   messageType: "text",
  //   createdAt: "2023-...",
  //   timestamp: "2023-..."
  // }
});
```

### 2. `user_joined`
**Purpose**: Notification when someone joins the current room
```typescript
socket.on("user_joined", (data) => {
  console.log("User joined:", data);
  // data structure:
  // {
  //   userId: "user-id",
  //   username: "user-name",
  //   roomId: "room-uuid",
  //   timestamp: "2023-..."
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
  // {
  //   userId: "user-id",
  //   username: "user-name",
  //   roomId: "room-uuid",
  //   isTyping: true/false,
  //   timestamp: "2023-..."
  // }
});
```

### 4. `user_status`
**Purpose**: Online/offline status of users
```typescript
socket.on("user_status", (data) => {
  updateUserStatus(data.userId, data.status);
  // data structure:
  // {
  //   userId: "user-id",
  //   username: "user-name",
  //   status: "online" | "offline",
  //   timestamp: "2023-..."
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
  // {
  //   roomId: "room-uuid",
  //   users: [
  //     {
  //       userId: "user-id",
  //       username: "user-name",
  //       isOnline: true,
  //       role: "member" | "admin"
  //     }
  //   ]
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
const socket = io('http://localhost:5000', {
  auth: {
    token: localStorage.getItem('authToken')
  }
});

// Join a room after successful HTTP join
const joinRoom = async (roomId: string) => {
  try {
    // First, join via HTTP endpoint
    const response = await fetch(`/api/rooms/${roomId}/join`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      // Then connect via socket for real-time updates
      socket.emit('join_room', { roomId });
    }
  } catch (error) {
    console.error('Failed to join room:', error);
  }
};

// Send message
const sendMessage = (roomId: string, content: string) => {
  socket.emit('send_message', { roomId, content });
};

// Listen for messages
socket.on('receive_message', (message) => {
  // Add message to chat UI
  addMessageToChat(message);
});

// Handle typing indicators
let typingTimeout: NodeJS.Timeout;
const handleTyping = (roomId: string) => {
  socket.emit('typing', { roomId, isTyping: true });
  
  clearTimeout(typingTimeout);
  typingTimeout = setTimeout(() => {
    socket.emit('typing', { roomId, isTyping: false });
  }, 2000);
};
```
