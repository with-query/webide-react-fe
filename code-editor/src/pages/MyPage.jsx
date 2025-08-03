/*import {
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
  Divider,
} from "@chakra-ui/react";
import {
  getReceivedInvitations,
  getSentInvitations,
} from "../services/invitationService"; 

import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons";
import { useTranslation } from "react-i18next";
import { useEffect, useState, useRef,useCallback  } from "react";
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

  const token = localStorage.getItem("ACCESS_TOKEN_KEY");
  const BASE_URL = "http://20.196.89.99:8080"; 

  const [receivedInvitations, setReceivedInvitations] = useState([]);
  const [sentInvitations, setSentInvitations] = useState([]);
  const [invitationsLoading, setInvitationsLoading] = useState(true);

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

  const fetchInvitations = useCallback(async () => {
    if (!token) return;
    setInvitationsLoading(true);
    try {
      const received = await getReceivedInvitations(token);
      setReceivedInvitations(received);

      const sent = await getSentInvitations(token);
      setSentInvitations(sent);
    } catch (err) {
      toast({
        title: err.message,
        status: "error",
        duration: 3000,
      });
    } finally {
      setInvitationsLoading(false);
    }
  }, [token, toast]);

  // 컴포넌트 마운트 시 초대 목록 불러오기
  useEffect(() => {
    fetchInvitations();
  }, [fetchInvitations]);


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
      // API 명세에 따라 닉네임 변경 시 새로운 토큰이 반환되므로 업데이트
      if (data.token) {
        localStorage.setItem("ACCESS_TOKEN_KEY", data.token);
      }
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
    try {
      const res = await fetch(`${BASE_URL}/api/users/me`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "회원 탈퇴 실패");

      localStorage.removeItem("ACCESS_TOKEN_KEY");
      localStorage.removeItem("nickname"); // 닉네임도 함께 제거
      setUser(null);
      setNickname("");
      setCurrentPw("");
      setNewPw("");

      toast({
        title: data.message || "회원 탈퇴 완료",
        status: "success",
        duration: 3000,
      });

      setIsDeleteOpen(false);
    // 로그인 페이지로 이동하면서 'isLoggedOut' 상태를 전달합니다.
    navigate("/login", { state: { isLoggedOut: true } }); 
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
            <Avatar size="xl" src="/profile.png" mb={3}  background="#d57239" />
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
        <Divider my={6} borderColor="gray.300" borderWidth="1px" /> 
          <Text fontWeight="semibold" fontSize="lg" mb={4} color="text.primary">
            {t("Received Invitations")}
          </Text>
          {invitationsLoading ? (
            <Flex justify="center" align="center" minH="100px" border="1px" borderColor="gray.200" borderRadius="md">
              <Spinner size="md" />
            </Flex>
          ) : receivedInvitations.length === 0 ? (
            <Text color="text.tertiary" p={3} minH="100px" border="1px" borderColor="gray.200" borderRadius="md">{t("No received invitations.")}</Text>
          ) : (
            <Flex
              direction="column"
              p={3}
              border="1px"
              borderColor="gray.200"
              borderRadius="md" 
              maxH="150px" 
              overflowY="auto" 
              
            >
              {receivedInvitations.map((invite, index) => (
                <Box key={invite.id} pb={2} mb={index < receivedInvitations.length - 1 ? 2 : 0} borderBottom={index < receivedInvitations.length - 1 ? "1px solid" : "none"} borderColor="gray.100"> 
                  <Text fontWeight="medium" color="gray.600">{invite.projectName}</Text>
                  <Text fontSize="sm" color="gray.600">
                    {t("Invited by")}: {invite.inviterName} ({invite.inviterEmail}) ({invite.role})
                    
                  </Text>

                  <Flex justify="space-between" align="center" mt={2}>
                    <Badge colorScheme={
                      invite.status === "PENDING" ? "orange" :
                      invite.status === "ACCEPTED" ? "green" : "red"
                    }>
                      {t(invite.status)}
                    </Badge>
                  </Flex>
                </Box>
              ))}
            </Flex>
          )}

     
          <Divider my={6} borderColor="gray.300" borderWidth="1px"/> 
          <Text fontWeight="semibold" fontSize="lg" mb={4} color="text.primary">
            {t("Sent Invitations")}
          </Text>
          {invitationsLoading ? (
            <Flex justify="center" align="center" minH="100px" border="1px" borderColor="gray.200" borderRadius="md"> 
              <Spinner size="md" />
            </Flex>
          ) : sentInvitations.length === 0 ? (
            <Text color="text.tertiary" p={3} minH="100px" border="1px" borderColor="gray.200" borderRadius="md">{t("No sent invitations.")}</Text>
          ) : (
            <Flex
              direction="column"
              p={3}
              border="1px"
              borderColor="gray.200"
              borderRadius="md" 
              maxH="150px" 
              overflowY="auto" 
              
            >
              {sentInvitations.map((invite, index) => (
                <Box key={invite.id} pb={2} mb={index < sentInvitations.length - 1 ? 2 : 0} borderBottom={index < sentInvitations.length - 1 ? "1px solid" : "none"} borderColor="gray.100">
                  <Text fontWeight="medium" color="gray.600">{invite.projectName}</Text>
                  <Text fontSize="sm" color="gray.600">
                    {t("Invited to")}: {invite.inviterEmail} ({invite.role})
                  </Text>
                  <Flex justify="space-between" align="center" mt={2}>
                    <Badge colorScheme={
                      invite.status === "PENDING" ? "blue" :
                      invite.status === "ACCEPTED" ? "green" : "red"
                    }>
                      {t(invite.status)}
                    </Badge>
                  </Flex>
                </Box>
              ))}
            </Flex>
          )}
        </Box>

    
        <Flex direction="column" width={{ base: "100%", md: "50%" }} gap={6}>
         
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

         
          <Box p={6} borderRadius="xl" boxShadow="md" bg="white">
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
              <InputRightElement>
                <IconButton
                  size="sm"
                  icon={showNewPw ? <ViewOffIcon /> : <ViewIcon />}
                  onClick={() => setShowNewPw(!showNewPw)}
                  aria-label="Toggle password visibility"
                />
              </InputRightElement>
            </InputGroup>

            <Button variant="solid" width="100%" onClick={handleChangePassword}>
              {t("Change Password")}
            </Button>
          </Box>

        
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
}*/

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
  Divider,
} from "@chakra-ui/react";
import {
  getReceivedInvitations,
  getSentInvitations,
} from "../services/invitationService";

