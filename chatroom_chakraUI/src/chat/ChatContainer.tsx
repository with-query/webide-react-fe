import {
  Box,
  Card,
  CardHeader,
  CardBody,
  Flex,
  Text,
  Icon,
  Badge,
  Divider,
} from '@chakra-ui/react';
import { MessageCircle, Users } from 'lucide-react';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import ChatMessageList from './ChatMessageList';
import ChatInput from './ChatInput';

export default function ChatContainer() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const { data: messages = [] } = useQuery({
    queryKey: ['/api/chat/messages'],
  });

  const handleMessageSent = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <Card
      maxW="600px"
      h="700px"
      mx="auto"
      boxShadow="2xl"
      borderRadius="3xl"
      overflow="hidden"
      bg="rgba(255, 255, 255, 0.95)"
      backdropFilter="blur(20px)"
      border="1px solid"
      borderColor="rgba(255, 255, 255, 0.3)"
    >
      {/* 채팅 헤더 */}
      <CardHeader
        bg="linear-gradient(135deg, var(--chakra-colors-brand-400), var(--chakra-colors-pink-400))"
        color="white"
        py={6}
      >
        <Flex align="center" justify="space-between">
          <Flex align="center" gap={3}>
            <Box
              p={2}
              borderRadius="full"
              bg="rgba(255, 255, 255, 0.2)"
            >
              <Icon as={MessageCircle} boxSize={6} />
            </Box>
            <Box>
              <Text fontSize="xl" fontWeight="bold">
                팀 채팅방
              </Text>
              <Text fontSize="sm" opacity={0.9}>
                실시간 협업 공간
              </Text>
            </Box>
          </Flex>
          
          <Flex align="center" gap={2}>
            <Icon as={Users} boxSize={5} />
            <Badge
              colorScheme="whiteAlpha"
              variant="solid"
              borderRadius="full"
              px={3}
              py={1}
            >
              온라인
            </Badge>
          </Flex>
        </Flex>
      </CardHeader>

      <Divider />

      {/* 메시지 목록 */}
      <CardBody p={0} position="relative">
        <ChatMessageList refreshTrigger={refreshTrigger} />
      </CardBody>

      {/* 메시지 입력 */}
      <ChatInput onMessageSent={handleMessageSent} />
    </Card>
  );
}