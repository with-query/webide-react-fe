import { Flex, Box, useToast } from '@chakra-ui/react'; // 오류: '@chakra-ui/react' 모듈을 찾을 수 없습니다. Chakra UI 라이브러리가 설치되었는지 확인해주세요. (예: npm install @chakra-ui/react @emotion/react @emotion/styled framer-motion)
import { useNavigate } from 'react-router-dom'; // 오류: 'react-router-dom' 모듈을 찾을 수 없습니다. React Router가 설치되었는지 확인해주세요. (예: npm install react-router-dom)
import axios from 'axios'; // 오류: 'axios' 모듈을 찾을 수 없습니다. Axios 라이브러리가 설치되었는지 확인해주세요. (예: npm install axios)
import { ChatProvider, useChat } from '../components/chat/context/ChatContext'; // 오류: '../components/chat/context/ChatContext' 경로를 찾을 수 없습니다. 파일 경로가 정확한지 확인해주세요.
import ChatSidebar from '../components/chat/ChatSidebar'; // 오류: '../components/chat/ChatSidebar' 경로를 찾을 수 없습니다. 파일 경로가 정확한지 확인해주세요.
import ChatWindow from '../components/chat/ChatWindow'; // 오류: '../components/chat/ChatWindow' 경로를 찾을 수 없습니다. 파일 경로가 정확한지 확인해주세요.
import ChatList from '../components/chat/ChatList'; // 오류: '../components/chat/ChatList' 경로를 찾을 수 없습니다. 파일 경로가 정확한지 확인해주세요.
import { useState, useEffect } from 'react';

const BASE_URL = "http://20.196.89.99:8080";

const ChatLayout = () => {
  const { selectedRoom, setSelectedRoom } = useChat();
  const [projectList, setProjectList] = useState([]);
  const [dmUserList, setDmUserList] = useState([]);
  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProjectsAndDmUsers = async () => {
      const token = localStorage.getItem('token');

      if (!token) {
        toast({
          title: "인증 필요",
          description: "채팅 기능을 사용하려면 로그인이 필요합니다.",
          status: "info",
          duration: 3000,
          isClosable: true,
        });
        navigate("/login");
        return;
      }

      try {
        // DBConnect.jsx의 로직을 활용하여 프로젝트 목록 가져오기
        const projectsRes = await axios.get(`${BASE_URL}/api/projects`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const fetchedProjects = projectsRes.data;
        console.log("API에서 불러온 프로젝트 목록:", fetchedProjects);

        const formattedProjects = fetchedProjects.map(project => ({
          id: `project-${project.id}`, // 웹소켓 방 이름 형식에 맞춤
          name: project.name, // 사이드바에 표시될 이름
        }));
        setProjectList(formattedProjects);

        // TODO: DM 사용자 목록도 API로 가져올 예정이라면 여기에 axios.get 호출 추가
        // 예: const dmUsersRes = await axios.get(`${BASE_URL}/api/users/chatable`, { headers: { Authorization: `Bearer ${token}` } });
        // setDmUserList(dmUsersRes.data.map(user => ({ id: `user-${user.id}`, name: user.nickname, type: 'user' })));
        
        // 현재는 DM 사용자 목록 목업 데이터 유지 (API 연동 전까지)
        setDmUserList([
          { id: 'user-hong', name: '홍길동', type: 'user' },
          { id: 'user-kim', name: '김개발', type: 'user' }
        ]);

      } catch (err) {
        console.error("채팅 관련 데이터 로드 중 오류 발생:", err);
        const errorMessage =
          err.response?.data?.message || "채팅 데이터를 로드하는 데 실패했습니다. 다시 시도해주세요.";
        toast({
          title: "데이터 로딩 실패",
          description: errorMessage,
          status: "error",
          duration: 5000,
          isClosable: true,
        });

        // 인증 오류 (401 Unauthorized, 403 Forbidden) 처리
        if (err.response?.status === 401 || err.response?.status === 403) {
          localStorage.removeItem("token");
          navigate("/login");
        }
      }
    };

    fetchProjectsAndDmUsers();
  }, [toast, navigate]);

  // availableRooms는 이제 projectList와 dmUserList에서 가져옵니다.
  const allAvailableRooms = [
    ...projectList.map(p => ({ id: p.id, name: p.name, type: 'project' })),
    ...dmUserList.map(u => ({ id: u.id, name: u.name, type: 'user' }))
  ];

  const handleLeaveRoom = (roomId) => {
    // ... (기존 로직)
    if (selectedRoom === roomId) {
      setSelectedRoom(null);
    }
  };

  return (
    <Flex height="90vh" bg="#f9f8f6" color="text.primary">
      <ChatSidebar
        onSelectRoom={setSelectedRoom}
        selectedRoom={selectedRoom}
        availableRooms={allAvailableRooms} // 동적으로 불러온 프로젝트와 DM 사용자 목록 전달
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

const ChatPage = () => (
  <ChatProvider>
    <ChatLayout />
  </ChatProvider>
);

export default ChatPage;
