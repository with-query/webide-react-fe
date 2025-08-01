/*
import { Box, Text } from '@chakra-ui/react';
import dayjs from 'dayjs';

const ChatMessage = ({ message, isOwn }) => {
  const displayTime = message.timestamp
    ? dayjs(message.timestamp).format('HH:mm')
    : message.time;

  return (
    <Box
      display="flex"
      flexDirection={isOwn ? 'row-reverse' : 'row'}
      alignItems="flex-end"
      mb="2"
    >
    
      <Box
        bg={isOwn ? 'blue.100' : 'gray.100'}
        color="black"
        px="4"
        py="2"
        borderRadius="lg"
        maxWidth="60%"
        whiteSpace="pre-wrap"
        wordBreak="break-word"
      >
        <Text>{message.text}</Text>
      </Box>

      <Text
        fontSize="xs"
        color="gray.500"
        mx="2"
        mb="1"
      >
        {displayTime}
      </Text>
    </Box>
  );
};

export default ChatMessage;
*/
import { Box, Text } from '@chakra-ui/react';
import dayjs from 'dayjs';

const ChatMessage = ({ message, isOwn, showTime }) => {
  const displayTime = message.timestamp
    ? dayjs(message.timestamp).format('HH:mm')
    : message.time;

  return (
    <Box
      display="flex"
      flexDirection={isOwn ? 'row-reverse' : 'row'}
      alignItems="flex-end"
      mb="2"
    >
      <Box
        bg={isOwn ? 'blue.100' : 'gray.100'}
        color="black"
        px="4"
        py="2"
        borderRadius="lg"
        maxWidth="60%"
        whiteSpace="pre-wrap"
        wordBreak="break-word"
      >
        <Text>{message.text}</Text>
      </Box>

      {/* 마지막 메시지일 때만 시간 표시 */}
      {showTime && (
        <Text fontSize="xs" color="gray.500" mx="2" mb="1">
          {displayTime}
        </Text>
      )}
    </Box>
  );
};

export default ChatMessage;
