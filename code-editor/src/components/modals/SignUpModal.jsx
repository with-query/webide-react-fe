/*
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

*/
//API 연동 버전 회원가입 모달

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
  useToast,
} from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import { useState } from "react";

// ✨ base_url을 여기에서 정의
//const BASE_URL = "http://localhost:8080";
const BASE_URL = "http://20.196.89.99:8080";
const SignupModal = ({ isOpen, onClose, onOpenLogin }) => {
  const { t } = useTranslation();
  const toast = useToast();

  const [email, setEmail] = useState("");
  const [nickname, setNickname] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleRegister = async () => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()\-_=+\[\]{}|;:'",.<>/?~]).{10,}$/;

    // 비밀번호 확인 검사
    if (password !== confirmPassword) {
      toast({
        title: t("Passwords do not match."),
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    // 비밀번호 형식 검사
    if (!passwordRegex.test(password)) {
      toast({
        title: t("Invalid password format."),
        description: t(
          "Password must be at least 10 characters long and include uppercase, lowercase, number, and special character."
        ),
        status: "error",
        duration: 4000,
        isClosable: true,
      });
      return;
    }

    try {
      const response = await fetch(`${BASE_URL}/api/users/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          nickname,
          password,
        }),
      });

      const statusCode = response.status;
      const result = await response.json();

      // 콘솔 로그 출력
      console.log("Response status:", statusCode);
      console.log("Response body:", result);

      if (statusCode === 201) {
        toast({
          title: t("Registration successful."),
          description: result.message,
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        onClose();
        onOpenLogin();
      } else {
        toast({
          title: t("Registration failed."),
          description: result.message || t("An error occurred."),
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error("Error during registration:", error);
      toast({
        title: t("Network error."),
        description: error.message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{t("Sign Up")}</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <FormControl mb={3}>
            <FormLabel>{t("Email")}</FormLabel>
            <Input
              placeholder={t("Email")}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </FormControl>

          <FormControl mb={3}>
            <FormLabel>{t("Name")}</FormLabel>
            <Input
              placeholder={t("Name")}
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
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

          <FormControl mb={3}>
            <FormLabel>{t("Password Confirm")}</FormLabel>
            <Input
              type="password"
              placeholder={t("Confirm Password")}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </FormControl>

          <Button colorScheme="orange" w="100%" mt={2} onClick={handleRegister}>
            {t("Register")}
          </Button>

          <Text mt={4} fontSize="sm" textAlign="center">
            {t("Already have an account?")}{" "}
            <Text
              as="span"
              color="orange.400"
              cursor="pointer"
              onClick={() => {
                onClose();
                onOpenLogin();
              }}
            >
              {t("Login")}
            </Text>
          </Text>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default SignupModal;