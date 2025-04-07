import React from 'react';
import { RouterProvider, Router, Route, RootRoute, Outlet } from '@tanstack/react-router';
import { MessageCircle } from 'lucide-react';
import { useWalletAuth } from './hooks/useWalletAuth';
import { useRooms } from './hooks/useRooms';
import { RoomList } from './components/RoomList';
import { CreateRoom } from './components/CreateRoom';
import { ChatRoom } from './components/ChatRoom';

const rootRoute = new RootRoute({
  component: Root,
});

const indexRoute = new Route({
  getParentRoute: () => rootRoute,
  path: '/',
  component: Index,
});

const createRoute = new Route({
  getParentRoute: () => rootRoute,
  path: '/create',
  component: Create,
});

const roomRoute = new Route({
  getParentRoute: () => rootRoute,
  path: '/room/$roomId',
  component: Room,
});

const routeTree = rootRoute.addChildren([indexRoute, createRoute, roomRoute]);

const router = new Router({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

function Root() {
  const { address, isConnected, connect, disconnect, error: walletError, isConnecting: isWalletConnecting } = useWalletAuth();
  const { isReady, error: wakuError, isConnecting: isWakuConnecting, reconnect } = useRooms(isConnected);

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md w-96">
          <div className="flex items-center justify-center mb-6">
            <MessageCircle className="w-12 h-12 text-blue-500" />
          </div>
          <h1 className="text-2xl font-bold text-center mb-6">
            Decentralized Chat
          </h1>
          {walletError && (
            <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-lg text-sm">
              {walletError}
            </div>
          )}
          <button
            onClick={connect}
            disabled={isWalletConnecting}
            className="w-full flex items-center justify-center space-x-2 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span>{isWalletConnecting ? 'Connecting...' : 'Connect Wallet'}</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-4xl mx-auto py-8 px-4">
        <Outlet />
      </div>
    </div>
  );
}

function Index() {
  const { isConnected } = useWalletAuth();
  const { rooms, isLoadingRooms } = useRooms(isConnected);
  return <RoomList rooms={rooms} isLoading={isLoadingRooms} />;
}

function Create() {
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

function Room() {
  const { roomId } = roomRoute.useParams();
  const { isConnected } = useWalletAuth();
  const { getRoomById } = useRooms(isConnected);
  const room = getRoomById(roomId);

  if (!room) {
    return <div>Room not found</div>;
  }

  return <ChatRoom room={room} />;
}

export default function App() {
  return <RouterProvider router={router} />;
}