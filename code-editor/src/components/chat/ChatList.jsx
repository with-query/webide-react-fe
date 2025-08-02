/*
import { VStack, Text, Box } from '@chakra-ui/react';
import { useEffect } from 'react'; // useEffect는 이제 초기 로딩에 필요 없을 수 있지만, 현재 ChatContext 로직 고려
import { useChat } from './context/ChatContext';
import { useTranslation } from "react-i18next";

const formatRoomName = (roomId) => {
 if (roomId.startsWith('user-')) {
  return roomId.replace('user-', '');
    }
  return roomId;
};


const ChatList = () => { // projectId prop 제거
 // ChatContext에서 모든 방의 메시지 상태와 방 선택 함수를 가져옵니다.
 const { messages, setSelectedRoom, allAvailableRooms } = useChat(); // allAvailableRooms 추가 (ChatLayout에서 가져와 ChatContext에 전달해야 할 수도)
 const { t } = useTranslation();

  const roomsWithMessages = Object.entries(messages)
    .filter(([_, msgs]) => msgs.length > 0) // 메시지가 있는 방만 필터링
    .map(([roomId, msgs]) => {
      const sorted = [...msgs].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      const lastMsg = sorted[0];

      const roomDisplayName = formatRoomName(roomId);

      return {
        roomId,
        displayName: roomDisplayName, // 표시될 방 이름
        preview: lastMsg.text,
        time: new Date(lastMsg.timestamp).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
        timestamp: lastMsg.timestamp,
      };
    })
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)); // 최신 메시지 순으로 정렬

 return (
  <VStack align="stretch" spacing={3} p={4}>
    <Text fontSize="lg" fontWeight="bold">{t("Recent Chatting")}</Text>
      {roomsWithMessages.map(({ roomId, displayName, preview, time }) => (
      <Box
        key={roomId}
        p="3"
        borderRadius="md"
        bg="white"
        _hover={{ bg: 'gray.100' }}
        cursor="pointer"
        onClick={() => setSelectedRoom(roomId)}
      >
        <Text fontWeight="semibold">{displayName}</Text>
        <Text fontSize="sm" color="gray.600" noOfLines={1}>{preview}</Text>
        <Text fontSize="xs" color="gray.400" textAlign="right">{time}</Text>
      </Box>
    ))}
      {roomsWithMessages.length === 0 && (
      <Text color="gray.500" mt="4">{t("There is no chat history yet.")}</Text>
      )}
  </VStack>
  );
};

export default ChatList;*/

/*

import { VStack, Text, Box, Spinner } from '@chakra-ui/react';
import { useChat } from './context/ChatContext'; // 경로 확인
import { useTranslation } from "react-i18next";

const formatRoomName = (roomId) => {
  if (roomId.startsWith('user-')) { // 1:1 채팅방 이름 처리
    return roomId.replace('user-', '');
  }
  // 프로젝트 채팅방 ID는 'project-123' 형태로 온다고 가정
  // 실제 프로젝트 이름으로 변환하려면 프로젝트 목록 정보가 필요합니다.
  // 여기서는 단순히 'project-' 접두사만 제거합니다.
  if (roomId.startsWith('project-')) {
    return `프로젝트 ${roomId.replace('project-', '')}`; // 예시: "프로젝트 123"
  }
  return roomId;
};

const ChatList = () => {
  // allRoomsMessages와 loadingInitialChats를 가져옵니다.
  const { setSelectedRoom, allRoomsMessages, loadingInitialChats } = useChat();
  const { t } = useTranslation();

  console.log("ChatList rendering. All Rooms Messages:", allRoomsMessages);
  console.log("ChatList rendering. Loading initial chats:", loadingInitialChats);

  const roomsWithMessages = Object.entries(allRoomsMessages)
    .map(([roomId, msgs]) => {
      // type이 'JOIN' 또는 'LEAVE'가 아닌 메시지만 필터링합니다.
      const filteredMsgs = msgs.filter(msg => 
        msg.type !== 'JOIN' && msg.type !== 'LEAVE'
      );
      
      if (filteredMsgs.length === 0) {
        return null; // 필터링 후 메시지가 없으면 이 방은 표시하지 않습니다.
      }

      // 필터링된 메시지 중 가장 최신 메시지를 찾습니다.
      const sorted = [...filteredMsgs].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      const lastMsg = sorted[0];

      if (!lastMsg) { // 필터링 후 메시지가 하나도 없을 경우 (edge case)
          return null;
      }

      const roomDisplayName = formatRoomName(roomId);

      return {
        roomId,
        displayName: roomDisplayName,
        preview: lastMsg.text,
        time: new Date(lastMsg.timestamp).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
        timestamp: lastMsg.timestamp,
      };
    })
    .filter(Boolean) // null 값 (메시지가 없는 방) 제거
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)); // 최신 메시지 순으로 정렬

  return (
    <VStack align="stretch" spacing={3} p={4}>
      <Text fontSize="lg" fontWeight="bold">{t("Recent Chatting")}</Text>
      {loadingInitialChats ? ( // 초기 로딩 중일 때 스피너 표시
        <Box display="flex" justifyContent="center" alignItems="center" height="100px">
          <Spinner size="lg" />
          <Text ml="2">{t("Loading chat history...")}</Text>
        </Box>
      ) : (
        roomsWithMessages.map(({ roomId, displayName, preview, time }) => (
          <Box
            key={roomId}
            p="3"
            borderRadius="md"
            bg="white"
            _hover={{ bg: 'gray.100' }}
            cursor="pointer"
            // selectedRoom에 객체를 전달하도록 변경 (id 속성 포함)
            onClick={() => setSelectedRoom({ id: roomId, name: displayName })} 
          >
            <Text fontWeight="semibold">{displayName}</Text>
            <Text fontSize="sm" color="gray.600" noOfLines={1}>{preview}</Text>
            <Text fontSize="xs" color="gray.400" textAlign="right">{time}</Text>
          </Box>
        ))
      )}
      {!loadingInitialChats && roomsWithMessages.length === 0 && ( // 로딩 완료 후 메시지가 없을 때
        <Text color="gray.500" mt="4">{t("There is no chat history yet.")}</Text>
      )}
    </VStack>
  );
};

export default ChatList;*/


