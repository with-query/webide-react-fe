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

export default function MyPage() {
  const theme = useTheme();

  return (
    <Box p={8} bg="brand.100" minH="100vh">
      <Text fontSize="2xl" fontWeight="bold" mb={6} color="text.primary">
        마이페이지
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
              이름
            </Text>
            <Text color="text.tertiary" mb={4}>
              kim@example.com
            </Text>

            <Flex w="100%" justify="space-between" color="text.tertiary">
              <Text>가입일</Text>
              <Text>2023.01.15</Text>
            </Flex>
            <Flex w="100%" justify="space-between" color="text.tertiary" mt={2}>
              <Text>최근 접속일</Text>
              <Text>2023.06.20</Text>
            </Flex>
            <Flex w="100%" justify="space-between" mt={2}>
              <Text color="text.tertiary">계정 상태</Text>
              
              <Badge color="text.tertiary" bg="none" fontWeight="bold" >
                활성
              </Badge>
            </Flex>
          </Flex>
        </Box>

        {/* 오른쪽 카드: 기본 정보 수정 */}
        <Box p={6} bg="white" borderRadius="xl" boxShadow="md">
          <Text fontWeight="semibold" mb={4} color="text.primary">
            기본 정보
          </Text>
          <Input placeholder="닉네임"  mb={3} />
          <Input placeholder="이메일"  mb={3} />
          <Input placeholder="전화번호" defaultValue="010-1234-5678" mb={3} />
          <Input placeholder="부서" defaultValue="개발팀" mb={3} />
          <Button variant="solid">저장</Button>
        </Box>
      </SimpleGrid>
    </Box>
  );
}
