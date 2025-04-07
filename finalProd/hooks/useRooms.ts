// // import { useState, useEffect, useCallback } from 'react';
// // import { createLightNode, createDecoder, createEncoder, waitForRemotePeer, Protocols } from '@waku/sdk';
// // import { bootstrap } from '@libp2p/bootstrap';
// // import { enrTree, wakuDnsDiscovery } from '@waku/dns-discovery';
// // import protobuf from 'protobufjs';
// // import { ChatRoom, RoomEvent } from '@/types/chat';

// // const ROOM_TOPIC = '/waku-chat-app/1/rooms/proto';
// // const MAX_RETRY_ATTEMPTS = 5;
// // const CONNECTION_TIMEOUT = 60000; // 60 seconds
// // const MIN_BACKOFF_DELAY = 2000;
// // const MAX_BACKOFF_DELAY = 15000;

// // // Protobuf definition for room events
// // const roomEventPrototype = new protobuf.Type('RoomEvent')
// //   .add(new protobuf.Field('type', 1, 'string'))
// //   .add(new protobuf.Field('timestamp', 2, 'uint64'))
// //   .add(new protobuf.Field('room', 3, 'Room'))
// //   .add(new protobuf.Type('Room')
// //     .add(new protobuf.Field('id', 1, 'string'))
// //     .add(new protobuf.Field('name', 2, 'string'))
// //     .add(new protobuf.Field('creator', 3, 'string'))
// //     .add(new protobuf.Field('createdAt', 4, 'uint64'))
// //     .add(new protobuf.Field('code', 5, 'string'))
// //     .add(new protobuf.Field('lastActivity', 6, 'uint64'))
// //     .add(new protobuf.Field('participantCount', 7, 'uint32'))
// //     .add(new protobuf.Field('isPublic', 8, 'bool')));

// // export function useRooms(isWalletConnected: boolean) {
// //   const [rooms, setRooms] = useState<ChatRoom[]>([]);
// //   const [node, setNode] = useState<any>(null);
// //   const [isReady, setIsReady] = useState(false);
// //   const [error, setError] = useState<string | null>(null);
// //   const [isConnecting, setIsConnecting] = useState(false);
// //   const [isLoadingRooms, setIsLoadingRooms] = useState(false);
// //   const [pendingRoomCreations, setPendingRoomCreations] = useState<Array<() => Promise<void> | Promise<ChatRoom>>>([]);

// //   // Generate a human-readable room code
// //   const generateRoomCode = () => {
// //     const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
// //     let code = '';
// //     for (let i = 0; i < 6; i++) {
// //       code += chars.charAt(Math.floor(Math.random() * chars.length));
// //     }
// //     return code;
// //   };

// //   // Calculate backoff delay with jitter
// //   const getBackoffDelay = (attempt: number) => {
// //     const baseDelay = Math.min(
// //       MIN_BACKOFF_DELAY * Math.pow(2, attempt),
// //       MAX_BACKOFF_DELAY
// //     );
// //     const jitter = baseDelay * 0.2 * (Math.random() * 2 - 1);
// //     return baseDelay + jitter;
// //   };

// //   // Fetch historical room events
// //   const fetchStoredRooms = async (wakuNode: any) => {
// //     try {
// //       setIsLoadingRooms(true);
// //       const decoder = createDecoder(ROOM_TOPIC);
// //       const roomsMap = new Map<string, ChatRoom>();

// //       const callback = (wakuMessage: any) => {
// //         if (!wakuMessage?.payload) return;

// //         try {
// //           const decodedEvent = roomEventPrototype.decode(wakuMessage.payload) as unknown as RoomEvent;
          
// //           switch (decodedEvent.type) {
// //             case 'create':
// //             case 'update':
// //               roomsMap.set(decodedEvent.room.id, decodedEvent.room);
// //               break;
// //             case 'delete':
// //               roomsMap.delete(decodedEvent.room.id);
// //               break;
// //           }
// //         } catch (error) {
// //           console.error('Failed to decode stored room event:', error);
// //         }
// //       };

// //       const startTime = new Date();
// //       startTime.setHours(startTime.getHours() - 48);
      
// //       await wakuNode.store.queryWithOrderedCallback([decoder], callback, {
// //         timeFilter: {
// //           startTime,
// //           endTime: new Date(),
// //         },
// //         pageSize: 100,
// //       });

// //       setRooms(Array.from(roomsMap.values()));
// //     } catch (error) {
// //       console.error('Failed to fetch stored rooms:', error);
// //       throw error;
// //     } finally {
// //       setIsLoadingRooms(false);
// //     }
// //   };

