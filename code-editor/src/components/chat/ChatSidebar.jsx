/*import { Box, VStack, Heading, Divider, Text, Flex } from '@chakra-ui/react';
import { FiFolder, FiUser } from 'react-icons/fi';
import { BsCircleFill } from 'react-icons/bs';
import { FaUserTie, FaUserGraduate } from 'react-icons/fa';
import { useTranslation } from "react-i18next";
// FolderIcon 컴포넌트가 '@/components/icons/FolderIcon' 경로에 있다고 가정합니다.
// 만약 없다면 FiFolder 아이콘으로 대체하거나 해당 경로에 파일을 생성해야 합니다.
import FolderIcon from "@/components/icons/FolderIcon";


const ChatSidebar = ({ onSelectRoom, selectedRoom, availableRooms = [] }) => {
  const { t } = useTranslation();

  // type 속성을 사용하여 팀 채팅과 1:1 채팅을 구분합니다.
  const teamRooms = availableRooms.filter(room => room.type === 'project');
  const dmRooms = availableRooms.filter(room => room.type === 'user');

  console.log("팀 채팅방:", teamRooms);
  console.log("DM 채팅방:", dmRooms);

  return (
    <Box width="300px" bg="white" borderRight="1px solid #e2e2e2" p="4">
      <Heading size="md" mb="4">{t("Chat")}</Heading>
      <VStack align="stretch" spacing={2}>
     
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
            onClick={() => onSelectRoom(room.id)}
            fontWeight={selectedRoom === room.id ? 'bold' : 'normal'}
            _hover={{ bg: "gray.100" }} // 호버 효과 추가
            p={1} // 패딩 추가
            borderRadius="md" // 둥근 모서리 추가
          >
            <BsCircleFill color="green" size="10" />
            <Text>{room.name}</Text>
          </Flex>
        ))}

        <Divider mt="2" mb="1" />

        
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
            onClick={() => onSelectRoom(room.id)}
            fontWeight={selectedRoom === room.id ? 'bold' : 'normal'}
            _hover={{ bg: "gray.100" }} // 호버 효과 추가
            p={1} // 패딩 추가
            borderRadius="md" // 둥근 모서리 추가
          >
           
            {room.id === 'user-hong' ? <FaUserTie /> : <FaUserGraduate />}
            <Text>{room.name}</Text>
          </Flex>
        ))}
      </VStack>
    </Box>
  );
};

export default ChatSidebar;*/
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
            _hover={{ bg: "gray.100" }}
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
            _hover={{ bg: "gray.100" }}
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
