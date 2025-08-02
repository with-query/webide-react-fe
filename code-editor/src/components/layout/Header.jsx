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
    Image,
} from "@chakra-ui/react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { FiBell } from "react-icons/fi";

// Modal and Context Imports
import LoginModal from "../modals/LoginModal";
import SignupModal from "../modals/SignUpModal";
import ForgotPasswordModal from "../modals/ForgotPasswordModal";
import InvitationModal from "../modals/InvitationModal";
import { useAuth } from '../../contexts/AuthContext';

const Header = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const { isLoggedIn, logout, openLoginModal, closeLoginModal, isLoginModalOpen } = useAuth();

    const [showProjectTabs, setShowProjectTabs] = useState(false);
    const [currentProjectId, setCurrentProjectId] = useState(null);
    const [notifications, setNotifications] = useState([]);
    const [selectedNotification, setSelectedNotification] = useState(null);
    const [isInviteModalOpen, setInviteModalOpen] = useState(false);
        
    const signupModal = useDisclosure();
    const forgotModal = useDisclosure();
    
    const { t, i18n } = useTranslation();
    const [lang, setLang] = useState(i18n.language || "kr");
    const BASE_URL = "http://20.196.89.99:8080";

    useEffect(() => {
        const match = location.pathname.match(/^\/(editor|query-builder)\/([^/]+)/);
        if (match && match[2]) {
            setShowProjectTabs(true);
            setCurrentProjectId(match[2]);
        } else {
            setShowProjectTabs(false);
            setCurrentProjectId(null);
        }
    }, [location.pathname]);

    useEffect(() => {
        const fetchInvitations = async () => {
            if (!isLoggedIn) {
                setNotifications([]);
                return;
            }
            try {
                const token = localStorage.getItem('ACCESS_TOKEN_KEY');
                const response = await fetch(`${BASE_URL}/api/projects/invitations`, {
                    headers: { 'Authorization': `Bearer ${token}` },
                });
                if (!response.ok) throw new Error('Failed to fetch invitations');
                
                const data = await response.json();
                const formattedNotifications = data.map(invite => ({
                    id: invite.id,
                    message: `${invite.inviterName} 님이 ${invite.projectName} 프로젝트에 초대했습니다.`,
                    ...invite
                }));
                setNotifications(formattedNotifications);
            } catch (error) {
                console.error('Error fetching invitations:', error);
            }
        };
        fetchInvitations();
    }, [isLoggedIn]);

    const handleLogout = () => {
        logout();
        navigate("/");
    };

    const handleLoginSuccess = () => {
        closeLoginModal();      // 1. Context를 통해 모달을 닫습니다.
        navigate('/dashboard'); // 2. 대시보드로 페이지를 이동시킵니다.
    };

    const toggleLang = () => {
        const newLang = lang === "kr" ? "en" : "kr";
        i18n.changeLanguage(newLang);
        setLang(newLang);
    };

    const handleClickNotification = (noti) => {
        setSelectedNotification(noti);
        setInviteModalOpen(true);
    };

    const handleAccept = async () => {
        if (!selectedNotification) return;
        try {
            // ✅ 키 이름을 "ACCESS_TOKEN_KEY"로 통일
            const token = localStorage.getItem('ACCESS_TOKEN_KEY');
            await fetch(`${BASE_URL}/api/projects/invitations/${selectedNotification.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ action: 'ACCEPT' }),
            });
            setNotifications(prev => prev.filter(n => n.id !== selectedNotification.id));
            setInviteModalOpen(false);
        } catch (error) {
            console.error('Error accepting invitation:', error);
        }
    };

    const handleDecline = async () => {
        if (!selectedNotification) return;
        try {
            // ✅ 키 이름을 "ACCESS_TOKEN_KEY"로 통일
            const token = localStorage.getItem('ACCESS_TOKEN_KEY');
            await fetch(`${BASE_URL}/api/projects/invitations/${selectedNotification.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ action: 'REJECT' }),
            });
            setNotifications(prev => prev.filter(n => n.id !== selectedNotification.id));
            setInviteModalOpen(false);
        } catch (error) {
            console.error('Error declining invitation:', error);
        }
    };

    const isActive = (path) => location.pathname.startsWith(path);

    return (
        <Box borderBottom="1px solid" borderColor="gray.200" bg="white" px={4} py={2}>
            <Flex align="center">
                <HStack spacing={2}>
                    <NavLink to="/">
                        <Image boxSize={50} src="/로고.png" alt="Logo" borderRadius="md" objectFit="contain" cursor="pointer" width={100} />
                    </NavLink>
                </HStack>

                <HStack spacing={6} ml={8}>
                    <NavLink to="/dashboard">
                        <Text cursor="pointer" color={isActive("/dashboard") ? "orange.500" : "gray.600"} borderBottom={isActive("/dashboard") ? "2px solid orange" : "none"} fontWeight="medium">
                            {t("Dashboard")}
                        </Text>
                    </NavLink>
                    {showProjectTabs && (
                        <>
                            <NavLink to={`/editor/${currentProjectId}`}>
                                <Text cursor="pointer" color={isActive(`/editor/`) ? "orange.500" : "gray.600"} borderBottom={isActive(`/editor/`) ? "2px solid orange" : "2px solid transparent"} fontWeight="medium">
                                    {t("IDE")}
                                </Text>
                            </NavLink>
                            <NavLink to={`/query-builder/${currentProjectId}`}>
                                <Text fontWeight="medium" cursor="pointer" borderBottom={isActive(`/query-builder/`) ? "2px solid orange" : "2px solid transparent"} color={isActive(`/query-builder/`) ? "orange.500" : "gray.600"}>
                                    {t("Query Builder")}
                                </Text>
                            </NavLink>
                        </>
                    )}
                    <NavLink to="/DBConnect">
                        <Text fontWeight="medium" cursor="pointer" borderBottom={isActive("/DBConnect") ? "2px solid orange" : "2px solid transparent"} color={isActive("/DBConnect") ? "orange.500" : "gray.600"}>
                            {t("DBConnect")}
                        </Text>
                    </NavLink>
                    <NavLink to="/chat">
                        <Text cursor="pointer" color={isActive("/chat") ? "orange.500" : "gray.600"} borderBottom={isActive("/chat") ? "2px solid orange" : "2px solid transparent"} fontWeight="medium">
                            {t("Chat")}
                        </Text>
                    </NavLink>
                </HStack>

                <Spacer />

                <HStack spacing={2}>
                    <Button size="sm" variant="outline" color="gray.600" fontWeight="medium" onClick={toggleLang}>
                        {lang.toUpperCase()}
                    </Button>
                    
                    {isLoggedIn && (
                        <Menu>
                            <MenuButton as={IconButton} variant="ghost" bg="transparent" _hover={{ bg: "transparent" }} _active={{ bg: "transparent" }} icon={
                                <Box position="relative">
                                    <FiBell size={22} color="black" />
                                    {notifications.length > 0 && (
                                        <Badge bg="#d57239" borderRadius="full" position="absolute" top="-1" right="-1" px="1" fontSize="0.6em" color="white" minW="14px" h="14px" display="flex" justifyContent="center" alignItems="center">
                                            {notifications.length}
                                        </Badge>
                                    )}
                                </Box>
                            } />
                            <MenuList zIndex={1000} bg="white">
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
                    )}

                    <Menu>
                        <MenuButton as={IconButton} icon={<Avatar size="sm" />} variant="ghost" borderRadius="full" p={0} />
                        <MenuList bg="white" color="text.primary">
                            {isLoggedIn ? (
                                <>
                                    <MenuItem _hover={{ bg: "#f2f2f2" }} onClick={() => navigate("/mypage")}>{t("My Page")}</MenuItem>
                                    <MenuItem _hover={{ bg: "#f2f2f2" }} onClick={handleLogout}>{t("Logout")}</MenuItem>
                                </>
                            ) : (
                                <>
                                    <MenuItem _hover={{ bg: "#f2f2f2" }} onClick={openLoginModal}>
                                        {t("Login")}
                                    </MenuItem>
                                    <MenuItem _hover={{ bg: "#f2f2f2" }} onClick={signupModal.onOpen}>{t("Sign Up")}</MenuItem>
                                </>
                            )}
                        </MenuList>
                    </Menu>
                </HStack>
            </Flex>

            <InvitationModal isOpen={isInviteModalOpen} onClose={() => setInviteModalOpen(false)} notification={selectedNotification} onAccept={handleAccept} onDecline={handleDecline} />
            
            <LoginModal 
                isOpen={isLoginModalOpen} 
                onClose={closeLoginModal} 
                onOpenSignup={signupModal.onOpen} 
                onOpenForgot={forgotModal.onOpen} 
                onLoginSuccess={handleLoginSuccess} 
            />

            <SignupModal isOpen={signupModal.isOpen} onClose={signupModal.onClose} onOpenLogin={openLoginModal} />
            <ForgotPasswordModal isOpen={forgotModal.isOpen} onClose={forgotModal.onClose} onOpenLogin={openLoginModal} />
        </Box>
    );
};

export default Header;
