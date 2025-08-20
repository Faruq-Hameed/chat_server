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