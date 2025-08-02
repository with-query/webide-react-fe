import { useRef, useEffect, useState } from "react";
import { 
    Box,
    Flex,
    HStack,
    Button,
    Spacer,
    Text,
    useToast 
} from "@chakra-ui/react";
import LanguageSelector from "../../../components/LanguageSelector";
import Output from "../../../components/Output";
import { CODE_SNIPPETS } from "../../../constants";
import { useTranslation } from "react-i18next";
import { executeCode } from "../../../api"; 


const CodeEditor = ({ 
  file, 
  onChangeContent, 
  onLanguageChange, 
  onSave, 
  isSaving,
  onRunQuery,      // Workspace에서 전달
  isExecuting,   // Workspace에서 전달
  isReadOnly       // Workspace에서 전달
}) => {
  const editorRef = useRef();
  const [value, setValue] = useState("");
  const { t } = useTranslation();
  const toast = useToast();
  
  // --- 코드 실행 관련 로직 ---
  const [output, setOutput] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  // 'Run Code' 버튼 클릭 시 실행될 함수
  const runCode = async () => {
    const sourceCode = editorRef.current.getValue();
    if (!sourceCode) return;
    try {
      setIsLoading(true);
      // onRunQuery prop이 있으면 사용하고, 없으면 executeCode를 직접 호출
      if (onRunQuery) {
        await onRunQuery(sourceCode); // Workspace는 자체 실행 로직 사용
      } else {
        const { run: result } = await executeCode(file.language, sourceCode);
        setOutput(result.output.split("\n"));
        result.stderr ? setIsError(true) : setIsError(false);
      }
    } catch (error) {
      console.log(error);
      toast({
        title: "An error occurred.",
        description: error.message || "Unable to run code",
        status: "error",
        duration: 6000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // file prop이 변경될 때 에디터 내용을 동기화
  useEffect(() => {
    if (file) {
      const defaultSnippet = CODE_SNIPPETS[file.language] ?? "";
      if (file.content) {
        setValue(file.content);
      } else {
        setValue(defaultSnippet);
        onChangeContent(defaultSnippet);
      }
      setOutput(null);
      setIsError(false);
    }
  }, [file]);

  const onMount = (editor) => {
    editorRef.current = editor;
    editor.focus();
  };

  const handleEditorChange = (newValue) => {
    setValue(newValue);
    onChangeContent(newValue);
  };

  const handleLanguageChange = (lang) => {
    onLanguageChange(lang);
  };

  // --- 렌더링 로직 ---

  if (!file) {
    return (
      <Box w="100%" p={10} textAlign="center" fontSize="xl" bg="brand.100" color="text.primary">
        {t("Select a file")}
      </Box>
    );
  }
  
  // ✅ 읽기 전용 모드일 때 보여줄 UI
  if (isReadOnly) {
    return (
      <Box p={4} bg="gray.100" h="100%" borderRadius="md" m={2}>
        <Text fontWeight="bold" mb={2}>읽기 전용</Text>
        <Text>쿼리빌더에서는 SQL 파일(.sql)만 편집할 수 있습니다.</Text>
        <Box as="pre" p={4} mt={4} bg="white" borderRadius="md" whiteSpace="pre-wrap" overflowX="auto">
          {file?.content}
        </Box>
      </Box>
    );
  }

  // 기본 편집 모드 UI
  return (
    <Box w="100%" bg="brand.100" color="text.primary" fontWeight="bold" m={2}>
      <Flex direction={{ base: "column", md: "row" }} gap={4}>
        
        {/* 왼쪽: 코드 에디터 영역 */}
        <Flex direction="column" w={{ base: "100%", md: "50%" }}>
          <HStack spacing={4} mb={2} h="32px"> 
            <LanguageSelector
              language={file.language}
              onSelect={handleLanguageChange}
            />
          </HStack>
          <Box border="1px solid #999" borderRadius="md" overflow="hidden">
            <Editor
              key={`${file.id}-${file.language}`}
              height="75vh"
              language={file.language}
              value={value}
              onChange={handleEditorChange}
              onMount={onMount}
              options={{ 
                minimap: { enabled: false },
                readOnly: isReadOnly // 에디터의 읽기 전용 옵션
              }}
            />
          </Box>
        </Flex>

        {/* 오른쪽: 아웃풋 영역 */}
        <Flex direction="column" w={{ base: "100%", md: "50%" }}>
          <HStack spacing={4} mb={2} h="32px">
            <Button
              size="sm"
              colorScheme="green"
              isLoading={isLoading || isExecuting} // 두 로딩 상태 모두 반영
              onClick={runCode}
            >
              Run Code
            </Button>
            <Spacer />
            <Button size="sm" variant="outline">
              공유
            </Button>
            <Button
              size="sm"
              colorScheme="orange"
              onClick={onSave}
              isLoading={isSaving}
            >
              저장
            </Button>
          </HStack>
          <Box flex="1" border="1px solid" borderColor={isError ? "red.500" : "#999"} borderRadius="md" overflow="hidden">
            <Output output={output} isError={isError} />
          </Box>
        </Flex>
      </Flex>
    </Box>
  );
};

export default CodeEditor;
