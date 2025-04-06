'use client';

import { useWalletAuth } from '@/hooks/useWalletAuth';
import { useRooms } from '@/hooks/useRooms';
import { CreateRoom } from '@/components/chat/CreateRoom';

export default function CreatePage() {
  const { address, isConnected } = useWalletAuth();
  const { createRoom, isReady, error, isConnecting, reconnect } = useRooms(isConnected);

  return (
    <CreateRoom 
      onCreateRoom={createRoom} 
      userAddress={address!}
      isReady={isReady}
      error={error}
      isConnecting={isConnecting}
      onRetryConnection={reconnect}
    />
  );
}