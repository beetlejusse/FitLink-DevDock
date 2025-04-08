import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, Wallet, Trash2, History } from 'lucide-react';
import { useWaku } from './hooks/useWaku';
import { useWalletAuth } from './hooks/useWalletAuth';

function App() {
  const [message, setMessage] = useState('');
  const { messages, sendMessage, clearHistory, isReady, isLoadingHistory } = useWaku();
  const { address, isConnected, connect, disconnect, error, isConnecting } = useWalletAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    // Only auto-scroll if user is near the bottom
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
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl font-semibold text-gray-700">
          Connecting to the Waku network...
        </div>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md w-96">
          <div className="flex items-center justify-center mb-6">
            <MessageCircle className="w-12 h-12 text-blue-500" />
          </div>
          <h1 className="text-2xl font-bold text-center mb-6">
            Decentralized Chat
          </h1>
          {error && (
            <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-lg text-sm">
              {error}
            </div>
          )}
          <button
            onClick={connect}
            disabled={isConnecting}
            className="w-full flex items-center justify-center space-x-2 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Wallet className="w-5 h-5" />
            <span>{isConnecting ? 'Connecting...' : 'Connect Wallet'}</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <MessageCircle className="w-6 h-6 text-blue-500" />
            <h1 className="text-xl font-semibold">Decentralized Chat</h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-600">
              {`${address.slice(0, 6)}...${address.slice(-4)}`}
            </div>
            <button
              onClick={clearHistory}
              className="text-sm text-gray-500 hover:text-gray-600 flex items-center space-x-1"
              title="Clear message history"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => disconnect()}
              className="text-sm text-red-500 hover:text-red-600"
            >
              Disconnect
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 max-w-4xl w-full mx-auto p-4 flex flex-col">
        <div 
          ref={chatContainerRef}
          className="flex-1 bg-white rounded-lg shadow-md p-4 mb-4 overflow-y-auto"
          style={{ maxHeight: 'calc(100vh - 220px)' }}
        >
          {isLoadingHistory && (
            <div className="flex items-center justify-center space-x-2 text-gray-500 mb-4">
              <History className="w-5 h-5 animate-spin" />
              <span>Loading message history...</span>
            </div>
          )}
          <div className="space-y-4">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${
                  msg.sender === address ? 'justify-end' : 'justify-start'
                }`}
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
        </div>

        <form onSubmit={handleSend} className="flex space-x-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-2"
          >
            <Send className="w-4 h-4" />
            <span>Send</span>
          </button>
        </form>
      </div>
    </div>
  );
}

export default App;