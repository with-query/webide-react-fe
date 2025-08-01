
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
            <FormLabel>{t("Confirm Password")}</FormLabel>
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

/*
//API 연동 버전 회원가입 모달
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
import { useTranslation } from "react-i18next";
import { useState } from "react";

const base_url = "http://localhost:8080";

const LoginModal = ({ isOpen, onClose, onOpenSignup, onOpenForgot, onLoginSuccess }) => {
  const { t } = useTranslation();
  const toast = useToast();

  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!emailOrUsername || !password) {
      toast({
        title: "모든 필드를 입력해주세요.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${base_url}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // 쿠키 저장용
        body: JSON.stringify({
          emailOrUsername,
          password,
        }),
      });

      if (!response.ok) {
        throw new Error("로그인 실패");
      }

      const data = await response.json();
      console.log("로그인 성공:", data);

      // 예: accessToken 저장 또는 사용자 상태 업데이트
      // localStorage.setItem("accessToken", data.accessToken);

      toast({
        title: "로그인 성공",
        status: "success",
        duration: 2000,
        isClosable: true,
      });

      onLoginSuccess?.(data);
      onClose();
    } catch (error) {
      console.error("로그인 에러:", error);
      toast({
        title: "로그인 실패",
        description: "이메일 또는 비밀번호를 확인해주세요.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
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
              value={emailOrUsername}
              onChange={(e) => setEmailOrUsername(e.target.value)}
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
            isLoading={isLoading}
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