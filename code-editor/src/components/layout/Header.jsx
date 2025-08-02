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
import LoginModal from "../modals/LoginModal";
import SignupModal from "../modals/SignUpModal";
import ForgotPasswordModal from "../modals/ForgotPasswordModal";
import { useTranslation } from "react-i18next";
import { FiBell } from "react-icons/fi";
import InvitationModal from "../modals/InvitationModal";

const Header = () => {
    const location = useLocation();
    const navigate = useNavigate();
    
    // --- 1. 동적 내비게이션 기능 상태 ---
    const [showProjectTabs, setShowProjectTabs] = useState(false);
    const [currentProjectId, setCurrentProjectId] = useState(null);

    // --- 2. 로그인 및 알림 기능 상태 ---
    const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));
    const [notifications, setNotifications] = useState([]);
    const [selectedNotification, setSelectedNotification] = useState(null);
    const [isInviteModalOpen, setInviteModalOpen] = useState(false);
    
    const loginModal = useDisclosure();
    const signupModal = useDisclosure();
    const forgotModal = useDisclosure();
    
    const { t, i18n } = useTranslation();
    const [lang, setLang] = useState(i18n.language || "kr");
    const BASE_URL = "http://20.196.89.99:8080";

    // ✅ Effect 1: URL 경로를 감지하여 동적 탭을 제어합니다.
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

    // ✅ Effect 2: 로그인 상태를 실시간으로 감지합니다.
    useEffect(() => {
        const checkLoginStatus = () => {
            const token = localStorage.getItem("token");
            setIsLoggedIn(!!token);
        };
        window.addEventListener('storage', checkLoginStatus);
        window.addEventListener('focus', checkLoginStatus);
        checkLoginStatus(); // 초기 확인
        return () => {
            window.removeEventListener('storage', checkLoginStatus);
            window.removeEventListener('focus', checkLoginStatus);
        };
    }, []);

    // ✅ Effect 3: 로그인 상태일 때만 초대 알림 목록을 불러옵니다.
    useEffect(() => {
        const fetchInvitations = async () => {
            if (!isLoggedIn) {
                setNotifications([]); // 로그아웃 시 알림 초기화
                return;
            }
            try {
                const token = localStorage.getItem('token');
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
    }, [isLoggedIn]); // isLoggedIn 상태가 바뀔 때마다 실행

    // --- 핸들러 함수들 ---
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
            const token = localStorage.getItem('token');
            const response = await fetch(`${BASE_URL}/api/projects/invitations/${selectedNotification.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ action: 'ACCEPT' }),
            });
            if (!response.ok) throw new Error('Failed to accept invitation');
            setNotifications(prev => prev.filter(n => n.id !== selectedNotification.id));
            setInviteModalOpen(false);
            alert('초대가 수락되었습니다!');
        } catch (error) {
            console.error('Error accepting invitation:', error);
            alert(`초대 수락에 실패했습니다: ${error.message}`);
        }
    };

    const handleDecline = async () => {
        if (!selectedNotification) return;
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${BASE_URL}/api/projects/invitations/${selectedNotification.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ action: 'REJECT' }),
            });
            if (!response.ok) throw new Error('Failed to decline invitation');
            setNotifications(prev => prev.filter(n => n.id !== selectedNotification.id));
            setInviteModalOpen(false);
            alert('초대가 거절되었습니다.');
        } catch (error) {
            console.error('Error declining invitation:', error);
            alert(`초대 거절에 실패했습니다: ${error.message}`);
        }
    };

    const isActive = (path) => location.pathname.startsWith(path);

    const handleLogout = () => {
        localStorage.removeItem("token");
        setIsLoggedIn(false);
        navigate("/");
    };

    return (
        <Box borderBottom="1px solid" borderColor="gray.200" bg="white" px={4} py={2}>
            <Flex align="center">
                {/* 로고 */}
                <HStack spacing={2}>
                    <NavLink to="/">
                        <Image boxSize={50} src="/로고.png" alt="Logo" borderRadius="md" objectFit="contain" cursor="pointer" width={100} />
                    </NavLink>
                </HStack>

                {/* 내비게이션 탭 */}
                <HStack spacing={6} ml={8}>
                    <NavLink to="/dashboard">
                        <Text cursor="pointer" color={isActive("/dashboard") ? "orange.500" : "gray.600"} borderBottom={isActive("/dashboard") ? "2px solid orange" : "none"} fontWeight="medium">
                            {t("Dashboard")}
                        </Text>
                    </NavLink>

                    {/* ✅ 동적 탭 렌더링 */}
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

                {/* 오른쪽 메뉴 (언어, 알림, 프로필) */}
                <HStack spacing={2}>
                    <Button size="sm" variant="outline" color="gray.600" fontWeight="medium" onClick={toggleLang}>
                        {lang.toUpperCase()}
                    </Button>
                    
                    {/* ✅ 로그인 상태일 때만 알림 벨 표시 */}
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
                                    <MenuItem _hover={{ bg: "#f2f2f2" }} onClick={loginModal.onOpen}>{t("Login")}</MenuItem>
                                    <MenuItem _hover={{ bg: "#f2f2f2" }} onClick={signupModal.onOpen}>{t("Sign Up")}</MenuItem>
                                </>
                            )}
                        </MenuList>
                    </Menu>
                </HStack>
            </Flex>

            {/* 모달들 */}
            <InvitationModal isOpen={isInviteModalOpen} onClose={() => setInviteModalOpen(false)} notification={selectedNotification} onAccept={handleAccept} onDecline={handleDecline} />
            <LoginModal isOpen={loginModal.isOpen} onClose={loginModal.onClose} onOpenSignup={signupModal.onOpen} onOpenForgot={forgotModal.onOpen} onLoginSuccess={() => { setIsLoggedIn(true); loginModal.onClose(); }} />
            <SignupModal isOpen={signupModal.isOpen} onClose={signupModal.onClose} onOpenLogin={loginModal.onOpen} />
            <ForgotPasswordModal isOpen={forgotModal.isOpen} onClose={forgotModal.onClose} onOpenLogin={loginModal.onOpen} />
        </Box>
    );
};

export default Header;
