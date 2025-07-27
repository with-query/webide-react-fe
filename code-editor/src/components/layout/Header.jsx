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
} from "@chakra-ui/react";
import { CopyIcon } from "@chakra-ui/icons";
import { NavLink, useLocation } from "react-router-dom";
import { Image } from "@chakra-ui/react";
import { useState } from "react";
import LoginModal from "../modals/LoginModal";
import SignupModal from "../modals/SignUpModal";
import ForgotPasswordModal from "../modals/ForgotPasswordModal";

import { useNavigate } from "react-router-dom";

const Header = () => {
    const location = useLocation();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const loginModal = useDisclosure();
    const signupModal = useDisclosure();
    const forgotModal = useDisclosure();
    
    const navigate = useNavigate();

    // 현재 경로 기반으로 active 상태 결정
    const isActive = (path) => location.pathname.startsWith(path);

    const handleLogout = () => {
    setIsLoggedIn(false);
    // 필요하면 localStorage 초기화도
  };

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
                <NavLink to="/query-builder">
                    <Text
                    fontWeight="medium"
                    cursor="pointer"
                    borderBottom={isActive("/query-builder") ? "2px solid orange" : "none"}
                    color={isActive("/query-builder") ? "orange.500" : "gray.600"}
                    pb={1}
                    >
                    쿼리 빌더
                    </Text>
                </NavLink>

                <NavLink to="/settings">
                    <Text
                        fontWeight="medium"
                        cursor="pointer"
                        borderBottom={isActive("/settings") ? "2px solid orange" : "none"}
                        color={isActive("/settings") ? "orange.500" : "gray.600"}
                        pb={1}
                    >
                    설정
                    </Text>
                </NavLink>
            </HStack>

            <Spacer />

        {/* 실행/저장/공유 버튼 */}
        {/*<HStack spacing={3}>
          <Button colorScheme="orange" size="sm">
            실행
          </Button>
          <Button variant="outline" size="sm"color="gray.600"
            fontWeight="medium">
            저장
          </Button>
          <Button variant="outline" size="sm"color="gray.600"
            fontWeight="medium">
            공유
          </Button>
        </HStack>*/}

            {/* 네비게이션 메뉴 (대시보드, IDE, 채팅) */}
            <HStack spacing={4} ml={6}>
                <Button size="sm" variant="outline"
                    color="gray.600"
                    fontWeight="medium">
                    KR
                </Button>
                <NavLink to="/dashboard">
                    <Text
                    cursor="pointer"
                    color={isActive("/dashboard") ? "orange.500" : "gray.600"}
                    borderBottom={isActive("/dashboard") ? "2px solid orange" : "none"}
                    fontWeight="medium"
                    >
                    대시보드
                    </Text>
                </NavLink>

                <NavLink to="/ide">
                    <Text
                    cursor="pointer"
                    color={isActive("/ide") ? "orange.500" : "gray.600"}
                    borderBottom={isActive("/ide") ? "2px solid orange" : "none"}
                    fontWeight="medium"
                    >
                    IDE
                    </Text>
                </NavLink>

                <NavLink to="/chat">
                    <Text
                        cursor="pointer"
                        color={isActive("/chat") ? "orange.500" : "gray.600"}
                        borderBottom={isActive("/chat") ? "2px solid orange" : "none"}
                        fontWeight="medium"
                    >
                    채팅
                    </Text>
                </NavLink>
            </HStack>

            {/* 사용자 프로필 */}
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
                            <MenuItem bg="brand.100"  _hover={{ bg: "brand.300" }} onClick={() => navigate("/mypage")}>마이페이지</MenuItem>

                            <MenuItem bg="brand.100"  _hover={{ bg: "brand.300" }} onClick={handleLogout}>로그아웃</MenuItem>
                            </>
                        ) : (
                            <>
                            <MenuItem bg="brand.100"  _hover={{ bg: "brand.300" }} onClick={loginModal.onOpen}>로그인</MenuItem>
                            <MenuItem bg="brand.100"  _hover={{ bg: "brand.300" }} onClick={signupModal.onOpen}>회원가입</MenuItem>
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