/*
import React from 'react';

import { VStack, Box, Text, Heading, Divider, Flex, Avatar } from '@chakra-ui/react';
import { useChat } from './context/ChatContext';
const ChatList = () => {
  const { allRoomsMessages, setSelectedRoom, loadingInitialChats, projectList } = useChat();

  const getProjectName = (roomId) => {
      const projectId = parseInt(roomId.replace('project-', ''));
      const project = projectList.find(p => p.id === projectId);
      return project ? project.name : `알 수 없는 프로젝트 (${projectId})`; 
  };

  const handleRoomClick = (roomId) => {
    const projectName = getProjectName(roomId);
    setSelectedRoom({ id: roomId, name: projectName }); // 이름 정보와 함께 설정
    console.log(`[ChatList] 방 클릭됨: ${roomId}, 이름: ${projectName}`);
  };

  if (loadingInitialChats) {
    return (
      <Box p={4}>
        <Text>채팅 목록을 불러오는 중...</Text>
      </Box>
    );
  }

  const sortedRooms = Object.entries(allRoomsMessages)
    .map(([roomId, messages]) => {
      const latestMessage = messages.length > 0 ? messages[messages.length - 1] : null;
      return {
        roomId,
        latestMessage,
        projectName: getProjectName(roomId)
      };
    })
    .sort((a, b) => {
      if (!a.latestMessage && !b.latestMessage) return 0;
      if (!a.latestMessage) return 1;
      if (!b.latestMessage) return -1;
      return new Date(b.latestMessage.timestamp) - new Date(a.latestMessage.timestamp);
    });

  return (
    <VStack spacing={4} align="stretch" p={4}>
      <Heading size="md">최근 대화</Heading>
      <Divider />
      {sortedRooms.length === 0 ? (
        <Text>최근 대화가 없습니다.</Text>
      ) : (
        sortedRooms.map(({ roomId, latestMessage, projectName }) => (
          <Box 
            key={roomId} 
            p={3} 
            borderWidth="1px" 
            borderRadius="lg" 
            cursor="pointer"
            _hover={{ bg: 'gray.100' }}
            onClick={() => handleRoomClick(roomId)} 
          >
            <Flex alignItems="center">
              <Avatar size="sm" name={projectName} mr={3} />
              <Box>
                <Text fontWeight="bold">{projectName}</Text> 
                <Text fontSize="sm" color="gray.600" isTruncated>
                  {latestMessage ? `${latestMessage.sender}: ${latestMessage.content}` : '메시지 없음'}
                </Text>
                {latestMessage && (
                  <Text fontSize="xs" color="gray.500" mt={1}>
                    {new Date(latestMessage.timestamp).toLocaleString()}
                  </Text>
                )}
              </Box>
            </Flex>
          </Box>
        ))
      )}
    </VStack>
  );
};

export default ChatList;*/

