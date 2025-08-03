
import React from 'react';
import { VStack, Box, Text, Heading, Divider, Flex, Avatar } from '@chakra-ui/react';
import { useChat } from './context/ChatContext'; 
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc'; 
import timezone from 'dayjs/plugin/timezone'; 
import localizedFormat from 'dayjs/plugin/localizedFormat'; 

dayjs.extend(utc); 
dayjs.extend(timezone); 
dayjs.extend(localizedFormat); 

const ChatList = () => {
  const { allRoomsMessages, setSelectedRoom, loadingInitialChats, projectList } = useChat();

  // 사용자 로컬 타임존을 'Asia/Seoul'로 설정 (KST)
  dayjs.tz.setDefault('Asia/Seoul');

  const getProjectName = (roomId) => {
    const projectId = parseInt(roomId.replace('project-', ''));
    const project = projectList.find(p => p.id === projectId);
    return project ? project.name : `알 수 없는 프로젝트 (${projectId})`; 
  };

  const handleRoomClick = (roomId) => {
    const projectName = getProjectName(roomId);
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
      const chatMessages = messages.filter(msg => msg.type === 'CHAT');
      const latestChatMessage = chatMessages.length > 0 ? chatMessages[chatMessages.length - 1] : null;
      // 필터링된 최신 메시지 할당
      return {
        roomId,
        latestMessage: latestChatMessage, 
        projectName: getProjectName(roomId)
      };
    })
    .sort((a, b) => {
      if (!a.latestMessage && !b.latestMessage) return 0;
      if (!a.latestMessage) return 1; 
      if (!b.latestMessage) return -1;
      
      
      const timeA = dayjs.utc(a.latestMessage.timestamp).tz('Asia/Seoul');
      const timeB = dayjs.utc(b.latestMessage.timestamp).tz('Asia/Seoul');
      return timeB.diff(timeA);
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
              <Avatar size="sm" name={projectName} mr={3} />
              <Box>
                <Text fontWeight="bold">{projectName}</Text> 
                <Text fontSize="sm" color="gray.600" isTruncated>
                  {latestMessage ? `${latestMessage.sender}: ${latestMessage.content}` : '메시지 없음'}
                </Text>
                {latestMessage && (
                  <Text fontSize="xs" color="gray.500" mt={1}>
                    {dayjs.utc(latestMessage.timestamp).tz('Asia/Seoul').format('YYYY.MM.DD HH:mm')}
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