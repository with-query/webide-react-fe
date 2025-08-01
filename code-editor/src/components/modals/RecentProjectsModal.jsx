// components/modals/RecentProjectsModal.jsx
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  Box,
  Text,
} from "@chakra-ui/react";
import { useTranslation } from "react-i18next";

const RecentProjectsModal = ({ isOpen, onClose, projects, onSelect }) => {
  const { t } = useTranslation();

  const getRecentProjects = () => {
    return [...projects]
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
      .slice(0, 3);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{t("Recent Projects")}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {getRecentProjects().length === 0 ? (
            <Text>{t("No recent projects found")}</Text>
          ) : (
            getRecentProjects().map((project) => (
              <Box
                key={project.id}
                p={4}
                mb={3}
                borderWidth="1px"
                borderRadius="md"
                cursor="pointer"
                _hover={{ bg: "gray.100" }}
                onClick={() => {
                  onClose();
                  onSelect(project.id);
                }}
              >
                <Text fontWeight="bold">{project.name}</Text>
                <Text fontSize="sm" color="gray.500">
                  {t("updated at")}: {new Date(project.updatedAt).toLocaleDateString("ko-KR")}
                </Text>
              </Box>
            ))
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default RecentProjectsModal;
