
import { Box, Text, Flex } from '@chakra-ui/react';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc'; 
import localizedFormat from 'dayjs/plugin/localizedFormat'; 
import timezone from 'dayjs/plugin/timezone'; 

dayjs.extend(utc); 
dayjs.extend(localizedFormat); 
dayjs.extend(timezone);


const ChatMessage = ({ message, isOwn, showTime }) => {
    // 메시지 타임스탬프를 UTC로 명시적으로 파싱한 후, KST로 변환하여 HH:mm 형식으로 표시
    const displayTime = message.timestamp
        ? dayjs.utc(message.timestamp).tz('Asia/Seoul').format('HH:mm') 
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
                    bg="none" 
                    display="flex" 
                    alignItems="center"
                    gap="2" 
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
