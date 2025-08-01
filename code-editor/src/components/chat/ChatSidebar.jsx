/*
import { Box, VStack, Heading, Divider, Text, Flex } from '@chakra-ui/react';
import { FiFolder, FiUser } from 'react-icons/fi';
import { BsCircleFill } from 'react-icons/bs';
import { FaUserTie, FaUserGraduate } from 'react-icons/fa';
import { useTranslation } from "react-i18next";

const ChatSidebar = ({ onSelectRoom, selectedRoom }) => {
      const { t } = useTranslation();
  return (
    <Box width="300px" bg="white" borderRight="1px solid #e2e2e2" p="4">
      <Heading size="md" mb="4">{t("Chat")}</Heading>
      <VStack align="stretch" spacing={2}>
        <Flex align="center" gap="2">
          <FiFolder />
          <Text fontWeight="bold">{t("Team chat")}</Text>
        </Flex>

        <Flex
          align="center"
          gap="2"
          cursor="pointer"
          onClick={() => onSelectRoom('project-a')}
          fontWeight={selectedRoom === 'project-a' ? 'bold' : 'normal'}
        >
          <BsCircleFill color="green" size="10" />
          <Text>프로젝트 A</Text>
        </Flex>

        <Flex
          align="center"
          gap="2"
          cursor="pointer"
          onClick={() => onSelectRoom('project-b')}
          fontWeight={selectedRoom === 'project-b' ? 'bold' : 'normal'}
        >
          <BsCircleFill color="blue" size="10" />
          <Text>프로젝트 B</Text>
        </Flex>

        <Divider mt="2" mb="1" />

        <Flex align="center" gap="2">
          <FiUser />
          <Text fontWeight="bold">{t("1:1 Chatting")}</Text>
        </Flex>

        <Flex
          align="center"
          gap="2"
          cursor="pointer"
          onClick={() => onSelectRoom('user-hong')}
          fontWeight={selectedRoom === 'user-hong' ? 'bold' : 'normal'}
        >
          <FaUserTie />
          <Text>홍길동</Text>
        </Flex>

        <Flex
          align="center"
          gap="2"
          cursor="pointer"
          onClick={() => onSelectRoom('user-kim')}
          fontWeight={selectedRoom === 'user-kim' ? 'bold' : 'normal'}
        >
          <FaUserGraduate />
          <Text>김개발</Text>
        </Flex>
      </VStack>
    </Box>
  );
};

export default ChatSidebar;
*/
// ChatSidebar.jsx
import { Box, VStack, Heading, Divider, Text, Flex } from '@chakra-ui/react';
import { FiFolder, FiUser } from 'react-icons/fi';
import { BsCircleFill } from 'react-icons/bs';
import { FaUserTie, FaUserGraduate } from 'react-icons/fa';
import { useTranslation } from "react-i18next";
import FolderIcon from "@/components/icons/FolderIcon";

const ChatSidebar = ({ onSelectRoom, selectedRoom, availableRooms = [] }) => {
  const { t } = useTranslation();

  const teamRooms = availableRooms.filter(r => r.startsWith('project-'));
  const dmRooms = availableRooms.filter(r => r.startsWith('user-'));

  return (
    <Box width="300px" bg="white" borderRight="1px solid #e2e2e2" p="4">
      <Heading size="md" mb="4">{t("Chat")}</Heading>
      <VStack align="stretch" spacing={2}>
        {/* 팀 채팅 */}
        <Flex align="center" gap="2" >
          {/*<FiFolder />*/}
          <Box boxSize="20px" color="#d57239">
            <FolderIcon />
          </Box>
          
          <Text fontWeight="bold">{t("Team chat")}</Text>
        </Flex>

        {teamRooms.map(room => (
          <Flex
            key={room}
            align="center"
            gap="2"
            cursor="pointer"
            onClick={() => onSelectRoom(room)}
            fontWeight={selectedRoom === room ? 'bold' : 'normal'}
          >
            <BsCircleFill color="green" size="10" />
            <Text>{room === 'project-a' ? '프로젝트 A' : '프로젝트 B'}</Text>
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
            key={room}
            align="center"
            gap="2"
            cursor="pointer"
            onClick={() => onSelectRoom(room)}
            fontWeight={selectedRoom === room ? 'bold' : 'normal'}
            
          >
            {room === 'user-hong' ? <FaUserTie /> : <FaUserGraduate />}
            <Text>{room === 'user-hong' ? '홍길동' : '김개발'}</Text>
          </Flex>
        ))}
      </VStack>
    </Box>
  );
};

export default ChatSidebar;
