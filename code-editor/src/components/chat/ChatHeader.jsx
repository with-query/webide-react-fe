
import { Flex, IconButton, Text } from '@chakra-ui/react';
import { FiArrowLeft, FiMenu } from 'react-icons/fi';

const ChatHeader = ({ title, onBack, onOpenMenu }) => (
  <Flex align="center" justify="space-between" mb="4">
    <Flex align="center" gap="2">
      {onBack && (
        <IconButton
          icon={<FiArrowLeft />}
          onClick={onBack}
          size="sm"
          aria-label="뒤로가기"
        />
      )}
      <Text fontSize="lg" fontWeight="bold">{title}</Text>
    </Flex>

    {onOpenMenu && (
      <IconButton
        icon={<FiMenu />}
        onClick={onOpenMenu}
        size="sm"
        aria-label="채팅방 메뉴"
      />
    )}
  </Flex>
);

export default ChatHeader;
