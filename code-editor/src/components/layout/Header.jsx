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
import { useState } from "react";
import LoginModal from "../modals/LoginModal";
import SignupModal from "../modals/SignUpModal";
import ForgotPasswordModal from "../modals/ForgotPasswordModal";

import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FiBell } from "react-icons/fi";
import InvitationModal from "../modals/InvitationModal";

const Header = () => {
    const location = useLocation();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
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

   const [notifications, setNotifications] = useState([
    { id: 1, projectName: "프로젝트 A", message: "프로젝트 A에서 초대가 왔습니다." },
  ]);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [isInviteModalOpen, setInviteModalOpen] = useState(false);

  const handleClickNotification = (noti) => {
    setSelectedNotification(noti);
    setInviteModalOpen(true);
  };

  const handleAccept = () => {
    // 수락 처리 (예: InviteMemberModal 연동 또는 상태 업데이트)
    setNotifications((prev) => prev.filter((n) => n.id !== selectedNotification.id));
    setInviteModalOpen(false);
  };

  const handleDecline = () => {
    setNotifications((prev) => prev.filter((n) => n.id !== selectedNotification.id));
    setInviteModalOpen(false);
  };


    // 현재 경로 기반으로 active 상태 결정
    const isActive = (path) => location.pathname.startsWith(path);

    const handleLogout = () => {
   
        localStorage.removeItem("token");  
        setIsLoggedIn(false);             
  //setUser(null);                    

  };

  console.log("현재 notifications 배열:", notifications);
  console.log("notifications.length:", notifications.length);

  return (
    <Box borderBottom="1px solid" borderColor="gray.200" bg="white" px={4} py={2} >
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
            <HStack spacing={6} ml={8} >
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
                <Button size="sm" variant="outline" mx="10px"
                    color="gray.600"
                    fontWeight="medium"
                    onClick={toggleLang}>
                    {lang.toUpperCase()}
                </Button>
            </HStack>

            
            <Menu>
                <MenuButton as={IconButton} icon={
                <Box position="relative" >
                    <FiBell size={22} color="black"/>
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
                     >{notifications.length}
                    </Badge>
                    )}
                </Box>
                } 
                variant="ghost" // 배경 없애기
                bg="transparent"
                _hover={{ bg: 'transparent' }}
                _active={{ bg: 'transparent' }} 
                />
                <MenuList zIndex={1000}>
                {notifications.length > 0 ? (
                    notifications.map((noti) => (
                    <MenuItem key={noti.id} onClick={() => handleClickNotification(noti)}>
                        {noti.message}
                    </MenuItem>
                    ))
                ) : (
                    <MenuItem disabled>새 알림이 없습니다</MenuItem>
                )}
                </MenuList>
            </Menu>

            {/* 알림 클릭 시 뜨는 모달 */}
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
                    <MenuList bg="brand.100" color="text.primary">
                        {isLoggedIn ? (
                            <>
                            <MenuItem bg="brand.100"  _hover={{ bg: "brand.300" }} onClick={() => navigate("/mypage")}>{t("My Page")}</MenuItem>

                            <MenuItem bg="brand.100"  _hover={{ bg: "brand.300" }} onClick={handleLogout}>{t("Logout")}</MenuItem>
                            </>
                        ) : (
                            <>
                            <MenuItem bg="brand.100"  _hover={{ bg: "brand.300" }} onClick={loginModal.onOpen}>{t("Login")}</MenuItem>
                            <MenuItem bg="brand.100"  _hover={{ bg: "brand.300" }} onClick={signupModal.onOpen}>{t("Sign Up")}</MenuItem>
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
                    setIsLoggedIn(true);
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
