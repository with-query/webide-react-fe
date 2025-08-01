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
  Text,
  useToast,
} from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import { useState } from "react";

const base_url = "http://20.196.89.99:8080";

const SignupModal = ({ isOpen, onClose, onOpenLogin }) => {
  const { t } = useTranslation();
  const toast = useToast();

  const [email, setEmail] = useState("");
  const [nickname, setNickname] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSignup = async () => {
    if (!passwordRegex.test(password)) {
      toast({
        title: "비밀번호 형식이 올바르지 않습니다.",
        description: "영문 대/소문자, 숫자, 특수문자를 포함한 10자 이상이어야 합니다.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
}

    if (password !== confirmPassword) {
      toast({
        title: "비밀번호가 일치하지 않습니다.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${base_url}/api/users/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, nickname, password }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "회원가입 실패");
      }

      toast({
        title: "회원가입이 완료되었습니다.",
        status: "success",
        duration: 2000,
        isClosable: true,
      });

      // 회원가입 성공 후 로그인 창 열기
      onClose();
      onOpenLogin();
    } catch (err) {
      toast({
        title: "회원가입 실패",
        description: err.message,
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
        <ModalHeader>{t("Sign Up")}</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <FormControl mb={3}>
            <FormLabel>{t("Email")}</FormLabel>
            <Input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t("Email")}
            />
          </FormControl>

          <FormControl mb={3}>
            <FormLabel>{t("Nickname")}</FormLabel>
            <Input
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder={t("Name")}
            />
          </FormControl>

          <FormControl mb={3}>
            <FormLabel>{t("Password")}</FormLabel>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t("Password")}
            />
          </FormControl>

          <FormControl mb={3}>
            <FormLabel>{t("Confirm Password")}</FormLabel>
            <Input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder={t("Confirm Password")}
            />
          </FormControl>

          <Button
            colorScheme="orange"
            w="100%"
            mt={2}
            onClick={handleSignup}
            isLoading={isLoading}
          >
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
