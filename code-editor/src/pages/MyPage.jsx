import {
  Box,
  Flex,
  Avatar,
  Text,
  SimpleGrid,
  Input,
  Button,
  Badge,
  useTheme,
} from "@chakra-ui/react";
import { useTranslation } from "react-i18next";

export default function MyPage() {
  const theme = useTheme();
  const { t } = useTranslation();

  return (
    <Box p={8} bg="brand.100" minH="100vh">
      <Text fontSize="2xl" fontWeight="bold" mb={6} color="text.primary">
        {t("My Page")}
      </Text>

      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
        {/* 왼쪽 카드: 사용자 정보 */}
        <Box p={6} bg="white" borderRadius="xl" boxShadow="md">
          <Flex direction="column" align="center">
            <Avatar
              size="xl"
              src="/profile.png"
              border={`4px solid ${theme.colors.brand[500]}`} // 테마 색 참조
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
              
              <Badge color="text.tertiary" bg="none" fontWeight="bold" >
                {t("Active")}
              </Badge>
            </Flex>
          </Flex>
        </Box>

        {/* 오른쪽 카드: 기본 정보 수정 */}
        <Box p={6} bg="white" borderRadius="xl" boxShadow="md">
          <Text fontWeight="semibold" mb={4} color="text.primary">
            {t("Information")}
          </Text>
          <Input placeholder={t("Nickname")}  mb={3} />
          <Input placeholder={t("Email")}  mb={3} />
          <Input placeholder={t("Number")} defaultValue="010-1234-5678" mb={3} />
          <Input placeholder={t("Department")} defaultValue="개발팀" mb={3} />
          <Button variant="solid">{t("Save")}</Button>
        </Box>
      </SimpleGrid>
    </Box>
  );
}
