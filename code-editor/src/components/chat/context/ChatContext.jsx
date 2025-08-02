/*import { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react';
import { Stomp } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import axios from 'axios';

const ChatContext = createContext();

export const BASE_URL = "http://20.196.89.99:8080";
const WS_CONNECTION_URL = `${BASE_URL}/chat`; // SockJS 엔드포인트 URL

export const ChatProvider = ({ children }) => {
  const [selectedRoom, setSelectedRoom] = useState(null);
  // messages는 projectId를 키로 하고, 해당 프로젝트의 메시지 배열을 값으로 가집니다.
  const [messages, setMessages] = useState({});
  const webSocketRef = useRef(null); // STOMP 클라이언트 인스턴스를 저장할 Ref

  // 현재 로그인한 사용자의 이메일과 닉네임을 관리하는 상태 (예시)
  // 실제 앱에서는 로그인 후 이 정보를 가져와 설정해야 합니다.
  const [currentUserInfo, setCurrentUserInfo] = useState({
    email: 'testuser@example.com', // 실제 사용자 이메일로 교체 필요!
    nickname: '테스트유저' // 실제 사용자 닉네임으로 교체 필요!
  });

  // 웹소켓 연결 및 초기 메시지 로드 로직
  const connectWebSocket = useCallback(async () => {
    if (!selectedRoom) {
      console.log("[WebSocket] 방이 선택되지 않아 연결을 시도하지 않습니다.");
      return;
    }

    // 기존 연결이 있다면 비활성화하고 정리
    if (webSocketRef.current && webSocketRef.current.connected) {
      console.log(`[WebSocket:${selectedRoom}] 기존 연결 비활성화.`);
      webSocketRef.current.deactivate();
    }

    const token = localStorage.getItem('token'); // `localStorage`에서 인증 토큰 가져오기

    if (!token) {
      console.error("웹소켓 연결을 위한 인증 토큰이 없습니다. 로그인 상태를 확인해주세요.");
      // 실제 앱에서는 여기서 로그인 페이지로 리디렉션하는 로직을 추가할 수 있습니다.
      return;
    }

    // 프로젝트 ID 추출 (예: 'project-123' -> '123')
    let projectId = null;
    if (selectedRoom.startsWith('project-')) {
      projectId = selectedRoom.replace('project-', '');
    } else {
      console.warn(`[WebSocket] 현재는 프로젝트 채팅방만 지원합니다. (${selectedRoom})`);
      return;
    }

    // 1. SockJS 클라이언트 생성 (http/https 스키마 사용)
    const stompClient = Stomp.over(function () {
      return new SockJS(WS_CONNECTION_URL);
    });
    
    stompClient.debug = (str) => {
      // console.log(str); // 개발 중 STOMP 로그를 보고 싶다면 주석 해제
    };

    // 2. STOMP 연결 시 헤더에 인증 토큰 포함
    const headers = {
      'Authorization': `Bearer ${token}`
    };
    
    stompClient.connect(headers, (frame) => {
      // onConnect 로직: 연결 성공 시
      console.log(`[STOMP] 웹소켓에 성공적으로 연결되었습니다. 방: ${selectedRoom}`, frame);
      
      // 3. 연결 성공 후 메시지 구독
      stompClient.subscribe(`/topic/chat/${selectedRoom}`, (message) => {
        try {
          const newMessage = JSON.parse(message.body);
          // 서버에서 받은 메시지 형식에 따라 클라이언트에서 사용할 형식으로 변환
          const formattedMessage = {
            id: newMessage.id || Date.now(), // 메시지 ID가 없다면 임시 ID 생성
            sender: newMessage.senderNickname || newMessage.senderEmail, // 닉네임 우선, 없으면 이메일
            text: newMessage.content,
            timestamp: newMessage.timestamp,
            // 현재 로그인한 사용자의 이메일과 메시지 발신자 이메일을 비교하여 isOwn 설정
            isOwn: newMessage.senderEmail === currentUserInfo.email,
            date: new Date(newMessage.timestamp).toISOString().slice(0, 10),
            time: new Date(newMessage.timestamp).toTimeString().slice(0, 5)
          };
          setMessages(prevMessages => ({
            ...prevMessages,
            [selectedRoom]: [...(prevMessages[selectedRoom] || []), formattedMessage]
          }));
          console.log(`[WebSocket:${selectedRoom}] 메시지 수신:`, formattedMessage);
        } catch (e) {
          console.error(`[WebSocket:${selectedRoom}] 메시지 파싱 오류:`, e, message.body);
        }
      });
      console.log(`[WebSocket:${selectedRoom}] 구독 시작: /topic/chat/${selectedRoom}`);

      // 4. HTTP API를 통해 최근 채팅 메시지 불러오기 (연결 성공 후)
      // 이 로직은 STOMP 연결 성공 콜백 내부에 두어, 연결이 확립된 후에 메시지를 가져오도록 합니다.
      const fetchRecentMessages = async () => {
        try {
          const response = await axios.get(`${BASE_URL}/api/projects/${projectId}/chat/recent`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const fetchedMessages = response.data;
          console.log(`[HTTP] 최근 메시지 로드 (${selectedRoom}):`, fetchedMessages);

          const formattedFetchedMessages = Array.isArray(fetchedMessages) ? fetchedMessages.map(msg => ({
            id: msg.id,
            sender: msg.senderNickname || msg.senderEmail,
            text: msg.content,
            timestamp: msg.timestamp,
            isOwn: msg.senderEmail === currentUserInfo.email, // 현재 사용자 이메일과 비교
            date: new Date(msg.timestamp).toISOString().slice(0, 10),
            time: new Date(msg.timestamp).toTimeString().slice(0, 5)
          })) : [];

          setMessages(prev => ({
            ...prev,
            [selectedRoom]: formattedFetchedMessages
          }));

        } catch (error) {
          console.error(`[HTTP] 최근 메시지 로드 실패 (${selectedRoom}):`, error);
          // 에러 처리 (예: toast)
        }
      };
      fetchRecentMessages();

    }, (error) => {
      // onStompError 로직: 연결 에러 발생 시
      console.error(`[STOMP] 웹소켓 연결 에러가 발생했습니다. 방: ${selectedRoom}`, error);
      // 웹소켓 연결 실패 시 사용자에게 알림 (예: toast)
    });

    webSocketRef.current = stompClient; // STOMP 클라이언트 인스턴스 저장

  }, [selectedRoom, currentUserInfo.email]); // selectedRoom 또는 currentUserInfo.email이 변경될 때마다 connectWebSocket 함수가 다시 생성되도록 의존성 추가

  // 컴포넌트 마운트/언마운트 및 selectedRoom 변경 시 웹소켓 연결/해제 관리
  useEffect(() => {
    if (selectedRoom) {
      // 새로운 방 선택 시 이전 메시지 초기화 (선택적)
      // setMessages({}); // 이 줄을 주석 처리하면 방을 오갈 때 메시지 기록이 유지됩니다.
      connectWebSocket(); // 새로운 방으로 연결 시도
    } else {
      // 방 선택 해제 시 현재 웹소켓 연결 끊기
      if (webSocketRef.current && webSocketRef.current.connected) {
        webSocketRef.current.deactivate();
        console.log("[STOMP] 웹소켓 연결이 끊어졌습니다. (방 선택 해제).");
      }
      // setMessages({}); // 모든 메시지 상태 초기화 (선택적)
    }

    // 컴포넌트 언마운트 시 또는 selectedRoom 변경 시 이전 웹소켓 연결 정리
    return () => {
      if (webSocketRef.current && webSocketRef.current.connected) {
        webSocketRef.current.deactivate();
        console.log("[STOMP] 웹소켓 연결이 정리(deactivate)되었습니다.");
      }
    };
  }, [selectedRoom, connectWebSocket]);

  // 메시지 전송 로직
  const sendMessage = useCallback((messageContent) => {
    if (webSocketRef.current && webSocketRef.current.connected && selectedRoom && messageContent.trim()) {
      let projectId = null;
      if (selectedRoom.startsWith('project-')) {
        projectId = selectedRoom.replace('project-', '');
      } else {
        console.warn("[WebSocket] 현재는 프로젝트 채팅방만 메시지 전송을 지원합니다.");
        return;
      }

      const chatMessage = {
        projectId: projectId, // 서버 API에 맞는 projectId (숫자)
        senderEmail: currentUserInfo.email, // 실제 로그인한 사용자 이메일
        senderNickname: currentUserInfo.nickname, // 실제 로그인한 사용자 닉네임
        content: messageContent,
        type: 'CHAT', // 메시지 타입 (서버와 협의된 타입)
        timestamp: new Date().toISOString()
      };
      // 메시지 전송 경로 설정
      // 백엔드(Spring Boot)의 @MessageMapping("/chat.sendMessage/{projectId}")와 일치해야 합니다.
      webSocketRef.current.send(`/app/chat.sendMessage/${projectId}`, {}, JSON.stringify(chatMessage));
      console.log(`[WebSocket:${selectedRoom}] 메시지 전송:`, chatMessage);
    } else {
      console.warn("[WebSocket] 메시지를 보낼 수 없습니다. 연결 상태 또는 방 선택을 확인하세요.");
    }
  }, [selectedRoom, currentUserInfo]);

  // 현재 선택된 방의 메시지만 반환하도록 messages getter를 사용
  const getMessagesForSelectedRoom = useCallback(() => {
    return messages[selectedRoom] || [];
  }, [messages, selectedRoom]);

  const value = {
    selectedRoom,
    setSelectedRoom,
    messages: getMessagesForSelectedRoom(), // 현재 선택된 방의 메시지만 전달
    sendMessage,
    currentUserInfo // 현재 사용자 정보도 Context를 통해 제공 (선택적)
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
};*/
import { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react';
import { Stomp } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import axios from 'axios';

const ChatContext = createContext();

export const BASE_URL = "http://20.196.89.99:8080";
const WS_CONNECTION_URL = `${BASE_URL}/chat`; // SockJS 엔드포인트 URL

export const ChatProvider = ({ children }) => {
  const [selectedRoom, setSelectedRoom] = useState(null);
  // messages는 projectId를 키로 하고, 해당 프로젝트의 메시지 배열을 값으로 가집니다.
  const [messages, setMessages] = useState({});
  const webSocketRef = useRef(null); // STOMP 클라이언트 인스턴스를 저장할 Ref

  // 현재 로그인한 사용자의 이메일과 닉네임을 관리하는 상태 (예시)
  // 실제 앱에서는 로그인 후 이 정보를 가져와 설정해야 합니다.
  const [currentUserInfo, setCurrentUserInfo] = useState({
    email: 'testuser@example.com', // 실제 사용자 이메일로 교체 필요!
    nickname: '테스트유저' // 실제 사용자 닉네임으로 교체 필요!
  });

  // 웹소켓 연결 및 초기 메시지 로드 로직
  const connectWebSocket = useCallback(async () => {
    if (!selectedRoom) {
      console.log("[WebSocket] 방이 선택되지 않아 연결을 시도하지 않습니다.");
      return;
    }

    // 기존 연결이 있다면 비활성화하고 정리
    if (webSocketRef.current && webSocketRef.current.connected) {
      console.log(`[WebSocket:${selectedRoom}] 기존 연결 비활성화.`);
      webSocketRef.current.deactivate();
    }

    const token = localStorage.getItem('token'); // `localStorage`에서 인증 토큰 가져오기

    if (!token) {
      console.error("웹소켓 연결을 위한 인증 토큰이 없습니다. 로그인 상태를 확인해주세요.");
      // 실제 앱에서는 여기서 로그인 페이지로 리디렉션하는 로직을 추가할 수 있습니다.
      return;
    }

    // 프로젝트 ID 추출 (예: 'project-123' -> '123')
    let projectId = null;
    if (selectedRoom.startsWith('project-')) {
      projectId = selectedRoom.replace('project-', '');
    } else {
      console.warn(`[WebSocket] 현재는 프로젝트 채팅방만 지원합니다. (${selectedRoom})`);
      return;
    }

    // 1. SockJS 클라이언트 생성 (http/https 스키마 사용)
    const stompClient = Stomp.over(function () {
      return new SockJS(WS_CONNECTION_URL);
    });
    
    stompClient.debug = (str) => {
       console.log(str); // 개발 중 STOMP 로그를 보고 싶다면 주석 해제
    };

    // 2. STOMP 연결 시 헤더에 인증 토큰 포함
    const headers = {
      'Authorization': `Bearer ${token}`
    };
    
    stompClient.connect(headers, (frame) => {
      // onConnect 로직: 연결 성공 시
      console.log(`[STOMP] 웹소켓에 성공적으로 연결되었습니다. 방: ${selectedRoom}`, frame);
      
      // 3. 연결 성공 후 메시지 구독
      stompClient.subscribe(`/topic/chat/${selectedRoom}`, (message) => {
        try {
          const newMessage = JSON.parse(message.body);
          // 서버에서 받은 메시지 형식에 따라 클라이언트에서 사용할 형식으로 변환
          const formattedMessage = {
            id: newMessage.id || Date.now(), // 메시지 ID가 없다면 임시 ID 생성
            sender: newMessage.senderNickname || newMessage.senderEmail, // 닉네임 우선, 없으면 이메일
            text: newMessage.content,
            timestamp: newMessage.timestamp,
            // 현재 로그인한 사용자의 이메일과 메시지 발신자 이메일을 비교하여 isOwn 설정
            isOwn: newMessage.senderEmail === currentUserInfo.email,
            date: new Date(newMessage.timestamp).toISOString().slice(0, 10),
            time: new Date(newMessage.timestamp).toTimeString().slice(0, 5)
          };
          setMessages(prevMessages => ({
            ...prevMessages,
            [selectedRoom]: [...(prevMessages[selectedRoom] || []), formattedMessage]
          }));
          console.log(`[WebSocket:${selectedRoom}] 메시지 수신:`, formattedMessage);
        } catch (e) {
          console.error(`[WebSocket:${selectedRoom}] 메시지 파싱 오류:`, e, message.body);
        }
      });
      console.log(`[WebSocket:${selectedRoom}] 구독 시작: /topic/chat/${selectedRoom}`);

      // 4. HTTP API를 통해 최근 채팅 메시지 불러오기 (연결 성공 후)
      // 이 로직은 STOMP 연결 성공 콜백 내부에 두어, 연결이 확립된 후에 메시지를 가져오도록 합니다.
      const fetchRecentMessages = async () => {
        try {
          const response = await axios.get(`${BASE_URL}/api/projects/${projectId}/chat/recent`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const fetchedMessages = response.data;
          console.log(`[HTTP] 최근 메시지 로드 (${selectedRoom}):`, fetchedMessages);

          const formattedFetchedMessages = Array.isArray(fetchedMessages) ? fetchedMessages.map(msg => ({
            id: msg.id,
            sender: msg.senderNickname || msg.senderEmail,
            text: msg.content,
            timestamp: msg.timestamp,
            isOwn: msg.senderEmail === currentUserInfo.email, // 현재 사용자 이메일과 비교
            date: new Date(msg.timestamp).toISOString().slice(0, 10),
            time: new Date(msg.timestamp).toTimeString().slice(0, 5)
          })) : [];

          setMessages(prev => ({
            ...prev,
            [selectedRoom]: formattedFetchedMessages
          }));

        } catch (error) {
          console.error(`[HTTP] 최근 메시지 로드 실패 (${selectedRoom}):`, error);
          // 에러 처리 (예: toast)
        }
      };
      fetchRecentMessages();

    }, (error) => {
      // onStompError 로직: 연결 에러 발생 시
      console.error(`[STOMP] 웹소켓 연결 에러가 발생했습니다. 방: ${selectedRoom}`, error);
      // 웹소켓 연결 실패 시 사용자에게 알림 (예: toast)
    });

    webSocketRef.current = stompClient; // STOMP 클라이언트 인스턴스 저장

  }, [selectedRoom, currentUserInfo.email]); // selectedRoom 또는 currentUserInfo.email이 변경될 때마다 connectWebSocket 함수가 다시 생성되도록 의존성 추가

  // 컴포넌트 마운트/언마운트 및 selectedRoom 변경 시 웹소켓 연결/해제 관리
  useEffect(() => {
    if (selectedRoom) {
      // 새로운 방 선택 시 이전 메시지 초기화 (선택적)
      // setMessages({}); // 이 줄을 주석 처리하면 방을 오갈 때 메시지 기록이 유지됩니다.
      connectWebSocket(); // 새로운 방으로 연결 시도
    } else {
      // 방 선택 해제 시 현재 웹소켓 연결 끊기
      if (webSocketRef.current && webSocketRef.current.connected) {
        webSocketRef.current.deactivate();
        console.log("[STOMP] 웹소켓 연결이 끊어졌습니다. (방 선택 해제).");
      }
      // setMessages({}); // 모든 메시지 상태 초기화 (선택적)
    }

    // 컴포넌트 언마운트 시 또는 selectedRoom 변경 시 이전 웹소켓 연결 정리
    return () => {
      if (webSocketRef.current && webSocketRef.current.connected) {
        webSocketRef.current.deactivate();
        console.log("[STOMP] 웹소켓 연결이 정리(deactivate)되었습니다.");
      }
    };
  }, [selectedRoom, connectWebSocket]);

  // 메시지 전송 로직
  const sendMessage = useCallback((messageContent) => {
    if (webSocketRef.current && webSocketRef.current.connected && selectedRoom && messageContent.trim()) {
      let projectId = null;
      if (selectedRoom.startsWith('project-')) {
        projectId = selectedRoom.replace('project-', '');
      } else {
        console.warn("[WebSocket] 현재는 프로젝트 채팅방만 메시지 전송을 지원합니다.");
        return;
      }

      const chatMessage = {
        projectId: projectId, // 서버 API에 맞는 projectId (숫자)
        senderEmail: currentUserInfo.email, // 실제 로그인한 사용자 이메일
        senderNickname: currentUserInfo.nickname, // 실제 로그인한 사용자 닉네임
        content: messageContent,
        type: 'CHAT', // 메시지 타입 (서버와 협의된 타입)
        timestamp: new Date().toISOString()
      };
      // 메시지 전송 경로 설정
      // 백엔드(Spring Boot)의 @MessageMapping("/chat.sendMessage/{projectId}")와 일치해야 합니다.
      webSocketRef.current.send(`/app/chat.sendMessage/${projectId}`, {}, JSON.stringify(chatMessage));
      console.log(`[WebSocket:${selectedRoom}] 메시지 전송:`, chatMessage);
    } else {
      console.warn("[WebSocket] 메시지를 보낼 수 없습니다. 연결 상태 또는 방 선택을 확인하세요.");
    }
  }, [selectedRoom, currentUserInfo]);

  // 현재 선택된 방의 메시지만 반환하도록 messages getter를 사용
  const getMessagesForSelectedRoom = useCallback(() => {
    return messages[selectedRoom] || [];
  }, [messages, selectedRoom]);

  const value = {
    selectedRoom,
    setSelectedRoom,
    messages: getMessagesForSelectedRoom(), // 현재 선택된 방의 메시지만 전달
    sendMessage,
    currentUserInfo // 현재 사용자 정보도 Context를 통해 제공 (선택적)
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