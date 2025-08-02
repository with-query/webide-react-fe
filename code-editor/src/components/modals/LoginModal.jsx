
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
import { useState, useEffect } from "react"; // useEffect 추가
import { useTranslation } from "react-i18next";

const LoginModal = ({ isOpen, onClose, onOpenSignup, onOpenForgot, onLoginSuccess }) => {
  const { t } = useTranslation();
  const toast = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [rememberEmail, setRememberEmail] = useState(false); // '아이디 저장' 상태 추가

  const BASE_URL = "http://20.196.89.99:8080";

  // 모달이 열릴 때 localStorage에서 저장된 이메일을 불러옵니다.
  useEffect(() => {
    if (isOpen) {
      const savedEmail = localStorage.getItem("savedEmail");
      if (savedEmail) {
        setEmail(savedEmail);
        setRememberEmail(true); // 저장된 이메일이 있으면 체크박스도 체크된 상태로 시작
      } else {
        setEmail(""); // 저장된 이메일이 없으면 초기화
        setRememberEmail(false); // 체크박스도 해제
      }
      setPassword(""); // 모달이 열릴 때마다 비밀번호는 항상 비웁니다.
    }
  }, [isOpen]); // isOpen이 변경될 때마다 이펙트 실행

  const handleLogin = async () => {
    if (!email || !password) {
      toast({
        title: t("Please enter your email and password."), // 번역 적용
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        // ✅ 토큰과 닉네임을 localStorage에 저장
        localStorage.setItem("token", data.token);
        localStorage.setItem("nickname", data.nickname);

        // '아이디 저장' 체크박스 상태에 따라 이메일을 localStorage에 저장 또는 삭제
        if (rememberEmail) {
          localStorage.setItem("savedEmail", email);
        } else {
          localStorage.removeItem("savedEmail");
        }

        toast({
          title: data.message || t("Login successful"), // 번역 적용
          status: "success",
          duration: 3000,
          isClosable: true,
        });

        onLoginSuccess(data); // 필요 시 상위 컴포넌트로 전달
        onClose();
      } else {
        toast({
          title: data.message || t("Login failed"), // 번역 적용
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (err) {
      toast({
        title: t("A server error occurred."), // 번역 적용
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
            <Checkbox
              isChecked={rememberEmail}
              onChange={(e) => setRememberEmail(e.target.checked)}
            >
              {t("Remember Me")}
            </Checkbox>
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