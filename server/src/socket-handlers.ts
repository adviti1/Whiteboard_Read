import { Server as SocketIOServer, Socket } from 'socket.io';
import { User, Room, DrawingEvent, CursorEvent } from './types';

const rooms = new Map<string, Room>();
const users = new Map<string, User>();

export const setupSocketHandlers = (io: SocketIOServer) => {
  io.on('connection', (socket: Socket) => {
    console.log(`User connected: ${socket.id}`);

    // User joins a room
    socket.on('join-room', (data: { roomId: string; username: string }) => {
      const { roomId, username } = data;
      
      // Create user object
      const user: User = {
        id: socket.id,
        username,
        socketId: socket.id
      };
      
      users.set(socket.id, user);
      
      // Join socket room
      socket.join(roomId);
      
      // Add user to room
      if (!rooms.has(roomId)) {
        rooms.set(roomId, {
          id: roomId,
          users: [],
          drawingData: []
        });
      }
      
      const room = rooms.get(roomId)!;
      room.users.push(user);
      
      // Notify others in room
      socket.to(roomId).emit('user-joined', user);
      
      // Send current room state to new user
      socket.emit('room-state', {
        users: room.users,
        drawingData: room.drawingData
      });
      
      console.log(`User ${username} joined room ${roomId}`);
    });

    // Handle drawing events
    socket.on('drawing-event', (data: DrawingEvent & { roomId: string }) => {
      const user = users.get(socket.id);
      if (!user) return;
      
      const room = rooms.get(data.roomId);
      if (!room) return;
      
      // Store drawing data
      room.drawingData.push(data);
      
      // Broadcast to other users in room
      socket.to(data.roomId).emit('drawing-event', {
        ...data,
        userId: user.id,
        username: user.username
      });
    });

    // Handle cursor movement
    socket.on('cursor-move', (data: CursorEvent & { roomId: string }) => {
      const user = users.get(socket.id);
      if (!user) return;
      
      socket.to(data.roomId).emit('cursor-move', {
        ...data,
        userId: user.id,
        username: user.username
      });
    });

    // Handle undo/redo
    socket.on('undo-redo', (data: { roomId: string; action: 'undo' | 'redo'; canvasData: any }) => {
      const room = rooms.get(data.roomId);
      if (!room) return;
      
      // Update room's drawing data
      room.drawingData = data.canvasData;
      
      // Broadcast to other users
      socket.to(data.roomId).emit('undo-redo', data);
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      const user = users.get(socket.id);
      if (!user) return;
      
      // Remove user from all rooms
      rooms.forEach((room, roomId) => {
        const userIndex = room.users.findIndex(u => u.id === socket.id);
        if (userIndex !== -1) {
          room.users.splice(userIndex, 1);
          socket.to(roomId).emit('user-left', user);
          
          // Clean up empty rooms
          if (room.users.length === 0) {
            rooms.delete(roomId);
          }
        }
      });
      
      users.delete(socket.id);
      console.log(`User disconnected: ${socket.id}`);
    });
  });
};
