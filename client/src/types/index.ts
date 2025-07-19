export interface User {
  id: string;
  username: string;
  firstName?: string;
  lastName?: string;
}

export interface WhiteboardSession {
  id: string;
  name: string;
  createdBy: string;
  createdAt: Date;
  users: User[];
}

export interface DrawingEvent {
  type: 'draw' | 'erase' | 'clear';
  data: any;
  userId: string;
  sessionId: string;
}

export interface ImagePrediction {
  label: string;
  confidence: number;
}

export interface CursorPosition {
  x: number;
  y: number;
  userId: string;
  username: string;
}
