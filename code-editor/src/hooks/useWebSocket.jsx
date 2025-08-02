// hooks/useWebSocket.jsx
import { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

const WebSocketContext = createContext();

export const WebSocketProvider = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState(null);
  const clientRef = useRef(null);
  const subscriptionsRef = useRef(new Map());

  // WebSocket 연결 설정
  const connect = useCallback((token = null) => {
    if (clientRef.current?.connected) {
      console.log('Already connected');
      return;
    }

    try {
      // SockJS를 사용한 WebSocket 연결 (일반적인 WebSocket 엔드포인트)
      const socket = new SockJS('/ws'); // 기본 WebSocket 엔드포인트
      
      // STOMP 클라이언트 생성
      const client = new Client({
        webSocketFactory: () => socket,
        debug: (str) => {
          console.log('STOMP Debug:', str);
        },
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
        // 인증이 필요한 경우 연결 헤더에 토큰 추가
        connectHeaders: token ? {
          'Authorization': `Bearer ${token}`
        } : {}
      });

      // 연결 성공 시
      client.onConnect = (frame) => {
        console.log('Connected: ', frame);
        setIsConnected(true);
        setConnectionError(null);
      };

      // 연결 실패 시
      client.onStompError = (frame) => {
        console.error('STOMP error: ', frame.headers['message']);
        console.error('Additional details: ', frame.body);
        setConnectionError(frame.headers['message']);
        setIsConnected(false);
      };

      // 연결 끊어졌을 때
      client.onDisconnect = () => {
        console.log('Disconnected');
        setIsConnected(false);
        subscriptionsRef.current.clear();
      };

      // WebSocket 에러 처리
      client.onWebSocketError = (error) => {
        console.error('WebSocket error:', error);
        setConnectionError('WebSocket connection failed');
        setIsConnected(false);
      };

      clientRef.current = client;
      client.activate();

    } catch (error) {
      console.error('Connection setup failed:', error);
      setConnectionError('Failed to setup connection');
    }
  }, []);

  // WebSocket 연결 해제
  const disconnect = useCallback(() => {
    if (clientRef.current?.connected) {
      subscriptionsRef.current.forEach((subscription) => {
        subscription.unsubscribe();
      });
      subscriptionsRef.current.clear();
      
      clientRef.current.deactivate();
      setIsConnected(false);
    }
  }, []);

  // 프로젝트 채팅방 구독
  const subscribeToProject = useCallback((projectId, onMessage) => {
    if (!clientRef.current?.connected) {
      console.error('Not connected to WebSocket');
      return null;
    }

    const destination = `/chat/${projectId}`; // 새로운 구독 패턴
    
    if (subscriptionsRef.current.has(destination)) {
      console.log(`Already subscribed to ${destination}`);
      return subscriptionsRef.current.get(destination);
    }

    try {
      const subscription = clientRef.current.subscribe(destination, (message) => {
        try {
          const parsedMessage = JSON.parse(message.body);
          onMessage(parsedMessage);
        } catch (error) {
          console.error('Failed to parse message:', error);
          onMessage({ error: 'Failed to parse message', raw: message.body });
        }
      });

      subscriptionsRef.current.set(destination, subscription);
      console.log(`Subscribed to ${destination}`);
      return subscription;
    } catch (error) {
      console.error(`Failed to subscribe to ${destination}:`, error);
      return null;
    }
  }, []);

  // 프로젝트 구독 해제
  const unsubscribeFromProject = useCallback((projectId) => {
    const destination = `/chat/${projectId}`;
    const subscription = subscriptionsRef.current.get(destination);
    
    if (subscription) {
      subscription.unsubscribe();
      subscriptionsRef.current.delete(destination);
      console.log(`Unsubscribed from ${destination}`);
    }
  }, []);

  // 메시지 전송 (새로운 메시지 형식)
  const sendMessage = useCallback((destination, message) => {
    if (!clientRef.current?.connected) {
      console.error('Not connected to WebSocket');
      return false;
    }

    try {
      clientRef.current.publish({
        destination,
        body: JSON.stringify(message)
      });
      return true;
    } catch (error) {
      console.error('Failed to send message:', error);
      return false;
    }
  }, []);

  // 프로젝트에 채팅 메시지 전송
  const sendChatMessage = useCallback((projectId, content, senderEmail, senderNickname) => {
    const message = {
      projectId: parseInt(projectId),
      senderEmail,
      senderNickname,
      content,
      messageType: 'CHAT'
    };
    return sendMessage(`/chat/${projectId}`, message);
  }, [sendMessage]);

  // 입장 메시지 전송
  const sendJoinMessage = useCallback((projectId, senderEmail, senderNickname) => {
    const message = {
      projectId: parseInt(projectId),
      senderEmail,
      senderNickname,
      content: `${senderNickname}님이 입장했습니다.`,
      messageType: 'JOIN'
    };
    return sendMessage(`/chat/${projectId}`, message);
  }, [sendMessage]);

  // 퇴장 메시지 전송
  const sendLeaveMessage = useCallback((projectId, senderEmail, senderNickname) => {
    const message = {
      projectId: parseInt(projectId),
      senderEmail,
      senderNickname,
      content: `${senderNickname}님이 채팅방을 나갔습니다.`,
      messageType: 'LEAVE'
    };
    return sendMessage(`/chat/${projectId}`, message);
  }, [sendMessage]);

  // 컴포넌트 마운트 시 연결
  useEffect(() => {
    connect();

    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  const value = {
    isConnected,
    connectionError,
    connect,
    disconnect,
    subscribeToProject,
    unsubscribeFromProject,
    sendMessage,
    sendChatMessage,
    sendJoinMessage,
    sendLeaveMessage
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};