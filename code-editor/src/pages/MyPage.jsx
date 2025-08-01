/*import {
  Box,
  Flex,
  Avatar,
  Text,
  Input,
  Button,
  Badge,
  useTheme,
  InputGroup,
  InputRightElement,
  IconButton,
} from "@chakra-ui/react";
import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons";
import { useTranslation } from "react-i18next";
import { useState } from "react";

export default function MyPage() {
  const theme = useTheme();
  const { t } = useTranslation();

  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);

  return (
    <Box p={8} bg="brand.100" minH="90vh">
      <Text fontSize="2xl" fontWeight="bold" mb={6} color="text.primary">
        {t("My Page")}
      </Text>

      <Flex direction={{ base: "column", md: "row" }} gap={10} align="flex-start" >
        
        <Box
          flexShrink={0}
          ml="3%"
          width={{ base: "100%", md: "40%" }}
          p={6}
          bg="white"
          borderRadius="xl"
          boxShadow="md"
        >
          <Flex direction="column" align="center">
            <Avatar
              size="xl"
              src="/profile.png"
              border={`4px solid ${theme.colors.brand[500]}`}
              mb={3}
            />
            <Text fontWeight="bold" fontSize="lg" color="text.primary">
              {t("Name")}
            </Text>
            <Text color="text.tertiary" mb={4}>
              kim@example.com
            </Text>

            <Flex w="100%" justify="space-between" color="text.tertiary">
              <Text>{t("Sign up date")}</Text>
              <Text>2023.01.15</Text>
            </Flex>
            <Flex w="100%" justify="space-between" color="text.tertiary" mt={2}>
              <Text>{t("Last access date")}</Text>
              <Text>2023.06.20</Text>
            </Flex>
            <Flex w="100%" justify="space-between" mt={2}>
              <Text color="text.tertiary">{t("Account status")}</Text>
              <Badge color="text.tertiary" bg="none" fontWeight="bold">
                {t("Active")}
              </Badge>
            </Flex>
          </Flex>
        </Box>


        <Flex direction="column" width={{ base: "100%", md: "50%" }} gap={6}>

          <Box p={6} bg="white" borderRadius="xl" boxShadow="md" >
            <Text fontWeight="semibold" mb={4} color="text.primary">
              {t("Information")}
            </Text>
            <Input placeholder={t("Nickname")} mb={3} />
            <Input placeholder={t("Email")} mb={3} />
            <Input placeholder={t("Number")} defaultValue="010-1234-5678" mb={3} />
            <Input placeholder={t("Department")} defaultValue="개발팀" mb={3} />
            <Button variant="solid">{t("Save")}</Button>
          </Box>


          <Box p={6} bg="white" borderRadius="xl" boxShadow="md">
            <Text fontWeight="semibold" mb={4} color="text.primary">
              {t("Change Password")}
            </Text>


            <InputGroup mb={3}>
              <Input
                type={showCurrentPw ? "text" : "password"}
                placeholder={t("Current Password")}
              />
              <InputRightElement>
                <IconButton
                  variant="ghost"
                  size="sm"
                  icon={showCurrentPw ? <ViewOffIcon /> : <ViewIcon />}
                  onClick={() => setShowCurrentPw(!showCurrentPw)}
                  aria-label="Toggle password visibility"
                />
              </InputRightElement>
            </InputGroup>

            <InputGroup mb={3}>
              <Input
                type={showNewPw ? "text" : "password"}
                placeholder={t("New Password")}
              />
              <InputRightElement>
                <IconButton
                  variant="ghost"
                  size="sm"
                  icon={showNewPw ? <ViewOffIcon /> : <ViewIcon />}
                  onClick={() => setShowNewPw(!showNewPw)}
                  aria-label="Toggle password visibility"
                />
              </InputRightElement>
            </InputGroup>

            <InputGroup mb={4}>
              <Input
                type={showConfirmPw ? "text" : "password"}
                placeholder={t("Confirm New Password")}
              />
              <InputRightElement>
                <IconButton
                  variant="ghost"
                  size="sm"
                  icon={showConfirmPw ? <ViewOffIcon /> : <ViewIcon />}
                  onClick={() => setShowConfirmPw(!showConfirmPw)}
                  aria-label="Toggle password visibility"
                />
              </InputRightElement>
            </InputGroup>

            <Button variant="outline" width="100%">
              {t("Change Password")}
            </Button>
          </Box>
        </Flex>
      </Flex>
    </Box>
  );
}
*/

//API 연동 버전 마이페이지
import {
  Box,
  Flex,
  Avatar,
  Text,
  Input,
  Button,
  Badge,
  useToast,
  InputGroup,
  InputRightElement,
  IconButton,
  Spinner,
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
} from "@chakra-ui/react";
import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons";
import { useTranslation } from "react-i18next";
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

