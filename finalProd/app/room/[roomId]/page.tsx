// "use client";

// import { useParams } from "next/navigation";
// import { useWalletAuth } from "@/hooks/useWalletAuth";
// import { useRooms } from "@/hooks/useRooms";
// import { ChatRoom as ChatRoomComponent } from "@/components/chat/ChatRoom";
// import { useEffect, useState } from "react";
// import { ChatRoom } from "@/types/chat";
// import { motion } from "framer-motion";
// import { AlertCircle, Info, MessageCircle } from "lucide-react";
// import { Card, CardContent } from "@/components/ui/card";
// import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
// import { Skeleton } from "@/components/ui/skeleton";

// export default function RoomPage() {
//   const { roomId } = useParams();
//   const { isConnected } = useWalletAuth();
//   const { getRoomById } = useRooms(isConnected);
//   const [room, setRoom] = useState<ChatRoom | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     if (!roomId) {
//       setError("Room ID is missing");
//       setLoading(false);
//       return;
//     }

//     if (!isConnected) {
//       setError("Wallet not connected");
//       setLoading(false);
//       return;
//     }

//     try {
//       const fetchedRoom = getRoomById(roomId as string);
//       if (!fetchedRoom) {
//         setError("Room not found");
//       }
//       setRoom(fetchedRoom || null);
//     } catch (err) {
//       setError("Failed to load room");
//       console.error(err);
//     } finally {
//       setLoading(false);
//     }
//   }, [roomId, isConnected, getRoomById]);

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gradient-to-b from-[#e8f9ef] to-white py-12 px-4">
//         <motion.div
//           initial="hidden"
//           animate="visible"
//           className="container mx-auto max-w-4xl"
//         >
//           <Card className="rounded-lg shadow-md p-6">
//             <Skeleton className="h-6 w-full mb-4 bg-[#0a7c3e]/20" />
//             <Skeleton className="h-6 w-full mb-4 bg-[#0a7c3e]/20" />
//             <Skeleton className="h-6 w-full mb-4 bg-[#0a7c3e]/20" />
//           </Card>
//         </motion.div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="min-h-screen bg-gradient-to-b from-[#e8f9ef] to-white py-12 px-4">
//         <motion.div
//           initial="hidden"
//           animate="visible"
//           className="container mx-auto max-w-4xl"
//         >
//           <Alert
//             variant="destructive"
//             className="mb-6 border-red-300 bg-red-50 rounded-lg"
//           >
//             <AlertCircle className="h-5 w-5" />
//             <AlertTitle className="font-semibold">Error</AlertTitle>
//             <AlertDescription>{error}</AlertDescription>
//           </Alert>
//         </motion.div>
//       </div>
//     );
//   }

//   if (!room) {
//     return (
//       <div className="min-h-screen bg-gradient-to-b from-[#e8f9ef] to-white py-12 px-4">
//         <motion.div
//           initial="hidden"
//           animate="visible"
//           className="container mx-auto max-w-4xl"
//         >
//           <Alert className="mb-6 border-[#0a7c3e]/30 bg-[#e8f9ef] items-center rounded-lg">
//             <Info className="h-5 w-5 text-[#0a7c3e]" />
//             <AlertTitle className="font-semibold text-[#0a7c3e]">
//               Decentralized Chat Notice
//             </AlertTitle>
//             <AlertDescription className="text-[#0a7c3e]/80">
//               We are using Waku protocols for decentralized chat features, which
//               may take some time to load. Sorry for the inconvenience!
//             </AlertDescription>
//           </Alert>
//           <Card className="rounded-lg shadow-md p-6">
//             <div className="text-center">
//               <MessageCircle className="h-8 w-8 text-[#0a7c3e] mb-4" />
//               <h3 className="text-xl font-semibold mb-2 text-[#0a7c3e]">
//                 Room Not Found
//               </h3>
//               <p className="text-[#2d6a4f] mb-6">
//                 The room you're looking for doesn't exist.
//               </p>
//             </div>
//           </Card>
//         </motion.div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-b from-[#e8f9ef] to-white py-12 px-4">
//       <motion.div
//         initial="hidden"
//         animate="visible"
//         className="container mx-auto max-w-4xl"
//       >
//         <Alert className="mb-6 border-[#0a7c3e]/30 bg-[#e8f9ef] items-center rounded-lg">
//           <Info className="h-5 w-5 text-[#0a7c3e]" />
//           <AlertTitle className="font-semibold text-[#0a7c3e]">
//             Decentralized Chat Notice
//           </AlertTitle>
//           <AlertDescription className="text-[#0a7c3e]/80">
//             We are using Waku protocols for decentralized chat features, which
//             may take some time to load. Sorry for the inconvenience!
//           </AlertDescription>
//         </Alert>
//         <Card className="rounded-lg shadow-md p-6">
//           <ChatRoomComponent room={room} />
//         </Card>
//       </motion.div>
//     </div>
//   );
// }


"use client";

import { useParams } from "next/navigation";
import { useWalletAuth } from "@/hooks/useWalletAuth";
import { useRooms } from "@/hooks/useRooms";
import { ChatRoom as ChatRoomComponent } from "@/components/chat/ChatRoom";
import { useEffect, useState } from "react";
import { ChatRoom } from "@/types/chat";
import { motion } from "framer-motion";
import { AlertCircle, Info, MessageCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";

export default function RoomPage() {
  const { roomId } = useParams();
  const { isConnected } = useWalletAuth();
  const { getRoomById, isReady, isLoadingRooms, rooms } = useRooms(isConnected);
  const [room, setRoom] = useState<ChatRoom | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!roomId) {
      setError("Room ID is missing");
      setLoading(false);
      return;
    }

    if (!isConnected) {
      setError("Wallet not connected");
      setLoading(false);
      return;
    }

    const fetchRoom = async () => {
      try {
        if (!isReady || isLoadingRooms) {
          console.log("Waiting for Waku to be ready or rooms to load...");
          return;
        }

        const fetchedRoom = getRoomById(roomId as string);
        console.log("Fetched room:", fetchedRoom, "All rooms:", rooms);

        if (!fetchedRoom) {
          setError("Room not found");
        }
        setRoom(fetchedRoom || null);
      } catch (err) {
        setError("Failed to load room");
        console.error("Error fetching room:", err);
      } finally {
        if (isReady && !isLoadingRooms) {
          setLoading(false); // Only stop loading when Waku is fully ready
        }
      }
    };

    fetchRoom();
    const interval = setInterval(fetchRoom, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, [roomId, isConnected, getRoomById, isReady, isLoadingRooms, rooms]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#e8f9ef] to-white py-12 px-4">
        <motion.div initial="hidden" animate="visible" className="container mx-auto max-w-4xl">
          <Card className="rounded-lg shadow-md p-6">
            <Skeleton className="h-6 w-full mb-4 bg-[#0a7c3e]/20" />
            <Skeleton className="h-6 w-full mb-4 bg-[#0a7c3e]/20" />
            <Skeleton className="h-6 w-full mb-4 bg-[#0a7c3e]/20" />
          </Card>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#e8f9ef] to-white py-12 px-4">
        <motion.div initial="hidden" animate="visible" className="container mx-auto max-w-4xl">
          <Alert variant="destructive" className="mb-6 border-red-300 bg-red-50 rounded-lg">
            <AlertCircle className="h-5 w-5" />
            <AlertTitle className="font-semibold">Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </motion.div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#e8f9ef] to-white py-12 px-4">
        <motion.div initial="hidden" animate="visible" className="container mx-auto max-w-4xl">
          <Alert className="mb-6 border-[#0a7c3e]/30 bg-[#e8f9ef] items-center rounded-lg">
            <Info className="h-5 w-5 text-[#0a7c3e]" />
            <AlertTitle className="font-semibold text-[#0a7c3e]">
              Decentralized Chat Notice
            </AlertTitle>
            <AlertDescription className="text-[#0a7c3e]/80">
              We are using Waku protocols for decentralized chat features, which may take some time to load. Please wait or check if the room ID is valid.
            </AlertDescription>
          </Alert>
          <Card className="rounded-lg shadow-md p-6">
            <div className="text-center">
              <MessageCircle className="h-8 w-8 text-[#0a7c3e] mb-4" />
              <h3 className="text-xl font-semibold mb-2 text-[#0a7c3e]">
                Room Not Found
              </h3>
              <p className="text-[#2d6a4f] mb-6">
                The room you're looking for doesn't exist or hasn’t loaded yet.
              </p>
            </div>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#e8f9ef] to-white py-12 px-4">
      <motion.div initial="hidden" animate="visible" className="container mx-auto max-w-4xl">
        <Alert className="mb-6 border-[#0a7c3e]/30 bg-[#e8f9ef] items-center rounded-lg">
          <Info className="h-5 w-5 text-[#0a7c3e]" />
          <AlertTitle className="font-semibold text-[#0a7c3e]">
            Decentralized Chat Notice
          </AlertTitle>
          <AlertDescription className="text-[#0a7c3e]/80">
            We are using Waku protocols for decentralized chat features, which may take some time to load.
          </AlertDescription>
        </Alert>
        <Card className="rounded-lg shadow-md p-6">
          <ChatRoomComponent room={room} />
        </Card>
      </motion.div>
    </div>
  );
}