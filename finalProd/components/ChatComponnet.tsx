// components/ChatAssistant.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, X } from "lucide-react";

interface Message {
  sender: "user" | "bot";
  text: string;
}

const ChatAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<null | HTMLDivElement>(null);
  
  // Generate a random user ID for this session
  const [userId] = useState(`user-${Math.random().toString(36).substring(2, 9)}`);

  // Scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Add initial greeting when chat is opened
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          sender: "bot",
          text: "Hi there! I'm your FitLink assistant. How can I help with your fitness journey today?",
        },
      ]);
    }
  }, [isOpen, messages.length]);

  const sendMessage = async () => {
    if (input.trim() === "") return;

    const userMessage = { sender: "user" as const, text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: input,
          userId: userId,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: data.response },
      ]);
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: "Sorry, I encountered an error. Please try again later.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5, y: 100, x: 50 }}
            animate={{ opacity: 1, scale: 1, y: -20, x: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: 100, x: 50 }}
            transition={{ 
              type: "spring", 
              stiffness: 300, 
              damping: 25,
              mass: 0.8
            }}
            className="absolute bottom-16 right-0 mb-4"
            style={{ 
              transformOrigin: "bottom right",
              boxShadow: "0 10px 25px -5px rgba(10, 124, 62, 0.3), 0 8px 10px -6px rgba(10, 124, 62, 0.2)"
            }}
          >
            <div className="flex flex-col h-[450px] w-[380px] border border-green-100 rounded-2xl bg-white overflow-hidden">
              <div className="p-4 border-b bg-[#0a7c3e] text-white rounded-t-2xl flex justify-between items-center">
                <h2 className="font-bold text-lg">FitLink Assistant</h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-white hover:text-gray-200 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#f9fffc]">
                {messages.map((msg, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 * (index % 3) }}
                    className={`flex ${
                      msg.sender === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[80%] p-3 rounded-2xl ${
                        msg.sender === "user"
                          ? "bg-[#0a7c3e] text-white rounded-br-none shadow-sm"
                          : "bg-[#e8f9ef] text-gray-800 rounded-bl-none shadow-sm"
                      }`}
                    >
                      {msg.text}
                    </div>
                  </motion.div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-[#e8f9ef] p-3 rounded-2xl rounded-bl-none shadow-sm">
                      <div className="flex space-x-2">
                        <motion.div 
                          className="w-2.5 h-2.5 bg-[#0a7c3e] rounded-full"
                          animate={{ y: [0, -6, 0] }}
                          transition={{ duration: 0.6, repeat: Infinity, ease: "easeInOut" }}
                        />
                        <motion.div 
                          className="w-2.5 h-2.5 bg-[#0a7c3e] rounded-full"
                          animate={{ y: [0, -6, 0] }}
                          transition={{ duration: 0.6, repeat: Infinity, ease: "easeInOut", delay: 0.15 }}
                        />
                        <motion.div 
                          className="w-2.5 h-2.5 bg-[#0a7c3e] rounded-full"
                          animate={{ y: [0, -6, 0] }}
                          transition={{ duration: 0.6, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
                        />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="p-4 border-t border-green-100 bg-white">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                    placeholder="Ask about workouts, nutrition, or goals..."
                    className="flex-1 p-3 border border-green-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0a7c3e] focus:border-transparent"
                  />
                  <motion.button
                    onClick={sendMessage}
                    disabled={isLoading}
                    className="bg-[#0a7c3e] text-white p-3 rounded-xl hover:bg-[#086a34] transition-colors disabled:opacity-70"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Send
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-[#0a7c3e] text-white rounded-full w-16 h-16 flex items-center justify-center shadow-lg hover:bg-[#086a34] transition-colors"
        whileHover={{ scale: 1.05, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
        whileTap={{ scale: 0.95 }}
        initial={{ scale: 0, rotate: 180 }}
        animate={{ 
          scale: 1, 
          rotate: isOpen ? 180 : 0,
          y: [0, -6, 0],
        }}
        transition={{
          type: "spring",
          stiffness: 260,
          damping: 20,
          y: {
            duration: 2,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut",
          }
        }}
      >
        {isOpen ? (
          <X size={28} />
        ) : (
          <MessageSquare size={28} />
        )}
      </motion.button>
    </div>
  );
};

export default ChatAssistant;
