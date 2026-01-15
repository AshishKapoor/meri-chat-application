# Meri Chat App

A real-time multi-window chat application built with Express.js, Socket.IO, MongoDB, and React. Supports guest users, channel creation/joining, admin features, and persistent message history with automatic cleanup.

<img width="1800" height="1045" alt="Screenshot 2026-01-15 at 12 05 31 PM" src="https://github.com/user-attachments/assets/0b5e0d32-527b-4433-acb7-168521081206" />

## ✨ Features

- **Real-time messaging** - Instant message delivery using Socket.IO
- **Multi-window support** - Chat across multiple browser tabs/windows
- **Guest authentication** - No registration required, session-based users
- **Channel management** - Create and join channels dynamically
- **Admin features** - Admin login with channel deletion permissions
- **Message persistence** - MongoDB storage with 10-day TTL auto-expiry
- **Responsive design** - Works on desktop and mobile
- **System notifications** - Join/leave notifications and admin badges
- **Docker support** - Easy deployment with MongoDB container

## 🛠 Tech Stack

### Backend

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **Socket.IO** - Real-time bidirectional communication
- **MongoDB** - Document database
- **Mongoose** - ODM for MongoDB
- **TypeScript** - Type safety

### Frontend

- **React** - UI library
- **Vite** - Build tool and dev server
- **TypeScript** - Type safety
- **Socket.IO Client** - Real-time communication
- **Day.js** - Date/time formatting

### DevOps

- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration
- **Mongo Express** - Database admin UI

## 📋 Prerequisites

- **Node.js** 18+ and npm/pnpm
- **Docker** and Docker Compose
- **Git** for cloning the repository

## 🚀 Quick Start

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/meri-chat-app.git
cd meri-chat-app
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Start the application

```bash
pnpm run dev
```

This command will:

- Start MongoDB container (if not running)
- Wait for database to be healthy
- Start the backend server on port 4000
- Start the frontend dev server on port 5173

### 4. Open your browser

Navigate to `http://localhost:5173` to start chatting!

## 📖 Usage

### For Users

1. **Register as guest** - Enter a username when prompted
2. **Create a channel** - Click "Create Channel" and optionally use "Suggest" for random names
3. **Join channels** - Click on any channel in the sidebar to join
4. **Start chatting** - Send messages that appear instantly to all channel members
5. **Multi-window** - Open multiple tabs to chat from different "users"

### For Admins

1. **Login as admin** - Click "Admin" button and use credentials:
   - Email: `admin@admin.com`
   - Password: `admin`
2. **Delete channels** - Admin badge appears, can delete any channel
3. **Channel management** - Full control over channel lifecycle

### Database Access

- **Mongo Express UI**: `http://localhost:8081`
- **MongoDB**: `mongodb://root:example@localhost:27017/chatapp`

## 🏗 Architecture

```
meri-chat-app/
├── server/                 # Backend Express + Socket.IO server
│   ├── src/
│   │   ├── handlers/       # Socket event handlers
│   │   ├── models/         # Mongoose schemas
│   │   ├── types/          # TypeScript interfaces
│   │   ├── utils/          # Helper functions
│   │   ├── config.ts       # Environment configuration
│   │   ├── db.ts           # Database connection
│   │   └── index.ts        # Server entry point
│   └── package.json
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── context/        # Socket context provider
│   │   ├── hooks/          # Custom React hooks
│   │   ├── types/          # Shared TypeScript types
│   │   ├── styles.css      # Global styles
│   │   └── main.tsx        # React entry point
│   ├── index.html          # HTML template
│   └── vite.config.ts      # Vite configuration
├── docker-compose.yml      # Docker services
├── scripts/dev.sh          # Development startup script
└── package.json            # Workspace configuration
```

## 🔌 API Documentation

### Socket.IO Events

#### Client → Server Events

