import { VStack, Text, Box } from '@chakra-ui/react';
import { useChat } from './context/ChatContext';
import { useTranslation } from "react-i18next";

const formatRoomName = (roomId) => {
  if (roomId.startsWith('user-')) {
    return roomId.replace('user-', ''); // 1:1 채팅은 이름만 표시
  }
  return roomId; // 프로젝트 채팅방은 그대로
};

const ChatList = () => {
  const { messages, setSelectedRoom } = useChat();
  const { t } = useTranslation();

  const roomsWithMessages = Object.entries(messages)
    .filter(([_, msgs]) => msgs.length > 0)
    .map(([roomId, msgs]) => {
      const sorted = [...msgs].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      const lastMsg = sorted[0];
      return {
        roomId,
        preview: lastMsg.text,
        time: new Date(lastMsg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
    })
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)); // 전체 최신 순 정렬

  return (
    <VStack align="stretch" spacing={3} p={4}>
      <Text fontSize="lg" fontWeight="bold">{t("Recent Chatting")}</Text>
      {roomsWithMessages.map(({ roomId, preview, time }) => (
        <Box
          key={roomId}
          p="3"
          borderRadius="md"
          bg="white"
          _hover={{ bg: 'gray.100' }}
          cursor="pointer"
          onClick={() => setSelectedRoom(roomId)}
        >
          <Text fontWeight="semibold">{formatRoomName(roomId)}</Text>
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