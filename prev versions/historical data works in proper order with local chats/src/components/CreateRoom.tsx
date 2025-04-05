import React, { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { ArrowLeft } from 'lucide-react';
import { ChatRoom } from '../types/chat';

interface CreateRoomProps {
  onCreateRoom: (room: ChatRoom) => void;
  userAddress: string;
}

export function CreateRoom({ onCreateRoom, userAddress }: CreateRoomProps) {
  const [roomName, setRoomName] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (roomName.trim()) {
      const newRoom: ChatRoom = {
        id: crypto.randomUUID(),
        name: roomName.trim(),
        creator: userAddress,
        createdAt: Date.now(),
      };
      
      onCreateRoom(newRoom);
      navigate({ to: '/room/$roomId', params: { roomId: newRoom.id } });
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <button
        onClick={() => navigate({ to: '/' })}
        className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 mb-6"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Back to Rooms</span>
      </button>

      <h2 className="text-2xl font-bold text-gray-800 mb-6">Create New Chat Room</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="roomName" className="block text-sm font-medium text-gray-700 mb-1">
            Room Name
          </label>
          <input
            type="text"
            id="roomName"
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter room name..."
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors"
        >
          Create Room
        </button>
      </form>
    </div>
  );
}