import React from 'react';
import { VStack, Box, Text, Heading, Divider, Flex, Avatar } from '@chakra-ui/react';
// 올바른 경로로 ChatContext를 import 합니다.
// 가정: ChatContext.js가 src/context/ChatContext.js에 위치하고
// ChatList.jsx가 src/components/chat/ChatList.jsx에 위치한다면 아래 경로가 맞습니다.
import { useChat } from './context/ChatContext'; 


const ChatList = () => {
  const { allRoomsMessages, setSelectedRoom, loadingInitialChats, projectList } = useChat();

  const getProjectName = (roomId) => {
    // projectList는 ChatContext에서 이미 배열 형태로 로드되어 있으므로, 여기서 찾아서 반환
    const projectId = parseInt(roomId.replace('project-', ''));
    const project = projectList.find(p => p.id === projectId);
    return project ? project.name : `알 수 없는 프로젝트 (${projectId})`; 
  };

  const handleRoomClick = (roomId) => {
    const projectName = getProjectName(roomId);
    // setSelectedRoom에 { id: "project-XXX", name: "프로젝트 이름" } 형태 전달
    setSelectedRoom({ id: roomId, name: projectName }); 
    console.log(`[ChatList] 방 클릭됨: ${roomId}, 이름: ${projectName}`);
  };

  if (loadingInitialChats) {
    return (
      <Box p={4}>
        <Text>채팅 목록을 불러오는 중...</Text>
      </Box>
    );
  }

  // 최신 대화 (입장/퇴장 메시지 제외)를 기준으로 정렬
  const sortedRooms = Object.entries(allRoomsMessages)
    .map(([roomId, messages]) => {
      // type이 'CHAT'인 메시지만 필터링하여 최신 메시지 찾기
      const chatMessages = messages.filter(msg => msg.type === 'CHAT');
      const latestChatMessage = chatMessages.length > 0 ? chatMessages[chatMessages.length - 1] : null;

      return {
        roomId,
        latestMessage: latestChatMessage, // 필터링된 최신 메시지 할당
        projectName: getProjectName(roomId)
      };
    })
    .sort((a, b) => {
      // 최신 메시지가 없는 방은 뒤로 (채팅이 없는 방)
      if (!a.latestMessage && !b.latestMessage) return 0;
      if (!a.latestMessage) return 1; 
      if (!b.latestMessage) return -1;
      // 최신 메시지 timestamp 기준으로 내림차순 정렬 (가장 최근이 위로)
      return new Date(b.latestMessage.timestamp) - new Date(a.latestMessage.timestamp);
    });

  return (
    <VStack spacing={4} align="stretch" p={4}>
      <Heading size="md">최근 대화</Heading>
      <Divider />
      {sortedRooms.length === 0 ? (
        <Text>최근 대화가 없습니다.</Text>
      ) : (
        sortedRooms.map(({ roomId, latestMessage, projectName }) => (
          <Box 
            bg="white"
            key={roomId} 
            p={3} 
            borderWidth="1px" 
            borderRadius="lg" 
            cursor="pointer"
            _hover={{ background : "#f2f2f2" }}
            onClick={() => handleRoomClick(roomId)} 
          >
            <Flex alignItems="center">
              {/* 아바타는 프로젝트 이름의 첫 글자를 사용하거나, 더미 아이콘 */}
              <Avatar size="sm" name={projectName} mr={3} />
              <Box>
                <Text fontWeight="bold">{projectName}</Text> 
                <Text fontSize="sm" color="gray.600" isTruncated>
                  {/* 최신 채팅 메시지가 있다면 내용 표시, 없으면 '메시지 없음' */}
                  {latestMessage ? `${latestMessage.sender}: ${latestMessage.content}` : '메시지 없음'}
                </Text>
                {latestMessage && (
                  <Text fontSize="xs" color="gray.500" mt={1}>
                    {new Date(latestMessage.timestamp).toLocaleString()}
                  </Text>
                )}
              </Box>
            </Flex>
          </Box>
        ))
      )}
    </VStack>
  );
};

export default ChatList;