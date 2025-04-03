export interface ChatMessage {
  timestamp: number;
  sender: string;
  content: string;
}

export interface MessageStore {
  messages: ChatMessage[];
  maxMessages: number;
  addMessage: (message: ChatMessage) => void;
  getMessages: () => ChatMessage[];
  clear: () => void;
}