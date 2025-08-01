import { createContext, useContext, useState } from 'react';

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [selectedRoom, setSelectedRoom] = useState(null);

  const [messages, setMessages] = useState({
    'project-a': [
      { sender: '홍길동', text: '안녕하세요!', timestamp: '2025-07-30T10:00:00Z' },
      { sender: '나', text: '반갑습니다!', timestamp: '2025-07-30T10:05:00Z' },
    ],
    'user-김민지': [
      { sender: '김민지', text: '1:1 채팅 시작해요!', timestamp: '2025-07-29T12:30:00Z' }
    ],
  });

  const sendMessage = (roomId, text) => {
    const now = new Date().toISOString();
    const newMessage = {
      sender: '나',
      text,
      timestamp: now,
    };
    setMessages((prev) => ({
      ...prev,
      [roomId]: [...(prev[roomId] || []), newMessage],
    }));
  };

  return (
    <ChatContext.Provider
      value={{
        selectedRoom,
        setSelectedRoom,
        messages,
        sendMessage,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => useContext(ChatContext);
