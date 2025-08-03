import { Flex, Box, useToast } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ChatProvider, useChat, BASE_URL } from '../components/chat/context/ChatContext'; // BASE_URL 임포트
import ChatSidebar from '../components/chat/ChatSidebar';
import ChatWindow from '../components/chat/ChatWindow';
import ChatList from '../components/chat/ChatList';
import { useState, useEffect, useCallback } from 'react';

const ChatLayout = () => {
  // ChatContext에서 필요한 상태와 함수를 가져옵니다.
  // ChatContext가 projectList를 이미 관리하고 있으므로, 여기서 다시 useState로 선언할 필요 없습니다.
  const { selectedRoom, setSelectedRoom, leaveChatRoom, currentUserInfo, projectList } = useChat(); 
  const [dmUserList, setDmUserList] = useState([]); // DM 사용자 목록만 여기서 관리
  const toast = useToast();
  const navigate = useNavigate();

  // projectList와 currentUserInfo를 기반으로 DM 사용자 목록을 구성하는 함수
  // useCallback을 사용하여 불필요한 재생성을 방지합니다.
  const buildDmUserList = useCallback(async () => {
    const token = localStorage.getItem('ACCESS_TOKEN_KEY');
    if (!token || !currentUserInfo || projectList.length === 0) {
      console.log("DM 사용자 목록을 구성할 준비가 안됨 (토큰, 사용자 정보, 프로젝트 목록 부족).");
      setDmUserList([]); // 준비 안될 경우 초기화
      return;
    }

    const uniqueDmUsers = new Map(); 

    for (const project of projectList) { // ChatContext에서 가져온 projectList 사용
      try {
        const membersRes = await axios.get(`${BASE_URL}/api/projects/${project.id}/members`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        membersRes.data.forEach(member => {
          if (member.userEmail !== currentUserInfo.email) {
            if (!uniqueDmUsers.has(member.userEmail)) {
              uniqueDmUsers.set(member.userEmail, {
                id: `user-${member.id}`, 
                name: member.userName, // 백엔드 응답 필드 확인 (userName 또는 nickname)
                email: member.userEmail,
                type: 'user'
              });
            }
          }
        });
      } catch (memberError) {
        console.error(`프로젝트 ${project.id} 멤버 로드 실패:`, memberError);
      }
    }
    
    setDmUserList(Array.from(uniqueDmUsers.values()));
    console.log("구성된 1:1 채팅 사용자 목록:", Array.from(uniqueDmUsers.values()));
  }, [currentUserInfo, projectList, toast, navigate]); // projectList와 currentUserInfo를 의존성으로 추가

  useEffect(() => {
    // currentUserInfo와 projectList가 모두 로드된 후에 DM 사용자 목록을 구성합니다.
    if (currentUserInfo && projectList.length > 0) {
      buildDmUserList();
    } else if (!localStorage.getItem('ACCESS_TOKEN_KEY')) {
       // 토큰이 없으면 로그인 페이지로 리다이렉트
       toast({
         title: "인증 필요",
         description: "채팅 기능을 사용하려면 로그인이 필요합니다.",
         status: "info",
         duration: 3000,
         isClosable: true,
       });
       navigate("/login");
    }
  }, [currentUserInfo, projectList, buildDmUserList, toast, navigate]);

  // ChatSidebar에 전달될 모든 방 목록
  // projectList는 ChatContext에서 오고, dmUserList는 여기서 구성됩니다.
  const allAvailableRooms = [
    ...projectList.map(p => ({
        id: `project-${p.id}`,
        name: p.name,
        type: 'project'
    })), // projectList는 이미 ChatContext에서 id, name을 가진 객체로 오지만, ChatSidebar가 원하는 포맷에 맞춰 다시 매핑합니다.
    ...dmUserList
  ];

  const handleLeaveRoom = (roomId) => {
    if (selectedRoom && selectedRoom.id === roomId) {
      leaveChatRoom(roomId);
    }
  };

  return (
    <Flex height="90vh" bg="#f9f8f6" color="text.primary">
      <ChatSidebar
        onSelectRoom={setSelectedRoom}
        selectedRoom={selectedRoom}
        availableRooms={allAvailableRooms} // 구성된 전체 방 목록 전달
      />
      <Box flex="1">
        {selectedRoom ? (
          <ChatWindow
            selectedRoom={selectedRoom}
            onBack={() => setSelectedRoom(null)}
            onLeaveRoom={handleLeaveRoom}
          />
        ) : (
          <ChatList />
        )}
      </Box>
    </Flex>
  );
};

// ChatProvider는 ChatLayout의 부모 컴포넌트여야 합니다.
// 보통 App.js나 라우터를 정의하는 곳에서 ChatProvider로 전체 앱을 감싸줍니다.
// 여기서는 ChatLayout을 감싸는 형태로 사용하겠습니다.
const ChatPage = () => (
  <ChatProvider>
    <ChatLayout />
  </ChatProvider>
);

export default ChatPage;
