import React from 'react';
import { Link } from '@tanstack/react-router';
import { MessageSquare, Plus, Loader2 } from 'lucide-react';
import { ChatRoom } from '../types/chat';

interface RoomListProps {
  rooms: ChatRoom[];
  isLoading?: boolean;
}

export function RoomList({ rooms, isLoading = false }: RoomListProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Chat Rooms</h2>
        <Link
          to="/create"
          className="flex items-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Create Room</span>
        </Link>
      </div>
      
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          <span className="ml-3 text-gray-600">Loading rooms...</span>
        </div>
      ) : rooms.length === 0 ? (
        <div className="text-center py-8">
          <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No chat rooms available</p>
          <p className="text-sm text-gray-400 mt-2">Create a new room to start chatting!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {rooms.map((room) => (
            <Link
              key={room.id}
              to="/room/$roomId"
              params={{ roomId: room.id }}
              className="block p-4 border rounded-lg hover:border-blue-500 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-800">{room.name}</h3>
                  <p className="text-sm text-gray-500">
                    Created by: {room.creator.slice(0, 6)}...{room.creator.slice(-4)}
                  </p>
                </div>
                <MessageSquare className="w-5 h-5 text-gray-400" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}