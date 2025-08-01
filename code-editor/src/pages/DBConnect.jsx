import {
  Box,
  Button,
  Flex,
  Text,
  Heading,
  useColorModeValue,
  Badge,
  VStack,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,

} from "@chakra-ui/react";
import { useState } from "react";
import ConnectDBModal from "../components/modals/ConnectDBModal";

const dummyDBList = [
  {
    name: "Production DB",
    type: "PostgreSQL",
    host: "prod-db.company.com",
    port: 5432,
    dbName: "main_db",
    status: "connected",
    color: "blue.500",
  },
  {
    name: "Development DB",
    type: "MySQL",
    host: "dev-db.company.com",
    port: 3306,
    dbName: "dev_db",
    status: "connected",
    color: "yellow.500",
  },
  {
    name: "Analytics DB",
    type: "MongoDB",
    host: "analytics.company.com",
    port: 27017,
    dbName: "analytics",
    status: "disconnected",
    color: "red.400",
  },
];

const DBConnect = () => {
  const [dbList] = useState(dummyDBList);
  const [showProjectList, setShowProjectList] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);

  const disconnectedProjects = [
    { id: 1, name: "Project A" },
    { id: 2, name: "Project B" },
  ];

  const statusText = {
    connected: "연결됨",
    disconnected: "연결 끊김",
  };

  return (
    <Box p={6} height="90vh" bg="brand.100" color="text.primary">
      <Flex justify="space-between" align="center" mb={4}>
        <Heading size="md">데이터베이스 연결 관리</Heading>
        <Button colorScheme="orange"  onClick={() => setShowProjectList(true)}>+ 새 연결 추가</Button>
        <Modal isOpen={showProjectList} onClose={() => setShowProjectList(false)}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>연결할 프로젝트 선택</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              {disconnectedProjects.map((proj) => (
                <Button
                  key={proj.id}
                  w="100%"
                  mb={2}
                  onClick={() => {
                    setSelectedProject(proj);
                    setShowProjectList(false);
                  }}
                >
                  {proj.name}
                </Button>
              ))}
            </ModalBody>
          </ModalContent>
        </Modal>

        {/* DB 연결 모달 */}
        {selectedProject && (
          <ConnectDBModal
            project={selectedProject}
            isOpen={!!selectedProject}
            onClose={() => setSelectedProject(null)}
          />
        )}
      </Flex>

      <Flex gap={4} flexWrap="wrap">
        {dbList.map((db, index) => (
          <Box
            key={index}
            p={4}
            borderWidth="1px"
            borderRadius="md"
            w="300px"
            //bg={useColorModeValue("white", "gray.700")}
            bg="white"
          >
            <Flex justify="space-between" align="center" mb={2}>
              <Flex align="center" gap={2}>
                <Box
                  w={4}
                  h={4}
                  bg={db.color}
                  borderRadius="sm"
                />
                <Text fontWeight="bold">{db.name}</Text>
              </Flex>
              <Badge colorScheme={db.status === "connected" ? "green" : "red"}>
                {statusText[db.status]}
              </Badge>
            </Flex>

            <Text fontSize="sm" color="gray.500" mb={2}>
              {db.type}
            </Text>

            <VStack align="start" spacing={1} fontSize="sm" mb={3}>
              <Text>호스트: {db.host}</Text>
              <Text>포트: {db.port}</Text>
              <Text>데이터베이스: {db.dbName}</Text>
            </VStack>

            <Flex justify="space-between">
              {db.status === "disconnected" ? (
                <>
                  <Button size="sm" colorScheme="yellow">재연결</Button>
                  <Button size="sm" colorScheme="red" variant="ghost">삭제</Button>
                </>
              ) : (
                <>
                  <Button size="sm" variant="ghost" isDisabled color="gray.500">편집</Button>
                  <Button size="sm" colorScheme="red" variant="ghost">삭제</Button>
                </>
              )}
            </Flex>
          </Box>
        ))}
      </Flex>
    </Box>
  );
};

export default DBConnect;
