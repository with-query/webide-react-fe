import {
  Box,
  VStack,
  Text,
  Spinner,
  Flex,
  Center,
  Icon,
} from '@chakra-ui/react';
import { MessageCircle } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';

import ChatMessage from './ChatMessage';

interface ChatMessageListProps {
  refreshTrigger?: number;
}

export default function ChatMessageList({ refreshTrigger }: ChatMessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();


  const { data: messages = [], isLoading, error } = useQuery({
    queryKey: ['/api/chat/messages', refreshTrigger],
    refetchInterval: 5000, // 5초마다 자동 새로고침
  });

  // 새 메시지가 추가되면 자동으로 스크롤 아래로
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (isLoading) {
    return (
      <Center h="400px">
        <VStack spacing={4}>
          <Spinner size="lg" color="brand.500" thickness="3px" />
          <Text color="gray.600" fontSize="sm">
            메시지를 불러오는 중...
          </Text>
        </VStack>
      </Center>
    );
  }

  if (error) {
    return (
      <Center h="400px">
        <VStack spacing={4}>
          <Icon as={MessageCircle} boxSize={12} color="gray.400" />
          <Text color="gray.600" fontSize="sm" textAlign="center">
            메시지를 불러올 수 없습니다.<br />
            잠시 후 다시 시도해주세요.
          </Text>
        </VStack>
      </Center>
    );
  }

  if (messages.length === 0) {
    return (
      <Center h="400px">
        <VStack spacing={4}>
          <Box
            p={4}
            borderRadius="full"
            bg="linear-gradient(135deg, var(--chakra-colors-brand-400), var(--chakra-colors-pink-400))"
          >
            <Icon as={MessageCircle} boxSize={8} color="white" />
          </Box>
          <VStack spacing={2}>
            <Text fontWeight="semibold" fontSize="lg" color="gray.700">
              💬 첫 번째 메시지를 보내보세요!
            </Text>
            <Text color="gray.500" fontSize="sm" textAlign="center">
              팀원들과 프로젝트에 대해 이야기해보세요.
            </Text>
          </VStack>
        </VStack>
      </Center>
    );
  }

  return (
    <Box
      h="500px"
      overflowY="auto"
      p={4}
      css={{
        '&::-webkit-scrollbar': {
          width: '6px',
        },
        '&::-webkit-scrollbar-track': {
          background: 'rgba(0,0,0,0.1)',
          borderRadius: '10px',
        },
        '&::-webkit-scrollbar-thumb': {
          background: 'linear-gradient(135deg, var(--chakra-colors-brand-400), var(--chakra-colors-pink-400))',
          borderRadius: '10px',
        },
      }}
    >
      <VStack spacing={0} align="stretch">
        {messages.map((message: any) => (
          <ChatMessage
            key={message.id}
            message={message}
            isOwnMessage={message.userId === user?.id}
          />
        ))}
        <div ref={messagesEndRef} />
      </VStack>
    </Box>
  );
}