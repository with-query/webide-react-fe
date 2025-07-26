import {
  Box,
  Flex,
  HStack,
  Button,
  Spacer,
  Text,
  IconButton,
} from "@chakra-ui/react";
import { CopyIcon } from "@chakra-ui/icons";
import { NavLink, useLocation } from "react-router-dom";

const Header = () => {
  const location = useLocation();

  // 현재 경로 기반으로 active 상태 결정
  const isActive = (path) => location.pathname.startsWith(path);

  return (
    <Box borderBottom="1px solid" borderColor="gray.200" bg="white" px={4} py={2}>
      <Flex align="center">
        {/* 로고 */}
        <HStack spacing={2}>
          {/*<Image 
            boxSize={6} 
            src="/로고.png" 
            alt="Logo" 
            borderRadius="md" 
            objectFit="cover" 
  />*/}
          <Text fontWeight="bold" fontSize="lg" color="gray.700">
            쿼리랑
          </Text>
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
        <HStack spacing={3}>
          <Button colorScheme="orange" size="sm">
            실행
          </Button>
          <Button variant="outline" size="sm">
            저장
          </Button>
          <Button variant="outline" size="sm">
            공유
          </Button>
        </HStack>

        {/* 네비게이션 메뉴 (대시보드, IDE, 채팅) */}
        <HStack spacing={4} ml={6}>
          <Button size="sm" variant="outline">
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

        {/* 복사 아이콘 */}
        <IconButton
          icon={<CopyIcon />}
          size="sm"
          variant="ghost"
          color="gray.500"
          aria-label="Copy"
          ml={4}
        />
      </Flex>
    </Box>
  );
};

export default Header;