// //   // Initialize Waku node with DNS Discovery and improved error handling
// //   const connectWithRetry = useCallback(async (attempt = 1) => {
// //     if (isConnecting || !isWalletConnected) {
// //       console.log('Skipping connection attempt: isConnecting=', isConnecting, 'isWalletConnected=', isWalletConnected);
// //       return;
// //     }
// //     setIsConnecting(true);
// //     setError(null);

// //     try {
// //       // Define node requirements for DNS Discovery
// //       const NODE_REQUIREMENTS = {
// //         store: 3,
// //         lightPush: 3,
// //         filter: 3,
// //       };

// //       // Fallback static peers (optional, for local development)
// //       const staticPeers: string | any[] = [
// //         // Add your local nwaku node here if available, e.g.:
// //         // '/ip4/0.0.0.0/tcp/60002/ws/p2p/16Uiu2HAkzjwwgEAXfeGNMKFPSpc6vGBRqCdTLG5q3Gmk2v4pQw7H',
// //       ];

// //       // Initialize Waku node with DNS Discovery and static peers
// //       const wakuNode = await createLightNode({
// //         libp2p: {
// //           peerDiscovery: [
// //             wakuDnsDiscovery([enrTree['PROD']], NODE_REQUIREMENTS),
// //             ...(staticPeers.length > 0 ? [bootstrap({ list: staticPeers })] : []),
// //           ],
// //         },
// //       });

// //       await wakuNode.start();
// //       console.log('Waku node started successfully');

// //       // Wait for remote peers
// //       try {
// //         await Promise.race([
// //           waitForRemotePeer(wakuNode, [
// //             Protocols.Store,
// //             Protocols.Filter,
// //             Protocols.LightPush,
// //           ]),
// //           new Promise((_, reject) => 
// //             setTimeout(() => reject(new Error('Connection timeout waiting for remote peer')), CONNECTION_TIMEOUT)
// //           ),
// //         ]);
// //         console.log('Successfully connected to remote peers');
// //       } catch (error) {
// //         throw new Error(`Failed to connect to remote peers: ${(error as Error).message}`);
// //       }

// //       // Fetch historical rooms
// //       await fetchStoredRooms(wakuNode);

// //       // Subscribe to new room events
// //       const decoder = createDecoder(ROOM_TOPIC);
// //       await wakuNode.filter.subscribe([decoder], (wakuMessage: any) => {
// //         if (!wakuMessage?.payload) return;

// //         try {
// //           const decodedEvent = roomEventPrototype.decode(wakuMessage.payload) as unknown as RoomEvent;
          
// //           setRooms(prevRooms => {
// //             switch (decodedEvent.type) {
// //               case 'create':
// //                 if (!prevRooms.find(r => r.id === decodedEvent.room.id)) {
// //                   return [...prevRooms, decodedEvent.room];
// //                 }
// //                 return prevRooms;
// //               case 'update':
// //                 return prevRooms.map(r => 
// //                   r.id === decodedEvent.room.id ? decodedEvent.room : r
// //                 );
// //               case 'delete':
// //                 return prevRooms.filter(r => r.id !== decodedEvent.room.id);
// //               default:
// //                 return prevRooms;
// //             }
// //           });
// //         } catch (error) {
// //           console.error('Failed to decode room event:', error);
// //         }
// //       });

// //       setNode(wakuNode);
// //       setIsReady(true);
// //       setError(null);
// //       setIsConnecting(false);

// //       // Process any pending room creations
// //       if (pendingRoomCreations.length > 0) {
// //         console.log('Processing pending room creations...');
// //         for (const createRoomFn of pendingRoomCreations) {
// //           await createRoomFn();
// //         }
// //         setPendingRoomCreations([]);
// //       }
// //     } catch (error) {
// //       if (attempt < MAX_RETRY_ATTEMPTS) {
// //         console.warn(`Connection attempt ${attempt} failed, retrying...`, error);
// //         const backoffDelay = getBackoffDelay(attempt);
// //         await new Promise(resolve => setTimeout(resolve, backoffDelay));
// //         await connectWithRetry(attempt + 1);
// //       } else {
// //         const errorMessage = error instanceof Error 
// //           ? error.message 
// //           : 'Failed to connect to the network after multiple attempts. Please check your internet connection and try again.';
// //         console.error('Waku node initialization failed:', error);
// //         setError(errorMessage);
// //         setIsConnecting(false);
// //         setIsReady(false);

