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


/*
//API 연동 버전 로그인 모달
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
  useToast,
} from "@chakra-ui/react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

const LoginModal = ({ isOpen, onClose, onOpenSignup, onOpenForgot, onLoginSuccess }) => {
  const { t } = useTranslation();
  const toast = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

   const base_url = "http://localhost:8080";

  const handleLogin = async () => {
    if (!email || !password) {
      toast({
        title: "이메일과 비밀번호를 입력하세요.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${base_url}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        toast({
          title: data.message || "로그인 성공",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        onLoginSuccess(data); // token, nickname 포함
        onClose();
      } else {
        toast({
          title: data.message || "로그인 실패",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (err) {
      toast({
        title: "서버 오류가 발생했습니다.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{t("Login")}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <FormControl mb={3}>
            <FormLabel>{t("Email or Username")}</FormLabel>
            <Input
              placeholder={t("Email or Username")}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </FormControl>
          <FormControl mb={3}>
            <FormLabel>{t("Password")}</FormLabel>
            <Input
              type="password"
              placeholder={t("Password")}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
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
          <Button
            colorScheme="orange"
            w="100%"
            onClick={handleLogin}
            isLoading={loading}
          >
            {t("Login")}
          </Button>
          <Text mt={4} fontSize="sm" textAlign="center">
            {t("No account?")}{" "}
            <Text
              as="span"
              color="orange.400"
              cursor="pointer"
              onClick={() => {
                onClose();
                onOpenSignup();
              }}
            >
              {t("Sign Up Now")}
            </Text>
          </Text>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default LoginModal;
*/