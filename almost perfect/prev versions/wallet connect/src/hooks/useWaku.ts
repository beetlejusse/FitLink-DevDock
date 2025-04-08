import { useState, useEffect, useCallback } from 'react';
import { createLightNode, createDecoder, createEncoder, waitForRemotePeer } from '@waku/sdk';
import { ChatMessage } from '../types/chat';
import protobuf from 'protobufjs';

const ContentTopic = '/waku-chat-app/1/chat/proto';

const messagePrototype = new protobuf.Type('ChatMessage')
  .add(new protobuf.Field('timestamp', 1, 'uint64'))
  .add(new protobuf.Field('sender', 2, 'string'))
  .add(new protobuf.Field('content', 3, 'string'));

export function useWaku() {
  const [node, setNode] = useState<any>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const initWaku = async () => {
      const wakuNode = await createLightNode({ defaultBootstrap: true });
      await wakuNode.start();
      await waitForRemotePeer(wakuNode);
      
      const decoder = createDecoder(ContentTopic);
      await wakuNode.filter.subscribe([decoder], (message: any) => {
        const payload = message.payload;
        try {
          const decodedMessage = messagePrototype.decode(payload);
          const chatMessage: ChatMessage = {
            timestamp: Number(decodedMessage.timestamp),
            sender: decodedMessage.sender,
            content: decodedMessage.content,
          };
          setMessages((prev) => [...prev, chatMessage]);
        } catch (error) {
          console.error('Failed to decode message:', error);
        }
      });

      setNode(wakuNode);
      setIsReady(true);
    };

    initWaku();

    return () => {
      if (node) {
        node.stop();
      }
    };
  }, []);

  const sendMessage = useCallback(async (sender: string, content: string) => {
    if (!node || !isReady) return;

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

  }, [node, isReady]);

  return { messages, sendMessage, isReady };
}