| Event                | Payload                                                           | Description                         |
| -------------------- | ----------------------------------------------------------------- | ----------------------------------- |
| `register`           | `{ username: string, visitorId: string }`                         | Register as guest user              |
| `adminLogin`         | `{ email: string, password: string, visitorId: string }`          | Login as admin                      |
| `getChannels`        | -                                                                 | Request channel list                |
| `suggestChannelName` | -                                                                 | Get random channel name suggestion  |
| `createChannel`      | `{ name: string, visitorId: string }`                             | Create new channel                  |
| `joinChannel`        | `{ channelId: string, visitorId: string }`                        | Join a channel                      |
| `leaveChannel`       | `{ channelId: string }`                                           | Leave current channel               |
| `sendMessage`        | `{ channelId: string, content: string, senderVisitorId: string }` | Send message                        |
| `deleteChannel`      | `{ channelId: string, visitorId: string }`                        | Delete channel (creator/admin only) |

#### Server → Client Events

| Event            | Payload     | Description            |
| ---------------- | ----------- | ---------------------- |
| `channels`       | `Channel[]` | Updated channel list   |
| `message`        | `Message`   | New message in channel |
| `system`         | `Message`   | System notification    |
| `channelDeleted` | `string`    | Channel was deleted    |
| `error`          | `string`    | Error message          |

### REST Endpoints

| Method | Endpoint  | Description           |
| ------ | --------- | --------------------- |
| GET    | `/health` | Health check endpoint |

## 🧪 Testing

### Automated E2E Testing

```bash
# Run automated test with two simulated users
pnpm add -D socket.io-client
NODE_PATH="$(pwd)/node_modules" node /tmp/test-chat.js
```

### Manual Testing

1. **Browser testing**: Open `test-chat.html` in multiple tabs
2. **React app**: Use the main application in multiple windows
3. **Database**: Check Mongo Express at `http://localhost:8081`

## 🔧 Development

### Available Scripts

```bash
# Install dependencies
pnpm install

# Start development servers
pnpm run dev

# Start only backend
pnpm run dev:server

# Start only frontend
pnpm run dev:client

# Start Docker services
pnpm run docker:up

# Stop Docker services
pnpm run docker:down
```

### Environment Variables

#### Backend (.env)

```env
MONGODB_URI=mongodb://root:example@localhost:27017/chatapp?authSource=admin
PORT=4000
ADMIN_EMAIL=admin@admin.com
ADMIN_PASSWORD=admin
CLIENT_ORIGIN=http://localhost:5173
```

#### Frontend (.env)

```env
VITE_API_URL=http://localhost:4000
```

### Code Quality

- **TypeScript**: Strict type checking enabled
- **ESLint**: Code linting (can be added)
- **Prettier**: Code formatting (can be added)

## 🚀 Deployment

### Docker Deployment

```bash
# Build and run with Docker Compose
docker compose up --build

# Run in background
docker compose up -d --build
```

### Production Build

```bash
# Build frontend
cd client && pnpm run build

# Build backend
cd ../server && pnpm run build

# Start production server
cd ../server && pnpm start
```

### Environment Setup

1. Set production MongoDB URI
2. Configure CORS origins
3. Set secure admin credentials
4. Enable HTTPS in production

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Development Guidelines

- Use TypeScript for all new code
- Follow existing code style and patterns
- Add tests for new features
- Update documentation as needed
- Ensure cross-browser compatibility

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Socket.IO](https://socket.io/) for real-time communication
- [MongoDB](https://www.mongodb.com/) for data persistence
- [React](https://reactjs.org/) for the frontend framework
- [Express.js](https://expressjs.com/) for the backend framework

## 📞 Support

If you have any questions or issues:

- Open an issue on GitHub
- Check the troubleshooting section below

### Troubleshooting

**Common Issues:**

1. **"Connection refused" error**

   - Ensure Docker services are running: `pnpm run docker:up`
   - Wait for MongoDB to be healthy (check logs)

2. **Messages not appearing in other windows**

   - Check browser console for errors
   - Ensure both windows are in the same channel
   - Verify visitorId uniqueness (check console logs)

3. **Admin login not working**

   - Use exact credentials: `admin@admin.com` / `admin`
   - Check server logs for authentication errors

4. **Build failures**
   - Clear node_modules: `rm -rf node_modules && pnpm install`
   - Check Node.js version (18+ required)

---

**Happy chatting! 🎉**
