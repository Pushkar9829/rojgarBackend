const { Server } = require('socket.io');
const { verifyToken } = require('../utils/jwtToken');
const User = require('../models/User');

let io;

/**
 * Initialize Socket.IO with JWT auth and rooms.
 * @param {import('http').Server} httpServer - HTTP server (from createServer(app))
 * @returns {import('socket.io').Server}
 */
function init(httpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CORS_ORIGIN || '*',
      methods: ['GET', 'POST'],
    },
    path: '/socket.io',
  });

  io.use(async (socket, next) => {
    let token =
      socket.handshake.auth?.token ||
      socket.handshake.query?.token ||
      socket.handshake.headers?.authorization?.replace('Bearer ', '');

    if (!token) {
      return next(new Error('Authentication required'));
    }

    try {
      const decoded = verifyToken(token);
      const user = await User.findById(decoded.userId).select('_id role isActive');
      if (!user || !user.isActive) {
        return next(new Error('User not found or inactive'));
      }
      socket.userId = user._id.toString();
      socket.role = user.role;
      next();
    } catch (err) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const uid = socket.userId;
    const room = `user:${uid}`;
    socket.join(room);
    if (socket.role === 'ADMIN') {
      socket.join('admin');
    }
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Socket] ${socket.role} connected: ${uid}`);
    }
    socket.on('disconnect', () => {
      if (process.env.NODE_ENV === 'development') {
        console.log(`[Socket] disconnected: ${uid}`);
      }
    });
  });

  return io;
}

/**
 * Get Socket.IO server. Must call init() first.
 */
function getIO() {
  if (!io) throw new Error('Socket.IO not initialized. Call init(httpServer) first.');
  return io;
}

module.exports = { init, getIO };
