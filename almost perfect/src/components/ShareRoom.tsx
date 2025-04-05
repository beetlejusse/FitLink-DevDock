import React, { useState } from 'react';
import { Copy, Check, Link as LinkIcon, Hash } from 'lucide-react';
import { ChatRoom } from '../types/chat';

interface ShareRoomProps {
  room: ChatRoom;
  onClose: () => void;
}

export function ShareRoom({ room, onClose }: ShareRoomProps) {
  const [copied, setCopied] = useState<'link' | 'code' | null>(null);
  const shareUrl = `${window.location.origin}/room/${room.id}`;

  const copyToClipboard = async (text: string, type: 'link' | 'code') => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      setTimeout(() => setCopied(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h2 className="text-xl font-semibold mb-4">Share Room</h2>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Room Link</label>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="flex-1 px-3 py-2 border rounded-lg bg-gray-50 text-sm"
              />
              <button
                onClick={() => copyToClipboard(shareUrl, 'link')}
                className="p-2 text-gray-600 hover:text-gray-900"
              >
                {copied === 'link' ? <Check className="w-5 h-5" /> : <LinkIcon className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Room Code</label>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                readOnly
                value={room.code}
                className="flex-1 px-3 py-2 border rounded-lg bg-gray-50 text-sm font-mono"
              />
              <button
                onClick={() => copyToClipboard(room.code, 'code')}
                className="p-2 text-gray-600 hover:text-gray-900"
              >
                {copied === 'code' ? <Check className="w-5 h-5" /> : <Hash className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}