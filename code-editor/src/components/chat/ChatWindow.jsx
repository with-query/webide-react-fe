/*import React, { useEffect, useState, useRef } from 'react';
import { Box, Text, VStack } from '@chakra-ui/react';
import ChatMessage from './ChatMessage'; // ChatMessage 컴포넌트가 필요합니다.
import ChatDateDivider from './ChatDateDivider'; // ChatDateDivider 컴포넌트가 필요합니다.
import MessageInput from './MessageInput'; // MessageInput 컴포넌트가 필요합니다.
import ChatHeader from './ChatHeader'; // ChatHeader 컴포넌트가 필요합니다.
import ChatRoomMenu from './ChatRoomMenu'; // ChatRoomMenu 컴포넌트가 필요합니다.
import { useChat } from './context/ChatContext';
// axios는 이 컴포넌트에서 직접 API 호출을 할 경우에만 필요합니다.
// 현재는 ChatContext에서 메시지를 가져오므로 필요하지 않습니다.
// import axios from 'axios';

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
      // TODO: 이 부분에서 selectedRoom에 해당하는 멤버 목록을 HTTP API로 가져와서 setRoomMembers를 호출해야 합니다.
      // 예시:
      // const fetchRoomMembers = async () => {
      //   try {
      //     const token = localStorage.getItem('token');
      //     const projectId = selectedRoom.replace('project-', '');
      //     const response = await axios.get(`${BASE_URL}/api/projects/${projectId}/members`, {
      //       headers: { 'Authorization': `Bearer ${token}` }
      //     });
      //     setRoomMembers(prev => ({
      //       ...prev,
      //       [selectedRoom]: response.data.map(member => member.nickname) // 또는 다른 필드
      //     }));
      //   } catch (error) {
      //     console.error("방 멤버 로드 실패:", error);
      //   }
      // };
      // fetchRoomMembers();

      // 현재는 목업 데이터 유지
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

export default ChatWindow;*/

/*
import React, { useEffect, useState, useRef } from 'react';
import { Box, Text, VStack } from '@chakra-ui/react';
import ChatMessage from './ChatMessage'; // ChatMessage 컴포넌트가 필요합니다.
import ChatDateDivider from './ChatDateDivider'; // ChatDateDivider 컴포넌트가 필요합니다.
import MessageInput from './MessageInput'; // MessageInput 컴포넌트가 필요합니다.
import ChatHeader from './ChatHeader'; // ChatHeader 컴포넌트가 필요합니다.
import ChatRoomMenu from './ChatRoomMenu'; // ChatRoomMenu 컴포넌트가 필요합니다.
import { useChat } from './context/ChatContext';
// axios는 이 컴포넌트에서 직접 API 호출을 할 경우에만 필요합니다.
// 현재는 ChatContext에서 메시지를 가져오므로 필요하지 않습니다.
// import axios from 'axios';

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
      // TODO: 이 부분에서 selectedRoom에 해당하는 멤버 목록을 HTTP API로 가져와서 setRoomMembers를 호출해야 합니다.
      // 예시:
      // const fetchRoomMembers = async () => {
      //   try {
      //     const token = localStorage.getItem('token');
      //     const projectId = selectedRoom.replace('project-', '');
      //     const response = await axios.get(`${BASE_URL}/api/projects/${projectId}/members`, {
      //       headers: { 'Authorization': `Bearer ${token}` }
      //     });
      //     setRoomMembers(prev => ({
      //       ...prev,
      //       [selectedRoom]: response.data.map(member => member.nickname) // 또는 다른 필드
      //     }));
      //   } catch (error) {
      //     console.error("방 멤버 로드 실패:", error);
      //   }
      // };
      // fetchRoomMembers();

      // 현재는 목업 데이터 유지
      setRoomMembers(prev => ({
        ...prev,
        [selectedRoom]: ['테스트멤버1', '테스트멤버2', '테스트멤버3']
      }));
    }
  }, [selectedRoom]);


  return (
    <Box p={4} bg="white" borderRadius="md" shadow="sm" height="100%" display="flex" flexDirection="column">
      <ChatHeader
        title={selectedRoom ? selectedRoom.split('-')[1] || selectedRoom : '채팅방'} // roomName 대신 title prop으로 전달
        onBack={onBack}
        onOpenMenu={() => setIsMenuOpen(true)} // onMenuOpen 대신 onOpenMenu prop으로 전달
      />

     
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
*/
import React, { useEffect, useState, useRef } from 'react';
import { Box, Text, VStack } from '@chakra-ui/react';
import ChatMessage from './ChatMessage'; // ChatMessage 컴포넌트가 필요합니다.
import ChatDateDivider from './ChatDateDivider'; // ChatDateDivider 컴포넌트가 필요합니다.
import MessageInput from './MessageInput'; // MessageInput 컴포넌트가 필요합니다.
import ChatHeader from './ChatHeader'; // ChatHeader 컴포넌트가 필요합니다.
import ChatRoomMenu from './ChatRoomMenu'; // ChatRoomMenu 컴포넌트가 필요합니다.
import { useChat } from './context/ChatContext';
// axios는 이 컴포넌트에서 직접 API 호출을 할 경우에만 필요합니다.
// 현재는 ChatContext에서 메시지를 가져오므로 필요하지 않습니다.
// import axios from 'axios';

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
      // TODO: 이 부분에서 selectedRoom에 해당하는 멤버 목록을 HTTP API로 가져와서 setRoomMembers를 호출해야 합니다.
      // 예시:
      // const fetchRoomMembers = async () => {
      //   try {
      //     const token = localStorage.getItem('token');
      //     const projectId = selectedRoom.id.replace('project-', ''); // selectedRoom이 객체이므로 .id 접근
      //     const response = await axios.get(`${BASE_URL}/api/projects/${projectId}/members`, {
      //       headers: { 'Authorization': `Bearer ${token}` }
      //     });
      //     setRoomMembers(prev => ({
      //       ...prev,
      //       [selectedRoom.id]: response.data.map(member => member.nickname) // selectedRoom.id를 키로 사용
      //     }));
      //   } catch (error) {
      //     console.error("방 멤버 로드 실패:", error);
      //   }
      // };
      // fetchRoomMembers();

      // 현재는 목업 데이터 유지
      setRoomMembers(prev => ({
        ...prev,
        [selectedRoom.id]: ['테스트멤버1', '테스트멤버2', '테스트멤버3'] // selectedRoom.id를 키로 사용
      }));
    }
  }, [selectedRoom]);


  return (
    <Box p={4} bg="white" borderRadius="md" shadow="sm" height="100%" display="flex" flexDirection="column">
      <ChatHeader
        // selectedRoom이 객체이므로 .name 속성을 직접 사용합니다.
        title={selectedRoom ? selectedRoom.name : '채팅방'}
        onBack={onBack}
        onOpenMenu={() => setIsMenuOpen(true)}
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
            roomName={selectedRoom.name} // selectedRoom이 객체이므로 .name 속성을 사용
            members={roomMembers[selectedRoom.id] || []} // selectedRoom.id를 키로 사용
            onLeave={() => onLeaveRoom(selectedRoom.id)} // onLeaveRoom에 selectedRoom.id를 전달
          />
        </>
      )}
    </Box>
  );
};

export default ChatWindow;