export default function MyPage() {
  const { t } = useTranslation();
  const toast = useToast();
  const cancelRef = useRef();

  const [user, setUser] = useState(null);
  const [nickname, setNickname] = useState("");
  const [loading, setLoading] = useState(true);

  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");

  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
   const BASE_URL = "http://20.196.89.99:8080";

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/users/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error("유저 정보를 불러올 수 없습니다.");

        const data = await res.json();
        setUser(data);
        setNickname(data.nickname || "");
      } catch (err) {
        toast({
          title: err.message,
          status: "error",
          duration: 3000,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [token, toast]);

  const handleNicknameSave = async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/users/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ nickname }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "닉네임 수정 실패");

      toast({
        title: data.message,
        status: "success",
        duration: 3000,
      });

      setUser((prev) => ({ ...prev, nickname }));
      localStorage.setItem("token", data.token); // 새 토큰 저장
    } catch (err) {
      toast({
        title: err.message,
        status: "error",
        duration: 3000,
      });
    }
  };

  const handleChangePassword = async () => {
    if (!currentPw || !newPw) {
      toast({
        title: "현재 비밀번호와 새 비밀번호를 입력하세요.",
        status: "warning",
        duration: 3000,
      });
      return;
    }

    try {
      const res = await fetch(`${BASE_URL}/api/users/password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: currentPw,
          newPassword: newPw,
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "비밀번호 변경 실패");

      toast({
        title: data.message,
        status: "success",
        duration: 3000,
      });

      setCurrentPw("");
      setNewPw("");
    } catch (err) {
      toast({
        title: err.message,
        status: "error",
        duration: 3000,
      });
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm("정말로 탈퇴하시겠습니까? 탈퇴 후 복구는 불가능합니다.")) return;

    try {
      const res = await fetch(`${BASE_URL}/api/users/me`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "회원 탈퇴 실패");

   
      localStorage.removeItem("token");
      localStorage.removeItem("nickname");
      setUser(null);
      setNickname("");
      setCurrentPw("");
      setNewPw("");

      toast({
        title: data.message || "회원 탈퇴 완료",
        status: "success",
        duration: 3000,
      });

     
      navigate("/login");
    } catch (err) {
      toast({
        title: err.message,
        status: "error",
        duration: 3000,
      });
    }
  };

  if (loading) {
    return (
      <Flex align="center" justify="center" h="90vh">
        <Spinner size="lg" />
      </Flex>
    );
  }

  return (
    <Box p={8} bg="brand.100" minH="90vh">
      <Text fontSize="2xl" fontWeight="bold" mb={6} color="text.primary">
        {t("My Page")}
      </Text>

      <Flex direction={{ base: "column", md: "row" }} gap={10} align="flex-start">
        {/* 왼쪽: 내 정보 조회 */}
        <Box
          flexShrink={0}
          ml="3%"
          width={{ base: "100%", md: "40%" }}
          p={6}
          bg="white"
          borderRadius="xl"
          boxShadow="md"
        >
          <Flex direction="column" align="center">
            <Avatar size="xl" src="/profile.png" mb={3} />
            <Text fontWeight="bold" fontSize="lg" color="text.primary">
              {user?.nickname || "Guest"}
            </Text>
            <Text color="text.tertiary" mb={4}>
              {user?.email || "guest@example.com"}
            </Text>
            <Flex w="100%" justify="space-between" mt={2}>
              <Text color="text.tertiary">{t("Account status")}</Text>
              <Badge color="text.tertiary" bg="none" fontWeight="bold">
                {t("Active")}
              </Badge>
            </Flex>
          </Flex>
        </Box>

        {/* 오른쪽: 수정 영역 */}
        <Flex direction="column" width={{ base: "100%", md: "50%" }} gap={6}>
          {/* 닉네임 수정 */}
          <Box p={6} bg="white" borderRadius="xl" boxShadow="md">
            <Text fontWeight="semibold" mb={4} color="text.primary">
              {t("Information")}
            </Text>
            <Input
              placeholder={t("Nickname")}
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              mb={3}
            />
            <Button variant="solid" onClick={handleNicknameSave}>
              {t("Save")}
            </Button>
          </Box>

          {/* 비밀번호 변경 */}
          <Box p={6}  borderRadius="xl" boxShadow="md">
            <Text fontWeight="semibold" mb={4} color="text.primary">
              {t("Change Password")}
            </Text>

            <InputGroup mb={3} color="text.primary">
              <Input
                type={showCurrentPw ? "text" : "password"}
                placeholder={t("Current Password")}
                value={currentPw}
                onChange={(e) => setCurrentPw(e.target.value)}
              />
              <InputRightElement>
                <IconButton
                  //variant="ghost"
                  size="sm"
                  icon={showCurrentPw ? <ViewOffIcon /> : <ViewIcon />}
                  onClick={() => setShowCurrentPw(!showCurrentPw)}
                  aria-label="Toggle password visibility"
                />
              </InputRightElement>
            </InputGroup>

            <InputGroup mb={4}>
              <Input
                type={showNewPw ? "text" : "password"}
                placeholder={t("New Password")}
                value={newPw}
                onChange={(e) => setNewPw(e.target.value)}
              />
              <InputRightElement  >
                <IconButton
                 // variant="ghost"
                  size="sm"
                  icon={showNewPw ? <ViewOffIcon /> : <ViewIcon />}
                  onClick={() => setShowNewPw(!showNewPw)}
                  aria-label="Toggle password visibility"
                />
              </InputRightElement>
            </InputGroup>

            <Button variant="solid" width="100%"  onClick={handleChangePassword}>
              {t("Change Password")}
            </Button>
          </Box>

          {/* 회원 탈퇴 */}
          <Box p={6} bg="white" borderRadius="xl" boxShadow="md">
            <Text fontWeight="semibold" mb={4} color="red.500">
              {t("Delete Account")}
            </Text>
            <Button colorScheme="red" variant="outline" onClick={() => setIsDeleteOpen(true)}>
              {t("Delete Account")}
            </Button>
          </Box>
        </Flex>
      </Flex>

      {/* 탈퇴 확인 다이얼로그 */}
      <AlertDialog
        isOpen={isDeleteOpen}
        leastDestructiveRef={cancelRef}
        onClose={() => setIsDeleteOpen(false)}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              {t("Delete Account")}
            </AlertDialogHeader>
            <AlertDialogBody>
              정말로 회원 탈퇴하시겠습니까? 이 작업은 되돌릴 수 없습니다.
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={() => setIsDeleteOpen(false)}>
                취소
              </Button>
              <Button colorScheme="red" onClick={handleDeleteAccount} ml={3}>
                탈퇴하기
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
}
