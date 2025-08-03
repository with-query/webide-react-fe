import { useState } from "react";
import { Link, useLocation } from "wouter";
import {
  Box,
  Flex,
  Text,
  Button,
  Avatar,
  AvatarBadge,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Spinner,
  useTheme, // Chakra UI 테마 접근을 위해 추가
} from "@chakra-ui/react";
import {
  Database,
  Save,
  Share,
  Home,
  Code,
  User,
  MessageCircle,
  ChevronDown, // 드롭다운 메뉴 아이콘을 위해 추가
} from "lucide-react"; // lucide-react 아이콘은 그대로 사용

import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/lib/i18n";
import LanguageSwitcher from "@/components/LanguageSwitcher"; // 이 컴포넌트도 Chakra UI 기반으로 변환되어야 함

interface NavigationProps {
  currentProject?: any;
  onSaveProject?: () => void;
  isSaving?: boolean;
}

export default function Navigation({ currentProject, onSaveProject, isSaving }: NavigationProps) {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [location] = useLocation();
  const theme = useTheme(); // Chakra UI 테마를 사용하여 색상 접근

  // Chakra UI의 사용자 정의 색상 매핑 (main.jsx의 theme.colors에 정의되어 있다고 가정)
  // 예: 'soft-orange' -> theme.colors['soft-orange'] 또는 'orange.400'
  // 'dark-text' -> theme.colors['dark-text'] 또는 'gray.800'
  // 'border' -> theme.colors['border'] 또는 'gray.200'
  // 'muted-foreground' -> theme.colors['muted-foreground'] 또는 'gray.500'

  return (
    <Box
      as="nav"
      bg="white"
      borderBottom="1px"
      borderColor="gray.200" // border-border
      px={6}
      py={3}
    >
      <Flex alignItems="center" justifyContent="space-between">
        <Flex alignItems="center" gap={6}> {/* space-x-6 */}
          {/* Logo */}
          <Link href="/">
            <Flex alignItems="center" gap={2} cursor="pointer"> {/* space-x-2 */}
              <Flex
                w={8}
                h={8}
                bg="orange.400" // bg-soft-orange (Chakra UI 기본 팔레트 사용 또는 사용자 정의 테마 색상)
                borderRadius="lg"
                alignItems="center"
                justifyContent="center"
              >
                <Database size={16} color="white" /> {/* w-4 h-4 */}
              </Flex>
              <Text fontWeight="semibold" fontSize="xl" color="gray.800"> {/* text-dark-text */}
                {t('brand.name')}
              </Text>
            </Flex>
          </Link>

          {/* Navigation Links */}
          <Flex alignItems="center" gap={1}> {/* space-x-1 */}
            <Link href="/">
              <Button
                variant={location === "/" ? "solid" : "ghost"}
                size="sm"
                bg={location === "/" ? "orange.400" : undefined} // bg-soft-orange
                color={location === "/" ? "white" : "gray.800"}
                _hover={{
                  bg: location === "/" ? "orange.500" : "gray.100",
                  color: location === "/" ? "white" : "gray.800",
                }}
              >
                <Home size={16} style={{ marginRight: '8px' }} /> {/* w-4 h-4 mr-2 */}
                {t('navigation.dashboard')}
              </Button>
            </Link>
            <Link href="/ide">
              <Button
                variant={location.startsWith("/ide") ? "solid" : "ghost"}
                size="sm"
                bg={location.startsWith("/ide") ? "orange.400" : undefined}
                color={location.startsWith("/ide") ? "white" : "gray.800"}
                _hover={{
                  bg: location.startsWith("/ide") ? "orange.500" : "gray.100",
                  color: location.startsWith("/ide") ? "white" : "gray.800",
                }}
              >
                <Code size={16} style={{ marginRight: '8px' }} />
                {t('navigation.ide')}
              </Button>
            </Link>
            <Link href="/chat">
              <Button
                variant={location === "/chat" ? "solid" : "ghost"}
                size="sm"
                bg={location === "/chat" ? "orange.400" : undefined}
                color={location === "/chat" ? "white" : "gray.800"}
                _hover={{
                  bg: location === "/chat" ? "orange.500" : "gray.100",
                  color: location === "/chat" ? "white" : "gray.800",
                }}
              >
                <MessageCircle size={16} style={{ marginRight: '8px' }} />
                {t('navigation.chat')}
              </Button>
            </Link>
          </Flex>

          {/* Project Selector (only in IDE) */}
          {location.startsWith("/ide") && (
            <Flex alignItems="center" gap={2}> {/* space-x-2 */}
              <Text fontSize="sm" color="gray.500"> {/* text-muted-foreground */}
                {t('navigation.project')}:
              </Text>
              <Text fontSize="sm" fontWeight="medium">
                {currentProject?.name || t('navigation.untitledProject')}
              </Text>
            </Flex>
          )}
        </Flex>

        <Flex alignItems="center" gap={4}> {/* space-x-4 */}
          {/* IDE Actions */}
          {location.startsWith("/ide") && onSaveProject && (
            <>
              <Button
                onClick={onSaveProject}
                isDisabled={isSaving}
                bg="orange.400" // bg-soft-orange
                _hover={{ bg: "orange.500" }} // hover:bg-soft-orange/90
                color="white"
                size="sm"
              >
                {isSaving ? (
                  <Spinner size="sm" mr={2} />
                ) : (
                  <Save size={16} style={{ marginRight: '8px' }} />
                )}
                {isSaving ? t('navigation.saving') : t('navigation.saveProject')}
              </Button>
              <Button variant="outline" size="sm">
                <Share size={16} style={{ marginRight: '8px' }} />
                {t('navigation.share')}
              </Button>
            </>
          )}

          {/* Language Switcher (Assuming it's Chakra UI compatible or handles its own styling) */}
          <LanguageSwitcher />

          {/* User Menu */}
          <Menu>
            <MenuButton
              as={Button}
              variant="ghost"
              display="flex"
              alignItems="center"
              gap={2} // space-x-2
              p={2}
            >
              <Avatar w={8} h={8} src={user?.profileImageUrl}> {/* w-8 h-8 */}
                <AvatarBadge boxSize="1em" bg="green.500" /> {/* 온라인 상태 등을 표시할 수 있는 배지 (선택 사항) */}
                <Text
                  as="span"
                  fontSize="sm" // text-xs
                  fontWeight="bold"
                  color="white"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  bg="orange.400" // bg-soft-orange (fallback 배경)
                  borderRadius="full"
                  w="100%"
                  h="100%"
                >
                  {user?.firstName?.[0]?.toUpperCase() || "U"}
                </Text>
              </Avatar>
              <Text fontSize="sm" fontWeight="medium">
                {user?.firstName || "User"}
              </Text>
              <ChevronDown size={16} /> {/* 드롭다운 메뉴 아이콘 추가 */}
            </MenuButton>
            <MenuList minW="48"> {/* w-48 */}
              <Link href="/profile">
                <MenuItem cursor="pointer">
                  <User size={16} style={{ marginRight: '8px' }} />
                  {t('navigation.profile')}
                </MenuItem>
              </Link>
              <MenuItem
                cursor="pointer"
                onClick={() => window.location.href = "/api/logout"}
              >
                {t('navigation.logout')}
              </MenuItem>
            </MenuList>
          </Menu>
        </Flex>
      </Flex>
    </Box>
  );
}
