import { useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

export interface WebSocketMessage {
  type: 'new_message' | 'user_joined' | 'user_left';
  data: any;
}

export function useChatWebSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const wsRef = useRef<WebSocket | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();

  const connect = () => {
    try {
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}/ws`;
      
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        console.log('WebSocket 연결됨');
        setIsConnected(true);
        toast({
          title: '실시간 채팅 연결됨',
          description: 'WebSocket 연결이 성공했습니다.',
        });
      };

      wsRef.current.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          
          switch (message.type) {
            case 'new_message':
              // 새 메시지가 도착하면 쿼리 무효화
              queryClient.invalidateQueries({ queryKey: ['/api/chat/messages'] });
              break;
            case 'user_joined':
              setOnlineUsers(prev => [...prev, message.data.userId]);
              toast({
                title: `${message.data.userName}님이 입장했습니다`,
                description: '새로운 사용자가 채팅방에 참여했습니다.',
              });
              break;
            case 'user_left':
              setOnlineUsers(prev => prev.filter(id => id !== message.data.userId));
              break;
          }
        } catch (error) {
          console.error('WebSocket 메시지 파싱 오류:', error);
        }
      };

      wsRef.current.onclose = () => {
        console.log('WebSocket 연결 종료');
        setIsConnected(false);
        
        // 3초 후 재연결 시도
        reconnectTimeoutRef.current = setTimeout(() => {
          console.log('WebSocket 재연결 시도...');
          connect();
        }, 3000);
      };

      wsRef.current.onerror = (error) => {
        console.error('WebSocket 오류:', error);
        setIsConnected(false);
      };

    } catch (error) {
      console.error('WebSocket 연결 실패:', error);
      setIsConnected(false);
    }
  };

  const disconnect = () => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    
    setIsConnected(false);
    setOnlineUsers([]);
  };

  const sendMessage = (message: any) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    }
  };

  useEffect(() => {
    connect();
    
    return () => {
      disconnect();
    };
  }, []);

  return {
    isConnected,
    onlineUsers,
    sendMessage,
    connect,
    disconnect,
  };
}