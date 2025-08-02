import React, { useEffect, useState, useRef } from 'react';
import { Box, Text, VStack } from '@chakra-ui/react';
import ChatMessage from './ChatMessage'; // ChatMessage 컴포넌트가 필요합니다.
import ChatDateDivider from './ChatDateDivider'; // ChatDateDivider 컴포넌트가 필요합니다.
import MessageInput from './MessageInput'; // MessageInput 컴포넌트가 필요합니다.
import ChatHeader from './ChatHeader'; // ChatHeader 컴포넌트가 필요합니다.
import ChatRoomMenu from './ChatRoomMenu'; // ChatRoomMenu 컴포넌트가 필요합니다.
import { useChat } from './context/ChatContext';
const ChatWindow = ({ selectedRoom, onBack, onLeaveRoom }) => {
  // ChatContext에서 메시지 목록과 메시지 전송 함수를 가져옵니다.
  const { messages, sendMessage } = useChat();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [roomMembers, setRoomMembers] = useState({}); // 각 방의 멤버 정보를 저장

  // 메시지 전송 핸들러: ChatContext의 sendMessage 함수를 호출합니다.
  const handleSend = (messageContent) => {
    sendMessage(messageContent);
  };


  useEffect(() => {
    if (selectedRoom) {
      // 이 부분에서 selectedRoom에 해당하는 멤버 목록을 API로 가져와서 setRoomMembers를 호출해야 합니다.
      
      setRoomMembers(prev => ({
        ...prev,
        [selectedRoom]: ['테스트멤버1', '테스트멤버2', '테스트멤버3']
      }));
    }
  }, [selectedRoom]);


  return (
    <Box p={4} bg="white" borderRadius="md" shadow="sm" height="100%" display="flex" flexDirection="column">
      <ChatHeader
        roomName={selectedRoom ? selectedRoom.split('-')[1] || selectedRoom : '채팅방'} 
        onBack={onBack}
        onMenuOpen={() => setIsMenuOpen(true)}
      />

      {/* 메시지 목록 */}
      <VStack spacing={2} align="stretch" overflowY="auto" flex="1" my={4}>
        {messages.length === 0 && selectedRoom && (
          <Text>아직 메시지가 없습니다.</Text>
        )}
        {messages.map((msg, index) => (
          
          <ChatMessage
            key={msg.id || index} 
            message={msg}
            isOwn={msg.isOwn} 
          />
        ))}
      </VStack>

      {/* MessageInput 및 ChatRoomMenu 관련 UI */}
      {selectedRoom && (
        <>
          <MessageInput onSend={handleSend} />
          <ChatRoomMenu
            isOpen={isMenuOpen}
            onClose={() => setIsMenuOpen(false)}
            roomName={selectedRoom}
            members={roomMembers[selectedRoom] || []} 
            onLeave={onLeaveRoom} 
          />
        </>
      )}
    </Box>
  );
};

export default ChatWindow;
