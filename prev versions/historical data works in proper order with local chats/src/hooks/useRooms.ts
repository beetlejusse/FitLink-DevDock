import { useState, useEffect } from 'react';
import { ChatRoom } from '../types/chat';

const STORAGE_KEY = 'waku_chat_rooms';

export function useRooms() {
  const [rooms, setRooms] = useState<ChatRoom[]>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(rooms));
  }, [rooms]);

  const createRoom = (room: ChatRoom) => {
    setRooms(prev => [...prev, room]);
  };

  const getRoomById = (id: string) => {
    return rooms.find(room => room.id === id);
  };

  return {
    rooms,
    createRoom,
    getRoomById,
  };
}