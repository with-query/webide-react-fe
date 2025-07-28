import { useTranslation } from "react-i18next";

import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  FormControl,
  FormLabel,
  Input,
  Button,
  Text,
} from "@chakra-ui/react";

const ForgotPasswordModal = ({ isOpen, onClose, onOpenLogin }) => {
const { t } = useTranslation();

    return (
        <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
            <ModalHeader>{t("Find Password")}</ModalHeader>
            <ModalCloseButton />
            <ModalBody pb={6}>
            <Text fontSize="sm" mb={4}>
                {t("Enter your email and we'll send a reset link.")}
            </Text>

            <FormControl mb={4}>
                <FormLabel>{t("Email")}</FormLabel>
                <Input type="email" placeholder={t("Email")} />
            </FormControl>

            <Button colorScheme="brown" w="100%">
                {t("Send Reset Link")}
            </Button>

            <Text mt={4} color="orange.400" fontSize="sm" textAlign="center" cursor="pointer" onClick={() => {
                onClose();
                onOpenLogin();
            }}>
                {t("Back to Login")}
            </Text>
            </ModalBody>
        </ModalContent>
        </Modal>
  );
};

export default ForgotPasswordModal;