// //         if (node) {
// //           try {
// //             await node.stop();
// //           } catch (stopError) {
// //             console.error('Failed to stop Waku node:', stopError);
// //           }
// //           setNode(null);
// //         }
// //       }
// //     }
// //   }, [isConnecting, node, isWalletConnected, pendingRoomCreations]);

// //   useEffect(() => {
// //     if (isWalletConnected) {
// //       connectWithRetry();
// //     } else {
// //       if (node) {
// //         node.stop().catch((error: Error) => {
// //           console.error('Failed to stop Waku node:', error);
// //         });
// //         setNode(null);
// //         setIsReady(false);
// //         setError(null);
// //         setIsConnecting(false);
// //         setRooms([]);
// //       }
// //     }

// //     return () => {
// //       if (node) {
// //         node.stop().catch((error: Error) => {
// //           console.error('Failed to stop Waku node:', error);
// //         });
// //       }
// //     };
// //   }, [isWalletConnected]);

// //   const broadcastRoomEvent = useCallback(async (event: RoomEvent) => {
// //     if (!node || !isReady) {
// //       throw new Error('Waku node is not ready');
// //     }

// //     try {
// //       const encoder = createEncoder({ contentTopic: ROOM_TOPIC });
// //       const protoEvent = roomEventPrototype.create(event);
// //       const serializedEvent = roomEventPrototype.encode(protoEvent).finish();

// //       await node.lightPush.send(encoder, {
// //         payload: serializedEvent,
// //       });
// //     } catch (error) {
// //       console.error('Failed to broadcast room event:', error);
// //       throw new Error('Failed to broadcast room update. Please try again.');
// //     }
// //   }, [node, isReady]);

// //   const createRoom = useCallback(async (name: string, creator: string) => {
// //     if (!name?.trim()) {
// //       throw new Error('Room name cannot be empty');
// //     }

// //     const createRoomFn = async () => {
// //       try {
// //         const newRoom: ChatRoom = {
// //           id: crypto.randomUUID(),
// //           name: name.trim(),
// //           creator,
// //           createdAt: Date.now(),
// //           code: generateRoomCode(),
// //           lastActivity: Date.now(),
// //           participantCount: 0,
// //           isPublic: true,
// //         };

// //         await broadcastRoomEvent({
// //           type: 'create',
// //           room: newRoom,
// //           timestamp: Date.now(),
// //         });

// //         return newRoom;
// //       } catch (error) {
// //         const errorMessage = error instanceof Error 
// //           ? error.message 
// //           : 'Failed to create room. Please try again.';
// //         throw new Error(errorMessage);
// //       }
// //     };

// //     if (!isReady) {
// //       console.log('Waku node not ready, queuing room creation...');
// //       setPendingRoomCreations(prev => [...prev, createRoomFn]);
// //       throw new Error('Please wait for network connection to be established.');
// //     }

// //     return await createRoomFn();
// //   }, [broadcastRoomEvent, isReady]);

// //   const getRoomById = useCallback((id: string) => {
// //     return rooms.find(room => room.id === id);
// //   }, [rooms]);

// //   const getRoomByCode = useCallback((code: string) => {
// //     return rooms.find(room => room.code.toLowerCase() === code.toLowerCase());
// //   }, [rooms]);

// //   const updateRoom = useCallback(async (room: ChatRoom) => {
// //     if (!isReady) {
// //       throw new Error('Please wait for network connection');
// //     }

// //     try {
// //       const updatedRoom = { ...room, lastActivity: Date.now() };
// //       await broadcastRoomEvent({
// //         type: 'update',
// //         room: updatedRoom,
// //         timestamp: Date.now(),
// //       });
// //     } catch (error) {
// //       const errorMessage = error instanceof Error 
// //         ? error.message 
// //         : 'Failed to update room. Please try again.';
// //       throw new Error(errorMessage);
// //     }
// //   }, [broadcastRoomEvent, isReady]);

// //   const reconnect = useCallback(() => {
// //     if (!isConnecting && isWalletConnected) {
// //       connectWithRetry();
// //     }
// //   }, [connectWithRetry, isConnecting, isWalletConnected]);

// //   return {
// //     rooms,
// //     createRoom,
// //     getRoomById,
// //     getRoomByCode,
// //     updateRoom,
// //     isReady,
// //     error,
// //     isConnecting,
// //     isLoadingRooms,
// //     reconnect,
// //   };
// // }


