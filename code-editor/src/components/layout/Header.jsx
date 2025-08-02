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
import { CopyIcon } from "@chakra-ui/icons";
// useParams와 useEffect를 추가로 import 합니다.
import { NavLink, useLocation, useNavigate, useParams } from "react-router-dom";
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
    // URL로부터 projectId 파라미터를 가져옵니다.
    const { projectId } = useParams(); 

    // --- START: 주요 로직 변경 ---
    // IDE, 쿼리빌더 탭을 보여줄지 결정하는 상태
    const [showProjectTabs, setShowProjectTabs] = useState(false);
    const [currentProjectId, setCurrentProjectId] = useState(null);

    useEffect(() => {
        // 정규식을 사용해 /editor/ 또는 /query-builder/ 뒤의 ID 값을 추출합니다.
        const match = location.pathname.match(/^\/(editor|query-builder)\/([^/]+)/);

        if (match && match[2]) {
            // URL 패턴이 일치하면, 탭을 보여주고 ID를 상태에 저장합니다.
            setShowProjectTabs(true);
            setCurrentProjectId(match[2]);
        } else {
            // 일치하지 않으면 탭을 숨깁니다.
            setShowProjectTabs(false);
            setCurrentProjectId(null);
        }
    }, [location.pathname]);

    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const loginModal = useDisclosure();
    const signupModal = useDisclosure();
    const forgotModal = useDisclosure();
    
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
        setNotifications((prev) => prev.filter((n) => n.id !== selectedNotification.id));
        setInviteModalOpen(false);
    };

    const handleDecline = () => {
        setNotifications((prev) => prev.filter((n) => n.id !== selectedNotification.id));
        setInviteModalOpen(false);
    };

    const isActive = (path) => location.pathname.startsWith(path);

    const handleLogout = () => {
        localStorage.removeItem("token");
        setIsLoggedIn(false);
    };

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

                {/* 내비게이션 탭 */}
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

                    {/* --- START: 조건부 렌더링 및 동적 경로 적용 --- */}
                    {/* showProjectTabs가 true일 때만 IDE와 Query Builder 탭을 렌더링합니다. */}
                    {showProjectTabs && (
                        <>
                            {/* NavLink의 to 속성에 projectId를 포함시켜 동적으로 경로를 생성합니다. */}
                            <NavLink to={`/editor/${currentProjectId}`}>
                                <Text
                                    cursor="pointer"
                                    color={isActive(`/editor/`) ? "orange.500" : "gray.600"}
                                    borderBottom={isActive(`/editor/`) ? "2px solid orange" : "2px solid transparent"}
                                    fontWeight="medium"
                                >
                                    {t("IDE")}
                                </Text>
                            </NavLink>

                            <NavLink to={`/query-builder/${currentProjectId}`}>
                                <Text
                                    fontWeight="medium"
                                    cursor="pointer"
                                    borderBottom={isActive(`/query-builder/`) ? "2px solid orange" : "2px solid transparent"}
                                    color={isActive(`/query-builder/`) ? "orange.500" : "gray.600"}
                                >
                                    {t("Query Builder")}
                                </Text>
                            </NavLink>
                        </>
                    )}
                    {/* --- END: 조건부 렌더링 및 동적 경로 적용 --- */}

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

                {/* 오른쪽 메뉴 (언어, 알림, 프로필) */}
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
                        variant="ghost"
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
