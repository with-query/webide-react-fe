import React, { useEffect, useState, useRef } from 'react';
import { Box, Text, VStack, useToast } from '@chakra-ui/react';
import ChatMessage from './ChatMessage';
import ChatDateDivider from './ChatDateDivider';
import MessageInput from './MessageInput';
import ChatHeader from './ChatHeader';
import ChatRoomMenu from './ChatRoomMenu';
import { useChat, BASE_URL } from './context/ChatContext';
import axios from 'axios';
import "../../styles/Chat.css";
import dayjs from 'dayjs';


const ChatWindow = ({ selectedRoom, onBack, onLeaveRoom }) => {
  const { messages, sendMessage, currentUserInfo } = useChat();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [roomMembers, setRoomMembers] = useState({}); 
  const messagesEndRef = useRef(null);
  const toast = useToast();

  const handleSend = (messageContent) => {
    if (!currentUserInfo) {
      toast({
        title: "사용자 정보 로딩 중",
        description: "잠시 후 다시 시도해주세요.",
        status: "info",
        duration: 2000,
        isClosable: true,
      });
      return;
    }
    sendMessage(messageContent);
  };

  useEffect(() => {
    const fetchRoomMembers = async () => {
      if (!selectedRoom || selectedRoom.type !== 'project') {
        setRoomMembers(prev => ({ ...prev, [selectedRoom?.id]: [] }));
        return;
      }

      const token = localStorage.getItem('token');
      if (!token) {
        toast({
          title: "인증 필요",
          description: "방 멤버를 불러오려면 로그인이 필요합니다.",
          status: "info",
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      try {
        const projectId = selectedRoom.id.replace('project-', '');
        const response = await axios.get(`${BASE_URL}/api/projects/${projectId}/members`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        // --- 디버깅 로그 추가 시작 ---
        console.log(`[DEBUG] 프로젝트 ${projectId}의 원본 멤버 데이터:`, response.data);
        const fetchedMembers = response.data.map(member => {
          console.log(`[DEBUG] 개별 멤버 객체:`, member); // 각 멤버 객체의 구조 확인
          return member.userName; // 'nickname' 대신 'userName'으로 수정했습니다.
        });
        // --- 디버깅 로그 추가 끝 ---

        console.log(`프로젝트 ${projectId}의 멤버 목록:`, fetchedMembers);

        setRoomMembers(prev => ({
          ...prev,
          [selectedRoom.id]: fetchedMembers
        }));
      } catch (error) {
        console.error(`프로젝트 ${selectedRoom.id} 멤버 로드 실패:`, error);
        toast({
          title: "멤버 로드 실패",
          description: "채팅방 멤버를 불러오는 데 실패했습니다.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    };

    fetchRoomMembers();
  }, [selectedRoom, toast]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const renderMessagesWithDividers = () => {
    let lastDisplayedDate = null;
    const renderedElements = [];

    messages.forEach((msg, index) => {
      const messageDate = dayjs(msg.timestamp).format('YYYY년 M월 D일');

      if (messageDate !== lastDisplayedDate) {
        renderedElements.push(
          <ChatDateDivider key={`date-${messageDate}`} date={messageDate} />
        );
        lastDisplayedDate = messageDate;
      }

      const showTimeForMessage = true; 

      renderedElements.push(
        <ChatMessage
          key={msg.id || index}
          message={msg}
          isOwn={msg.isOwn}
          showTime={showTimeForMessage}
        />
      );
    });
    return renderedElements;
  };

  return (
    <Box p={4} bg="white" borderRadius="md" shadow="sm" height="100%" display="flex" flexDirection="column">
      <ChatHeader
        title={selectedRoom ? selectedRoom.name : '채팅방'}
        onBack={onBack}
        onOpenMenu={() => setIsMenuOpen(true)}
      />

      <VStack spacing={2} align="stretch" overflowY="auto" flex="1" my={4}>
        {messages.length === 0 && selectedRoom && (
          <Text textAlign="center" color="gray.500">
            아직 메시지가 없습니다.
          </Text>
        )}
        {renderMessagesWithDividers()}
        <div ref={messagesEndRef} />
      </VStack>

      {selectedRoom && (
        <>
          <MessageInput onSend={handleSend} />
          <ChatRoomMenu
            isOpen={isMenuOpen}
            onClose={() => setIsMenuOpen(false)}
            roomName={selectedRoom.name}
            members={roomMembers[selectedRoom.id] || []} 
            onLeave={() => onLeaveRoom(selectedRoom.id)}
          />
        </>
      )}
    </Box>
  );
};

export default ChatWindow;
