import {
  Box,
  Flex,
  Avatar,
  Text,
  Input,
  Button,
  Badge,
  useTheme,
  InputGroup,
  InputRightElement,
  IconButton,
} from "@chakra-ui/react";
import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons";
import { useTranslation } from "react-i18next";
import { useState } from "react";

export default function MyPage() {
  const theme = useTheme();
  const { t } = useTranslation();

  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);

  return (
    <Box p={8} bg="brand.100" minH="90vh">
      <Text fontSize="2xl" fontWeight="bold" mb={6} color="text.primary">
        {t("My Page")}
      </Text>

      <Flex direction={{ base: "column", md: "row" }} gap={10} align="flex-start" >
        {/* 왼쪽: 사용자 정보 */}
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
            <Avatar
              size="xl"
              src="/profile.png"
              border={`4px solid ${theme.colors.brand[500]}`}
              mb={3}
            />
            <Text fontWeight="bold" fontSize="lg" color="text.primary">
              {t("Name")}
            </Text>
            <Text color="text.tertiary" mb={4}>
              kim@example.com
            </Text>

            <Flex w="100%" justify="space-between" color="text.tertiary">
              <Text>{t("Sign up date")}</Text>
              <Text>2023.01.15</Text>
            </Flex>
            <Flex w="100%" justify="space-between" color="text.tertiary" mt={2}>
              <Text>{t("Last access date")}</Text>
              <Text>2023.06.20</Text>
            </Flex>
            <Flex w="100%" justify="space-between" mt={2}>
              <Text color="text.tertiary">{t("Account status")}</Text>
              <Badge color="text.tertiary" bg="none" fontWeight="bold">
                {t("Active")}
              </Badge>
            </Flex>
          </Flex>
        </Box>

        {/* 오른쪽: 정보 수정 + 비밀번호 변경 */}
        <Flex direction="column" width={{ base: "100%", md: "50%" }} gap={6}>
          {/* 기본 정보 수정 */}
          <Box p={6} bg="white" borderRadius="xl" boxShadow="md" >
            <Text fontWeight="semibold" mb={4} color="text.primary">
              {t("Information")}
            </Text>
            <Input placeholder={t("Nickname")} mb={3} />
            <Input placeholder={t("Email")} mb={3} />
            <Input placeholder={t("Number")} defaultValue="010-1234-5678" mb={3} />
            <Input placeholder={t("Department")} defaultValue="개발팀" mb={3} />
            <Button variant="solid">{t("Save")}</Button>
          </Box>

          {/* 비밀번호 변경 */}
          <Box p={6} bg="white" borderRadius="xl" boxShadow="md">
            <Text fontWeight="semibold" mb={4} color="text.primary">
              {t("Change Password")}
            </Text>

            {/* 현재 비밀번호 */}
            <InputGroup mb={3}>
              <Input
                type={showCurrentPw ? "text" : "password"}
                placeholder={t("Current Password")}
              />
              <InputRightElement>
                <IconButton
                  variant="ghost"
                  size="sm"
                  icon={showCurrentPw ? <ViewOffIcon /> : <ViewIcon />}
                  onClick={() => setShowCurrentPw(!showCurrentPw)}
                  aria-label="Toggle password visibility"
                />
              </InputRightElement>
            </InputGroup>

            {/* 새 비밀번호 */}
            <InputGroup mb={3}>
              <Input
                type={showNewPw ? "text" : "password"}
                placeholder={t("New Password")}
              />
              <InputRightElement>
                <IconButton
                  variant="ghost"
                  size="sm"
                  icon={showNewPw ? <ViewOffIcon /> : <ViewIcon />}
                  onClick={() => setShowNewPw(!showNewPw)}
                  aria-label="Toggle password visibility"
                />
              </InputRightElement>
            </InputGroup>

            {/* 비밀번호 확인 */}
            <InputGroup mb={4}>
              <Input
                type={showConfirmPw ? "text" : "password"}
                placeholder={t("Confirm New Password")}
              />
              <InputRightElement>
                <IconButton
                  variant="ghost"
                  size="sm"
                  icon={showConfirmPw ? <ViewOffIcon /> : <ViewIcon />}
                  onClick={() => setShowConfirmPw(!showConfirmPw)}
                  aria-label="Toggle password visibility"
                />
              </InputRightElement>
            </InputGroup>

            <Button variant="outline" width="100%">
              {t("Change Password")}
            </Button>
          </Box>
        </Flex>
      </Flex>
    </Box>
  );
}
