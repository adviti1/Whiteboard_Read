export interface User {
  id: string;
  username: string;
  socketId: string;
}

export interface Room {
  id: string;
  users: User[];
  drawingData: any[];
}

export interface DrawingEvent {
  type: 'path:created' | 'object:modified' | 'object:removed';
  data: any;
  userId: string;
}

export interface CursorEvent {
  x: number;
  y: number;
  userId: string;
  username: string;
}
