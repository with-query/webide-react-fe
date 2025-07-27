import { Box, Flex, Tabs, TabList, TabPanels, Tab, TabPanel } from "@chakra-ui/react";
import FileTree from "./components/FileTree";
import QueryBuilder from "./components/QueryBuilder";
import CodeEditor from "./components/CodeEditor";

const Workspace = () => {
  return (
    <Flex direction="column" height="100%">
      {/* 상단 3분할 영역 */}
      <Flex flex="1" overflow="hidden">
        {/* 왼쪽: 파일/폴더 */}
        <Box width="250px" borderRight="1px solid #E2E8F0" bg="gray.50" p={2} overflowY="auto">
          <FileTree />
        </Box>

        {/* 가운데: 쿼리 빌더 */}
        <Box flex="1" borderRight="1px solid #E2E8F0" bg="gray.50" p={4} overflowY="auto">
          <QueryBuilder />
        </Box>

        {/* 오른쪽: 코드 에디터 */}
        <Box width="40%" bg="white" p={4} overflowY="auto">
          <CodeEditor />
        </Box>
      </Flex>

      {/* 하단: 결과 영역 */}
      <Box borderTop="1px solid #E2E8F0" height="250px" bg="white">
        <Tabs size="sm" colorScheme="orange">
          <TabList px={4} pt={2}>
            <Tab>데이터</Tab>
            <Tab>차트</Tab>
          </TabList>

          <TabPanels>
            <TabPanel>
              {/* 데이터 결과 영역 */}
              <Box>결과 테이블 들어갈 자리</Box>
            </TabPanel>
            <TabPanel>
              {/* 차트 영역 */}
              <Box>차트 컴포넌트 자리</Box>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>
    </Flex>
  );
};

export default Workspace;
