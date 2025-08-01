/*
import { Box, Flex, VStack, Text, Center } from '@chakra-ui/react';
import ChatMessage from './ChatMessage';
import ChatDateDivider from './ChatDateDivider';
import MessageInput from './MessageInput';
import ChatHeader from './ChatHeader';
import { useState, useEffect, useRef } from 'react';
import { useTranslation } from "react-i18next";

const mockMessages = {
  'project-a': [
    { date: '2025-07-30', sender: '홍길동', time: '10:00', text: '프로젝트 A 시작합니다.' },
    { date: '', sender: '나', time: '10:05', text: '좋아요!' }
  ],
  'user-hong': []
};

const ChatWindow = ({ selectedRoom, onBack }) => {
  const [messages, setMessages] = useState(mockMessages);
  const messageBoxRef = useRef(null);
    const { t } = useTranslation();

  const currentMessages = messages[selectedRoom] || [];

  // ✅ 메시지 전송
  const handleSend = (text) => {
    if (!selectedRoom) return;
    const now = new Date();
    const time = now.toTimeString().slice(0, 5);
    const date = now.toISOString().slice(0, 10);

    // ✅ 메시지 추가 전 스크롤이 맨 아래였는지 체크
    const box = messageBoxRef.current;
    const isAtBottom = box
      ? box.scrollHeight - box.scrollTop <= box.clientHeight + 10
      : false;

    setMessages((prev) => {
      const roomMsgs = prev[selectedRoom] || [];
      const hasDate = roomMsgs.some((m) => m.date === date);
      const newMsg = {
        sender: '나',
        time,
        text,
        date: hasDate ? '' : date,
      };
      return {
        ...prev,
        [selectedRoom]: [...roomMsgs, newMsg],
      };
    });

    // ✅ setTimeout으로 다음 렌더 이후 실행 (스크롤 맨 아래로)
    setTimeout(() => {
      if (isAtBottom && messageBoxRef.current) {
        messageBoxRef.current.scrollTop = messageBoxRef.current.scrollHeight;
      }
    }, 0);
  };

  // ✅ 채팅방 바뀌었을 때 무조건 맨 아래로
  useEffect(() => {
    if (messageBoxRef.current) {
      messageBoxRef.current.scrollTop = messageBoxRef.current.scrollHeight;
    }
  }, [selectedRoom]);

  return (
    <Flex flex="1" direction="column" justify="space-between" p="4" height="90vh">
      <ChatHeader title={selectedRoom} onBack={onBack} />

      <Box
        ref={messageBoxRef}
        flex="1"
        overflowY="auto"
        mb="4"
        bg="gray.50"
        px="2"
        borderRadius="md"
      >
        {!selectedRoom ? (
          <Center h="100%">
            <Text color="gray.500">{t("Please select a chatting")}</Text>
          </Center>
        ) : currentMessages.length === 0 ? (
          <Center h="100%">
            <Text color="gray.500">{t("There is no chat history yet.")}</Text>
          </Center>
        ) : (
         
        <VStack spacing={2} align="stretch">
            {currentMessages.map((msg, idx) => {
                const nextMsg = currentMessages[idx + 1];
                const currentTime = msg.timestamp || msg.time;
                const nextTime = nextMsg?.timestamp || nextMsg?.time;

                // 다음 메시지랑 시간이 다르거나 마지막 메시지면 시간 표시
                const showTime = !nextMsg || currentTime !== nextTime;

                return (
                <div key={idx}>
                    {msg.date && <ChatDateDivider date={msg.date} />}
                    <ChatMessage
                    message={msg}
                    isOwn={msg.sender === '나'}
                    showTime={showTime}
                    />
                </div>
                );
            })}
        </VStack>

        )}
      </Box>

      {selectedRoom && <MessageInput onSend={handleSend} />}
    </Flex>
  );
};

export default ChatWindow;
*/

import { Box, Flex, VStack, Text, Center } from '@chakra-ui/react';
import ChatMessage from './ChatMessage';
import ChatDateDivider from './ChatDateDivider';
import MessageInput from './MessageInput';
import ChatHeader from './ChatHeader';
import { useState, useEffect, useRef } from 'react';
import { useTranslation } from "react-i18next";
import ChatRoomMenu from './ChatRoomMenu';

