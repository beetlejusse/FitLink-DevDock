export interface ChatMessage {
  timestamp: number;
  sender: string;
  content: string;
  roomId: string;
}

export interface ChatRoom {
  id: string;
  name: string;
  creator: string;
  createdAt: number;
}

export interface MessageStore {
  messages: ChatMessage[];
  maxMessages: number;
  addMessage: (message: ChatMessage) => void;
  getMessages: () => ChatMessage[];
  clear: () => void;
}