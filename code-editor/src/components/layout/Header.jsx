import {
  Box,
  Flex,
  HStack,
  Button,
  Spacer,
  Text,
  IconButton,
  useDisclosure,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Avatar,
  Badge,
} from "@chakra-ui/react";
import { CopyIcon } from "@chakra-ui/icons";
import { NavLink, useLocation } from "react-router-dom";
import { Image } from "@chakra-ui/react";
import { useState, useEffect } from "react"; // useEffect 추가
import LoginModal from "../modals/LoginModal";
import SignupModal from "../modals/SignUpModal";
import ForgotPasswordModal from "../modals/ForgotPasswordModal";

import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FiBell } from "react-icons/fi";
import InvitationModal from "../modals/InvitationModal";

const Header = () => {
  const location = useLocation();
  // 초기 isLoggedIn 상태를 localStorage의 토큰 유무로 설정
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));
  const loginModal = useDisclosure();
  const signupModal = useDisclosure();
  const forgotModal = useDisclosure();

  const navigate = useNavigate();

  const { t, i18n } = useTranslation();
  const [lang, setLang] = useState(i18n.language || "kr");

  const toggleLang = () => {
    const newLang = lang === "kr" ? "en" : "kr";
    i18n.changeLanguage(newLang);
    setLang(newLang);
  };

  const [notifications, setNotifications] = useState([]);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [isInviteModalOpen, setInviteModalOpen] = useState(false);

   const BASE_URL = "http://20.196.89.99:8080";

  useEffect(() => {
    // 초대 수신 목록 API 호출
    const fetchInvitations = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${BASE_URL}/api/projects/invitations`, {
          method: 'GET', // GET 요청임을 명시
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          if (response.status === 401) {
            console.error('인증되지 않았습니다. 로그인 상태를 확인하세요.');
          
          }
      throw new Error('Failed to fetch invitations');
        }
        const data = await response.json();
        console.log("=== API로부터 받은 원본 응답 데이터 ===", data);

        // API 응답 형태에 따라 notifications 상태에 맞게 변환
        const formattedNotifications = data.map(invite => ({
          id: invite.id,
          message: `${invite.inviterName} 님이 ${invite.projectName} 프로젝트에 초대했습니다.`,
          ...invite // 초대 응답 처리 시 필요한 나머지 정보도 함께 저장
        }));

        console.log("=== 변환 후 notifications 배열 ===", formattedNotifications);

        setNotifications(formattedNotifications);

        console.log("Header.jsx: 현재 notifications 배열:", notifications);
        console.log("Header.jsx: notifications.length:", notifications.length);
      } catch (error) {
        console.error('Error fetching invitations:', error);
      }
    };

    fetchInvitations();
  }, []); // 컴포넌트 마운트 시 한 번만 호출


  const handleClickNotification = (noti) => {
    setSelectedNotification(noti);
    setInviteModalOpen(true);
  };

 const handleAccept = async () => {
  if (!selectedNotification) return;

  try {
    const token = localStorage.getItem('token'); // 토큰도 함께 보내야 합니다.
    if (!token) {
      alert('로그인이 필요합니다.');
      return;
    }

    const response = await fetch(`${BASE_URL}/api/projects/invitations/${selectedNotification.id}`, { // BASE_URL 사용
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`, // 인증 토큰 추가
      },
      body: JSON.stringify({ action: 'ACCEPT' }),
    });

    if (!response.ok) {
      const errorData = await response.json(); // 서버에서 에러 메시지를 보낼 경우를 대비
      console.error("서버에서 받은 오류 데이터:", errorData);
      throw new Error(errorData.message || 'Failed to accept invitation');
    }

    setNotifications(prev => prev.filter(n => n.id !== selectedNotification.id));
    setInviteModalOpen(false);
    // 프로젝트 멤버 목록을 새로 불러와 UI에 반영해야 합니다.
    // 예를 들어, Header 컴포넌트의 부모가 fetchProjectMembers 함수를 props로 전달한다면
    // onAccept={async () => { await handleAccept(); fetchProjectMembers(selectedNotification.projectId); }}
    // 와 같이 호출해야 합니다.
    // 아니면 Header 컴포넌트에서 직접 Project 멤버 목록을 관리하거나, 전역 상태 관리 사용.
    alert('초대가 수락되었습니다!');
  } catch (error) {
    console.error('Error accepting invitation:', error);
    alert(`초대 수락에 실패했습니다: ${error.message}`);
  }
};


  useEffect(() => {
    // MyPage에서 전달된 상태가 있는지 확인
    if (location.state && location.state.isLoggedOut) {
      setIsLoggedIn(false);
      // 상태를 한 번 사용했으니 클리어하여 불필요한 재설정 방지
      // (단, location.state는 라우팅이 변경될 때만 초기화되므로 주의)
      // 또는 localStorage만 믿는게 더 확실할 수 있습니다.
    }

    const checkLoginStatus = () => {
      const token = localStorage.getItem("token");
      setIsLoggedIn(!!token);
    };

    window.addEventListener('storage', checkLoginStatus);
    window.addEventListener('focus', checkLoginStatus); // 창이 다시 포커스될 때 확인

    // 컴포넌트 마운트 시 초기 확인
    checkLoginStatus();

    return () => {
      window.removeEventListener('storage', checkLoginStatus);
      window.removeEventListener('focus', checkLoginStatus);
    };
  }, [location.state]); // location.state가 변경될 때마다 실행

  const handleDecline = async () => {
  if (!selectedNotification) return;

  try {
    const token = localStorage.getItem('token'); // 토큰도 함께 보내야 합니다.
    if (!token) {
      alert('로그인이 필요합니다.');
      return;
    }

    const response = await fetch(`${BASE_URL}/api/projects/invitations/${selectedNotification.id}`, { // BASE_URL 사용
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`, // 인증 토큰 추가
      },
      body: JSON.stringify({ action: 'REJECT' }),
    });

    if (!response.ok) {
      const errorData = await response.json(); // 서버에서 에러 메시지를 보낼 경우를 대비
      console.error("서버에서 받은 오류 데이터:", errorData);
      throw new Error(errorData.message || 'Failed to decline invitation');
    }

    setNotifications(prev => prev.filter(n => n.id !== selectedNotification.id));
    setInviteModalOpen(false);
    alert('초대가 거절되었습니다.');
  } catch (error) {
    console.error('Error declining invitation:', error);
    alert(`초대 거절에 실패했습니다: ${error.message}`);
  }
};

  // 현재 경로 기반으로 active 상태 결정
  const isActive = (path) => location.pathname.startsWith(path);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false); // 로그아웃 시 isLoggedIn 상태를 false로 설정
    navigate("/"); // 로그아웃 후 홈으로 이동 (선택 사항)
  };

  console.log("현재 notifications 배열:", notifications);
  console.log("notifications.length:", notifications.length);

  return (
    <Box borderBottom="1px solid" borderColor="gray.200" bg="white" px={4} py={2}>
      <Flex align="center">
        {/* 로고 */}
        <HStack spacing={2}>
          <NavLink to="/">
            <Image
              boxSize={50}
              src="/로고.png"
              alt="Logo"
              borderRadius="md"
              objectFit="contain"
              cursor="pointer"
              width={100}
            />
          </NavLink>
        </HStack>

        {/* 탭 (쿼리 빌더 / 설정) */}
        <HStack spacing={6} ml={8}>
          <NavLink to="/dashboard">
            <Text
              cursor="pointer"
              color={isActive("/dashboard") ? "orange.500" : "gray.600"}
              borderBottom={isActive("/dashboard") ? "2px solid orange" : "none"}
              fontWeight="medium"
            >
              {t("Dashboard")}
            </Text>
          </NavLink>

          <NavLink to="/ide">
            <Text
              cursor="pointer"
              color={isActive("/ide") ? "orange.500" : "gray.600"}
              borderBottom={isActive("/ide") ? "2px solid orange" : "2px solid transparent"}
              fontWeight="medium"
            >
              {t("IDE")}
            </Text>
          </NavLink>

          <NavLink to="/query-builder">
            <Text
              fontWeight="medium"
              cursor="pointer"
              borderBottom={isActive("/query-builder") ? "2px solid orange" : "2px solid transparent"}
              color={isActive("/query-builder") ? "orange.500" : "gray.600"}
            >
              {t("Query Builder")}
            </Text>
          </NavLink>

          <NavLink to="/DBConnect">
            <Text
              fontWeight="medium"
              cursor="pointer"
              borderBottom={isActive("/DBConnect") ? "2px solid orange" : "2px solid transparent"}
              color={isActive("/DBConnect") ? "orange.500" : "gray.600"}
            >
              {t("DBConnect")}
            </Text>
          </NavLink>

          <NavLink to="/chat">
            <Text
              cursor="pointer"
              color={isActive("/chat") ? "orange.500" : "gray.600"}
              borderBottom={isActive("/chat") ? "2px solid orange" : "2px solid transparent"}
              fontWeight="medium"
            >
              {t("Chat")}
            </Text>
          </NavLink>
        </HStack>

        <Spacer />

        <HStack spacing={4} mx={3}>
          <Button
            size="sm"
            variant="outline"
            mx="10px"
            color="gray.600"
            fontWeight="medium"
            onClick={toggleLang}
          >
            {lang.toUpperCase()}
          </Button>
        </HStack>

        <Menu>
        <MenuButton
          as={IconButton}
          icon={
            <Box position="relative">
              <FiBell size={22} color="black" />
              {notifications.length > 0 && (
                <Badge
                  bg="#d57239"
                  borderRadius="full"
                  position="absolute"
                  top="-1"
                  right="-1"
                  px="1"
                  fontSize="0.6em"
                  color="white"
                  width="14px"
                  height="14px"
                  display="flex"
                  justifyContent="center"
                  alignItems="center"
                >
                  {notifications.length}
                </Badge>
              )}
            </Box>
          }
          variant="ghost"
          bg="transparent"
          _hover={{ bg: "transparent" }}
          _active={{ bg: "transparent" }}
        />
        <MenuList zIndex={1000} background="white">
          {notifications.length > 0 ? (
            notifications.map((noti) => (
              <MenuItem bg="white" _hover={{ bg: "#f2f2f2" }} color="black" key={noti.id} onClick={() => handleClickNotification(noti)}>
                {noti.message}
              </MenuItem>
            ))
          ) : (
            <MenuItem bg="white" _hover={{ bg: "#f2f2f2" }} color="black" disabled >새 알림이 없습니다</MenuItem>
          )}
        </MenuList>
      </Menu>

      <InvitationModal
        isOpen={isInviteModalOpen}
        onClose={() => setInviteModalOpen(false)}
        notification={selectedNotification}
        onAccept={handleAccept}
        onDecline={handleDecline}
      />

        <Flex justify="flex-end" p={4}>
          <Menu>
            <MenuButton
              as={IconButton}
              icon={<Avatar size="sm" />}
              variant="ghost"
              borderRadius="full"
              p={0}
            />
            <MenuList bg="white" color="text.primary">
              {isLoggedIn ? (
                <>
                  <MenuItem bg="white" _hover={{ bg: "#f2f2f2" }} onClick={() => navigate("/mypage")}>
                    {t("My Page")}
                  </MenuItem>
                  <MenuItem bg="white" _hover={{ bg: "#f2f2f2" }} onClick={handleLogout}>
                    {t("Logout")}
                  </MenuItem>
                </>
              ) : (
                <>
                  <MenuItem bg="white" _hover={{ bg: "#f2f2f2" }} onClick={loginModal.onOpen}>
                    {t("Login")}
                  </MenuItem>
                  <MenuItem bg="white" _hover={{ bg: "#f2f2f2" }} onClick={signupModal.onOpen}>
                    {t("Sign Up")}
                  </MenuItem>
                </>
              )}
            </MenuList>
          </Menu>
        </Flex>

        {/* 모달들 */}
        <LoginModal
          isOpen={loginModal.isOpen}
          onClose={loginModal.onClose}
          onOpenSignup={signupModal.onOpen}
          onOpenForgot={forgotModal.onOpen}
          onLoginSuccess={() => {
            setIsLoggedIn(true); // 로그인 성공 시 isLoggedIn 상태를 true로 설정
            loginModal.onClose();
          }}
        />

        <SignupModal
          isOpen={signupModal.isOpen}
          onClose={signupModal.onClose}
          onOpenLogin={loginModal.onOpen}
        />

        <ForgotPasswordModal
          isOpen={forgotModal.isOpen}
          onClose={forgotModal.onClose}
          onOpenLogin={loginModal.onOpen}
        />
      </Flex>
    </Box>
  );
};

export default Header;