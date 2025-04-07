import React, { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import { ChatRoom } from '../types/chat';

interface CreateRoomProps {
  onCreateRoom: (name: string, userAddress: string) => Promise<ChatRoom>;
  userAddress: string;
  isReady?: boolean;
  error?: string | null;
  isConnecting?: boolean;
  onRetryConnection?: () => void;
}

export function CreateRoom({ 
  onCreateRoom, 
  userAddress, 
  isReady = false,
  error = null,
  isConnecting = false,
  onRetryConnection 
}: CreateRoomProps) {
  const [roomName, setRoomName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (roomName.trim() && isReady) {
      setIsCreating(true);
      try {
        const newRoom = await onCreateRoom(roomName, userAddress);
        navigate({ to: '/room/$roomId', params: { roomId: newRoom.id } });
      } catch (error) {
        console.error('Failed to create room:', error);
      } finally {
        setIsCreating(false);
      }
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

      {error && (
        <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-4 rounded-lg mb-4">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <div className="flex-1">
            <p className="font-medium">Connection Error</p>
            <p className="text-sm">{error}</p>
          </div>
          {onRetryConnection && (
            <button
              onClick={onRetryConnection}
              className="px-3 py-1 text-sm bg-red-100 hover:bg-red-200 rounded-md transition-colors"
            >
              Retry
            </button>
          )}
        </div>
      )}

      {isConnecting && !error && (
        <div className="flex items-center justify-center space-x-2 text-blue-600 mb-4">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Connecting to network...</span>
        </div>
      )}

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
            disabled={!isReady || isCreating}
          />
        </div>

        <button
          type="submit"
          disabled={!isReady || isCreating || !roomName.trim()}
          className={`w-full flex items-center justify-center py-2 rounded-lg transition-colors ${
            isReady && !isCreating && roomName.trim()
              ? 'bg-blue-500 text-white hover:bg-blue-600'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {isCreating ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
              Creating Room...
            </>
          ) : (
            'Create Room'
          )}
        </button>
      </form>
    </div>
  );
}