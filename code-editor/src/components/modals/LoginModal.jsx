import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  Button,
  Input,
  FormControl,
  FormLabel,
  Checkbox,
  Text,
  Flex,
} from "@chakra-ui/react";
import { useTranslation } from "react-i18next";

const LoginModal = ({ isOpen, onClose, onOpenSignup, onOpenForgot, onLoginSuccess }) => {
  const { t } = useTranslation();

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{t("Login")}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <FormControl mb={3}>
            <FormLabel>{t("Email or Username")}</FormLabel>
            <Input placeholder={t("Email or Username")} />
          </FormControl>
          <FormControl mb={3}>
            <FormLabel>{t("Password")}</FormLabel>
            <Input type="password" placeholder={t("Password")} />
          </FormControl>
          <Flex justify="space-between" mb={4}>
            <Checkbox>{t("Remember Me")}</Checkbox>
            <Text
              color="orange.400"
              fontSize="sm"
              cursor="pointer"
              onClick={() => {
                onClose();
                onOpenForgot();
              }}
            >
              {t("Forgot Password?")}
            </Text>
          </Flex>
          <Button colorScheme="orange" w="100%" onClick={onLoginSuccess}>
            {t("Login")}
          </Button>
          <Text mt={4} fontSize="sm" textAlign="center">
            {t("No account?")}{" "}
            <Text as="span" color="orange.400" cursor="pointer" onClick={() => {
              onClose();
              onOpenSignup();
            }}>
              {t("Sign Up Now")}
            </Text>
          </Text>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default LoginModal;
