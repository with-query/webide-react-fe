import {
  Drawer, DrawerBody, DrawerHeader, DrawerOverlay, DrawerContent,
  DrawerCloseButton, Button, VStack, Text
} from '@chakra-ui/react';

const ChatRoomMenu = ({ isOpen, onClose, roomName, members, onLeave }) => {
  return (
    <Drawer isOpen={isOpen} placement="right" onClose={onClose}>
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton />
        <DrawerHeader>{roomName} 참여자 ({members.length}명)</DrawerHeader>

        <DrawerBody>
          <VStack align="start" spacing="2" mb="4">
            {members.map((member, idx) => (
              <Text key={idx}>👤 {member}</Text>
            ))}
          </VStack>

          <Button colorScheme="red" variant="outline" onClick={onLeave}>
            채팅방 나가기
          </Button>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
};

export default ChatRoomMenu;
