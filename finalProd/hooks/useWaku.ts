import { useState, useEffect, useCallback, useRef } from 'react';
import { createLightNode, createDecoder, createEncoder, waitForRemotePeer, Protocols } from '@waku/sdk';
import { ChatMessage } from '../types/chat';
import { LocalMessageStore } from '../utils/messageStore';
import protobuf from 'protobufjs';

const ContentTopic = '/waku-chat-app/1/chat/proto';

interface DecodedMessage {
  timestamp: number;
  sender: string;
  content: string;
}

const messagePrototype = new protobuf.Type('ChatMessage')
  .add(new protobuf.Field('timestamp', 1, 'uint64'))
  .add(new protobuf.Field('sender', 2, 'string'))
  .add(new protobuf.Field('content', 3, 'string'));

export function useWaku() {
  const [node, setNode] = useState<any>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isReady, setIsReady] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const messageStore = useRef<LocalMessageStore>(new LocalMessageStore(100));
  const retryAttempts = useRef(0);
  const maxRetries = 10;

  const fetchStoredMessages = async (wakuNode: any) => {
    try {
      setIsLoadingHistory(true);
      const decoder = createDecoder(ContentTopic);
      const callback = (wakuMessage: any) => {
        try {
          const payload = wakuMessage.payload;
          const decodedMessage = messagePrototype.decode(payload) as unknown as DecodedMessage;
          const chatMessage: ChatMessage = {
            timestamp: Number(decodedMessage.timestamp),
            sender: decodedMessage.sender,
            content: decodedMessage.content,
          };
          messageStore.current.addMessage(chatMessage);
        } catch (error) {
          console.error('Failed to decode stored message:', error);
        }
      };

      // Query the store for historical messages (last 24 hours)
      const startTime = new Date();
      startTime.setHours(startTime.getHours() - 24);
      
      await wakuNode.store.queryWithOrderedCallback([decoder], callback, {
        timeFilter: {
          startTime,
          endTime: new Date(),
        },
        pageSize: 100,
      });

      setMessages(messageStore.current.getMessages());
    } catch (error) {
      console.error('Failed to fetch stored messages:', error);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const initWaku = async () => {
    try {
      // Load existing messages from storage
      const storedMessages = messageStore.current.getMessages();
      setMessages(storedMessages);

      const wakuNode = await createLightNode({
        defaultBootstrap: true
      });

      await wakuNode.start();
      
      // Wait for specific protocols with timeout
      try {
        await Promise.race([
          waitForRemotePeer(wakuNode, [
            Protocols.Store,
            Protocols.Filter,
            Protocols.LightPush
          ]),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Peer connection timeout')), 30000)
          )
        ]);
      } catch (error) {
        console.warn('Peer connection warning:', error);
        // Continue anyway as we might still be able to operate
      }

      // Fetch historical messages
      await fetchStoredMessages(wakuNode);

      // Subscribe to new messages
      const decoder = createDecoder(ContentTopic);
      await wakuNode.filter.subscribe([decoder], (message: any) => {
        try {
          const payload = message.payload;
          const decodedMessage = messagePrototype.decode(payload) as unknown as DecodedMessage;
          const chatMessage: ChatMessage = {
            timestamp: Number(decodedMessage.timestamp),
            sender: decodedMessage.sender,
            content: decodedMessage.content,
          };
          
          messageStore.current.addMessage(chatMessage);
          setMessages(messageStore.current.getMessages());
        } catch (error) {
          console.error('Failed to decode message:', error);
        }
      });

      setNode(wakuNode);
      setIsReady(true);
      retryAttempts.current = 0; // Reset retry counter on successful connection
    } catch (error) {
      console.error('Failed to initialize Waku node:', error);
      
      // Implement retry logic
      if (retryAttempts.current < maxRetries) {
        retryAttempts.current++;
        console.log(`Retrying connection (attempt ${retryAttempts.current}/${maxRetries})...`);
        setTimeout(initWaku, 5000); // Retry after 5 seconds
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
  }, []);

  const sendMessage = useCallback(async (sender: string, content: string) => {
    if (!node || !isReady) return;

    try {
      const encoder = createEncoder({ contentTopic: ContentTopic });
      const message: ChatMessage = {
        timestamp: Date.now(),
        sender,
        content,
      };

      const protoMessage = messagePrototype.create(message);
      const serializedMessage = messagePrototype.encode(protoMessage).finish();

      await node.lightPush.send(encoder, {
        payload: serializedMessage,
      });

      // Add the message to local storage immediately
      messageStore.current.addMessage(message);
      setMessages(messageStore.current.getMessages());
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  }, [node, isReady]);

  const clearHistory = useCallback(() => {
    messageStore.current.clear();
    setMessages([]);
  }, []);

  return { messages, sendMessage, clearHistory, isReady, isLoadingHistory };
}