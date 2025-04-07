"use client"

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, AlertCircle, Info } from 'lucide-react'; // Added Info icon for the warning
import { ChatRoom } from '@/types/chat';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { motion } from "framer-motion";

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
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [creationError, setCreationError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (roomName.trim() && isReady) {
      setIsCreating(true);
      setCreationError(null);
      try {
        const newRoom = await onCreateRoom(roomName, userAddress);
        
        console.log('Created room ID:', newRoom.id); 
        if (!newRoom?.id || typeof newRoom.id !== 'string') {
          throw new Error('Invalid room ID returned');
        }

        setIsCreating(false);
        setIsRedirecting(true);
        
        router.push(`/room/${newRoom.id}`);
      } catch (error) {
        const errorMessage = error instanceof Error 
          ? error.message 
          : 'Failed to create room. Please try again.';
        setCreationError(errorMessage);
        console.error('Failed to create room:', error);
        setIsCreating(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#e8f9ef] to-white py-12 px-4">
      <motion.div initial="hidden" animate="visible" className="container mx-auto max-w-4xl">
        <Card className="rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <button
              onClick={() => router.push('/chatWTrainer')}
              className="flex items-center space-x-2 text-[#0a7c3e] hover:text-[#086a34] cursor-pointer transition-colors duration-300"
              aria-label="Back to Rooms"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Rooms</span>
            </button>
          </div>

          <h2 className="text-2xl font-bold text-[#0a7c3e] mb-3">Create New Chat Room</h2>

          <Alert className="mb-6 border-[#0a7c3e]/30 bg-[#e8f9ef] rounded-lg">
            <Info className="h-5 w-5 text-[#0a7c3e]" />
            <AlertTitle className="font-semibold text-[#0a7c3e]">Decentralized Chat Notice</AlertTitle>
            <AlertDescription className="text-[#0a7c3e]/80">
              We are using Waku protocols for decentralized chat features, which may take some time to load. Sorry for the inconvenience!
            </AlertDescription>
          </Alert>

          {error && (
            <Alert variant="destructive" className="mb-6 border-red-300 bg-red-50 rounded-lg">
              <AlertCircle className="h-5 w-5" />
              <AlertTitle className="font-semibold">Connection Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
              {onRetryConnection && (
                <Button 
                  asChild 
                  variant="outline" 
                  size="sm" 
                  className="gap-1 border-red-500 text-red-500 hover:bg-red-100 rounded-full"
                  onClick={onRetryConnection}
                >
                  Retry
                </Button>
              )}
            </Alert>
          )}

          {creationError && (
            <Alert className="mb-6 border-red-300 bg-red-50 rounded-lg">
              <AlertCircle className="h-5 w-5" />
              <AlertTitle className="font-semibold">Room Creation Failed</AlertTitle>
              <AlertDescription>{creationError}</AlertDescription>
            </Alert>
          )}

          {isConnecting && !error && (
            <div className="flex items-center justify-center space-x-2 text-[#0a7c3e] mb-4">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Connecting to network, Please wait for a moment...</span>
            </div>
          )}

          {isRedirecting && (
            <div className="flex items-center justify-center space-x-2 text-[#0a7c3e] mb-4">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Redirecting to your room...</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="roomName" className="text-[#0a7c3e] mb-3 font-semibold">Room Name</Label>
              <Input
                id="roomName"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                className="w-full px-4 py-2 border border-[#0a7c3e]/20 focus:border-[#0a7c3e] focus:ring-[#0a7c3e] rounded-lg"
                placeholder="Enter room name..."
                required
                disabled={!isReady || isCreating || isRedirecting}
                aria-disabled={!isReady || isCreating || isRedirecting}
              />
            </div>

            <Button 
              type="submit" 
              className="w-full bg-[#0a7c3e] hover:bg-[#086a34] text-white rounded-lg py-3 text-lg font-semibold transition-colors duration-300 cursor-pointer" 
              disabled={!isReady || isCreating || isRedirecting || !roomName.trim()}
            >
              {isCreating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Creating Room...
                </>
              ) : isRedirecting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Redirecting...
                </>
              ) : (
                'Create Room'
              )}
            </Button>
          </form>
        </Card>
      </motion.div>
    </div>
  );
}