import { Center, Text } from '@chakra-ui/react';

const ChatDateDivider = ({ date }) => {
  return (
    <Center my="4">
      <Text fontSize="sm" color="gray.500">
        ────── {date} ──────
      </Text>
    </Center>
  );
};

export default ChatDateDivider;
