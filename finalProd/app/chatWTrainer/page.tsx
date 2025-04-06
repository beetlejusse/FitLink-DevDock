"use client"

import { useWalletAuth } from '@/hooks/useWalletAuth';
import { useRooms } from '@/hooks/useRooms';
import { RoomList } from '@/components/chat/RoomList';
import { JoinByCode } from '@/components/chat/JoinByCode';
import { ShareRoom } from '@/components/chat/ShareRoom';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { MessageCircle } from "lucide-react";
import Link from 'next/link';

export default function ChatWTrainer() {
  const { isConnected } = useWalletAuth();
  const { rooms, isLoadingRooms } = useRooms(isConnected);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#e8f9ef] to-white py-12 px-4">
      <motion.div initial="hidden" animate="visible" className="container mx-auto max-w-5xl">
        <div className="mb-8 text-center md:text-left">
          <h1 className="text-3xl md:text-4xl font-bold mb-3 text-[#0a7c3e]">Chat with Your Trainer</h1>
          <p className="text-[#2d6a4f]">Stay connected with your fitness community.</p>
        </div>

        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              {/* <JoinByCode />
              <ShareRoom /> */}
            </div>
          </div>
          
          <div className="rounded-lg border border-[#0a7c3e]/10 bg-white shadow-sm p-6">
            <RoomList rooms={rooms} isLoading={isLoadingRooms} />
          </div>
        </div>
      </motion.div>
    </div>
  );
}
