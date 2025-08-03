// src/pages/Workspace/components/CodeEditor.jsx

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
import { Editor } from "@monaco-editor/react";

import LanguageSelector from "../../../components/LanguageSelector";
import { CODE_SNIPPETS } from "../../../constants";
import { useTranslation } from "react-i18next";
import { executeCode } from "../../../api";

const WorkspaceCodeEditor = ({ 
    file, 
    sql,
    setSql,
    onRunQuery,
    isExecuting,
    onChangeContent, 
    onLanguageChange, 
    onSave, 
    isSaving,
    isReadOnly,
    showLanguageSelector = true,
}) => {
    const editorRef = useRef();
    const [value, setValue] = useState("");
    const { t } = useTranslation();
    const toast = useToast();
    
    const [isLoading, setIsLoading] = useState(false);

    const runCode = async () => {
        const sourceCode = editorRef.current.getValue();
        if (!sourceCode) return;

        if (onRunQuery) {
            await onRunQuery(sourceCode);
            return;
        }

        try {
            setIsLoading(true);
            await executeCode(file.language, sourceCode);
            toast({
                title: "Code executed successfully.",
                status: "success",
            });
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

    useEffect(() => {
        if (isReadOnly && file) {
            setValue(file.content || "");
        } else if (file) {
            setValue(file.content || CODE_SNIPPETS[file.language] || "");
        } else {
            setValue(sql || "/* 테이블을 캔버스로 드래그하세요. */");
        }
    }, [file, sql, isReadOnly]);

    const onMount = (editor) => {
        editorRef.current = editor;
        editor.focus();
    };

    const handleEditorChange = (newValue) => {
        setValue(newValue);
        if ((file && file.language === 'sql') || !file) {
            if (setSql) setSql(newValue);
        } else {
            if (onChangeContent) onChangeContent(newValue);
        }
    };

    const handleLanguageChange = (lang) => {
        if(onLanguageChange) {
            onLanguageChange(lang);
        }
    };

    if (!file && !sql) {
        return (
            <Center w="100%" h="100%" bg="#FFFFFF" color="gray.500" border="1px solid" borderColor="gray.200" borderRadius="md">
                <Text fontSize="lg">{t("Select a file or build a query")}</Text>
            </Center>
        );
    }

    return (
        <Flex direction="column" h="100%" w="100%" bg="brand.100" p={3}>
            <HStack spacing={2} mb={2}> 
                <Text fontSize="sm" fontWeight="bold" color="gray.600">
                    {file ? file.name : 'Generated SQL'}
                    {isReadOnly ? " (Read Only)" : ""}
                </Text>
                <Spacer />
                {file && showLanguageSelector && (
                    <LanguageSelector language={file.language} onSelect={handleLanguageChange} />
                )}
                <Button size="sm" colorScheme="orange" isLoading={isLoading || isExecuting} onClick={runCode}>
                    Run
                </Button>
                <Button size="sm" variant="outline" colorScheme="gray" onClick={onSave} isLoading={isSaving}>
                    Save
                </Button>
            </HStack>
            <Box flex="1" overflow="hidden" minHeight="0" bg="white" borderWidth="1px" borderColor="gray.200" borderRadius="md">
                <Editor
                    key={file?.id || 'sql-editor'}
                    height="100%"
                    language={file?.language || 'sql'}
                    value={value}
                    onChange={handleEditorChange}
                    onMount={onMount}
                    theme="light"
                    options={{ 
                        minimap: { enabled: false },
                        readOnly: isReadOnly,
                        fontSize: 14,
                        wordWrap: 'on',
                        // 안쪽 여백을 조금 더 줍니다.
                        padding: {
                            top: 10,
                            bottom: 10
                        },
                        scrollbar: {
                            verticalScrollbarSize: 10,
                            horizontalScrollbarSize: 10
                        }
                    }}
                />
            </Box>
        </Flex>
    );
};

export default WorkspaceCodeEditor;