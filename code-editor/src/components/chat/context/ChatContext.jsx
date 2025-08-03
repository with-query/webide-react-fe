/*
import { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react';
import { Stomp } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import axios from 'axios';
import { Box } from '@chakra-ui/react';

const ChatContext = createContext();

export const BASE_URL = "http://20.196.89.99:8080"; // API 기본 URL
const WS_CONNECTION_URL = `${BASE_URL}/ws`; // 웹소켓 연결 URL

export const ChatProvider = ({ children }) => {
  const [selectedRoom, setSelectedRoom] = useState(null); // 현재 선택된 채팅방 정보
  const [allRoomsMessages, setAllRoomsMessages] = useState({}); // 모든 방의 메시지 이력 (채팅 목록 미리보기에 사용)
  const [messages, setMessages] = useState({}); // 현재 선택된 방의 메시지들
  const [loadingInitialChats, setLoadingInitialChats] = useState(true); // 초기 채팅 목록 로딩 여부
  const webSocketRef = useRef(null); // STOMP 클라이언트 참조
  const [currentUserInfo, setCurrentUserInfo] = useState(null); // 현재 로그인 사용자 정보
  const tokenRef = useRef(null); // 인증 토큰 (localStorage에서 가져옴)
  const [projectList, setProjectList] = useState([]); // 모든 프로젝트 목록
  const [currentRoomMembers, setCurrentRoomMembers] = useState([]); // 현재 방의 참여자 목록

  // 1. 사용자 정보 로드 (컴포넌트 마운트 시 한 번)
  useEffect(() => {
    const fetchUserInfo = async () => {
      const token = localStorage.getItem('token');
      tokenRef.current = token;

      if (!token) {
        console.warn("[ChatContext] 사용자 정보를 불러올 토큰이 없습니다. 로그인 상태를 확인해주세요.");
        setCurrentUserInfo(null);
        setLoadingInitialChats(false);
        return;
      }

      try {
        const response = await axios.get(`${BASE_URL}/api/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCurrentUserInfo(response.data);
        console.log("[ChatContext] 현재 로그인 사용자 정보 로드 완료:", response.data);
      } catch (error) {
        console.error("[ChatContext] 사용자 정보를 불러오는 데 실패했습니다:", error);
        setCurrentUserInfo(null);
        setLoadingInitialChats(false);
      }
    };
    fetchUserInfo();
  }, []);

  // 2. 모든 프로젝트 목록 및 채팅 히스토리 로드 (사용자 정보 로드 후)
  const fetchAllProjectsChatHistory = useCallback(async () => {
    const token = tokenRef.current;
    if (!token || !currentUserInfo) {
      console.log("[ChatContext] 토큰 또는 사용자 정보가 없어 모든 프로젝트 채팅 히스토리를 가져올 수 없습니다.");
      setLoadingInitialChats(false);
      return;
    }

    setLoadingInitialChats(true);
    try {
      console.log("[ChatContext] [HTTP] 모든 프로젝트 목록 조회 요청...");
      const projectsResponse = await axios.get(`${BASE_URL}/api/projects`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const projects = projectsResponse.data;
      setProjectList(projects); // 프로젝트 목록 상태 업데이트
      console.log("[ChatContext] [HTTP] 조회된 프로젝트 목록:", projects);

      const newAllRoomsMessages = {};
      
      if (Array.isArray(projects)) {
        for (const project of projects) {
          const projectId = project.id;
          const roomId = `project-${projectId}`; // 방 ID 형식 통일

          try {
            console.log(`[ChatContext] [HTTP] 프로젝트 ${projectId}의 채팅 히스토리 조회 요청...`);
            const historyResponse = await axios.get(`${BASE_URL}/api/projects/${projectId}/chat/history`, {
              headers: { 'Authorization': `Bearer ${token}` }
            });
            const fetchedMsgs = historyResponse.data;
            // console.log(`[ChatContext] [HTTP] 프로젝트 ${projectId}의 원본 채팅 히스토리:`, fetchedMsgs);

            const formattedMsgs = Array.isArray(fetchedMsgs) ? fetchedMsgs.map(msg => ({
              id: msg.id, 
              sender: msg.senderNickname || msg.senderEmail, // 닉네임 우선
              text: msg.content, 
              content: msg.content, 
              timestamp: msg.timestamp,
              isOwn: msg.senderEmail === currentUserInfo.email,
              date: new Date(msg.timestamp).toISOString().slice(0, 10),
              time: new Date(msg.timestamp).toTimeString().slice(0, 5),
              type: msg.type
            })) : [];

            newAllRoomsMessages[roomId] = formattedMsgs;
            // console.log(`[ChatContext] [HTTP] 프로젝트 ${projectId}의 포맷된 채팅 히스토리:`, formattedMsgs);

          } catch (err) {
            console.error(`[ChatContext] [HTTP] 프로젝트 ${projectId}의 채팅 히스토리 로드 실패:`, err);
          }
        }
      } else {
        console.warn("[ChatContext] [HTTP] 프로젝트 목록이 배열이 아닙니다:", projects);
      }

      setAllRoomsMessages(newAllRoomsMessages);
      console.log("[ChatContext] 모든 프로젝트 채팅 히스토리 로딩 완료:", newAllRoomsMessages);

    } catch (error) {
      console.error("[ChatContext] [HTTP] 모든 프로젝트 목록 조회 실패:", error);
    } finally {
      setLoadingInitialChats(false);
    }
  }, [currentUserInfo]); // currentUserInfo 변경 시 다시 실행

  useEffect(() => {
    if (currentUserInfo && tokenRef.current) { 
      fetchAllProjectsChatHistory();
    }
  }, [currentUserInfo, fetchAllProjectsChatHistory]);

  // 3. 특정 방의 멤버 목록을 불러오는 함수 (재사용 가능하도록 useCallback)
  const fetchRoomMembers = useCallback(async (projectId, token) => {
    if (!projectId || !token) {
      setCurrentRoomMembers([]);
      console.log("[ChatContext] fetchRoomMembers: projectId 또는 token이 없어 멤버를 불러올 수 없습니다.");
      return;
    }
    try {
      console.log(`[ChatContext] [HTTP] fetchRoomMembers: 프로젝트 ${projectId}의 멤버 목록 조회 요청...`);
      // TODO: 백엔드 API 엔드포인트에 따라 URL과 응답 파싱을 수정해야 합니다.
      // 예시: API 응답이 [{id: 1, userName: "김철수", userEmail: "kim@example.com"}] 형태일 때
      const response = await axios.get(`${BASE_URL}/api/projects/${projectId}/members`, { 
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const members = response.data.map(member => member.userName || member.userEmail); // userName 우선, 없으면 userEmail
      setCurrentRoomMembers(members);
      console.log(`[ChatContext] [HTTP] fetchRoomMembers: 프로젝트 ${projectId}의 멤버 목록:`, members);
    } catch (error) {
      console.error(`[ChatContext] [HTTP] fetchRoomMembers: 프로젝트 ${projectId}의 멤버 목록 로드 실패:`, error);
      setCurrentRoomMembers([]);
    }
  }, []); // 이 함수 자체는 의존성 없음 (인자로 필요한 값을 받음)

  // 4. 웹소켓 연결 및 현재 방의 히스토리 로드 (selectedRoom 또는 currentUserInfo 변경 시)
  useEffect(() => {
    // 4.1. selectedRoom이 null일 경우 연결 끊고 상태 초기화
    if (!selectedRoom) {
      if (webSocketRef.current && webSocketRef.current.connected) {
        webSocketRef.current.deactivate();
        console.log("[ChatContext] [STOMP] 웹소켓 연결이 끊어졌습니다 (selectedRoom이 null).");
      }
      setMessages({}); // 현재 방 메시지 초기화
      setCurrentRoomMembers([]); // 멤버 목록 초기화
      return; // selectedRoom이 없으면 더 이상 진행하지 않음
    }

    // 4.2. selectedRoom은 있지만, 사용자 정보나 토큰이 로드되지 않았을 경우
    if (!currentUserInfo || !tokenRef.current) {
      console.log("[ChatContext] [WebSocket] 사용자 정보 또는 토큰이 로드되지 않아 연결을 시도하지 않습니다.");
      setCurrentRoomMembers([]); // 정보 부족 시 멤버 목록 초기화
      return;
    }

    const roomId = selectedRoom.id;
    const token = tokenRef.current;
    let projectId = null;

    // 현재는 프로젝트 채팅방만 지원하므로, 다른 타입의 roomId는 처리하지 않음
    if (roomId.startsWith('project-')) {
      projectId = parseInt(roomId.replace('project-', ''));
    } else {
      console.warn(`[ChatContext] [WebSocket] 현재는 프로젝트 채팅방만 지원합니다. (${roomId})`);
      setMessages({});
      setCurrentRoomMembers([]);
      return;
    }

    // 4.3. 기존 웹소켓 연결이 있다면 비활성화
    if (webSocketRef.current && webSocketRef.current.connected) {
      console.log(`[ChatContext] [WebSocket:${roomId}] 기존 연결 비활성화.`);
      webSocketRef.current.deactivate();
    }

    // 4.4. 방이 선택될 때마다 멤버 목록을 즉시 불러오도록 강제
    // ChatList에서 클릭했을 때 selectedRoom이 변경되면 바로 실행됩니다.
    fetchRoomMembers(projectId, token); 

    // 4.5. STOMP 웹소켓 연결
    const stompClient = Stomp.over(function() {
      return new SockJS(WS_CONNECTION_URL);
    });

    //stompClient.debug = (str) => {  console.log(str);  }; // STOMP 디버그 메시지 (필요시 활성화)
    const headers = { 'Authorization': `Bearer ${token}` };

    stompClient.connect(headers, (frame) => {
      console.log(`[ChatContext] [STOMP] 웹소켓에 성공적으로 연결되었습니다. 방: ${roomId}`, frame);

      // 입장 메시지 전송
      const joinMessage = {
        projectId: projectId,
        senderEmail: currentUserInfo.email,
        senderNickname: currentUserInfo.nickname,
        content: `${currentUserInfo.nickname}님이 입장했습니다.`,
        type: 'JOIN',
        timestamp: new Date().toISOString()
      };
      stompClient.send(`/app/chat.addUser`, {}, JSON.stringify(joinMessage));
      console.log(`[ChatContext] [WebSocket:${roomId}] 입장 메시지 전송:`, joinMessage);

      // 메시지 구독
      stompClient.subscribe(`/topic/project/${projectId}`, (message) => {
        try {
          const newMessage = JSON.parse(message.body);
          console.log(`[ChatContext] [WebSocket:${roomId}] 수신된 원본 메시지:`, newMessage); 
          
          // 입장/퇴장 메시지일 경우 멤버 목록을 다시 불러옴 (실시간 업데이트)
          if (newMessage.type === 'JOIN' || newMessage.type === 'LEAVE') {
            fetchRoomMembers(projectId, token); 
          }

          // 수신된 메시지 포맷팅
          const formattedMessage = {
            id: newMessage.id || Date.now(),
            sender: newMessage.senderNickname || newMessage.senderEmail,
            text: newMessage.content, 
            content: newMessage.content,
            timestamp: newMessage.timestamp,
            isOwn: newMessage.senderEmail === currentUserInfo.email,
            date: new Date(newMessage.timestamp).toISOString().slice(0, 10),
            time: new Date(newMessage.timestamp).toTimeString().slice(0, 5),
            type: newMessage.type
          };
          
          // 현재 방 메시지 업데이트
          setMessages(prevMessages => ({
            ...prevMessages,
            [roomId]: [...(prevMessages[roomId] || []), formattedMessage]
          }));
          // 모든 방 메시지 업데이트 (채팅 목록 미리보기를 위함)
          setAllRoomsMessages(prevAll => {
              const currentRoomMsgs = prevAll[roomId] || [];
              const updatedMsgs = [...currentRoomMsgs, formattedMessage];
              return {
                  ...prevAll,
                  [roomId]: updatedMsgs
              };
          });
          console.log(`[ChatContext] [WebSocket:${roomId}] 포맷된 메시지:`, formattedMessage);
        } catch (e) {
          console.error(`[ChatContext] [WebSocket:${roomId}] 메시지 파싱 오류:`, e, message.body);
        }
      });
      console.log(`[ChatContext] [WebSocket:${roomId}] 구독 시작: /topic/project/${projectId}`);

      // 방 선택 시 채팅 히스토리 로드 (웹소켓 연결 성공 후)
      const fetchChatHistoryForSelectedRoom = async () => { 
        try {
          console.log(`[ChatContext] [HTTP] 선택된 방 (${roomId})의 채팅 히스토리 조회 요청...`);
          const response = await axios.get(`${BASE_URL}/api/projects/${projectId}/chat/history`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const fetchedMessages = response.data;
          // console.log(`[ChatContext] [HTTP] API로부터 불러온 원본 채팅 히스토리 (${roomId}):`, fetchedMessages); 

          const formattedFetchedMessages = Array.isArray(fetchedMessages) ? fetchedMessages.map(msg => {
            return {
              id: msg.id, sender: msg.senderNickname || msg.senderEmail, text: msg.content, 
              content: msg.content, timestamp: msg.timestamp, isOwn: msg.senderEmail === currentUserInfo.email,
              date: new Date(msg.timestamp).toISOString().slice(0, 10),
              time: new Date(msg.timestamp).toTimeString().slice(0, 5), type: msg.type
            };
          }) : [];

          setMessages(prev => ({
            ...prev,
            [roomId]: formattedFetchedMessages
          }));
          setAllRoomsMessages(prevAll => ({ // 모든 방 메시지에도 업데이트
              ...prevAll,
              [roomId]: formattedFetchedMessages 
          }));
          console.log(`[ChatContext] [HTTP] 포맷된 채팅 히스토리 (${roomId}):`, formattedFetchedMessages);
        } catch (error) {
          console.error(`[ChatContext] [HTTP] 채팅 히스토리 로드 실패 (${roomId}):`, error);
        }
      };
      fetchChatHistoryForSelectedRoom();

    }, (error) => {
      console.error(`[ChatContext] [STOMP] 웹소켓 연결 에러가 발생했습니다. 방: ${roomId}`, error);
      setCurrentRoomMembers([]); // 연결 에러 시 멤버 목록 초기화
    });

    webSocketRef.current = stompClient;

    // 클린업 함수: 컴포넌트 언마운트 또는 의존성 변경 시 웹소켓 연결 정리
    return () => {
      if (webSocketRef.current && webSocketRef.current.connected) {
          webSocketRef.current.deactivate();
          console.log(`[ChatContext] [STOMP] 웹소켓 연결이 정리(deactivate)되었습니다. (클린업).`);
      }
    };
  }, [selectedRoom, currentUserInfo, fetchRoomMembers, tokenRef.current]); // 중요한 의존성 배열

  // 5. 채팅방 나가기 함수
  const leaveChatRoom = useCallback((roomId) => {
    if (webSocketRef.current && webSocketRef.current.connected && roomId) {
      let projectId = null;
      if (roomId.startsWith('project-')) {
        projectId = roomId.replace('project-', '');
      } else {
        console.warn("[ChatContext] [WebSocket] 현재는 프로젝트 채팅방만 메시지 전송을 지원합니다.");
        return;
      }

      if (currentUserInfo && currentUserInfo.email && currentUserInfo.nickname) {
        const leaveMessage = {
          projectId: parseInt(projectId),
          senderEmail: currentUserInfo.email,
          senderNickname: currentUserInfo.nickname,
          content: `${currentUserInfo.nickname}님이 나갔습니다.`,
          type: 'LEAVE',
          timestamp: new Date().toISOString()
        };
        try {
          webSocketRef.current.send(`/app/chat.leaveUser`, {}, JSON.stringify(leaveMessage));
          console.log(`[ChatContext] [WebSocket:${roomId}] 퇴장 메시지 전송:`, leaveMessage);
        } catch (e) {
          console.error(`[ChatContext] [WebSocket:${roomId}] 퇴장 메시지 전송 실패:`, e);
        }
      } else {
        console.warn("[ChatContext] [WebSocket] 사용자 정보가 없어 퇴장 메시지를 보낼 수 없습니다.");
      }

      webSocketRef.current.deactivate();
      console.log(`[ChatContext] [STOMP] 웹소켓 연결이 끊어졌습니다. (방 ${roomId} 퇴장).`);
    }
    setSelectedRoom(null); // 선택된 방 초기화
    setCurrentRoomMembers([]); // 멤버 목록 초기화
  }, [currentUserInfo, setSelectedRoom]); // 의존성 추가

  // 6. 메시지 전송 함수
  const sendMessage = useCallback((messageContent) => {
    if (webSocketRef.current && webSocketRef.current.connected && selectedRoom && messageContent.trim()) {
      let projectId = null;
      if (selectedRoom.id.startsWith('project-')) { 
        projectId = selectedRoom.id.replace('project-', '');
      } else {
        console.warn("[ChatContext] [WebSocket] 현재는 프로젝트 채팅방만 메시지 전송을 지원합니다.");
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
      console.log(`[ChatContext] [WebSocket:${selectedRoom.id}] 메시지 전송:`, chatMessage);
    } else {
      console.warn("[ChatContext] [WebSocket] 메시지를 보낼 수 없습니다. 연결 상태 또는 방 선택을 확인하세요.");
    }
  }, [selectedRoom, currentUserInfo]);

  // Context를 통해 제공할 값들
  const value = {
    selectedRoom,
    setSelectedRoom,
    messages: messages[selectedRoom ? selectedRoom.id : null] || [], // 현재 방 메시지
    allRoomsMessages, // 모든 방의 메시지 (ChatList에서 사용)
    sendMessage,
    currentUserInfo,
    leaveChatRoom,
    loadingInitialChats,
    projectList, // 프로젝트 목록
    currentRoomMembers, // 현재 방 참여자 목록
  };

  // 초기 로딩 중 UI
  if (!currentUserInfo && !tokenRef.current && loadingInitialChats) { 
    return <Box textAlign="center" py={10}>사용자 정보를 불러오는 중...</Box>;
  }

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
import { Box } from '@chakra-ui/react';
import dayjs from 'dayjs'; // dayjs 임포트
import utc from 'dayjs/plugin/utc'; // dayjs UTC 플러그인
import timezone from 'dayjs/plugin/timezone'; // dayjs Timezone 플러그인

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault('Asia/Seoul'); // 모든 dayjs 작업에 기본 타임존을 KST로 설정

const ChatContext = createContext();

export const BASE_URL = "http://20.196.89.99:8080"; // API 기본 URL
const WS_CONNECTION_URL = `${BASE_URL}/ws`; // 웹소켓 연결 URL

export const ChatProvider = ({ children }) => {
    const [selectedRoom, setSelectedRoom] = useState(null); // 현재 선택된 채팅방 정보
    const [allRoomsMessages, setAllRoomsMessages] = useState({}); // 모든 방의 메시지 이력 (채팅 목록 미리보기에 사용)
    const [messages, setMessages] = useState({}); // 현재 선택된 방의 메시지들
    const [loadingInitialChats, setLoadingInitialChats] = useState(true); // 초기 채팅 목록 로딩 여부
    const webSocketRef = useRef(null); // STOMP 클라이언트 참조
    const [currentUserInfo, setCurrentUserInfo] = useState(null); // 현재 로그인 사용자 정보
    const tokenRef = useRef(null); // 인증 토큰 (localStorage에서 가져옴)
    const [projectList, setProjectList] = useState([]); // 모든 프로젝트 목록
    const [currentRoomMembers, setCurrentRoomMembers] = useState([]); // 현재 방의 참여자 목록

    // 1. 사용자 정보 로드 (컴포넌트 마운트 시 한 번)
    useEffect(() => {
        const fetchUserInfo = async () => {
            const token = localStorage.getItem('ACCESS_TOKEN_KEY');
            tokenRef.current = token;

            if (!token) {
                console.warn("[ChatContext] 사용자 정보를 불러올 토큰이 없습니다. 로그인 상태를 확인해주세요.");
                setCurrentUserInfo(null);
                setLoadingInitialChats(false);
                return;
            }

            try {
                const response = await axios.get(`${BASE_URL}/api/users/me`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setCurrentUserInfo(response.data);
                console.log("[ChatContext] 현재 로그인 사용자 정보 로드 완료:", response.data);
            } catch (error) {
                console.error("[ChatContext] 사용자 정보를 불러오는 데 실패했습니다:", error);
                setCurrentUserInfo(null);
                setLoadingInitialChats(false);
            }
        };
        fetchUserInfo();
    }, []);

    // 2. 모든 프로젝트 목록 및 채팅 히스토리 로드 (사용자 정보 로드 후)
    const fetchAllProjectsChatHistory = useCallback(async () => {
        const token = tokenRef.current;
        if (!token || !currentUserInfo) {
            console.log("[ChatContext] 토큰 또는 사용자 정보가 없어 모든 프로젝트 채팅 히스토리를 가져올 수 없습니다.");
            setLoadingInitialChats(false);
            return;
        }

        setLoadingInitialChats(true);
        try {
            console.log("[ChatContext] [HTTP] 모든 프로젝트 목록 조회 요청...");
            const projectsResponse = await axios.get(`${BASE_URL}/api/projects`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const projects = projectsResponse.data;
            setProjectList(projects); // 프로젝트 목록 상태 업데이트
            console.log("[ChatContext] [HTTP] 조회된 프로젝트 목록:", projects);

            const newAllRoomsMessages = {};
            
            if (Array.isArray(projects)) {
                for (const project of projects) {
                    const projectId = project.id;
                    const roomId = `project-${projectId}`; // 방 ID 형식 통일

                    try {
                        console.log(`[ChatContext] [HTTP] 프로젝트 ${projectId}의 채팅 히스토리 조회 요청...`);
                        const historyResponse = await axios.get(`${BASE_URL}/api/projects/${projectId}/chat/history`, {
                            headers: { 'Authorization': `Bearer ${token}` }
                        });
                        const fetchedMsgs = historyResponse.data;

                        const formattedMsgs = Array.isArray(fetchedMsgs) ? fetchedMsgs.map(msg => ({
                            id: msg.id, 
                            sender: msg.senderNickname || msg.senderEmail, // 닉네임 우선
                            text: msg.content, 
                            content: msg.content, 
                            timestamp: msg.timestamp,
                            isOwn: msg.senderEmail === currentUserInfo.email,
                            // dayjs를 사용하여 KST로 변환
                            date: dayjs.utc(msg.timestamp).tz('Asia/Seoul').format('YYYY-MM-DD'),
                            time: dayjs.utc(msg.timestamp).tz('Asia/Seoul').format('HH:mm'),
                            type: msg.type
                        })) : [];

                        newAllRoomsMessages[roomId] = formattedMsgs;
                    } catch (err) {
                        console.error(`[ChatContext] [HTTP] 프로젝트 ${projectId}의 채팅 히스토리 로드 실패:`, err);
                    }
                }
            } else {
                console.warn("[ChatContext] [HTTP] 프로젝트 목록이 배열이 아닙니다:", projects);
            }

            setAllRoomsMessages(newAllRoomsMessages);
            console.log("[ChatContext] 모든 프로젝트 채팅 히스토리 로딩 완료:", newAllRoomsMessages);

        } catch (error) {
            console.error("[ChatContext] [HTTP] 모든 프로젝트 목록 조회 실패:", error);
        } finally {
            setLoadingInitialChats(false);
        }
    }, [currentUserInfo]); // currentUserInfo 변경 시 다시 실행

    useEffect(() => {
        if (currentUserInfo && tokenRef.current) { 
            fetchAllProjectsChatHistory();
        }
    }, [currentUserInfo, fetchAllProjectsChatHistory]);

    // 3. 특정 방의 멤버 목록을 불러오는 함수 (재사용 가능하도록 useCallback)
    const fetchRoomMembers = useCallback(async (projectId, token) => {
        if (!projectId || !token) {
            setCurrentRoomMembers([]);
            console.log("[ChatContext] fetchRoomMembers: projectId 또는 token이 없어 멤버를 불러올 수 없습니다.");
            return;
        }
        try {
            console.log(`[ChatContext] [HTTP] fetchRoomMembers: 프로젝트 ${projectId}의 멤버 목록 조회 요청...`);
            const response = await axios.get(`${BASE_URL}/api/projects/${projectId}/members`, { 
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const members = response.data.map(member => member.userName || member.userEmail); // userName 우선, 없으면 userEmail
            setCurrentRoomMembers(members);
            console.log(`[ChatContext] [HTTP] fetchRoomMembers: 프로젝트 ${projectId}의 멤버 목록:`, members);
        } catch (error) {
            console.error(`[ChatContext] [HTTP] fetchRoomMembers: 프로젝트 ${projectId}의 멤버 목록 로드 실패:`, error);
            setCurrentRoomMembers([]);
        }
    }, []); 

    // 4. 웹소켓 연결 및 현재 방의 히스토리 로드 (selectedRoom 또는 currentUserInfo 변경 시)
    useEffect(() => {
        if (!selectedRoom) {
            if (webSocketRef.current && webSocketRef.current.connected) {
                webSocketRef.current.deactivate();
                console.log("[ChatContext] [STOMP] 웹소켓 연결이 끊어졌습니다 (selectedRoom이 null).");
            }
            setMessages({}); 
            setCurrentRoomMembers([]); 
            return; 
        }

        if (!currentUserInfo || !tokenRef.current) {
            console.log("[ChatContext] [WebSocket] 사용자 정보 또는 토큰이 로드되지 않아 연결을 시도하지 않습니다.");
            setCurrentRoomMembers([]); 
            return;
        }

        const roomId = selectedRoom.id;
        const token = tokenRef.current;
        let projectId = null;

        if (roomId.startsWith('project-')) {
            projectId = parseInt(roomId.replace('project-', ''));
        } else {
            console.warn(`[ChatContext] [WebSocket] 현재는 프로젝트 채팅방만 지원합니다. (${roomId})`);
            setMessages({});
            setCurrentRoomMembers([]);
            return;
        }

        if (webSocketRef.current && webSocketRef.current.connected) {
            console.log(`[ChatContext] [WebSocket:${roomId}] 기존 연결 비활성화.`);
            webSocketRef.current.deactivate();
        }

        fetchRoomMembers(projectId, token); 

        const stompClient = Stomp.over(function() {
            return new SockJS(WS_CONNECTION_URL);
        });

        stompClient.debug = (str) => { /* console.log(str); */ }; 
        const headers = { 'Authorization': `Bearer ${token}` };

        stompClient.connect(headers, (frame) => {
            console.log(`[ChatContext] [STOMP] 웹소켓에 성공적으로 연결되었습니다. 방: ${roomId}`, frame);

            // 입장 메시지 전송
            const joinMessage = {
                projectId: projectId,
                senderEmail: currentUserInfo.email,
                senderNickname: currentUserInfo.nickname,
                content: `${currentUserInfo.nickname}님이 입장했습니다.`,
                type: 'JOIN',
                timestamp: new Date().toISOString()
            };
            stompClient.send(`/app/chat.addUser`, {}, JSON.stringify(joinMessage));
            console.log(`[ChatContext] [WebSocket:${roomId}] 입장 메시지 전송:`, joinMessage);

            // 메시지 구독
            stompClient.subscribe(`/topic/project/${projectId}`, (message) => {
                try {
                    const newMessage = JSON.parse(message.body);
                    console.log(`[ChatContext] [WebSocket:${roomId}] 수신된 원본 메시지:`, newMessage); 
                    
                    // 수신된 메시지 포맷팅 (timestamp를 KST로 변환)
                    const formattedMessage = {
                        id: newMessage.id || Date.now(),
                        sender: newMessage.senderNickname || newMessage.senderEmail,
                        text: newMessage.content, 
                        content: newMessage.content,
                        timestamp: newMessage.timestamp,
                        isOwn: newMessage.senderEmail === currentUserInfo.email,
                        date: dayjs.utc(newMessage.timestamp).tz('Asia/Seoul').format('YYYY-MM-DD'),
                        time: dayjs.utc(newMessage.timestamp).tz('Asia/Seoul').format('HH:mm'),
                        type: newMessage.type
                    };

                    // 입장/퇴장 메시지일 경우 멤버 목록을 다시 불러옴 (실시간 업데이트)
                    if (formattedMessage.type === 'JOIN' || formattedMessage.type === 'LEAVE') {
                        fetchRoomMembers(projectId, token); 
                    }

                    // 현재 방 메시지 업데이트
                    setMessages(prevMessages => {
                        const currentRoomMsgs = prevMessages[roomId] || [];
                        // 중복 방지: 이미 있는 메시지인지 확인 (특히 히스토리 로딩과 웹소켓 수신이 겹칠 때)
                        if (currentRoomMsgs.some(msg => msg.id === formattedMessage.id)) {
                            return prevMessages; // 이미 존재하면 업데이트하지 않음
                        }
                        return {
                            ...prevMessages,
                            [roomId]: [...currentRoomMsgs, formattedMessage]
                        };
                    });
                    
                    // 모든 방 메시지 업데이트 (채팅 목록 미리보기를 위함)
                    setAllRoomsMessages(prevAll => {
                        const currentRoomMsgs = prevAll[roomId] || [];
                        if (currentRoomMsgs.some(msg => msg.id === formattedMessage.id)) {
                            return prevAll;
                        }
                        const updatedMsgs = [...currentRoomMsgs, formattedMessage];
                        return {
                            ...prevAll,
                            [roomId]: updatedMsgs
                        };
                    });
                    console.log(`[ChatContext] [WebSocket:${roomId}] 포맷된 메시지:`, formattedMessage);
                } catch (e) {
                    console.error(`[ChatContext] [WebSocket:${roomId}] 메시지 파싱 오류:`, e, message.body);
                }
            });
            console.log(`[ChatContext] [WebSocket:${roomId}] 구독 시작: /topic/project/${projectId}`);

            // 방 선택 시 채팅 히스토리 로드 (웹소켓 연결 성공 후)
            // 입장/퇴장 메시지 누락 방지를 위해 히스토리 로딩 후 JOIN 메시지를 추가하는 것이 아니라,
            // JOIN 메시지 자체를 웹소켓으로 받고, 웹소켓 메시지 처리 로직에서 messages에 추가하도록 합니다.
            // 이미 `fetchAllProjectsChatHistory`에서 히스토리를 불러오고 있으므로, 여기서는 selectedRoom의 메시지만 업데이트합니다.
            const fetchChatHistoryForSelectedRoom = async () => { 
                try {
                    console.log(`[ChatContext] [HTTP] 선택된 방 (${roomId})의 채팅 히스토리 조회 요청...`);
                    const response = await axios.get(`${BASE_URL}/api/projects/${projectId}/chat/history`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    const fetchedMessages = response.data;

                    const formattedFetchedMessages = Array.isArray(fetchedMessages) ? fetchedMessages.map(msg => {
                        return {
                            id: msg.id, sender: msg.senderNickname || msg.senderEmail, text: msg.content, 
                            content: msg.content, timestamp: msg.timestamp, isOwn: msg.senderEmail === currentUserInfo.email,
                            date: dayjs.utc(msg.timestamp).tz('Asia/Seoul').format('YYYY-MM-DD'),
                            time: dayjs.utc(msg.timestamp).tz('Asia/Seoul').format('HH:mm'), type: msg.type
                        };
                    }) : [];

                    setMessages(prev => ({
                        ...prev,
                        [roomId]: formattedFetchedMessages
                    }));
                    // 모든 방 메시지에도 업데이트 (채팅 목록 미리보기에 최신 히스토리 반영)
                    setAllRoomsMessages(prevAll => ({ 
                        ...prevAll,
                        [roomId]: formattedFetchedMessages 
                    }));
                    console.log(`[ChatContext] [HTTP] 포맷된 채팅 히스토리 (${roomId}):`, formattedFetchedMessages);
                } catch (error) {
                    console.error(`[ChatContext] [HTTP] 채팅 히스토리 로드 실패 (${roomId}):`, error);
                }
            };
            fetchChatHistoryForSelectedRoom();

        }, (error) => {
            console.error(`[ChatContext] [STOMP] 웹소켓 연결 에러가 발생했습니다. 방: ${roomId}`, error);
            setCurrentRoomMembers([]); 
        });

        webSocketRef.current = stompClient;

        return () => {
            if (webSocketRef.current && webSocketRef.current.connected) {
                // 퇴장 메시지 전송 (클린업 시)
                let leaveProjectId = null;
                if (roomId.startsWith('project-')) {
                    leaveProjectId = parseInt(roomId.replace('project-', ''));
                }
                if (currentUserInfo && currentUserInfo.email && currentUserInfo.nickname && leaveProjectId) {
                    const leaveMessage = {
                        projectId: leaveProjectId,
                        senderEmail: currentUserInfo.email,
                        senderNickname: currentUserInfo.nickname,
                        content: `${currentUserInfo.nickname}님이 나갔습니다.`,
                        type: 'LEAVE',
                        timestamp: new Date().toISOString()
                    };
                    try {
                        webSocketRef.current.send(`/app/chat.leaveUser`, {}, JSON.stringify(leaveMessage));
                        console.log(`[ChatContext] [WebSocket:${roomId}] 클린업 시 퇴장 메시지 전송:`, leaveMessage);
                    } catch (e) {
                        console.error(`[ChatContext] [WebSocket:${roomId}] 클린업 시 퇴장 메시지 전송 실패:`, e);
                    }
                }
                webSocketRef.current.deactivate();
                console.log(`[ChatContext] [STOMP] 웹소켓 연결이 정리(deactivate)되었습니다. (클린업).`);
            }
        };
    }, [selectedRoom, currentUserInfo, fetchRoomMembers]); 

    // 5. 채팅방 나가기 함수 (명시적 '나가기' 버튼 클릭 시)
    const leaveChatRoom = useCallback((roomId) => {
        if (webSocketRef.current && webSocketRef.current.connected && roomId) {
            let projectId = null;
            if (roomId.startsWith('project-')) {
                projectId = roomId.replace('project-', '');
            } else {
                console.warn("[ChatContext] [WebSocket] 현재는 프로젝트 채팅방만 메시지 전송을 지원합니다.");
                return;
            }

            if (currentUserInfo && currentUserInfo.email && currentUserInfo.nickname) {
                const leaveMessage = {
                    projectId: parseInt(projectId),
                    senderEmail: currentUserInfo.email,
                    senderNickname: currentUserInfo.nickname,
                    content: `${currentUserInfo.nickname}님이 나갔습니다.`,
                    type: 'LEAVE',
                    timestamp: new Date().toISOString()
                };
                try {
                    webSocketRef.current.send(`/app/chat.leaveUser`, {}, JSON.stringify(leaveMessage));
                    console.log(`[ChatContext] [WebSocket:${roomId}] 퇴장 메시지 전송:`, leaveMessage);
                } catch (e) {
                    console.error(`[ChatContext] [WebSocket:${roomId}] 퇴장 메시지 전송 실패:`, e);
                }
            } else {
                console.warn("[ChatContext] [WebSocket] 사용자 정보가 없어 퇴장 메시지를 보낼 수 없습니다.");
            }

            webSocketRef.current.deactivate();
            console.log(`[ChatContext] [STOMP] 웹소켓 연결이 끊어졌습니다. (방 ${roomId} 퇴장).`);
        }
        setSelectedRoom(null); 
        setCurrentRoomMembers([]); 
    }, [currentUserInfo, setSelectedRoom]); 

    // 6. 메시지 전송 함수
    const sendMessage = useCallback((messageContent) => {
        if (webSocketRef.current && webSocketRef.current.connected && selectedRoom && messageContent.trim()) {
            let projectId = null;
            if (selectedRoom.id.startsWith('project-')) { 
                projectId = selectedRoom.id.replace('project-', '');
            } else {
                console.warn("[ChatContext] [WebSocket] 현재는 프로젝트 채팅방만 메시지 전송을 지원합니다.");
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
            console.log(`[ChatContext] [WebSocket:${selectedRoom.id}] 메시지 전송:`, chatMessage);
        } else {
            console.warn("[ChatContext] [WebSocket] 메시지를 보낼 수 없습니다. 연결 상태 또는 방 선택을 확인하세요.");
        }
    }, [selectedRoom, currentUserInfo]);

    const value = {
        selectedRoom,
        setSelectedRoom,
        messages: messages[selectedRoom ? selectedRoom.id : null] || [], 
        allRoomsMessages, 
        sendMessage,
        currentUserInfo,
        leaveChatRoom,
        loadingInitialChats,
        projectList, 
        currentRoomMembers, 
    };

    if (!currentUserInfo && !tokenRef.current && loadingInitialChats) { 
        return <Box textAlign="center" py={10}>사용자 정보를 불러오는 중...</Box>;
    }

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