/*
import { HStack, Input, IconButton } from '@chakra-ui/react';
import { FiSend } from 'react-icons/fi';
import { useState } from 'react';

const MessageInput = ({ onSend }) => {
  const [message, setMessage] = useState('');

  const handleSend = () => {
    if (!message.trim()) return;
    onSend(message);
    setMessage('');
  };

  return (
    <HStack spacing="2" mt="2">
      <Input
        placeholder="메시지를 입력하세요"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        bg="white"
      />
      <IconButton
        icon={<FiSend />}
        onClick={handleSend}
        colorScheme="blue"
        aria-label="전송"
      />
    </HStack>
  );
};

export default MessageInput;
*/
import { HStack, Textarea, IconButton } from '@chakra-ui/react';
import { FiSend } from 'react-icons/fi';
import { useState } from 'react';
import { useTranslation } from "react-i18next";

const MessageInput = ({ onSend }) => {
    const [message, setMessage] = useState('');
    const { t } = useTranslation();

  const handleSend = () => {
    if (!message.trim()) return;
    onSend(message);
    setMessage('');
  };

  return (
    <HStack spacing="2" mt="2">
      <Textarea
        placeholder= {t("Please enter your message")}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        bg="white"
        resize="none"
        rows={3}
        onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault(); // 줄바꿈 막음
                handleSend();
                }
            }}
        />

      <IconButton
        icon={<FiSend />}
        onClick={handleSend}
        colorScheme="blue"
        aria-label="전송"
      />
    </HStack>
  );
};

export default MessageInput;
