import {
  Box,
  Flex,
  Input,
  IconButton,
  useToast,
} from '@chakra-ui/react';
import { Send } from 'lucide-react';
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';


interface ChatInputProps {
  onMessageSent?: () => void;
}

export default function ChatInput({ onMessageSent }: ChatInputProps) {
  const [message, setMessage] = useState('');
  const toast = useToast();
  const queryClient = useQueryClient();


  const sendMessageMutation = useMutation({
    mutationFn: async (messageText: string) => {
      return await apiRequest('/api/chat/messages', {
        method: 'POST',
        body: JSON.stringify({ message: messageText }),
      });
    },
    onSuccess: () => {
      setMessage('');
      queryClient.invalidateQueries({ queryKey: ['/api/chat/messages'] });
      onMessageSent?.();
      toast({
        title: '메시지 전송됨',
        status: 'success',
        duration: 2000,
        isClosable: true,
        position: 'top',
      });
    },
    onError: (error) => {
      toast({
        title: '메시지 전송 실패',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
        position: 'top',
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || sendMessageMutation.isPending) return;
    
    sendMessageMutation.mutate(message.trim());
  };

  return (
    <Box
      position="sticky"
      bottom={0}
      bg="rgba(255, 255, 255, 0.95)"
      backdropFilter="blur(10px)"
      borderTop="1px solid"
      borderColor="rgba(255, 255, 255, 0.2)"
      p={4}
    >
      <form onSubmit={handleSubmit}>
        <Flex gap={3} align="center">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="메시지를 입력하세요..."
            size="lg"
            borderRadius="full"
            bg="white"
            border="2px solid"
            borderColor="gray.200"
            _focus={{
              borderColor: 'brand.400',
              boxShadow: '0 0 0 1px var(--chakra-colors-brand-400)',
            }}
            _placeholder={{ color: 'gray.500' }}
            disabled={sendMessageMutation.isPending}
          />
          
          <IconButton
            type="submit"
            aria-label="메시지 전송"
            icon={<Send size={20} />}
            size="lg"
            borderRadius="full"
            bgGradient="linear(to-r, brand.400, pink.400)"
            color="white"
            _hover={{
              bgGradient: 'linear(to-r, brand.500, pink.500)',
              transform: 'scale(1.05)',
            }}
            _active={{
              transform: 'scale(0.95)',
            }}
            isLoading={sendMessageMutation.isPending}
            isDisabled={!message.trim()}
            transition="all 0.2s ease"
          />
        </Flex>
      </form>
    </Box>
  );
}