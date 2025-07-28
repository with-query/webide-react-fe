
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
import { useTranslation } from "react-i18next";


const SignupModal = ({ isOpen, onClose, onOpenLogin }) => {
const { t } = useTranslation();

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{t("Sign Up")}</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <FormControl mb={3}>
            <FormLabel>{t("Email")}</FormLabel>
            <Input placeholder={t("Email")} />
          </FormControl>

          <FormControl mb={3}>
            <FormLabel>{t("Name")}</FormLabel>
            <Input placeholder={t("Name")} />
          </FormControl>

          <FormControl mb={3}>
            <FormLabel>{t("Password")}</FormLabel>
            <Input type="password" placeholder={t("Password")}/>
          </FormControl>

          <FormControl mb={3}>
            <FormLabel>{t("Password Confirm")}</FormLabel>
            <Input type="password" placeholder={t("Confirm Password")}rkdl />
          </FormControl>

          <Button colorScheme="brown" w="100%" mt={2}>
            {t("Register")}
          </Button>

          <Text mt={4} fontSize="sm" textAlign="center">
            {t("Already have an account?")}{" "}
            <Text as="span" color="orange.400" cursor="pointer" onClick={() => {
              onClose();
              onOpenLogin();
            }}>
              {t("Login")}
            </Text>
          </Text>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default SignupModal;
