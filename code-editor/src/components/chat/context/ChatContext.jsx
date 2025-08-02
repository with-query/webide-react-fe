
import { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react';
import { Stomp } from '@stomp/stompjs';
import SockJS from 'sockjs-client'; // SockJS 재도입
import axios from 'axios';

const ChatContext = createContext();

// HTTP API 호출을 위한 기본 URL입니다.
export const BASE_URL = "http://20.196.89.99:8080";
// 웹소켓 연결을 위한 URL을 http:// 스킴으로 정의합니다.
// 백엔드 WebSocketConfig에 정의된 엔드포인트인 '/ws'를 SockJS 클라이언트가 사용합니다.
const WS_CONNECTION_URL = `http://20.196.89.99:8080/ws`;

export const ChatProvider = ({ children }) => {
  const [selectedRoom, setSelectedRoom] = useState(null); // 이제 객체를 저장
  const [messages, setMessages] = useState({});
  const webSocketRef = useRef(null);

  // 현재 사용자 정보 (임시 데이터, 실제로는 로그인 정보에서 가져와야 함)
  const [currentUserInfo, setCurrentUserInfo] = useState({
    email: 'testuser@example.com',
    nickname: '테스트유저'
  });

  const connectWebSocket = useCallback(async () => {
    if (!selectedRoom) {
      console.log("[WebSocket] 방이 선택되지 않아 연결을 시도하지 않습니다.");
      return;
    }

    // selectedRoom이 객체이므로, ID를 추출하여 사용
    const roomId = selectedRoom.id; // 여기서 selectedRoom.id를 사용하도록 수정

    if (webSocketRef.current && webSocketRef.current.connected) {
      console.log(`[WebSocket:${roomId}] 기존 연결 비활성화.`);
      webSocketRef.current.deactivate();
    }

    const token = localStorage.getItem('token');

    if (!token) {
      console.error("웹소켓 연결을 위한 인증 토큰이 없습니다. 로그인 상태를 확인해주세요.");
      return;
    }

    let projectId = null;
    if (roomId.startsWith('project-')) { // roomId에 startsWith 호출
      projectId = roomId.replace('project-', '');
    } else {
      console.warn(`[WebSocket] 현재는 프로젝트 채팅방만 지원합니다. (${roomId})`);
      return;
    }

    const stompClient = Stomp.over(function() {
      return new SockJS(WS_CONNECTION_URL);
    });

    stompClient.debug = (str) => {
      // console.log(str);
    };

    const headers = {
      'Authorization': `Bearer ${token}`
    };

    stompClient.connect(headers, (frame) => {
      console.log(`[STOMP] 웹소켓에 성공적으로 연결되었습니다. 방: ${roomId}`, frame);

      const joinMessage = {
        projectId: parseInt(projectId), // 백엔드에서 Long 타입이므로 숫자로 변환
        senderEmail: currentUserInfo.email,
        senderNickname: currentUserInfo.nickname,
        content: `${currentUserInfo.nickname}님이 입장했습니다.`,
        type: 'JOIN', // MessageType.JOIN
        timestamp: new Date().toISOString()
      };
      stompClient.send(`/app/chat.addUser`, {}, JSON.stringify(joinMessage));
      console.log(`[WebSocket:${roomId}] 입장 메시지 전송:`, joinMessage);

      stompClient.subscribe(`/topic/project/${projectId}`, (message) => {
        try {
          const newMessage = JSON.parse(message.body);
          const formattedMessage = {
            id: newMessage.id || Date.now(),
            sender: newMessage.senderNickname || newMessage.senderEmail,
            text: newMessage.content,
            timestamp: newMessage.timestamp,
            isOwn: newMessage.senderEmail === currentUserInfo.email,
            date: new Date(newMessage.timestamp).toISOString().slice(0, 10),
            time: new Date(newMessage.timestamp).toTimeString().slice(0, 5)
          };
          setMessages(prevMessages => ({
            ...prevMessages,
            [roomId]: [...(prevMessages[roomId] || []), formattedMessage] // 키도 roomId로 변경
          }));
          console.log(`[WebSocket:${roomId}] 메시지 수신:`, formattedMessage);
        } catch (e) {
          console.error(`[WebSocket:${roomId}] 메시지 파싱 오류:`, e, message.body);
        }
      });
      console.log(`[WebSocket:${roomId}] 구독 시작: /topic/project/${projectId}`);

      const fetchRecentMessages = async () => {
        try {
          const response = await axios.get(`${BASE_URL}/api/projects/${projectId}/chat/recent`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const fetchedMessages = response.data;
          console.log(`[HTTP] 최근 메시지 로드 (${roomId}):`, fetchedMessages);

          const formattedFetchedMessages = Array.isArray(fetchedMessages) ? fetchedMessages.map(msg => ({
            id: msg.id,
            sender: msg.senderNickname || msg.senderEmail,
            text: msg.content,
            timestamp: msg.timestamp,
            isOwn: msg.senderEmail === currentUserInfo.email,
            date: new Date(msg.timestamp).toISOString().slice(0, 10),
            time: new Date(msg.timestamp).toTimeString().slice(0, 5)
          })) : [];

          setMessages(prev => ({
            ...prev,
            [roomId]: formattedFetchedMessages // 키도 roomId로 변경
          }));

        } catch (error) {
          console.error(`[HTTP] 최근 메시지 로드 실패 (${roomId}):`, error);
        }
      };
      fetchRecentMessages();

    }, (error) => {
      console.error(`[STOMP] 웹소켓 연결 에러가 발생했습니다. 방: ${roomId}`, error);
    });

    webSocketRef.current = stompClient;

  }, [selectedRoom, currentUserInfo.email]); // selectedRoom 객체 전체를 의존성으로 사용

  const leaveChatRoom = useCallback((roomId) => {
    if (webSocketRef.current && webSocketRef.current.connected && roomId) {
      let projectId = null;
      if (roomId.startsWith('project-')) { // roomId에 startsWith 호출
        projectId = roomId.replace('project-', '');
      } else {
        console.warn("[WebSocket] 현재는 프로젝트 채팅방만 메시지 전송을 지원합니다.");
        return;
      }

      const leaveMessage = {
        projectId: parseInt(projectId),
        senderEmail: currentUserInfo.email,
        senderNickname: currentUserInfo.nickname,
        content: `${currentUserInfo.nickname}님이 나갔습니다.`,
        type: 'LEAVE',
        timestamp: new Date().toISOString()
      };
      webSocketRef.current.send(`/app/chat.leaveUser`, {}, JSON.stringify(leaveMessage));
      console.log(`[WebSocket:${roomId}] 퇴장 메시지 전송:`, leaveMessage);

      webSocketRef.current.deactivate();
      console.log(`[STOMP] 웹소켓 연결이 끊어졌습니다. (방 ${roomId} 퇴장).`);
    }
    setSelectedRoom(null); // 방 선택 해제
  }, [currentUserInfo, setSelectedRoom]);


  useEffect(() => {
    // selectedRoom이 객체이므로, selectedRoom이 null이 아닐 때만 connectWebSocket 호출
    if (selectedRoom) {
      connectWebSocket();
    } else {
      if (webSocketRef.current && webSocketRef.current.connected) {
        webSocketRef.current.deactivate();
        console.log("[STOMP] 웹소켓 연결이 끊어졌습니다. (방 선택 해제).");
      }
    }

    return () => {
      if (webSocketRef.current && webSocketRef.current.connected) {
        webSocketRef.current.deactivate();
        console.log("[STOMP] 웹소켓 연결이 정리(deactivate)되었습니다.");
      }
    };
  }, [selectedRoom, connectWebSocket]); // selectedRoom 객체 전체를 의존성으로 사용

  const sendMessage = useCallback((messageContent) => {
    if (webSocketRef.current && webSocketRef.current.connected && selectedRoom && messageContent.trim()) {
      // selectedRoom이 객체이므로, ID를 추출하여 사용
      let projectId = null;
      if (selectedRoom.id.startsWith('project-')) { // selectedRoom.id에 startsWith 호출
        projectId = selectedRoom.id.replace('project-', '');
      } else {
        console.warn("[WebSocket] 현재는 프로젝트 채팅방만 메시지 전송을 지원합니다.");
        return;
      }

      const chatMessage = {
        projectId: parseInt(projectId),
        senderEmail: currentUserInfo.email,
        senderNickname: currentUserInfo.nickname,
        content: messageContent,
        type: 'CHAT',
        timestamp: new Date().toISOString()
      };
      webSocketRef.current.send(`/app/chat.sendMessage`, {}, JSON.stringify(chatMessage));
      console.log(`[WebSocket:${selectedRoom.id}] 메시지 전송:`, chatMessage); // 로그도 selectedRoom.id 사용
    } else {
      console.warn("[WebSocket] 메시지를 보낼 수 없습니다. 연결 상태 또는 방 선택을 확인하세요.");
    }
  }, [selectedRoom, currentUserInfo]);

  const getMessagesForSelectedRoom = useCallback(() => {
    // selectedRoom이 객체이므로, ID를 키로 사용
    return messages[selectedRoom ? selectedRoom.id : null] || [];
  }, [messages, selectedRoom]);

  const value = {
    selectedRoom,
    setSelectedRoom,
    messages: getMessagesForSelectedRoom(),
    sendMessage,
    currentUserInfo,
    leaveChatRoom
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};