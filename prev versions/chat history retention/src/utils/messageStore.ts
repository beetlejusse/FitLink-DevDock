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
        return messages.slice(-this.maxMessages);
      }
    } catch (error) {
      console.error('Failed to load messages from storage:', error);
    }
    return [];
  }

  private saveMessages(): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.messages));
    } catch (error) {
      console.error('Failed to save messages to storage:', error);
    }
  }

  addMessage(message: ChatMessage): void {
    this.messages.push(message);
    if (this.messages.length > this.maxMessages) {
      this.messages = this.messages.slice(-this.maxMessages);
    }
    this.saveMessages();
  }

  getMessages(): ChatMessage[] {
    return [...this.messages];
  }

  clear(): void {
    this.messages = [];
    this.saveMessages();
  }
}