// import { useState, useEffect, useCallback } from 'react';
// import { createLightNode, createDecoder, createEncoder, waitForRemotePeer, Protocols } from '@waku/sdk';
// import protobuf from 'protobufjs';
// import { ChatRoom, RoomEvent } from '../types/chat';

// const ROOM_TOPIC = '/waku-chat-app/1/rooms/proto';
// const MAX_RETRY_ATTEMPTS = 5;
// const CONNECTION_TIMEOUT = 30000;
// const MIN_BACKOFF_DELAY = 2000;
// const MAX_BACKOFF_DELAY = 10000;

// // Protobuf definition for room events
// const roomEventPrototype = new protobuf.Type('RoomEvent')
//   .add(new protobuf.Field('type', 1, 'string'))
//   .add(new protobuf.Field('timestamp', 2, 'uint64'))
//   .add(new protobuf.Field('room', 3, 'Room'))
//   .add(new protobuf.Type('Room')
//     .add(new protobuf.Field('id', 1, 'string'))
//     .add(new protobuf.Field('name', 2, 'string'))
//     .add(new protobuf.Field('creator', 3, 'string'))
//     .add(new protobuf.Field('createdAt', 4, 'uint64'))
//     .add(new protobuf.Field('code', 5, 'string'))
//     .add(new protobuf.Field('lastActivity', 6, 'uint64'))
//     .add(new protobuf.Field('participantCount', 7, 'uint32'))
//     .add(new protobuf.Field('isPublic', 8, 'bool')));

// export function useRooms(isWalletConnected: boolean) {
//   const [rooms, setRooms] = useState<ChatRoom[]>([]);
//   const [node, setNode] = useState<any>(null);
//   const [isReady, setIsReady] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [isConnecting, setIsConnecting] = useState(false);
//   const [isLoadingRooms, setIsLoadingRooms] = useState(false);

//   // Generate a human-readable room code
//   const generateRoomCode = () => {
//     const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
//     let code = '';
//     for (let i = 0; i < 6; i++) {
//       code += chars.charAt(Math.floor(Math.random() * chars.length));
//     }
//     return code;
//   };

//   // Calculate backoff delay with jitter
//   const getBackoffDelay = (attempt: number) => {
//     const baseDelay = Math.min(
//       MIN_BACKOFF_DELAY * Math.pow(2, attempt),
//       MAX_BACKOFF_DELAY
//     );
//     const jitter = baseDelay * 0.2 * (Math.random() * 2 - 1);
//     return baseDelay + jitter;
//   };

//   // Fetch historical room events
//   const fetchStoredRooms = async (wakuNode: any) => {
//     try {
//       setIsLoadingRooms(true);
//       const decoder = createDecoder(ROOM_TOPIC);
//       const roomsMap = new Map<string, ChatRoom>();

//       const callback = (wakuMessage: any) => {
//         if (!wakuMessage?.payload) return;

//         try {
//           const decodedEvent = roomEventPrototype.decode(wakuMessage.payload) as unknown as RoomEvent;
          
//           switch (decodedEvent.type) {
//             case 'create':
//             case 'update':
//               roomsMap.set(decodedEvent.room.id, decodedEvent.room);
//               break;
//             case 'delete':
//               roomsMap.delete(decodedEvent.room.id);
//               break;
//           }
//         } catch (error) {
//           console.error('Failed to decode stored room event:', error);
//         }
//       };

//       // Query the store for historical room events (last 48 hours)
//       const startTime = new Date();
//       startTime.setHours(startTime.getHours() - 48);
      
//       await wakuNode.store.queryWithOrderedCallback([decoder], callback, {
//         timeFilter: {
//           startTime,
//           endTime: new Date(),
//         },
//         pageSize: 100,
//       });

//       setRooms(Array.from(roomsMap.values()));
//     } catch (error) {
//       console.error('Failed to fetch stored rooms:', error);
//       throw error;
//     } finally {
//       setIsLoadingRooms(false);
//     }
//   };

//   // Initialize Waku node with improved error handling and retry mechanism
//   const connectWithRetry = useCallback(async (attempt = 1) => {
//     if (isConnecting || !isWalletConnected) return;
//     setIsConnecting(true);
//     setError(null);

//     try {
//       const wakuNode = await createLightNode({
//         defaultBootstrap: true
//       });

//       await wakuNode.start();

