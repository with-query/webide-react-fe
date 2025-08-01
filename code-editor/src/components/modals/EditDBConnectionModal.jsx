import React, { useState, useEffect } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useTranslation } from "react-i18next";

const EditDBConnectionModal = ({ isOpen, onClose, dbConnection, onSave }) => {
  const { t } = useTranslation();
  const [dbName, setDbName] = useState("");
  const [dbHost, setDbHost] = useState("");
  const [dbPort, setDbPort] = useState("");
  const [dbUsername, setDbUsername] = useState("");
  // const [dbPassword, setDbPassword] = useState(""); // 비밀번호는 보안상 직접 편집하지 않는 것이 일반적

  // DB Connection 객체의 role 속성을 통해 OWNER 여부 판단
  const isOwner = dbConnection?.role === 'OWNER';

  useEffect(() => {
    if (dbConnection) {
      setDbName(dbConnection.dbName || "");
      setDbHost(dbConnection.host || "");
      setDbPort(dbConnection.port || "");
      // mockDbConnections에는 username이 없지만, 실제 데이터에 있다면 설정
      // setDbUsername(dbConnection.username || "");
    }
  }, [dbConnection]);

  const handleSave = () => {
    if (!dbName.trim() || !dbHost.trim() || !dbPort) {
      alert("모든 필수 정보를 입력해주세요.");
      return;
    }

    onSave({
      ...dbConnection, // 기존 정보 유지
      dbName: dbName,
      host: dbHost,
      port: parseInt(dbPort), // 숫자로 변환
      // username: dbUsername,
    });
    onClose();
  };

  const handleReadOnlyClick = () => {
    if (!isOwner) {
      alert("프로젝트 소유자만 DB 연결 정보를 수정할 수 있습니다.");
    }
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{t("Edit DB Connection")}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4}>
            <FormControl>
              <FormLabel>{t("Project Name")}</FormLabel>
              <Input value={dbConnection?.projectName || ""} isReadOnly />
            </FormControl>

            <FormControl>
              <FormLabel>{t("DB Type")}</FormLabel>
              <Input value={dbConnection?.type || ""} isReadOnly />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>{t("DB Name")}</FormLabel>
              {isOwner ? (
                <Input
                  value={dbName}
                  onChange={(e) => setDbName(e.target.value)}
                  placeholder={t("Enter DB name")}
                />
              ) : (
                <Input value={dbName} isReadOnly onClick={handleReadOnlyClick} />
              )}
            </FormControl>

            <FormControl isRequired>
              <FormLabel>{t("Host")}</FormLabel>
              {isOwner ? (
                <Input
                  value={dbHost}
                  onChange={(e) => setDbHost(e.target.value)}
                  placeholder={t("Enter host")}
                />
              ) : (
                <Input value={dbHost} isReadOnly onClick={handleReadOnlyClick} />
              )}
            </FormControl>

            <FormControl isRequired>
              <FormLabel>{t("Port")}</FormLabel>
              {isOwner ? (
                <Input
                  type="number"
                  value={dbPort}
                  onChange={(e) => setDbPort(e.target.value)}
                  placeholder={t("Enter port")}
                />
              ) : (
                <Input type="number" value={dbPort} isReadOnly onClick={handleReadOnlyClick} />
              )}
            </FormControl>

            {/* 사용자 ID, 비밀번호 등 다른 편집 가능한 필드도 isOwner에 따라 제어 */}
            {/* <FormControl>
              <FormLabel>{t("User ID")}</FormLabel>
              {isOwner ? (
                <Input
                  value={dbUsername}
                  onChange={(e) => setDbUsername(e.target.value)}
                  placeholder={t("Enter user ID")}
                />
              ) : (
                <Input value={dbUsername} isReadOnly onClick={handleReadOnlyClick} />
              )}
            </FormControl> */}
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" onClick={onClose} mr={3}>
            {t("Cancel")}
          </Button>
          <Button colorScheme="blue" onClick={handleSave} isDisabled={!isOwner}>
            {t("Save")}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default EditDBConnectionModal;