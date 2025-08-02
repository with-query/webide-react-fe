
import { Box, VStack, Heading, Divider, Text, Flex } from '@chakra-ui/react';
import { FiUser } from 'react-icons/fi';
import { BsCircleFill } from 'react-icons/bs';
import { FaUserTie, FaUserGraduate } from 'react-icons/fa';
import { useTranslation } from "react-i18next";
import FolderIcon from "@/components/icons/FolderIcon";


const ChatSidebar = ({ onSelectRoom, selectedRoom, availableRooms = [] }) => {
  const { t } = useTranslation();

  const teamRooms = availableRooms.filter(room => room.type === 'project');
  const dmRooms = availableRooms.filter(room => room.type === 'user');

  console.log("팀 채팅방:", teamRooms);
  console.log("DM 채팅방:", dmRooms);

  return (
    <Box width="300px" bg="white" borderRight="1px solid #e2e2e2" p="4">
      <Heading size="md" mb="4">{t("Chat")}</Heading>
      <VStack align="stretch" spacing={2}>
        {/* 팀 채팅 */}
        <Flex align="center" gap="2" >
          <Box boxSize="20px" color="#d57239">
            <FolderIcon />
          </Box>
          <Text fontWeight="bold">{t("Team chat")}</Text>
        </Flex>

        {teamRooms.map(room => (
          <Flex
            key={room.id}
            align="center"
            gap="2"
            cursor="pointer"
            onClick={() => onSelectRoom(room)} // 방 전체 객체를 전달
            fontWeight={selectedRoom && selectedRoom.id === room.id ? 'bold' : 'normal'} // selectedRoom이 객체이므로 .id 접근
            _hover={{ bg: "#f2f2f2" }}
            p={1}
            borderRadius="md"
          >
            <BsCircleFill color="green" size="10" />
            <Text>{room.name}</Text>
          </Flex>
        ))}

        <Divider mt="2" mb="1" />

        {/* 1:1 채팅 */}
        <Flex align="center" gap="2">
          <Box color="#d57239" boxSize="20px" >
            <FiUser />
          </Box>
          <Text fontWeight="bold">{t("1:1 Chatting")}</Text>
        </Flex>

        {dmRooms.map(room => (
          <Flex
            key={room.id}
            align="center"
            gap="2"
            cursor="pointer"
            onClick={() => onSelectRoom(room)} // 방 전체 객체를 전달
            fontWeight={selectedRoom && selectedRoom.id === room.id ? 'bold' : 'normal'} // selectedRoom이 객체이므로 .id 접근
            _hover={{ bg: "#f2f2f2" }}
            p={1}
            borderRadius="md"
          >
            {room.id === 'user-hong' ? <FaUserTie /> : <FaUserGraduate />}
            <Text>{room.name}</Text>
          </Flex>
        ))}
      </VStack>
    </Box>
  );
};

export default ChatSidebar;
