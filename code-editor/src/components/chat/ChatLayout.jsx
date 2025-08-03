import { Flex, Box, useToast } from '@chakra-ui/react'; 
import { useNavigate } from 'react-router-dom'; 
import axios from 'axios'; 
import { ChatProvider, useChat } from '../components/chat/context/ChatContext';
import ChatSidebar from '../components/chat/ChatSidebar';
import ChatWindow from '../components/chat/ChatWindow'; 
import ChatList from '../components/chat/ChatList'; 
import { useState, useEffect } from 'react';

const BASE_URL = "http://20.196.89.99:8080";

const ChatLayout = () => {
  const { selectedRoom, setSelectedRoom } = useChat();
  const [projectList, setProjectList] = useState([]);

  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProjectsAndDmUsers = async () => {
      const token = localStorage.getItem('ACCESS_TOKEN_KEY');

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
        const projectsRes = await axios.get(`${BASE_URL}/api/projects`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const fetchedProjects = projectsRes.data;
        console.log("API에서 불러온 프로젝트 목록:", fetchedProjects);

        const formattedProjects = fetchedProjects.map(project => ({
          id: `project-${project.id}`, 
          name: project.name, 
        }));
        setProjectList(formattedProjects);

       
        // 현재는 DM 사용자 목록 목업 데이터 유지 (API 연동 전까지)
        /*setDmUserList([
          { id: 'user-hong', name: '홍길동', type: 'user' },
          { id: 'user-kim', name: '김개발', type: 'user' }
        ]);*/

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

        if (err.response?.status === 401 || err.response?.status === 403) {
          localStorage.removeItem("ACCESS_TOKEN_KEY");
          navigate("/login");
        }
      }
    };

    fetchProjectsAndDmUsers();
  }, [toast, navigate]);

 
  const allAvailableRooms = [
    ...projectList.map(p => ({ id: p.id, name: p.name, type: 'project' })),
   
  ];

  const handleLeaveRoom = (roomId) => {
    if (selectedRoom === roomId) {
      setSelectedRoom(null);
    }
  };

  return (
    <Flex height="90vh" bg="#f9f8f6" color="text.primary">
      <ChatSidebar
        onSelectRoom={setSelectedRoom}
        selectedRoom={selectedRoom}
        availableRooms={allAvailableRooms} 
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