//       const bootstrapNodes = [
//         '/dns4/node-01.ac-cn-hongkong-c.wakuv2.test.statusim.net/tcp/443/wss/p2p/16Uiu2HAkvWiyFsgRhuJEb9JfjYxEkoHLgnUQmr1N5mKWnYjxYRVm',
//         '/dns4/node-01.do-ams3.wakuv2.test.statusim.net/tcp/443/wss/p2p/16Uiu2HAmPLe7Mzm8TsYUubgCAW1aJoeFScxrLj8ppHFivPo97bUZ',
//         '/dns4/node-01.gc-us-central1-a.wakuv2.test.statusim.net/tcp/443/wss/p2p/16Uiu2HAmJb2e28qLXxT5kZxVUUoJt72EMzNGXB47Rxx5hw3q4YjS',
//         '/dns4/waku.node1.prod.statusim.net/tcp/443/wss/p2p/16Uiu2HAkwbJ3QLnRxvN2qYiJEg5ZH3hNqwvJGxXEDXTgbPstGpAM',
//         '/dns4/waku.node2.prod.statusim.net/tcp/443/wss/p2p/16Uiu2HAmVkKntsECaYfefR1QmkUqzQrL1LX6Jjw7ZvyJPDcAGWMJ'
//       ];

//       for (const node of bootstrapNodes) {
//         try {
//           await Promise.race([
//             wakuNode.dial(node),
//             new Promise((_, reject) => 
//               setTimeout(() => reject(new Error('Bootstrap node connection timeout')), 5000)
//             )
//           ]);
//         } catch (error) {
//           console.warn(`Failed to connect to bootstrap node ${node}:`, error);
//           continue;
//         }
//       }
      
//       try {
//         await Promise.race([
//           waitForRemotePeer(wakuNode, [
//             Protocols.Store,
//             Protocols.Filter,
//             Protocols.LightPush
//           ]),
//           new Promise((_, reject) => 
//             setTimeout(() => reject(new Error('Connection timeout')), CONNECTION_TIMEOUT)
//           )
//         ]);

//         // First fetch historical rooms
//         await fetchStoredRooms(wakuNode);

//         // Then subscribe to new room events
//         const decoder = createDecoder(ROOM_TOPIC);
//         await wakuNode.filter.subscribe([decoder], (wakuMessage: any) => {
//           if (!wakuMessage?.payload) return;

//           try {
//             const decodedEvent = roomEventPrototype.decode(wakuMessage.payload) as unknown as RoomEvent;
            
//             setRooms(prevRooms => {
//               switch (decodedEvent.type) {
//                 case 'create':
//                   if (!prevRooms.find(r => r.id === decodedEvent.room.id)) {
//                     return [...prevRooms, decodedEvent.room];
//                   }
//                   return prevRooms;
//                 case 'update':
//                   return prevRooms.map(r => 
//                     r.id === decodedEvent.room.id ? decodedEvent.room : r
//                   );
//                 case 'delete':
//                   return prevRooms.filter(r => r.id !== decodedEvent.room.id);
//                 default:
//                   return prevRooms;
//               }
//             });
//           } catch (error) {
//             console.error('Failed to decode room event:', error);
//           }
//         });

//         setNode(wakuNode);
//         setIsReady(true);
//         setError(null);
//         setIsConnecting(false);
//       } catch (error) {
//         if (attempt < MAX_RETRY_ATTEMPTS) {
//           console.warn(`Connection attempt ${attempt} failed, retrying...`);
//           const backoffDelay = getBackoffDelay(attempt);
//           await new Promise(resolve => setTimeout(resolve, backoffDelay));
//           await connectWithRetry(attempt + 1);
//         } else {
//           throw new Error(
//             'Network connection issues detected. Please check your internet connection and try again in a few minutes.'
//           );
//         }
//       }
//     } catch (error) {
//       const errorMessage = error instanceof Error 
//         ? error.message 
//         : 'Failed to connect to the network. Please try again later.';
      
//       console.error('Waku node initialization failed:', error);
//       setError(errorMessage);
//       setIsConnecting(false);
//       setIsReady(false);

//       if (node) {
//         try {
//           await node.stop();
//         } catch (stopError) {
//           console.error('Failed to stop Waku node:', stopError);
//         }
//         setNode(null);
//       }
//     }
//   }, [isConnecting, node, isWalletConnected]);

//   // Initialize connection when wallet is connected
//   useEffect(() => {
//     if (isWalletConnected) {
//       connectWithRetry();
//     } else {
//       if (node) {
//         node.stop().catch((error: Error) => {
//           console.error('Failed to stop Waku node:', error);
//         });
//         setNode(null);
//         setIsReady(false);
//         setError(null);
//         setIsConnecting(false);
//         setRooms([]); // Clear rooms when disconnected
//       }
//     }

