
import { Box, Text, Flex } from '@chakra-ui/react';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc'; // dayjs UTC 플러그인 다시 임포트
import localizedFormat from 'dayjs/plugin/localizedFormat'; 

dayjs.extend(utc); // UTC 플러그인 다시 활성화
dayjs.extend(localizedFormat); 

const ChatMessage = ({ message, isOwn, showTime }) => {
  // 메시지 타임스탬프를 UTC로 명시적으로 파싱한 후, 사용자 로컬 시간으로 변환하여 HH:mm 형식으로 표시
  // 백엔드에서 시간대 정보 없이 UTC 시간을 보낼 경우 이 방식이 올바르게 작동합니다.
  const displayTime = message.timestamp
    ? dayjs.utc(message.timestamp).local().format('HH:mm') 
    : ''; 

  // 1. 입장/퇴장 메시지 처리 (시스템 메시지)
  if (message.type === 'JOIN' || message.type === 'LEAVE') {
    return (
      <Flex justify="center" width="100%" my="2">
        <Text
          fontSize="sm"
          color="gray.500"
          fontStyle="italic"
          textAlign="center"
          px="3"
          py="1"
          borderRadius="md"
          bg="none" // 시스템 메시지 배경색
          display="flex" 
          alignItems="center"
          gap="2" // 내용과 시간 사이 간격
        >
          -- {message.content || ''} -- 
          {showTime && ( 
            <Box as="span" fontSize="xs" color="gray.400">
              {displayTime}
            </Box>
          )}
        </Text>
      </Flex>
    );
  }

  // 2. 일반 채팅 메시지 (CHAT 타입)
  return (
    <Box
      display="flex"
      flexDirection={isOwn ? 'row-reverse' : 'row'} 
      alignItems="flex-end" 
      mb="2"
      width="100%" 
    >
      <Box
        bg={isOwn ? 'orange.500' : 'gray.200'} 
        color={isOwn ? 'white' : 'gray.800'}
        px="4"
        py="2"
        borderRadius="lg"
        maxWidth="60%" 
        whiteSpace="pre-wrap"
        wordBreak="break-word"
        shadow="sm" 
      >
        {!isOwn && ( 
          <Text fontSize="xs" fontWeight="bold" mb="1" color="gray.600">
            {message.sender}
          </Text>
        )}
        <Text fontSize="md">{message.text || ''}</Text> 
      </Box>

      {/* 시간 표시: 메시지 버블 옆에 작게 표시 */}
      {showTime && ( 
        <Text
          fontSize="xs"
          color="gray.500"
          mx="2" 
          mb="1" 
          alignSelf="flex-end" 
        >
          {displayTime}
        </Text>
      )}
    </Box>
  );
};

export default ChatMessage;
