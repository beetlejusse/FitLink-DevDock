'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Send } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useWaku } from '@/hooks/useWaku';
import { useWalletAuth } from '@/hooks/useWalletAuth';
import { ChatRoom as ChatRoomType } from '@/types/chat';

interface ChatRoomProps {
  room: ChatRoomType;
}

export function ChatRoom({ room }: ChatRoomProps) {
  const [message, setMessage] = useState('');
  const { messages, sendMessage, isReady, isLoadingHistory } = useWaku(room.id);
  const { address } = useWalletAuth();
  const router = useRouter();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (chatContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
      
      if (isNearBottom) {
        scrollToBottom();
      }
    }
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && address) {
      await sendMessage(address, message);
      setMessage('');
      scrollToBottom();
    }
  };

  if (!isReady) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-xl font-semibold text-gray-700 text-center">
          Connecting to the Waku network...
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md">
      <div className="border-b p-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.push('/chatWTrainer')}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Rooms</span>
          </button>
          <h2 className="text-xl font-semibold text-gray-800">{room.name}</h2>
          <div className="w-24" /> {/* Spacer for alignment */}
        </div>
      </div>

      <div
        ref={chatContainerRef}
        className="p-4 space-y-4 overflow-y-auto"
        style={{ height: 'calc(100vh - 250px)' }}
      >
        {isLoadingHistory && (
          <div className="text-center text-gray-500">
            Loading message history...
          </div>
        )}

        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${msg.sender === address ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[70%] rounded-lg px-4 py-2 ${
                msg.sender === address
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100'
              }`}
            >
              <div className="text-sm font-semibold mb-1">
                {msg.sender === address 
                  ? 'You' 
                  : `${msg.sender.slice(0, 6)}...${msg.sender.slice(-4)}`}
              </div>
              <div>{msg.content}</div>
              <div className="text-xs opacity-75 mt-1">
                {new Date(msg.timestamp).toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSend} className="border-t p-4">
        <div className="flex space-x-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <button
            type="submit"
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-2"
          >
            <Send className="w-4 h-4" />
            <span>Send</span>
          </button>
        </div>
      </form>
    </div>
  );
}
