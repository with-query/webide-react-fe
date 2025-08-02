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
  useToast, // useToast 추가
  VStack, // Stack 대신 VStack 사용 (세로 정렬)
} from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import { useState } from "react"; // useState 추가

const BASE_URL = "http://20.196.89.99:8080"; // API 기본 URL

const ForgotPasswordModal = ({ isOpen, onClose, onOpenLogin }) => {
  const { t } = useTranslation();
  const toast = useToast(); // 토스트 메시지 훅 초기화

  // 모달의 현재 단계를 관리 (request: 이메일 입력, confirm: 토큰 및 새 비밀번호 입력)
  const [step, setStep] = useState("request"); // 'request' 또는 'confirm'
  const [email, setEmail] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState(""); // 새 비밀번호 확인용
  const [loading, setLoading] = useState(false); // 로딩 상태

  // 모달이 닫힐 때 상태를 초기화하여 다음 번에 열릴 때 첫 단계부터 시작하도록 합니다.
  const handleClose = () => {
    setStep("request");
    setEmail("");
    setResetToken("");
    setNewPassword("");
    setConfirmNewPassword("");
    onClose();
  };

  // 1단계: 비밀번호 재설정 요청 (이메일 발송)
  const handleRequestReset = async () => {
    if (!email) {
      toast({
        title: t("Please enter your email."),
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/api/auth/password-reset/request`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: t("Reset link sent."),
          description: data.message || t("Check your email for the password reset link."),
          status: "success",
          duration: 5000,
          isClosable: true,
        });
        setStep("confirm"); // 성공하면 다음 단계로 전환
      } else {
        toast({
          title: t("Failed to send reset link."),
          description: data.message || t("Please check your email address."),
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error("Error requesting password reset:", error);
      toast({
        title: t("Network error."),
        description: t("Could not connect to the server. Please try again later."),
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  // 2단계: 비밀번호 재설정 확인 (새 비밀번호 설정)
  const handleConfirmReset = async () => {
    if (!resetToken || !newPassword || !confirmNewPassword) {
      toast({
        title: t("Please fill in all fields."),
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (newPassword !== confirmNewPassword) {
      toast({
        title: t("Passwords do not match."),
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    // 비밀번호 형식 검사 (SignupModal과 동일하게 적용)
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()\-_=+\[\]{}|;:'",.<>/?~]).{10,}$/;
    if (!passwordRegex.test(newPassword)) {
      toast({
        title: t("Invalid password format."),
        description: t("Password must be at least 10 characters long and include uppercase, lowercase, number, and special character."),
        status: "error",
        duration: 4000,
        isClosable: true,
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/api/auth/password-reset/confirm`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ resetToken, newPassword }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: t("Password changed successfully."),
          description: data.message,
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        handleClose(); // 비밀번호 재설정 성공 시 모달 닫기
        onOpenLogin(); // 로그인 모달 열기
      } else {
        toast({
          title: t("Failed to change password."),
          description: data.message || t("Invalid token or password. Please try again."),
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error("Error confirming password reset:", error);
      toast({
        title: t("Network error."),
        description: t("Could not connect to the server. Please try again later."),
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{t("Find Password")}</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          {step === "request" ? (
            // 1단계: 이메일 입력
            <VStack spacing={4}>
              <Text fontSize="sm" mb={2}>
                {t("Enter your email and we'll send a reset link.")}
              </Text>
              <FormControl>
                <FormLabel>{t("Email")}</FormLabel>
                <Input
                  type="email"
                  placeholder={t("Email")}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </FormControl>
              <Button
                colorScheme="orange" // 색상 brown -> orange로 통일 (다른 모달과 일관성 위해)
                w="100%"
                onClick={handleRequestReset}
                isLoading={loading}
              >
                {t("Send Reset Link")}
              </Button>
            </VStack>
          ) : (
            // 2단계: 토큰 및 새 비밀번호 입력
            <VStack spacing={4}>
              <Text fontSize="sm" mb={2}>
                {t("Enter the token sent to your email and your new password.")}
              </Text>
              <FormControl>
                <FormLabel>{t("Reset Token")}</FormLabel>
                <Input
                  type="text"
                  placeholder={t("Enter reset token")}
                  value={resetToken}
                  onChange={(e) => setResetToken(e.target.value)}
                />
              </FormControl>
              <FormControl>
                <FormLabel>{t("New Password")}</FormLabel>
                <Input
                  type="password"
                  placeholder={t("New Password")}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <FormHelperText color="gray.500" fontSize="sm">
                    {t("Password must be at least 10 characters long and include uppercase, lowercase, number, and special character.")}
                </FormHelperText>
              </FormControl>
              <FormControl>
                <FormLabel>{t("Confirm New Password")}</FormLabel>
                <Input
                  type="password"
                  placeholder={t("Confirm New Password")}
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                />
              </FormControl>
              <Button
                colorScheme="orange" // 색상 brown -> orange로 통일
                w="100%"
                onClick={handleConfirmReset}
                isLoading={loading}
              >
                {t("Confirm Reset")}
              </Button>
            </VStack>
          )}

          <Text
            mt={4}
            color="orange.400"
            fontSize="sm"
            textAlign="center"
            cursor="pointer"
            onClick={() => {
              handleClose(); // 모달 닫으면서 상태 초기화
              onOpenLogin();
            }}
          >
            {t("Back to Login")}
          </Text>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default ForgotPasswordModal;