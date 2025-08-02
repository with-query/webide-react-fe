/*import { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react';
import { Stomp } from '@stomp/stompjs';
import SockJS from 'sockjs-client'; // SockJS 재도입
import axios from 'axios';

const ChatContext = createContext();

// HTTP API 호출을 위한 기본 URL입니다.
export const BASE_URL = "http://20.196.89.99:8080";
// 웹소켓 연결을 위한 URL을 http:// 스킴으로 정의합니다.
// 백엔드 WebSocketConfig에 정의된 엔드포인트인 '/ws'를 SockJS 클라이언트가 사용합니다.
// BASE_URL을 기반으로 URL을 생성하도록 수정했습니다.
const WS_CONNECTION_URL = `${BASE_URL}/ws`; 

export const ChatProvider = ({ children }) => {
  const [selectedRoom, setSelectedRoom] = useState(null); // 이제 객체를 저장
  const [messages, setMessages] = useState({});
  const webSocketRef = useRef(null);

  // 현재 사용자 정보 상태. 초기에는 null로 설정하여 로딩 중임을 나타냅니다.
  const [currentUserInfo, setCurrentUserInfo] = useState(null); 

  // 로그인한 사용자 정보를 API에서 불러오는 useEffect
  useEffect(() => {
    const fetchUserInfo = async () => {
      const token = localStorage.getItem('token'); // 로컬 스토리지에서 토큰 가져오기

      if (!token) {
        console.warn("사용자 정보를 불러올 토큰이 없습니다. 로그인 상태를 확인해주세요.");
        // 실제 앱에서는 로그인 페이지로 리디렉션하거나 사용자에게 알림을 띄울 수 있습니다.
        return;
      }

      try {
        const response = await axios.get(`${BASE_URL}/api/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCurrentUserInfo(response.data); // 불러온 사용자 정보로 상태 업데이트
        console.log("현재 로그인 사용자 정보:", response.data);
      } catch (error) {
        console.error("사용자 정보를 불러오는 데 실패했습니다:", error);
        // 오류 발생 시 사용자에게 알림을 띄우거나 로그인 페이지로 리디렉션할 수 있습니다.
        // 예: toast({ title: "사용자 정보 로드 실패", status: "error" });
      }
    };

    fetchUserInfo();
  }, []); // 컴포넌트가 마운트될 때 한 번만 실행

  const connectWebSocket = useCallback(async () => {
    // currentUserInfo가 아직 로드되지 않았다면 연결 시도하지 않음
    if (!currentUserInfo) {
      console.log("[WebSocket] 사용자 정보가 로드되지 않아 연결을 시도하지 않습니다.");
      return;
    }
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
        senderEmail: currentUserInfo.email, // 불러온 사용자 정보 사용
        senderNickname: currentUserInfo.nickname, // 불러온 사용자 정보 사용
        content: `${currentUserInfo.nickname}님이 입장했습니다.`,
        type: 'JOIN', // MessageType.JOIN
        timestamp: new Date().toISOString()
      };
      stompClient.send(`/app/chat.addUser`, {}, JSON.stringify(joinMessage));
      console.log(`[WebSocket:${roomId}] 입장 메시지 전송:`, joinMessage);

      stompClient.subscribe(`/topic/project/${projectId}`, (message) => {
        try {
          const newMessage = JSON.parse(message.body);
          // 메시지 타입(JOIN, LEAVE, CHAT)을 formattedMessage에 포함하여 UI에서 구분할 수 있도록 합니다.
          const formattedMessage = {
            id: newMessage.id || Date.now(),
            sender: newMessage.senderNickname || newMessage.senderEmail,
            text: newMessage.content,
            timestamp: newMessage.timestamp,
            isOwn: newMessage.senderEmail === currentUserInfo.email,
            date: new Date(newMessage.timestamp).toISOString().slice(0, 10),
            time: new Date(newMessage.timestamp).toTimeString().slice(0, 5),
            type: newMessage.type // 메시지 타입 추가
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
            time: new Date(msg.timestamp).toTimeString().slice(0, 5),
            type: msg.type // 메시지 타입 추가
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

  }, [selectedRoom, currentUserInfo]); // currentUserInfo 객체 전체를 의존성으로 사용

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
        senderEmail: currentUserInfo.email, // 불러온 사용자 정보 사용
        senderNickname: currentUserInfo.nickname, // 불러온 사용자 정보 사용
        content: `${currentUserInfo.nickname}님이 나갔습니다.`,
        type: 'LEAVE',
        timestamp: new Date().toISOString()
      };
      // 백엔드 ChatController의 @MessageMapping("/chat.leaveUser")와 일치해야 합니다.
      webSocketRef.current.send(`/app/chat.leaveUser`, {}, JSON.stringify(leaveMessage));
      console.log(`[WebSocket:${roomId}] 퇴장 메시지 전송:`, leaveMessage);

      webSocketRef.current.deactivate();
      console.log(`[STOMP] 웹소켓 연결이 끊어졌습니다. (방 ${roomId} 퇴장).`);
    }
    setSelectedRoom(null); // 방 선택 해제
  }, [currentUserInfo, setSelectedRoom]);


  useEffect(() => {
    // currentUserInfo가 로드된 후에만 connectWebSocket 호출
    if (selectedRoom && currentUserInfo) { 
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
  }, [selectedRoom, currentUserInfo, connectWebSocket]); // currentUserInfo를 의존성으로 추가

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
        senderEmail: currentUserInfo.email, // 불러온 사용자 정보 사용
        senderNickname: currentUserInfo.nickname, // 불러온 사용자 정보 사용
        content: messageContent,
        type: 'CHAT',
        timestamp: new Date().toISOString()
      };
      // 메시지 전송 경로 설정
      // 백엔드(Spring Boot)의 @MessageMapping("/chat.sendMessage")와 일치해야 합니다.
      webSocketRef.current.send(`/app/chat.sendMessage`, {}, JSON.stringify(chatMessage));
      console.log(`[WebSocket:${selectedRoom.id}] 메시지 전송:`, chatMessage); // 로그도 selectedRoom.id 사용
    } else {
      console.warn("[WebSocket] 메시지를 보낼 수 없습니다. 연결 상태 또는 방 선택을 확인하세요.");
    }
  }, [selectedRoom, currentUserInfo]); // currentUserInfo를 의존성으로 추가

  const getMessagesForSelectedRoom = useCallback(() => {
    // selectedRoom이 객체이므로, ID를 키로 사용
    return messages[selectedRoom ? selectedRoom.id : null] || [];
  }, [messages, selectedRoom]);

  const value = {
    selectedRoom,
    setSelectedRoom,
    messages: getMessagesForSelectedRoom(),
    sendMessage,
    currentUserInfo, // 현재 사용자 정보도 Context를 통해 제공
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
*/import { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react';
import { Stomp } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import axios from 'axios';

const ChatContext = createContext();

export const BASE_URL = "http://20.196.89.99:8080";
const WS_CONNECTION_URL = `${BASE_URL}/ws`; 

export const ChatProvider = ({ children }) => {
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [messages, setMessages] = useState({});
  const webSocketRef = useRef(null);

  const [currentUserInfo, setCurrentUserInfo] = useState(null); 

  useEffect(() => {
    const fetchUserInfo = async () => {
      const token = localStorage.getItem('token');

      if (!token) {
        console.warn("사용자 정보를 불러올 토큰이 없습니다. 로그인 상태를 확인해주세요.");
        return;
      }

      try {
        const response = await axios.get(`${BASE_URL}/api/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCurrentUserInfo(response.data);
        console.log("현재 로그인 사용자 정보:", response.data);
      } catch (error) {
        console.error("사용자 정보를 불러오는 데 실패했습니다:", error);
      }
    };

    fetchUserInfo();
  }, []);

  const connectWebSocket = useCallback(async () => {
    if (!currentUserInfo) {
      console.log("[WebSocket] 사용자 정보가 로드되지 않아 연결을 시도하지 않습니다.");
      return;
    }
    if (!selectedRoom) {
      console.log("[WebSocket] 방이 선택되지 않아 연결을 시도하지 않습니다.");
      return;
    }

    const roomId = selectedRoom.id;

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
    if (roomId.startsWith('project-')) {
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
        projectId: parseInt(projectId),
        senderEmail: currentUserInfo.email,
        senderNickname: currentUserInfo.nickname,
        content: `${currentUserInfo.nickname}님이 입장했습니다.`,
        type: 'JOIN',
        timestamp: new Date().toISOString()
      };
      stompClient.send(`/app/chat.addUser`, {}, JSON.stringify(joinMessage));
      console.log(`[WebSocket:${roomId}] 입장 메시지 전송:`, joinMessage);

      stompClient.subscribe(`/topic/project/${projectId}`, (message) => {
        try {
          const newMessage = JSON.parse(message.body);
          console.log(`[WebSocket:${roomId}] 수신된 원본 메시지:`, newMessage); // 디버깅 로그 추가
          const formattedMessage = {
            id: newMessage.id || Date.now(),
            sender: newMessage.senderNickname || newMessage.senderEmail,
            // 'text'는 일반 채팅 메시지 내용, 'content'는 시스템 메시지 내용으로 사용
            text: newMessage.content, 
            content: newMessage.content, // 'content' 필드도 그대로 전달
            timestamp: newMessage.timestamp,
            isOwn: newMessage.senderEmail === currentUserInfo.email,
            date: new Date(newMessage.timestamp).toISOString().slice(0, 10),
            time: new Date(newMessage.timestamp).toTimeString().slice(0, 5),
            type: newMessage.type
          };
          setMessages(prevMessages => ({
            ...prevMessages,
            [roomId]: [...(prevMessages[roomId] || []), formattedMessage]
          }));
          console.log(`[WebSocket:${roomId}] 포맷된 메시지:`, formattedMessage); // 디버깅 로그 추가
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
          console.log(`[HTTP] 불러온 최근 메시지 원본:`, fetchedMessages); // 디버깅 로그 추가

          const formattedFetchedMessages = Array.isArray(fetchedMessages) ? fetchedMessages.map(msg => ({
            id: msg.id,
            sender: msg.senderNickname || msg.senderEmail,
            text: msg.content, // msg.content가 비어있는지 확인
            content: msg.content, // 'content' 필드도 그대로 전달
            timestamp: msg.timestamp,
            isOwn: msg.senderEmail === currentUserInfo.email,
            date: new Date(msg.timestamp).toISOString().slice(0, 10),
            time: new Date(msg.timestamp).toTimeString().slice(0, 5),
            type: msg.type
          })) : [];

          setMessages(prev => ({
            ...prev,
            [roomId]: formattedFetchedMessages
          }));
          console.log(`[HTTP] 포맷된 최근 메시지:`, formattedFetchedMessages); // 디버깅 로그 추가

        } catch (error) {
          console.error(`[HTTP] 최근 메시지 로드 실패 (${roomId}):`, error);
        }
      };
      fetchRecentMessages();

    }, (error) => {
      console.error(`[STOMP] 웹소켓 연결 에러가 발생했습니다. 방: ${roomId}`, error);
    });

    webSocketRef.current = stompClient;

  }, [selectedRoom, currentUserInfo]);

  const leaveChatRoom = useCallback((roomId) => {
    if (webSocketRef.current && webSocketRef.current.connected && roomId) {
      let projectId = null;
      if (roomId.startsWith('project-')) {
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
    setSelectedRoom(null);
  }, [currentUserInfo, setSelectedRoom]);


  useEffect(() => {
    if (selectedRoom && currentUserInfo) { 
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
  }, [selectedRoom, currentUserInfo, connectWebSocket]);

  const sendMessage = useCallback((messageContent) => {
    if (webSocketRef.current && webSocketRef.current.connected && selectedRoom && messageContent.trim()) {
      let projectId = null;
      if (selectedRoom.id.startsWith('project-')) {
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
      console.log(`[WebSocket:${selectedRoom.id}] 메시지 전송:`, chatMessage);
    } else {
      console.warn("[WebSocket] 메시지를 보낼 수 없습니다. 연결 상태 또는 방 선택을 확인하세요.");
    }
  }, [selectedRoom, currentUserInfo]);

  const getMessagesForSelectedRoom = useCallback(() => {
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