//     // Cleanup function
//     return () => {
//       if (node) {
//         node.stop().catch((error: Error) => {
//           console.error('Failed to stop Waku node:', error);
//         });
//       }
//     };
//   }, [isWalletConnected]);

//   // Broadcast room event with improved error handling
//   const broadcastRoomEvent = useCallback(async (event: RoomEvent) => {
//     if (!node || !isReady) {
//       throw new Error('Waku node is not ready');
//     }

//     try {
//       const encoder = createEncoder({ contentTopic: ROOM_TOPIC });
//       const protoEvent = roomEventPrototype.create(event);
//       const serializedEvent = roomEventPrototype.encode(protoEvent).finish();

//       await node.lightPush.send(encoder, {
//         payload: serializedEvent,
//       });
//     } catch (error) {
//       console.error('Failed to broadcast room event:', error);
//       throw new Error('Failed to broadcast room update. Please try again.');
//     }
//   }, [node, isReady]);

//   const createRoom = useCallback(async (name: string, creator: string) => {
//     if (!name?.trim()) {
//       throw new Error('Room name cannot be empty');
//     }

//     if (!isReady) {
//       throw new Error('Please wait for network connection');
//     }

//     try {
//       const newRoom: ChatRoom = {
//         id: crypto.randomUUID(),
//         name: name.trim(),
//         creator,
//         createdAt: Date.now(),
//         code: generateRoomCode(),
//         lastActivity: Date.now(),
//         participantCount: 0,
//         isPublic: true,
//       };

//       await broadcastRoomEvent({
//         type: 'create',
//         room: newRoom,
//         timestamp: Date.now(),
//       });

//       return newRoom;
//     } catch (error) {
//       const errorMessage = error instanceof Error 
//         ? error.message 
//         : 'Failed to create room. Please try again.';
//       throw new Error(errorMessage);
//     }
//   }, [broadcastRoomEvent, isReady]);

//   const getRoomById = useCallback((id: string) => {
//     return rooms.find(room => room.id === id);
//   }, [rooms]);

//   const getRoomByCode = useCallback((code: string) => {
//     return rooms.find(room => room.code.toLowerCase() === code.toLowerCase());
//   }, [rooms]);

//   const updateRoom = useCallback(async (room: ChatRoom) => {
//     if (!isReady) {
//       throw new Error('Please wait for network connection');
//     }

//     try {
//       const updatedRoom = { ...room, lastActivity: Date.now() };
//       await broadcastRoomEvent({
//         type: 'update',
//         room: updatedRoom,
//         timestamp: Date.now(),
//       });
//     } catch (error) {
//       const errorMessage = error instanceof Error 
//         ? error.message 
//         : 'Failed to update room. Please try again.';
//       throw new Error(errorMessage);
//     }
//   }, [broadcastRoomEvent, isReady]);

//   const reconnect = useCallback(() => {
//     if (!isConnecting && isWalletConnected) {
//       connectWithRetry();
//     }
//   }, [connectWithRetry, isConnecting, isWalletConnected]);

//   return {
//     rooms,
//     createRoom,
//     getRoomById,
//     getRoomByCode,
//     updateRoom,
//     isReady,
//     error,
//     isConnecting,
//     isLoadingRooms,
//     reconnect,
//   };
// }

import { useState, useEffect, useCallback } from 'react';
import { createLightNode, createDecoder, createEncoder, waitForRemotePeer, Protocols } from '@waku/sdk';
import protobuf from 'protobufjs';
import { ChatRoom, RoomEvent } from '../types/chat';

const ROOM_TOPIC = '/waku-chat-app/1/rooms/proto';
const MAX_RETRY_ATTEMPTS = 5;
const CONNECTION_TIMEOUT = 30000;
const MIN_BACKOFF_DELAY = 2000;
const MAX_BACKOFF_DELAY = 10000;

// Protobuf definition for room events
const roomEventPrototype = new protobuf.Type('RoomEvent')
  .add(new protobuf.Field('type', 1, 'string'))
  .add(new protobuf.Field('timestamp', 2, 'uint64'))
  .add(new protobuf.Field('room', 3, 'Room'))
  .add(new protobuf.Type('Room')
    .add(new protobuf.Field('id', 1, 'string'))
    .add(new protobuf.Field('name', 2, 'string'))
    .add(new protobuf.Field('creator', 3, 'string'))
    .add(new protobuf.Field('createdAt', 4, 'uint64'))
    .add(new protobuf.Field('code', 5, 'string'))
    .add(new protobuf.Field('lastActivity', 6, 'uint64'))
    .add(new protobuf.Field('participantCount', 7, 'uint32'))
    .add(new protobuf.Field('isPublic', 8, 'bool')));