const mockMessages = {
  'project-a': [
    { date: '2025-07-30', sender: '홍길동', time: '10:00', text: '프로젝트 A 시작합니다.' },
    { date: '', sender: '나', time: '10:05', text: '좋아요!' }
  ],
  'user-hong': []
};

const ChatWindow = ({ selectedRoom, onBack, onLeaveRoom }) => {
  const [messages, setMessages] = useState(mockMessages);
  const [roomMembers, setRoomMembers] = useState({
    'project-a': ['홍길동', '나'],
    'project-b': ['김개발', '나'],
    'user-hong': ['홍길동', '나'],
    'user-kim': ['김개발', '나'],
  });

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLeaveRoom = () => {
    onLeaveRoom(selectedRoom); // 부모로 콜백 전달
    setIsMenuOpen(false);
  };
  const messageBoxRef = useRef(null);
    const { t } = useTranslation();

  const currentMessages = messages[selectedRoom] || [];

  // ✅ 메시지 전송
  const handleSend = (text) => {
    if (!selectedRoom) return;
    const now = new Date();
    const time = now.toTimeString().slice(0, 5);
    const date = now.toISOString().slice(0, 10);

    // ✅ 메시지 추가 전 스크롤이 맨 아래였는지 체크
    const box = messageBoxRef.current;
    const isAtBottom = box
      ? box.scrollHeight - box.scrollTop <= box.clientHeight + 10
      : false;

    setMessages((prev) => {
      const roomMsgs = prev[selectedRoom] || [];
      const hasDate = roomMsgs.some((m) => m.date === date);
      const newMsg = {
        sender: '나',
        time,
        text,
        date: hasDate ? '' : date,
      };
      return {
        ...prev,
        [selectedRoom]: [...roomMsgs, newMsg],
      };
    });

    // ✅ setTimeout으로 다음 렌더 이후 실행 (스크롤 맨 아래로)
    setTimeout(() => {
      if (isAtBottom && messageBoxRef.current) {
        messageBoxRef.current.scrollTop = messageBoxRef.current.scrollHeight;
      }
    }, 0);
  };

  // ✅ 채팅방 바뀌었을 때 무조건 맨 아래로
  useEffect(() => {
    if (messageBoxRef.current) {
      messageBoxRef.current.scrollTop = messageBoxRef.current.scrollHeight;
    }
  }, [selectedRoom]);

  return (
    <Flex flex="1" direction="column" justify="space-between" p="4" height="90vh">
      <ChatHeader title={selectedRoom} onBack={onBack}  onOpenMenu={() => setIsMenuOpen(true)}/>

      {/* ✅ 스크롤 영역에 ref 추가 */}
      <Box
        ref={messageBoxRef}
        flex="1"
        overflowY="auto"
        mb="4"
        bg="gray.50"
        px="2"
        borderRadius="md"
      >
        {!selectedRoom ? (
          <Center h="100%">
            <Text color="gray.500">{t("Please select a chatting")}</Text>
          </Center>
        ) : currentMessages.length === 0 ? (
          <Center h="100%">
            <Text color="gray.500">{t("There is no chat history yet.")}</Text>
          </Center>
        ) : (
         
        <VStack spacing={2} align="stretch">
            {currentMessages.map((msg, idx) => {
                const nextMsg = currentMessages[idx + 1];
                const currentTime = msg.timestamp || msg.time;
                const nextTime = nextMsg?.timestamp || nextMsg?.time;

                // 다음 메시지랑 시간이 다르거나 마지막 메시지면 시간 표시
                const showTime = !nextMsg || currentTime !== nextTime;

                return (
                <div key={idx}>
                    {msg.date && <ChatDateDivider date={msg.date} />}
                    <ChatMessage
                    message={msg}
                    isOwn={msg.sender === '나'}
                    showTime={showTime}
                    />
                </div>
                );
            })}
        </VStack>

        )}
      </Box>

    {selectedRoom && (
        <>
          <MessageInput onSend={handleSend} />
          <ChatRoomMenu
            isOpen={isMenuOpen}
            onClose={() => setIsMenuOpen(false)}
            roomName={selectedRoom}
            members={roomMembers[selectedRoom] || []}
            onLeave={handleLeaveRoom}
          />
        </>
      )}
    </Flex>
  );
};

export default ChatWindow;
