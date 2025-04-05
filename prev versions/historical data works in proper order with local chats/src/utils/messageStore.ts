import { ChatMessage } from '../types/chat';

export class LocalMessageStore {
  private readonly storageKey = 'waku_messages';
  private readonly maxMessages: number;
  private messages: ChatMessage[];

  constructor(maxMessages: number = 100) {
    this.maxMessages = maxMessages;
    this.messages = this.loadMessages();
  }

  private loadMessages(): ChatMessage[] {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const messages = JSON.parse(stored) as ChatMessage[];
        // Sort messages by timestamp in descending order (newest first)
        messages.sort((a, b) => b.timestamp - a.timestamp);
        // Take the most recent maxMessages
        return messages.slice(0, this.maxMessages);
      }
    } catch (error) {
      console.error('Failed to load messages from storage:', error);
    }
    return [];
  }

  private saveMessages(): void {
    try {
      // Sort messages by timestamp before saving
      this.messages.sort((a, b) => b.timestamp - a.timestamp);
      // Keep only the most recent messages
      this.messages = this.messages.slice(0, this.maxMessages);
      localStorage.setItem(this.storageKey, JSON.stringify(this.messages));
    } catch (error) {
      console.error('Failed to save messages to storage:', error);
    }
  }

  addMessage(message: ChatMessage): void {
    this.messages.push(message);
    // Sort and trim messages whenever we add a new one
    this.messages.sort((a, b) => b.timestamp - a.timestamp);
    this.messages = this.messages.slice(0, this.maxMessages);
    this.saveMessages();
  }

  getMessages(): ChatMessage[] {
    // Return messages sorted by timestamp in ascending order for display
    return [...this.messages].sort((a, b) => a.timestamp - b.timestamp);
  }

  clear(): void {
    this.messages = [];
    this.saveMessages();
  }
}