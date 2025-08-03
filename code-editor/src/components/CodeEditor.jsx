/*import { useRef, useEffect, useState } from "react";
import { 
    Box,
    Flex,
    HStack,
    Button,
    Spacer,
    useToast 
} from "@chakra-ui/react";
import { Editor } from "@monaco-editor/react";
import LanguageSelector from "./LanguageSelector";
import Output from "./Output";
import { CODE_SNIPPETS } from "../constants";
import { useTranslation } from "react-i18next";
import { executeCode } from "../api"; 

const CodeEditor = ({ file, onChangeContent, onLanguageChange, onSave, isSaving }) => {
  const editorRef = useRef();
  const [value, setValue] = useState("");
  const { t } = useTranslation();

  // --- 코드 실행 관련 로직 ---
  const toast = useToast();
  const [output, setOutput] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  // "Run Code" 버튼을 누르면 이 함수가 실행됩니다.
  const runCode = async () => {
    // 에디터에서 현재 코드를 가져옵니다.
    const sourceCode = editorRef.current.getValue();
    if (!sourceCode) return;
    try {
      setIsLoading(true); // 로딩 시작
      // API를 호출하여 코드를 실행합니다.
      const { run: result } = await executeCode(file.language, sourceCode);
      setOutput(result.output.split("\n"));
      result.stderr ? setIsError(true) : setIsError(false);
    } catch (error) {
      console.log(error);
      toast({
        title: "An error occurred.",
        description: error.message || "Unable to run code",
        status: "error",
        duration: 6000,
      });
    } finally {
      setIsLoading(false); // 로딩 종료
    }
  };
  // --- 코드 실행 로직 끝 ---

  useEffect(() => {
    if (file) {
      const defaultSnippet = CODE_SNIPPETS[file.language] ?? "";
      if (file.content) {
        setValue(file.content);
      } else {
        // 새 파일일 경우, 기본 스니펫으로 내용을 채우고 부모 상태도 업데이트합니다.
        setValue(defaultSnippet);
        onChangeContent(defaultSnippet);
      }
      // 파일이 변경되면 아웃풋을 초기화합니다.
      setOutput(null);
      setIsError(false);
    }
  }, [file, onChangeContent]);

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

  if (!file) {
    return (
      <Box w="100%" p={10} textAlign="center" fontSize="xl" bg="brand.100" color="text.primary">
        {t("Select a file")}
      </Box>
    );
  }

  return (
    <Box w="100%" bg="brand.100" color="text.primary" fontWeight="bold" m={2}>
      <Flex direction={{ base: "column", md: "row" }} gap={4}>
        
       
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
              options={{ minimap: { enabled: false } }}
            />
          </Box>
        </Flex>

       
        <Flex direction="column" w={{ base: "100%", md: "50%" }}>
          <HStack spacing={4} mb={2} h="32px">
            <Button
              size="sm"
              colorScheme="green"
              isLoading={isLoading}
              onClick={runCode}
            >
              {t("Run Code")}
            </Button>
            <Spacer />
            <Button size="sm" variant="outline">
              {t("Share")}
            </Button>
            <Button
              size="sm"
              colorScheme="orange"
              onClick={onSave}
              isLoading={isSaving}
            >
              {t("Save")}
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
*/


import { useRef, useEffect, useState } from "react";
import {
    Box,
    Flex,
    HStack,
    Button,
    Spacer,
    useToast
} from "@chakra-ui/react";
import { Editor } from "@monaco-editor/react";
import LanguageSelector from "./LanguageSelector";
import Output from "./Output";
import { CODE_SNIPPETS } from "../constants";
import { useTranslation } from "react-i18next";
import { executeCode } from "../api";

const CodeEditor = ({ file, onChangeContent, onLanguageChange, onSave, isSaving }) => {
    const editorRef = useRef();
    const [value, setValue] = useState("");
    const { t } = useTranslation();

    // --- 코드 실행 관련 로직 ---
    const toast = useToast();
    const [output, setOutput] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isError, setIsError] = useState(false);

    // "Run Code" 버튼을 누르면 이 함수가 실행됩니다.
    const runCode = async () => {
        // 에디터에서 현재 코드를 가져옵니다.
        const sourceCode = editorRef.current.getValue();
        if (!sourceCode) return;
        try {
            setIsLoading(true); // 로딩 시작
            // API를 호출하여 코드를 실행합니다.
            const { run: result } = await executeCode(file.language, sourceCode);
            setOutput(result.output.split("\n"));
            result.stderr ? setIsError(true) : setIsError(false);
        } catch (error) {
            console.log(error);
            toast({
                title: "An error occurred.",
                description: error.message || "Unable to run code",
                status: "error",
                duration: 6000,
            });
        } finally {
            setIsLoading(false); // 로딩 종료
        }
    };
    // --- 코드 실행 로직 끝 ---

    useEffect(() => {
        if (file) {
            // 파일이 폴더 타입인지 확인
            if (file.type === "DIRECTORY") {
                setValue(""); // 폴더일 경우 에디터 내용을 비웁니다.
                setOutput(null); // 아웃풋도 초기화
                setIsError(false);
            } else {
                // 파일일 경우, 내용을 설정합니다.
                const defaultSnippet = CODE_SNIPPETS[file.language] ?? "";
                if (file.content) {
                    setValue(file.content);
                } else {
                    // 새 파일일 경우, 기본 스니펫으로 내용을 채우고 부모 상태도 업데이트합니다.
                    setValue(defaultSnippet);
                    onChangeContent(defaultSnippet);
                }
                // 파일이 변경되면 아웃풋을 초기화합니다.
                setOutput(null);
                setIsError(false);
            }
        }
    }, [file, onChangeContent]);

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

    if (!file) {
        return (
            <Box w="100%" p={10} textAlign="center" fontSize="xl" bg="brand.100" color="text.primary">
                {t("Select a file")}
            </Box>
        );
    }

    // 파일이 폴더 타입일 경우 에디터 대신 메시지를 표시합니다.
    if (file.type === "DIRECTORY") {
        return (
            <Box w="100%" p={10} textAlign="center" fontSize="xl" bg="brand.100" color="text.primary">
                {t("Folders cannot be edited. Please select a file.")} {/* 폴더는 편집할 수 없습니다. 파일을 선택해주세요. */}
            </Box>
        );
    }

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
                            options={{ minimap: { enabled: false } }}
                        />
                    </Box>
                </Flex>

                {/* 오른쪽: 아웃풋 영역 */}
                <Flex direction="column" w={{ base: "100%", md: "50%" }}>
                    <HStack spacing={4} mb={2} h="32px">
                        <Button
                            size="sm"
                            colorScheme="green"
                            isLoading={isLoading}
                            onClick={runCode}
                        >
                            {t("Run Code")}
                        </Button>
                        <Spacer />
                        <Button size="sm" variant="outline">
                            {t("Share")}
                        </Button>
                        <Button
                            size="sm"
                            colorScheme="orange"
                            onClick={onSave}
                            isLoading={isSaving}
                        >
                            {t("Save")}
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
