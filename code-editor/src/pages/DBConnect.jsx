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
  Spinner,
  Alert,
  AlertIcon,
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";

// 모달 컴포넌트 가져오기 (경로가 정확한지 다시 한번 확인하세요)
import CreateProjectModal from "../components/modals/CreateProjectModal";
import EditDBConnectionModal from "../components/modals/EditDBConnectionModal";

// mock/mockData.js에서 목업 데이터를 임포트합니다.
// 실제 경로에 맞게 수정해주세요. 예: '../../mock/mockData' 또는 './mock/mockData'
import { mockProjects, mockDbConnections } from '../mock/mockData'; // <-- 이 부분을 추가/수정

const DBConnect = () => {
  const [projects, setProjects] = useState([]);
  const [dbConnections, setDbConnections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showProjectListModal, setShowProjectListModal] = useState(false);
  const [selectedProjectForNewConnection, setSelectedProjectForNewConnection] = useState(null);
  const [isEditDbModalOpen, setIsEditDbModalOpen] = useState(false);
  const [editTargetDb, setEditTargetDb] = useState(null);

  useEffect(() => {
    // 실제 API 호출 대신 목업 데이터를 사용합니다.
    // 비동기 처리를 흉내 내기 위해 setTimeout을 사용할 수 있습니다.
    const fetchData = () => {
      setLoading(true);
      setError(null);
      try {
        // 목업 데이터를 직접 상태에 설정합니다.
        setProjects(mockProjects);
        setDbConnections(mockDbConnections);
      } catch (err) {
        console.error("데이터 로드 중 오류 발생:", err);
        setError("데이터를 로드하는 데 실패했습니다. 다시 시도해주세요.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    // setTimeout(() => { // 실제 비동기 로딩처럼 보이게 하려면 주석을 풀고 사용
    //   fetchData();
    // }, 500); // 0.5초 지연
  }, []); // 빈 의존성 배열로 컴포넌트 마운트 시 한 번만 실행

  


  const statusText = {
    connected: "연결됨",
    disconnected: "연결 끊김",
  };

  const getColorByDBType = (type) => {
    // mockDbConnections의 type 필드 값이 'mysql', 'postgres' 등으로 소문자이므로,
    // 여기에 대응하도록 case를 수정합니다.
    switch (type.toLowerCase()) { // 소문자로 변환하여 비교
      case "postgres":
        return "blue.500";
      case "mysql":
      case "mariadb": // MariaDB도 있다면 추가 가능
        return "yellow.500";
      case "mongodb":
        return "green.500";
      case "oracle":
        return "red.500";
      case "sqlserver":
        return "purple.500";
      default:
        return "gray.400";
    }
  };

  // dbList는 projects와 dbConnections 상태를 기반으로 계산되는 파생된 값입니다.
  const dbList = projects
    .map((project) => {
      // mockDbConnections의 projectId가 숫자로 되어 있으므로, project.id도 숫자로 일치시켜야 합니다.
      // mockProjects의 id도 숫자이므로 문제가 없습니다.
      const connection = dbConnections.find((conn) => conn.projectId === project.id);
      return connection
        ? {
            id: connection.id,
            projectId: project.id,
            projectName: project.name, // project.name을 사용
            type: connection.type,
            host: connection.host,
            port: connection.port,
            dbName: connection.database, // mockDbConnections의 'database' 필드를 사용
            status: "connected", // 현재는 항상 'connected'로 설정
            color: getColorByDBType(connection.type),
            role: project.role, // project의 role을 사용
          }
        : null;
    })
    .filter(Boolean); // null 값 필터링 (연결되지 않은 프로젝트는 제외)

  // 새 연결 추가 모달에서 프로젝트 선택 시
  const handleSelectProjectForNewConnection = (proj) => {
    setSelectedProjectForNewConnection(proj);
    setShowProjectListModal(false);
  };

  // CreateProjectModal의 onNext (DB 연결 완료) 핸들러
  const handleAddNewDBConnection = async (data) => {
    if (!selectedProjectForNewConnection) return;

    // 새로운 DB 연결 객체 생성 (mockData의 형식에 맞게)
    const newDBConnection = {
      id: dbConnections.length > 0 ? Math.max(...dbConnections.map(c => c.id)) + 1 : 1, // 간단한 ID 생성
      projectId: selectedProjectForNewConnection.id,
      name: `${data.dbType} ${selectedProjectForNewConnection.name} 연결`, // 새 연결 이름
      type: data.dbType.toLowerCase(), // 타입은 소문자로 저장
      host: data.dbConfig.host,
      port: parseInt(data.dbConfig.port), // 포트는 숫자로 저장
      username: "user", // 기본값
      database: data.dbConfig.dbName, // DB 이름
      // 기타 필드 (schema, searchPath 등)는 필요에 따라 추가
    };

    try {
      console.log("새 DB 연결 추가 (목업):", newDBConnection);
      // 실제 API 호출 대신 상태 업데이트
      setDbConnections((prev) => [...prev, newDBConnection]);

      setSelectedProjectForNewConnection(null);
    } catch (err) {
      console.error("새 DB 연결 추가 실패:", err);
      alert("새 DB 연결 추가에 실패했습니다. 다시 시도해주세요.");
    }
  };

  // 편집 버튼 클릭 핸들러
  const handleEditDbConnection = (db) => {
    if (db.role !== "OWNER") {
      alert("프로젝트 소유자만 DB 연결을 편집할 수 있습니다.");
      return;
    }
    // 편집 모달에 전달할 데이터 형식 맞추기:
    // dbName을 database 필드로 넘겨야 EditDBConnectionModal이 제대로 받을 수 있습니다.
    setEditTargetDb({ ...db, database: db.dbName });
    setIsEditDbModalOpen(true);
  };

  // DB 연결 편집 저장 핸들러
  const handleSaveEditedDb = async (updatedDb) => {
    try {
      // 업데이트된 DB 연결 객체 생성 (mockData의 형식에 맞게)
      const updatedMockDbConnection = {
        ...updatedDb,
        type: updatedDb.dbType.toLowerCase(), // 타입은 소문자로
        port: parseInt(updatedDb.port),      // 포트는 숫자로
        database: updatedDb.dbName,          // dbName을 database 필드로 저장
      };
      delete updatedMockDbConnection.dbType; // 더 이상 필요 없는 필드는 제거
      delete updatedMockDbConnection.dbName;

      console.log("DB 연결 편집 (목업):", updatedMockDbConnection);

      // 실제 API 호출 대신 상태 업데이트
      setDbConnections((prev) =>
        prev.map((conn) => (conn.id === updatedMockDbConnection.id ? updatedMockDbConnection : conn))
      );

      setIsEditDbModalOpen(false);
      setEditTargetDb(null);
    } catch (err) {
      console.error("DB 연결 편집 실패:", err);
      alert("DB 연결 편집에 실패했습니다. 다시 시도해주세요.");
    }
  };

  // 삭제 버튼 클릭 핸들러
  const handleDeleteDbConnection = async (dbId) => {
    if (!window.confirm("정말로 이 DB 연결을 삭제하시겠습니까?")) {
      return;
    }

    try {
      console.log(`DB 연결 삭제 (목업): ${dbId}`);
      // 실제 API 호출 대신 상태 업데이트
      setDbConnections((prev) => prev.filter((conn) => conn.id !== dbId));
    } catch (err) {
      console.error("DB 연결 삭제 실패:", err);
      alert("DB 연결 삭제에 실패했습니다. 다시 시도해주세요.");
    }
  };

  if (loading) {
    return (
      <Flex justify="center" align="center" height="90vh">
        <Spinner size="xl" />
        <Text ml={4}>데이터 로딩 중...</Text>
      </Flex>
    );
  }

  if (error) {
    return (
      <Flex justify="center" align="center" height="90vh">
        <Alert status="error" width="auto">
          <AlertIcon />
          {error}
        </Alert>
      </Flex>
    );
  }

  return (
    <Box p={6} minHeight="90vh" bg="brand.100" color="text.primary">
      <Flex justify="space-between" align="center" mb={4}>
        <Heading size="md">데이터베이스 연결 관리</Heading>
        <Button colorScheme="orange" onClick={() => setShowProjectListModal(true)}>
          + 새 연결 추가
        </Button>

        {/* 연결할 프로젝트 선택 모달 */}
        <Modal isOpen={showProjectListModal} onClose={() => setShowProjectListModal(false)}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>연결할 프로젝트 선택</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              {/* 이미 연결된 프로젝트는 리스트에서 제외 */}
              {projects.filter((p) => !dbList.some((db) => db.projectId === p.id)).length > 0 ? (
                projects
                  .filter((p) => !dbList.some((db) => db.projectId === p.id))
                  .map((proj) => (
                    <Button key={proj.id} w="100%" mb={2} onClick={() => handleSelectProjectForNewConnection(proj)}>
                      {proj.name} ({proj.role})
                    </Button>
                  ))
              ) : (
                <Text>모든 프로젝트가 DB에 연결되어 있습니다.</Text>
              )}
            </ModalBody>
          </ModalContent>
        </Modal>

        {/* 새 DB 연결 모달 (CreateProjectModal 재활용) */}
        {selectedProjectForNewConnection && (
          <CreateProjectModal
            isOpen={true}
            onClose={() => setSelectedProjectForNewConnection(null)}
            onNext={handleAddNewDBConnection}
            skipStep1={true}
            presetProjectName={selectedProjectForNewConnection.name}
          />
        )}
      </Flex>

      {/* DB 카드 목록 */}
      <Flex gap={4} flexWrap="wrap">
        {dbList.length === 0 ? (
          <Text>연결된 데이터베이스가 없습니다. 새 연결을 추가해보세요.</Text>
        ) : (
          dbList.map((db) => (
            <Box key={db.id} p={4} borderWidth="1px" borderRadius="md" w="300px" bg="white">
              <Flex justify="space-between" align="center" mb={2}>
                <Flex align="center" gap={2}>
                  <Box w={4} h={4} bg={db.color} borderRadius="sm" />
                  <Text fontWeight="bold">{db.projectName}</Text>
                  {db.role && (
                    <Badge ml={1} colorScheme={db.role === "OWNER" ? "purple" : "blue"}>
                      {db.role}
                    </Badge>
                  )}
                </Flex>
                <Badge colorScheme={db.status === "connected" ? "green" : "red"}>
                  {statusText[db.status]}
                </Badge>
              </Flex>

              <Text fontSize="sm" color="gray.500" mb={2}>
                {db.type} ({db.projectName})
              </Text>

              <VStack align="start" spacing={1} fontSize="sm" mb={3}>
                <Text>호스트: {db.host}</Text>
                <Text>포트: {db.port}</Text>
                <Text>데이터베이스: {db.dbName}</Text>
              </VStack>

              <Flex justify="space-between">
                {db.status === "disconnected" ? (
                  <>
                    <Button size="sm" colorScheme="yellow">
                      재연결
                    </Button>
                    <Button size="sm" colorScheme="red" variant="ghost">
                      삭제
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      size="sm"
                      variant="ghost"
                      isDisabled={db.role !== "OWNER"}
                      color={db.role !== "OWNER" ? "gray.500" : "gray.700"}
                      onClick={() => handleEditDbConnection(db)}
                    >
                      편집
                    </Button>
                    <Button
                      size="sm"
                      colorScheme="red"
                      variant="ghost"
                      onClick={() => handleDeleteDbConnection(db.id)}
                    >
                      삭제
                    </Button>
                  </>
                )}
              </Flex>
            </Box>
          ))
        )}
      </Flex>

      {/* DB 연결 편집 모달 */}
      <EditDBConnectionModal
        isOpen={isEditDbModalOpen}
        onClose={() => setIsEditDbModalOpen(false)}
        dbConnection={editTargetDb}
        onSave={handleSaveEditedDb}
      />
    </Box>
  );
};

export default DBConnect;