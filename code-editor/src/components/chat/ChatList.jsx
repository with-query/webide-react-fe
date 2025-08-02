
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

  // ChatList에서는 더 이상 직접 채팅 히스토리를 로드할 필요가 없습니다.
  // 이 로직은 ChatContext의 connectWebSocket/fetchRecentMessages에서 이미 처리됩니다.
  // useEffect(() => {
  //   if (!projectId) return;
  //   const fetchChatHistory = async () => { ... }; // <-- 이 로직은 삭제합니다.
  //   fetchChatHistory();
  // }, [projectId, setMessages]);

  // messages 객체를 순회하여 각 방의 마지막 메시지를 찾습니다.
  // 이 부분은 ChatContext의 messages 상태에 이미 모든 방의 메시지가 있다고 가정합니다.
  const roomsWithMessages = Object.entries(messages)
    .filter(([_, msgs]) => msgs.length > 0) // 메시지가 있는 방만 필터링
    .map(([roomId, msgs]) => {
      const sorted = [...msgs].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      const lastMsg = sorted[0];

      // roomId를 통해 방 이름을 가져오는 로직이 필요할 수 있습니다.
      // ChatLayout의 projectList와 dmUserList를 ChatContext로 넘겨주거나,
      // ChatContext에서 이 목록들을 관리하여 roomId에 해당하는 name을 가져올 수 있도록 해야 합니다.
      // 여기서는 일단 formatRoomName을 사용합니다.
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

export default ChatList;