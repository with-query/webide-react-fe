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
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../contexts/AuthContext";


const LoginModal = ({ isOpen, onClose, onOpenSignup, onOpenForgot, onLoginSuccess }) => {
  const { t } = useTranslation();
  const toast = useToast();
  const { login } = useAuth(); // useAuth 훅에서 login 함수 가져오기

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [rememberEmail, setRememberEmail] = useState(false);


  const BASE_URL = "http://20.196.89.99:8080";

  useEffect(() => {
        if (isOpen) {
            const savedEmail = localStorage.getItem("savedEmail");
            if (savedEmail) {
                setEmail(savedEmail);
                setRememberEmail(true);
            }
        }
    }, [isOpen]);

  const handleLogin = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${BASE_URL}/api/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (res.ok) {
               const expiresInSeconds = data.expiresIn || (30 * 60); 
              // 1. Context의 login 함수를 호출하여 전역 상태를 업데이트합니다.

          
        login(data.token, data.nickname, expiresInSeconds); 
                if (rememberEmail) {
                    localStorage.setItem("savedEmail", email);
                } else {
                    localStorage.removeItem("savedEmail");
                }


                toast({
                    title: data.message || t("Login successful"),
                    status: "success",
                    duration: 2000,
                });

                // ✅ 2. 부모(Header)에게 성공했음을 알립니다. 모달을 직접 닫지 않습니다.
                onLoginSuccess();

            } else {
                throw new Error(data.message || "Login failed");
            }
          } catch (err) {
            toast({
                title: err.message || t("A server error occurred."),
                status: "error",
                duration: 3000,
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