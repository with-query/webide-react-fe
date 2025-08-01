import {
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton,
  ModalBody, Text, Button, Flex,
} from "@chakra-ui/react";
import { useTranslation } from "react-i18next";

const InvitationModal = ({ isOpen, onClose, notification, onAccept, onDecline }) => {
  const { t } = useTranslation();

  if (!notification) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{t("Project Invitation")}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Text mb={4}>{notification.projectName} 프로젝트에서 초대 메시지가 도착했습니다.</Text>
          <Flex justify="flex-end" gap={3} >
            <Button colorScheme="brand.100"  onClick={onDecline}>{t("Decline")}</Button>
            <Button colorScheme="brand.100" onClick={onAccept}>{t("Accept")}</Button>
          </Flex>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default InvitationModal;
