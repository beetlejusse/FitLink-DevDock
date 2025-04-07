export interface ChatMessage {
  timestamp: number;
  sender: string;
  content: string;
  // roomId: string;
}

export interface ChatRoom {
  id: string;
  name: string;
  creator: string;
  createdAt: number;
  code: string;
  lastActivity: number;
  participantCount: number;
  isPublic: boolean;
}

export interface MessageStore {
  messages: ChatMessage[];
  maxMessages: number;
  addMessage: (message: ChatMessage) => void;
  getMessages: () => ChatMessage[];
  clear: () => void;
}

export interface RoomEvent {
  type: 'create' | 'update' | 'delete';
  timestamp: number;
  room: ChatRoom;
}
