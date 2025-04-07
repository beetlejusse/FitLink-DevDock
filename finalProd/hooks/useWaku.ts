import { useState, useEffect, useCallback, useRef } from 'react';
import { createLightNode, createDecoder, createEncoder, waitForRemotePeer, Protocols } from '@waku/sdk';
import { ChatMessage } from '@/types/chat';
import protobuf from 'protobufjs';

interface ProtobufChatMessage {
  timestamp: number;
  sender: string;
  content: string;
  roomId: string;
}

const getContentTopic = (roomId: string) => `/waku-chat-app/1/chat/${roomId}/proto`;

const messagePrototype = new protobuf.Type('ChatMessage')
  .add(new protobuf.Field('timestamp', 1, 'uint64'))
  .add(new protobuf.Field('sender', 2, 'string'))
  .add(new protobuf.Field('content', 3, 'string'))
  .add(new protobuf.Field('roomId', 4, 'string'));

export function useWaku(roomId: string) {
  const [node, setNode] = useState<any>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isReady, setIsReady] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const retryAttempts = useRef(0);
  const maxRetries = 10;

  const fetchStoredMessages = async (wakuNode: any) => {
    try {
      setIsLoadingHistory(true);
      const decoder = createDecoder(getContentTopic(roomId));
      const roomMessages: ChatMessage[] = [];

      const callback = (wakuMessage: any) => {
        try {
          const payload = wakuMessage.payload;
          const decodedMessage = messagePrototype.decode(payload) as unknown as ProtobufChatMessage;
          const chatMessage: ChatMessage = {
            timestamp: Number(decodedMessage.timestamp),
            sender: decodedMessage.sender,
            content: decodedMessage.content,
            roomId: decodedMessage.roomId,
          };
          if (chatMessage.roomId === roomId) {
            roomMessages.push(chatMessage);
          }
        } catch (error) {
          console.error('Failed to decode stored message:', error);
        }
      };

      const startTime = new Date();
      startTime.setHours(startTime.getHours() - 24);

      await wakuNode.store.queryWithOrderedCallback([decoder], callback, {
        timeFilter: {
          startTime,
          endTime: new Date(),
        },
        pageSize: 100,
      });

      roomMessages.sort((a, b) => a.timestamp - b.timestamp);
      setMessages(roomMessages);
    } catch (error) {
      console.error('Failed to fetch stored messages:', error);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const initWaku = async () => {
    try {
      const wakuNode = await createLightNode({
        defaultBootstrap: true,
      });

      await wakuNode.start();

      try {
        await Promise.race([
          waitForRemotePeer(wakuNode, [
            Protocols.Store,
            Protocols.Filter,
            Protocols.LightPush,
          ]),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Peer connection timeout')), 30000)
          ),
        ]);
      } catch (error) {
        console.warn('Peer connection warning:', error);
      }

      await fetchStoredMessages(wakuNode);

      const decoder = createDecoder(getContentTopic(roomId));
      await wakuNode.filter.subscribe([decoder], (message: any) => {
        try {
          const payload = message.payload;
          const decodedMessage = messagePrototype.decode(payload) as unknown as ProtobufChatMessage;
          const chatMessage: ChatMessage = {
            timestamp: Number(decodedMessage?.timestamp),
            sender: decodedMessage?.sender,
            content: decodedMessage?.content,
            roomId: decodedMessage?.roomId,
          };

          if (chatMessage.roomId === roomId) {
            setMessages(prev => [...prev, chatMessage].sort((a, b) => a.timestamp - b.timestamp));
          }
        } catch (error) {
          console.error('Failed to decode message:', error);
        }
      });

      setNode(wakuNode);
      setIsReady(true);
      retryAttempts.current = 0;
    } catch (error) {
      console.error('Failed to initialize Waku node:', error);

      if (retryAttempts.current < maxRetries) {
        retryAttempts.current++;
        console.log(`Retrying connection (attempt ${retryAttempts.current}/${maxRetries})...`);
        setTimeout(initWaku, 5000);
      }
    }
  };

  useEffect(() => {
    initWaku();

    return () => {
      if (node) {
        node.stop();
      }
    };
  }, [roomId]);

  const sendMessage = useCallback(async (sender: string, content: string) => {
    if (!node || !isReady) return;

    try {
      const encoder = createEncoder({ contentTopic: getContentTopic(roomId) });
      const message: ChatMessage = {
        timestamp: Date.now(),
        sender,
        content,
        roomId,
      };

      const protoMessage = messagePrototype.create(message);
      const serializedMessage = messagePrototype.encode(protoMessage).finish();

      await node.lightPush.send(encoder, {
        payload: serializedMessage,
      });

      setMessages(prev => [...prev, message].sort((a, b) => a.timestamp - b.timestamp));
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  }, [node, isReady, roomId]);

  const clearHistory = useCallback(() => {
    setMessages([]);
  }, []);

  return { messages, sendMessage, clearHistory, isReady, isLoadingHistory };
}