import {
  Box,
  Button,
  Flex,
  Text,
  Heading,
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
  useToast, // useToast 추가
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import axios from "axios"; // axios 임포트
import { useNavigate } from "react-router-dom"; // useNavigate 임포트

import CreateProjectModal from "../components/modals/CreateProjectModal";
import EditDBConnectionModal from "../components/modals/EditDBConnectionModal";


const BASE_URL = "http://20.196.89.99:8080"; 

const DBConnect = () => {
  const [projects, setProjects] = useState([]);
  const [dbConnections, setDbConnections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showProjectListModal, setShowProjectListModal] = useState(false);
  const [selectedProjectForNewConnection, setSelectedProjectForNewConnection] =
    useState(null);
  const [isEditDbModalOpen, setIsEditDbModalOpen] = useState(false);
  const [editTargetDb, setEditTargetDb] = useState(null);

  const toast = useToast(); // useToast 훅 초기화
  const navigate = useNavigate(); // useNavigate 훅 초기화

  // 프로젝트 및 DB 연결 데이터를 가져오는 함수
  const fetchDBConnectData = async () => {
    setLoading(true);
    setError(null);
    const token = localStorage.getItem("token");

    if (!token) {
      toast({
        title: "인증 필요",
        description: "로그인이 필요합니다.",
        status: "info",
        duration: 3000,
        isClosable: true,
      });
      navigate("/login");
      setLoading(false);
      return;
    }

    try {
      const [projectsRes, dbConnectionsRes] = await Promise.all([
        axios.get(`${BASE_URL}/api/projects`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${BASE_URL}/api/db-connections`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const fetchedProjects = projectsRes.data;
      const fetchedDbConnections = dbConnectionsRes.data;

      setProjects(fetchedProjects);
      setDbConnections(fetchedDbConnections);
    } catch (err) {
      console.error("데이터 로드 중 오류 발생:", err);
      const errorMessage =
        err.response?.data?.message ||
        "데이터를 로드하는 데 실패했습니다. 다시 시도해주세요.";
      setError(errorMessage);
      toast({
        title: "데이터 로딩 실패",
        description: errorMessage,
        status: "error",
        duration: 5000,
        isClosable: true,
      });

      if (err.response?.status === 401 || err.response?.status === 403) {
        localStorage.removeItem("token");
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDBConnectData();
  }, []); // 컴포넌트 마운트 시 한 번만 실행

  const statusText = {
    connected: "연결됨",
    disconnected: "연결 끊김",
  };

  const getColorByDBType = (type) => {
    switch (type?.toLowerCase()) {
      case "postgres":
        return "blue.500";
      case "mysql":
      case "mariadb":
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

  // JDBC URL에서 DB 정보 파싱
  const parseJdbcUrl = (url) => {
    let type = "unknown";
    let host = "";
    let port = "";
    let dbName = "";

    try {
      if (url.startsWith("jdbc:mysql://")) {
        type = "mysql";
        const parts = url.substring("jdbc:mysql://".length).split("/");
        if (parts.length > 0) {
          const hostPort = parts[0].split(":");
          host = hostPort[0];
          port = hostPort[1] || "3306"; // 기본 MySQL 포트
        }
        if (parts.length > 1) {
          dbName = parts[1].split("?")[0]; // 쿼리 스트링 제거
        }
      } else if (url.startsWith("jdbc:postgresql://")) {
        type = "postgres";
        const parts = url.substring("jdbc:postgresql://".length).split("/");
        if (parts.length > 0) {
          const hostPort = parts[0].split(":");
          host = hostPort[0];
          port = hostPort[1] || "5432"; // 기본 PostgreSQL 포트
        }
        if (parts.length > 1) {
          dbName = parts[1].split("?")[0]; // 쿼리 스트링 제거
        }
      }
      // 다른 DB 타입도 여기에 추가 가능
    } catch (e) {
      console.error("JDBC URL 파싱 오류:", e);
    }

    return { type, host, port, dbName };
  };

  // dbList는 projects와 dbConnections 상태를 기반으로 계산되는 파생된 값입니다.
  const dbList = projects
    .map((project) => {
      const connection = dbConnections.find(
        (conn) => conn.projectId === project.id
      );
      if (connection) {
        const { type, host, port, dbName } = parseJdbcUrl(connection.url);
        return {
          id: connection.id,
          projectId: project.id,
          projectName: project.name,
          type: type,
          host: host,
          port: port,
          dbName: dbName,
          status: "connected", // API가 상태를 제공하지 않으므로 기본적으로 'connected'로 설정
          color: getColorByDBType(type),
          role: project.role, // 프로젝트에서 role 정보 가져오기
          username: connection.username,
          password: connection.password, // 편집 시 필요
          driverClassName: connection.driverClassName, // 편집 시 필요
        };
      }
      return null;
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

    const token = localStorage.getItem("token");
    if (!token) {
      toast({ title: "로그인이 필요합니다.", status: "warning" });
      navigate("/login");
      return;
    }

    let url = "";
    let driverClassName = "";
    const projectId = selectedProjectForNewConnection.id;
    const dbType = data.dbType.toLowerCase(); // mysql, postgres 등

    switch (dbType) {
      case "mysql":
        url = `jdbc:mysql://${data.dbConfig.host}:${data.dbConfig.port}/${data.dbConfig.dbName}`;
        driverClassName = "com.mysql.cj.jdbc.Driver";
        break;
      case "postgresql":
        url = `jdbc:postgresql://${data.dbConfig.host}:${data.dbConfig.port}/${data.dbConfig.dbName}`;
        driverClassName = "org.postgresql.Driver";
        break;
      default:
        toast({ title: "DB 연결 실패", description: "지원하지 않는 DB 타입입니다.", status: "error" });
        return;
    }

    const newDBConnectionPayload = {
      projectId: projectId,
      name: `${selectedProjectForNewConnection.name} ${dbType} 연결`, // 이름 생성
      url: url,
      username: data.dbConfig.user || data.dbConfig.username,
      password: data.dbConfig.password,
      driverClassName: driverClassName,
    };

    try {
      console.log("새 DB 연결 API 요청 데이터:", newDBConnectionPayload);
      const res = await axios.post(
        `${BASE_URL}/api/db-connections`,
        newDBConnectionPayload,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const createdConnection = res.data;

      // 상태 업데이트 및 UI 리프레시 (전체 데이터를 다시 가져오는 것이 가장 간단)
      await fetchDBConnectData(); // 새로운 연결이 추가되었으므로 데이터 다시 가져오기

      setSelectedProjectForNewConnection(null);
      toast({
        title: "새 DB 연결 추가 완료",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (err) {
      console.error("새 DB 연결 추가 실패:", err);
      const errorMessage =
        err.response?.data?.message || "새 DB 연결 추가에 실패했습니다.";
      toast({
        title: "DB 연결 실패",
        description: errorMessage,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  // 편집 버튼 클릭 핸들러
  const handleEditDbConnection = (db) => {
    // dbList에서 가져온 db 객체에는 이미 host, port, dbName, type이 파싱되어 있습니다.
    // EditDBConnectionModal은 dbType, host, port, dbName, username, password를 기대합니다.
    // 따라서 editTargetDb에 이 값들을 직접 전달합니다.
    setEditTargetDb({
      id: db.id,
      projectId: db.projectId,
      projectName: db.projectName,
      dbType: db.type, // parseJdbcUrl에서 가져온 type 사용
      host: db.host,
      port: db.port,
      dbName: db.dbName,
      username: db.username,
      password: db.password, // 실제 비밀번호는 보안상 여기서는 빈 값으로 시작할 수 있습니다.
      driverClassName: db.driverClassName,
    });
    setIsEditDbModalOpen(true);
  };

  // DB 연결 편집 저장 핸들러
  const handleSaveEditedDb = async (updatedDb) => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast({ title: "로그인이 필요합니다.", status: "warning" });
      navigate("/login");
      return;
    }

    let url = "";
    let driverClassName = "";
    const dbType = updatedDb.dbType.toLowerCase();

    switch (dbType) {
      case "mysql":
        url = `jdbc:mysql://${updatedDb.host}:${updatedDb.port}/${updatedDb.dbName}`;
        driverClassName = "com.mysql.cj.jdbc.Driver";
        break;
      case "postgresql":
        url = `jdbc:postgresql://${updatedDb.host}:${updatedDb.port}/${updatedDb.dbName}`;
        driverClassName = "org.postgresql.Driver";
        break;
      default:
        toast({ title: "DB 연결 실패", description: "지원하지 않는 DB 타입입니다.", status: "error" });
        return;
    }

    const updatedDBConnectionPayload = {
      name: `${updatedDb.projectName} ${dbType} 연결`, // 이름 재구성
      url: url,
      username: updatedDb.username,
      password: updatedDb.password, // 변경된 비밀번호를 보냅니다.
      driverClassName: driverClassName,
      projectId: updatedDb.projectId,
      // createdById는 API에서 알아서 처리할 것이므로 제외
    };

    try {
      console.log("DB 연결 편집 API 요청 데이터:", updatedDBConnectionPayload);
      await axios.put(
        `${BASE_URL}/api/db-connections/${updatedDb.id}`, // PUT 요청에 ID 포함
        updatedDBConnectionPayload,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // 상태 업데이트 및 UI 리프레시
      await fetchDBConnectData();

      setIsEditDbModalOpen(false);
      setEditTargetDb(null);
      toast({
        title: "DB 연결 편집 완료",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (err) {
      console.error("DB 연결 편집 실패:", err);
      const errorMessage =
        err.response?.data?.message || "DB 연결 편집에 실패했습니다.";
      toast({
        title: "DB 연결 편집 실패",
        description: errorMessage,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  // 삭제 버튼 클릭 핸들러
  const handleDeleteDbConnection = async (dbId, projectName) => {
    if (
      !window.confirm(
        `프로젝트 '${projectName}'의 DB 연결을 정말로 삭제하시겠습니까?`
      )
    ) {
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      toast({ title: "로그인이 필요합니다.", status: "warning" });
      navigate("/login");
      return;
    }

    try {
      console.log(`DB 연결 삭제 API 호출: ${dbId}`);
      await axios.delete(`${BASE_URL}/api/db-connections/${dbId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // 상태 업데이트 및 UI 리프레시
      await fetchDBConnectData();

      toast({
        title: "DB 연결 삭제 완료",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (err) {
      console.error("DB 연결 삭제 실패:", err);
      const errorMessage =
        err.response?.data?.message || "DB 연결 삭제에 실패했습니다.";
      toast({
        title: "DB 연결 삭제 실패",
        description: errorMessage,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
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
        <Button
          colorScheme="orange"
          onClick={() => setShowProjectListModal(true)}
        >
          + 새 연결 추가
        </Button>

        {/* 연결할 프로젝트 선택 모달 */}
        <Modal
          isOpen={showProjectListModal}
          onClose={() => setShowProjectListModal(false)}
        >
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>연결할 프로젝트 선택</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              {/* 이미 연결된 프로젝트는 리스트에서 제외 */}
              {projects.filter((p) => !dbList.some((db) => db.projectId === p.id))
                .length > 0 ? (
                projects
                  .filter((p) => !dbList.some((db) => db.projectId === p.id))
                  .map((proj) => (
                    <Button
                      key={proj.id}
                      w="100%"
                      mb={2}
                      onClick={() => handleSelectProjectForNewConnection(proj)}
                    >
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
            // CreateProjectModal에 dbConnection step만 보여주도록 프롭스 추가
            forceDbConnectionStep={true}
          />
        )}
      </Flex>

      {/* DB 카드 목록 */}
      <Flex gap={4} flexWrap="wrap">
        {dbList.length === 0 ? (
          <Text>연결된 데이터베이스가 없습니다. 새 연결을 추가해보세요.</Text>
        ) : (
          dbList.map((db) => (
            <Box
              key={db.id}
              p={4}
              borderWidth="1px"
              borderRadius="md"
              w="300px"
              bg="white"
            >
              <Flex justify="space-between" align="center" mb={2}>
                <Flex align="center" gap={2}>
                  <Box w={4} h={4} bg={db.color} borderRadius="sm" />
                  <Text fontWeight="bold">{db.projectName}</Text>
                  {db.role && (
                    <Badge
                      ml={1}
                      colorScheme={db.role === "OWNER" ? "purple" : "blue"}
                    >
                      {db.role}
                    </Badge>
                  )}
                  <Badge colorScheme={db.status === "connected" ? "green" : "red"}>
                    {statusText[db.status]}
                  </Badge>
                </Flex>
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
                    <Button
                      size="sm"
                      colorScheme="red"
                      variant="ghost"
                      onClick={() => handleDeleteDbConnection(db.id, db.projectName)}
                    >
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
                      onClick={() => handleDeleteDbConnection(db.id, db.projectName)}
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