import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons";
import { useTranslation } from "react-i18next";
import { useEffect, useState, useRef, useCallback } from "react";
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

  const [receivedInvitations, setReceivedInvitations] = useState([]);
  const [sentInvitations, setSentInvitations] = useState([]);
  const [invitationsLoading, setInvitationsLoading] = useState(true);

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

  const fetchInvitations = useCallback(async () => {
    if (!token) return;
    setInvitationsLoading(true);
    try {
      const received = await getReceivedInvitations(token);
      setReceivedInvitations(received);

      const sent = await getSentInvitations(token);
      setSentInvitations(sent);
    } catch (err) {
      toast({
        title: err.message,
        status: "error",
        duration: 3000,
      });
    } finally {
      setInvitationsLoading(false);
    }
  }, [token, toast]);

  // 컴포넌트 마운트 시 초대 목록 불러오기
  useEffect(() => {
    fetchInvitations();
  }, [fetchInvitations]);


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
      // API 명세에 따라 닉네임 변경 시 새로운 토큰이 반환되므로 업데이트
      if (data.token) {
        localStorage.setItem("token", data.token);
      }
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

    // 비밀번호 정규표현식 검사
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()\-_=+\[\]{}|;:'",.<>/?~]).{10,}$/;
    if (!passwordRegex.test(newPw)) {
      toast({
        title: "새 비밀번호는 최소 10자 이상, 대문자, 소문자, 숫자, 특수문자를 각각 1개 이상 포함해야 합니다.",
        status: "error",
        duration: 5000,
        isClosable: true,
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
      localStorage.removeItem("nickname"); // 닉네임도 함께 제거
      setUser(null);
      setNickname("");
      setCurrentPw("");
      setNewPw("");

      toast({
        title: data.message || "회원 탈퇴 완료",
        status: "success",
        duration: 3000,
      });

      setIsDeleteOpen(false);
    // 로그인 페이지로 이동하면서 'isLoggedOut' 상태를 전달합니다.
    navigate("/login", { state: { isLoggedOut: true } });
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
            <Avatar size="xl" src="/profile.png" mb={3}  background="#d57239" />
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
        <Divider my={6} borderColor="gray.300" borderWidth="1px" />
          <Text fontWeight="semibold" fontSize="lg" mb={4} color="text.primary">
            {t("Received Invitations")}
          </Text>
          {invitationsLoading ? (
            <Flex justify="center" align="center" minH="100px" border="1px" borderColor="gray.200" borderRadius="md">
              <Spinner size="md" />
            </Flex>
          ) : receivedInvitations.length === 0 ? (
            <Text color="text.tertiary" p={3} minH="100px" border="1px" borderColor="gray.200" borderRadius="md">{t("No received invitations.")}</Text>
          ) : (
            <Flex
              direction="column"
              p={3}
              border="1px"
              borderColor="gray.200"
              borderRadius="md"
              maxH="150px"
              overflowY="auto"

            >
              {receivedInvitations.map((invite, index) => (
                <Box key={invite.id} pb={2} mb={index < receivedInvitations.length - 1 ? 2 : 0} borderBottom={index < receivedInvitations.length - 1 ? "1px solid" : "none"} borderColor="gray.100">
                  <Text fontWeight="medium" color="gray.600">{invite.projectName}</Text>
                  <Text fontSize="sm" color="gray.600">
                    {t("Invited by")}: {invite.inviterName} ({invite.inviterEmail}) ({invite.role})

                  </Text>

                  <Flex justify="space-between" align="center" mt={2}>
                    <Badge colorScheme={
                      invite.status === "PENDING" ? "orange" :
                      invite.status === "ACCEPTED" ? "green" : "red"
                    }>
                      {t(invite.status)}
                    </Badge>
                  </Flex>
                </Box>
              ))}
            </Flex>
          )}

          {/* --- 보낸 초대 목록 --- */}
          <Divider my={6} borderColor="gray.300" borderWidth="1px"/> {/* 구분선 추가 */}
          <Text fontWeight="semibold" fontSize="lg" mb={4} color="text.primary">
            {t("Sent Invitations")}
          </Text>
          {invitationsLoading ? (
            <Flex justify="center" align="center" minH="100px" border="1px" borderColor="gray.200" borderRadius="md">
              <Spinner size="md" />
            </Flex>
          ) : sentInvitations.length === 0 ? (
            <Text color="text.tertiary" p={3} minH="100px" border="1px" borderColor="gray.200" borderRadius="md">{t("No sent invitations.")}</Text>
          ) : (
            <Flex
              direction="column"
              p={3}
              border="1px"
              borderColor="gray.200"
              borderRadius="md"
              maxH="150px"
              overflowY="auto"

            >
              {sentInvitations.map((invite, index) => (
                <Box key={invite.id} pb={2} mb={index < sentInvitations.length - 1 ? 2 : 0} borderBottom={index < sentInvitations.length - 1 ? "1px solid" : "none"} borderColor="gray.100">
                  <Text fontWeight="medium" color="gray.600">{invite.projectName}</Text>
                  <Text fontSize="sm" color="gray.600">
                    {t("Invited to")}: {invite.inviterEmail} ({invite.role})
                  </Text>
                  <Flex justify="space-between" align="center" mt={2}>
                    <Badge colorScheme={
                      invite.status === "PENDING" ? "blue" :
                      invite.status === "ACCEPTED" ? "green" : "red"
                    }>
                      {t(invite.status)}
                    </Badge>
                  </Flex>
                </Box>
              ))}
            </Flex>
          )}
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
          <Box p={6} borderRadius="xl" boxShadow="md" bg="white">
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
              <InputRightElement>
                <IconButton
                  size="sm"
                  icon={showNewPw ? <ViewOffIcon /> : <ViewIcon />}
                  onClick={() => setShowNewPw(!showNewPw)}
                  aria-label="Toggle password visibility"
                />
              </InputRightElement>
            </InputGroup>

            <Button variant="solid" width="100%" onClick={handleChangePassword}>
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
