import {
  Box,
  Flex,
  Text,
  Avatar,
  Card,
  CardBody,
  useColorModeValue,
} from '@chakra-ui/react';
// import { format } from 'date-fns';

interface ChatMessageProps {
  message: {
    id: string;
    message: string;
    createdAt: string;
    user?: {
      firstName?: string;
      lastName?: string;
      profileImageUrl?: string;
    };
  };
  isOwnMessage?: boolean;
}

export default function ChatMessage({ message, isOwnMessage = false }: ChatMessageProps) {
  const bgColor = useColorModeValue(
    isOwnMessage ? 'brand.500' : 'white',
    isOwnMessage ? 'brand.600' : 'gray.700'
  );
  
  const textColor = useColorModeValue(
    isOwnMessage ? 'white' : 'gray.800',
    isOwnMessage ? 'white' : 'white'
  );

  const userName = message.user?.firstName || '익명';
  const userInitial = userName.charAt(0).toUpperCase();
  const messageTime = new Date(message.createdAt).toLocaleTimeString('ko-KR', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });

  return (
    <Flex
      justify={isOwnMessage ? 'flex-end' : 'flex-start'}
      mb={4}
      align="flex-start"
    >
      {!isOwnMessage && (
        <Avatar
          size="sm"
          name={userName}
          src={message.user?.profileImageUrl}
          bg="brand.400"
          color="white"
          mr={3}
        />
      )}
      
      <Box maxW="70%" minW="120px">
        {!isOwnMessage && (
          <Text fontSize="xs" color="gray.600" mb={1} ml={2}>
            {userName}
          </Text>
        )}
        
        <Card
          bg={bgColor}
          color={textColor}
          borderRadius={isOwnMessage ? "20px 20px 4px 20px" : "20px 20px 20px 4px"}
          boxShadow="md"
          border="none"
        >
          <CardBody p={3}>
            <Text fontSize="sm" lineHeight="1.4">
              {message.message}
            </Text>
            <Text
              fontSize="xs"
              opacity={0.7}
              mt={1}
              textAlign={isOwnMessage ? 'right' : 'left'}
            >
              {messageTime}
            </Text>
          </CardBody>
        </Card>
      </Box>

      {isOwnMessage && (
        <Avatar
          size="sm"
          name={userName}
          src={message.user?.profileImageUrl}
          bg="brand.400"
          color="white"
          ml={3}
        />
      )}
    </Flex>
  );
}