/*
import { Flex, Box } from '@chakra-ui/react';
import { ChatProvider, useChat } from '../components/chat/context/ChatContext';
import ChatSidebar from '../components/chat/ChatSidebar';
import ChatWindow from '../components/chat/ChatWindow';
import ChatList from '../components/chat/ChatList';

const ChatLayout = () => {
  const { selectedRoom, setSelectedRoom } = useChat();

  return (
    <Flex height="90vh" bg="#f9f8f6" color="text.primary">
      <ChatSidebar
        onSelectRoom={setSelectedRoom}
        selectedRoom={selectedRoom}
      />
      <Box flex="1">
        {selectedRoom ? (
          <ChatWindow
            selectedRoom={selectedRoom}
            onBack={() => setSelectedRoom(null)}
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
*/
// ChatLayout.jsx
import { Flex, Box } from '@chakra-ui/react';
import { ChatProvider, useChat } from '../components/chat/context/ChatContext';
import ChatSidebar from '../components/chat/ChatSidebar';
import ChatWindow from '../components/chat/ChatWindow';
import ChatList from '../components/chat/ChatList';
import { useState } from 'react';

const ChatLayout = () => {
  const { selectedRoom, setSelectedRoom } = useChat();

  const [rooms, setRooms] = useState([
    'project-a',
    'project-b',
    'user-hong',
    'user-kim'
  ]);

  const handleLeaveRoom = (roomId) => {
    setRooms(prev => prev.filter(r => r !== roomId));
    if (selectedRoom === roomId) {
      setSelectedRoom(null);
    }
  };

  return (
    <Flex height="90vh" bg="#f9f8f6" color="text.primary">
      <ChatSidebar
        onSelectRoom={setSelectedRoom}
        selectedRoom={selectedRoom}
        availableRooms={rooms} // ✅ 추가
      />
      <Box flex="1">
        {selectedRoom ? (
          <ChatWindow
            selectedRoom={selectedRoom}
            onBack={() => setSelectedRoom(null)}
            onLeaveRoom={handleLeaveRoom} // ✅ 추가
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
