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
import SignupModal from "../modals/SignupModal";
import ForgotPasswordModal from "../modals/ForgotPasswordModal";
import InvitationModal from "../modals/InvitationModal";
import { useAuth } from '../../contexts/AuthContext';

const Header = () => {
    const location = useLocation();
    const navigate = useNavigate();

    // useAuth 훅을 통해 로그인 상태 및 모달 제어 함수 가져오기
    const { isLoggedIn, logout, openLoginModal, closeLoginModal, isLoginModalOpen, isInitialized } = useAuth();

    const [showProjectTabs, setShowProjectTabs] = useState(false);
    const [currentProjectId, setCurrentProjectId] = useState(null);
    const [notifications, setNotifications] = useState([]);
    const [selectedNotification, setSelectedNotification] = useState(null);
    const [isInviteModalOpen, setInviteModalOpen] = useState(false);
    
    // 회원가입, 비밀번호 찾기 모달은 Header가 직접 제어
    const signupModal = useDisclosure();
    const forgotModal = useDisclosure();
    
    const { t, i18n } = useTranslation();
    const [lang, setLang] = useState(i18n.language || "kr");
    const BASE_URL = "http://20.196.89.99:8080";

    // URL 경로에 따라 동적 탭 제어
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

    // ✅ 2. Header가 자체적으로 로그인 상태를 확인하던 useEffect를 제거합니다.
    // 이 역할은 이제 AuthContext가 전담합니다.

    // 로그인 상태일 때만 초대 알림 목록을 불러옵니다.
    useEffect(() => {
        const fetchInvitations = async () => {
            if (!isInitialized || !isLoggedIn) {
                setNotifications([]); // 로그아웃 시 알림 초기화
                return;
            }
            try {
                const token = localStorage.getItem('ACCESS_TOKEN_KEY');
                const response = await fetch(`${BASE_URL}/api/projects/invitations`, {
                    headers: { 'Authorization': `Bearer ${token}` },
                });
                if (!response.ok) throw new Error('Failed to fetch invitations');
                
                const data = await response.json();
                
                // ⭐ 중요: 서버 응답의 'status' 필드가 'PENDING'인 초대만 필터링합니다.
                const pendingInvitations = data.filter(invite => invite.status === 'PENDING');
                const formattedNotifications = pendingInvitations.map(invite => ({
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

 

    // --- 핸들러 함수들 ---
    const handleLogout = () => {
        logout();
        navigate("/");
    };

    // ✅ 3. 이 함수는 이제 모달 닫기와 페이지 이동만 책임집니다.
    const handleLoginSuccess = () => {
        closeLoginModal();      // AuthContext를 통해 모달을 닫습니다.
        //navigate('/dashboard'); // 대시보드로 페이지를 이동시킵니다.
        window.location.reload();
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
    if (isLoggedIn === null) {
      return null; // 또는 로딩 스피너
    }

    return (
        <Box borderBottom="1px solid" borderColor="gray.200" bg="white" px={4} py={2}>
            <Flex align="center">
                <HStack spacing={2}>
                    <NavLink to="/">
                        <Image boxSize={50} src="/로고.png" alt="Logo" borderRadius="md" objectFit="contain" cursor="pointer" width={100} />
                    </NavLink>
                </HStack>

                <HStack spacing={6} ml={8}>
                    {/* ... NavLinks ... */}
                </HStack>

                <Spacer />

                <HStack spacing={2}>
                    <Button size="sm" variant="outline" color="gray.600" fontWeight="medium" onClick={toggleLang}>
                        {lang.toUpperCase()}
                    </Button>
                    {isInitialized && ( 
                        <>
                    
                    {isLoggedIn && (
                        <Menu>
                            <MenuButton as={IconButton} variant="ghost" icon={
                                <Box position="relative">
                                    <FiBell size={22} />
                                    {notifications.length > 0 && (
                                        <Badge colorScheme="orange" variant="solid" borderRadius="full" position="absolute" top="-1px" right="-1px" fontSize="0.6em">
                                            {notifications.length}
                                        </Badge>
                                    )}
                                </Box>
                            } />
                            <MenuList>
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
                    </>
                    )}

                    <Menu>
                        <MenuButton as={IconButton} icon={<Avatar size="sm" bg="#d57239" />} variant="ghost" borderRadius="full" />
                        <MenuList>
                            {isLoggedIn ? (
                                <>
                                    <MenuItem onClick={() => navigate("/mypage")}>{t("My Page")}</MenuItem>
                                    <MenuItem onClick={handleLogout}>{t("Logout")}</MenuItem>
                                </>
                            ) : (
                                <>
                                    <MenuItem onClick={openLoginModal}>
                                        {t("Login")}
                                    </MenuItem>
                                    <MenuItem onClick={signupModal.onOpen}>{t("Sign Up")}</MenuItem>
                                </>
                            )}
                        </MenuList>
                    </Menu>
                </HStack>
            </Flex>

            {/* Modals */}
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
