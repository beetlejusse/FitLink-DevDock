"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  MessageCircle,
  Send,
  Wallet,
  Trash2,
  History,
  Info,
} from "lucide-react";
import { useWaku } from "@/hooks/useWaku";
import { useWalletAuth } from "@/hooks/useWalletAuth";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

function App() {
  const [message, setMessage] = useState("");
  const { messages, sendMessage, clearHistory, isReady, isLoadingHistory } = useWaku();
  const { address, isConnected, connect, disconnect, error, isConnecting } = useWalletAuth();
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
      setMessage("");
      scrollToBottom();
    }
  };

  if (!isReady) {
    return (
      <div className="min-h-screen bg-green-50 flex items-center justify-center">
        <div className="text-xl font-semibold text-green-700">
          Connecting to the Waku network...
        </div>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-green-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md w-96">
          <div className="flex items-center justify-center mb-6">
            <MessageCircle className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-center mb-6 text-green-700">
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
            className="w-full flex items-center justify-center space-x-2 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Wallet className="w-5 h-5" />
            <span>{isConnecting ? "Connecting..." : "Connect Wallet"}</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-green-50 flex flex-col p-4">
      <div className="max-w-4xl w-full mx-auto">
        <div className="flex items-center space-x-4 mb-6">
          <Alert className="border-[#0a7c3e]/30 bg-[#e8f9ef] items-center rounded-lg w-full">
            <Info className="h-5 w-5 text-[#0a7c3e]" />
            <AlertTitle className="font-semibold text-[#0a7c3e]">
              Decentralized Chat Notice
            </AlertTitle>
            <AlertDescription className="text-[#0a7c3e]/80">
              We are using Waku protocols for decentralized chat features, which may take some time to load.
            </AlertDescription>
          </Alert>
          <div className="text-sm text-green-800 whitespace-nowrap">
            {`${address?.slice(0, 6)}...${address?.slice(-4)}`}
          </div>
          <button
            onClick={clearHistory}
            className="text-sm text-green-600 hover:text-green-800 flex items-center space-x-1"
            title="Clear message history"
          >
            <Trash2 className="w-4 h-4 cursor-pointer" />
          </button>
        </div>

        <div
          ref={chatContainerRef}
          className="bg-white rounded-xl shadow-md p-6 overflow-y-auto mb-4 h-[60vh] sm:h-[65vh] flex flex-col"
        >
          {isLoadingHistory ? (
            <div className="flex items-center justify-center space-x-2 text-gray-500 mb-4">
              <History className="w-5 h-5 animate-spin" />
              <span>Loading message history...</span>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-green-800/80 text-center">
              <MessageCircle className="w-12 h-12 mb-3 opacity-80" />
              <p className="text-lg font-medium">Start chatting here ✨</p>
              <p className="text-sm text-green-700/70">Say hello to get the conversation going!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${
                    msg.sender === address ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[70%] px-4 py-2 rounded-xl shadow ${
                      msg.sender === address
                        ? "bg-green-600 text-white"
                        : "bg-green-100 text-green-900"
                    }`}
                  >
                    <div className="text-sm font-semibold mb-1">
                      {msg.sender === address
                        ? "You"
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
          )}
        </div>

        <form onSubmit={handleSend} className="flex space-x-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 px-4 py-2 border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <button
            type="submit"
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2 cursor-pointer"
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