export function useRooms(isWalletConnected: boolean) {
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [node, setNode] = useState<any>(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isLoadingRooms, setIsLoadingRooms] = useState(false);

  const generateRoomCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  const getBackoffDelay = (attempt: number) => {
    const baseDelay = Math.min(MIN_BACKOFF_DELAY * Math.pow(2, attempt), MAX_BACKOFF_DELAY);
    const jitter = baseDelay * 0.2 * (Math.random() * 2 - 1);
    return baseDelay + jitter;
  };

  const fetchStoredRooms = async (wakuNode: any) => {
    try {
      setIsLoadingRooms(true);
      const decoder = createDecoder(ROOM_TOPIC);
      const roomsMap = new Map<string, ChatRoom>();

      const callback = (wakuMessage: any) => {
        if (!wakuMessage?.payload) return;

        try {
          const decodedEvent = roomEventPrototype.decode(wakuMessage.payload) as unknown as RoomEvent;
          switch (decodedEvent.type) {
            case 'create':
            case 'update':
              roomsMap.set(decodedEvent.room.id, decodedEvent.room);
              break;
            case 'delete':
              roomsMap.delete(decodedEvent.room.id);
              break;
          }
        } catch (error) {
          console.error('Failed to decode stored room event:', error);
        }
      };

      const startTime = new Date();
      startTime.setDate(startTime.getDate() - 7); // Fetch last 7 days

      await wakuNode.store.queryWithOrderedCallback([decoder], callback, {
        timeFilter: { startTime, endTime: new Date() },
        pageSize: 100,
      });

      const fetchedRooms = Array.from(roomsMap.values());
      setRooms(fetchedRooms);
      console.log('Fetched rooms:', fetchedRooms);
    } catch (error) {
      console.error('Failed to fetch stored rooms:', error);
      throw error;
    } finally {
      setIsLoadingRooms(false);
    }
  };

  const connectWithRetry = useCallback(async (attempt = 1) => {
    if (isConnecting || !isWalletConnected) return;
    setIsConnecting(true);
    setError(null);

    try {
      const wakuNode = await createLightNode({ defaultBootstrap: true });
      await wakuNode.start();

      const bootstrapNodes = [
        '/dns4/node-01.ac-cn-hongkong-c.wakuv2.test.statusim.net/tcp/443/wss/p2p/16Uiu2HAkvWiyFsgRhuJEb9JfjYxEkoHLgnUQmr1N5mKWnYjxYRVm',
        '/dns4/node-01.do-ams3.wakuv2.test.statusim.net/tcp/443/wss/p2p/16Uiu2HAmPLe7Mzm8TsYUubgCAW1aJoeFScxrLj8ppHFivPo97bUZ',
        '/dns4/node-01.gc-us-central1-a.wakuv2.test.statusim.net/tcp/443/wss/p2p/16Uiu2HAmJb2e28qLXxT5kZxVUUoJt72EMzNGXB47Rxx5hw3q4YjS',
        '/dns4/waku.node1.prod.statusim.net/tcp/443/wss/p2p/16Uiu2HAkwbJ3QLnRxvN2qYiJEg5ZH3hNqwvJGxXEDXTgbPstGpAM',
        '/dns4/waku.node2.prod.statusim.net/tcp/443/wss/p2p/16Uiu2HAmVkKntsECaYfefR1QmkUqzQrL1LX6Jjw7ZvyJPDcAGWMJ'
      ];

      for (const node of bootstrapNodes) {
        try {
          await Promise.race([
            wakuNode.dial(node),
            new Promise((_, reject) => setTimeout(() => reject(new Error('Bootstrap node timeout')), 5000))
          ]);
        } catch (error) {
          console.warn(`Failed to connect to bootstrap node ${node}:`, error);
          continue;
        }
      }

      await Promise.race([
        waitForRemotePeer(wakuNode, [Protocols.Store, Protocols.Filter, Protocols.LightPush]),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Connection timeout')), CONNECTION_TIMEOUT))
      ]);

      await fetchStoredRooms(wakuNode);

      const decoder = createDecoder(ROOM_TOPIC);
      await wakuNode.filter.subscribe([decoder], (wakuMessage: any) => {
        if (!wakuMessage?.payload) return;

        try {
          const decodedEvent = roomEventPrototype.decode(wakuMessage.payload) as unknown as RoomEvent;
          setRooms(prevRooms => {
            switch (decodedEvent.type) {
              case 'create':
                if (!prevRooms.find(r => r.id === decodedEvent.room.id)) {
                  const newRooms = [...prevRooms, decodedEvent.room];
                  console.log('Updated rooms after create:', newRooms);
                  return newRooms;
                }
                return prevRooms;
              case 'update':
                return prevRooms.map(r => r.id === decodedEvent.room.id ? decodedEvent.room : r);
              case 'delete':
                return prevRooms.filter(r => r.id !== decodedEvent.room.id);
              default:
                return prevRooms;
            }
          });
        } catch (error) {
          console.error('Failed to decode room event:', error);
        }
      });

      setNode(wakuNode);
      setIsReady(true);
      setError(null);
      setIsConnecting(false);
      console.log('Waku node ready:', true);
    } catch (error) {
      if (attempt < MAX_RETRY_ATTEMPTS) {
        console.warn(`Connection attempt ${attempt} failed, retrying...`);
        const backoffDelay = getBackoffDelay(attempt);
        await new Promise(resolve => setTimeout(resolve, backoffDelay));
        await connectWithRetry(attempt + 1);
      } else {
        const errorMessage = error instanceof Error ? error.message : 'Failed to connect to the network.';
        console.error('Waku node initialization failed:', error);
        setError(errorMessage);
        setIsConnecting(false);
        setIsReady(false);
        if (node) {
          await node.stop().catch((stopError: Error) => console.error('Failed to stop Waku node:', stopError));
          setNode(null);
        }
      }
    }
  }, [isConnecting, node, isWalletConnected]);

  useEffect(() => {
    if (isWalletConnected) {
      connectWithRetry();
    } else if (node) {
      node.stop().catch((error: Error) => console.error('Failed to stop Waku node:', error));
      setNode(null);
      setIsReady(false);
      setError(null);
      setIsConnecting(false);
      setRooms([]);
    }
    return () => {
      if (node) {
        node.stop().catch((error: Error) => console.error('Failed to stop Waku node:', error));
      }
    };
  }, [isWalletConnected]);

  const broadcastRoomEvent = useCallback(async (event: RoomEvent) => {
    if (!node || !isReady) throw new Error('Waku node is not ready');
    const encoder = createEncoder({ contentTopic: ROOM_TOPIC });
    const protoEvent = roomEventPrototype.create(event);
    const serializedEvent = roomEventPrototype.encode(protoEvent).finish();
    await node.lightPush.send(encoder, { payload: serializedEvent });
  }, [node, isReady]);

  const createRoom = useCallback(async (name: string, creator: string) => {
    if (!name?.trim()) throw new Error('Room name cannot be empty');
    if (!isReady) throw new Error('Please wait for network connection');

    const newRoom: ChatRoom = {
      id: crypto.randomUUID(),
      name: name.trim(),
      creator,
      createdAt: Date.now(),
      code: generateRoomCode(),
      lastActivity: Date.now(),
      participantCount: 0,
      isPublic: true,
    };

    await broadcastRoomEvent({ type: 'create', room: newRoom, timestamp: Date.now() });
    console.log('Room created and broadcast:', newRoom);
    return newRoom;
  }, [broadcastRoomEvent, isReady]);

  const getRoomById = useCallback((id: string) => {
    return rooms.find(room => room.id === id);
  }, [rooms]);

  const getRoomByCode = useCallback((code: string) => {
    return rooms.find(room => room.code.toLowerCase() === code.toLowerCase());
  }, [rooms]);

  const updateRoom = useCallback(async (room: ChatRoom) => {
    if (!isReady) throw new Error('Please wait for network connection');
    const updatedRoom = { ...room, lastActivity: Date.now() };
    await broadcastRoomEvent({ type: 'update', room: updatedRoom, timestamp: Date.now() });
  }, [broadcastRoomEvent, isReady]);

  const reconnect = useCallback(() => {
    if (!isConnecting && isWalletConnected) connectWithRetry();
  }, [connectWithRetry, isConnecting, isWalletConnected]);

  return {
    rooms,
    createRoom,
    getRoomById,
    getRoomByCode,
    updateRoom,
    isReady,
    error,
    isConnecting,
    isLoadingRooms,
    reconnect,
  };
}