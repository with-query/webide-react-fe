
import { useRef, useEffect, useState } from "react";
import { Box, HStack } from "@chakra-ui/react";
import { Editor } from "@monaco-editor/react";
import LanguageSelector from "./LanguageSelector";
import Output from "./Output";
import { CODE_SNIPPETS } from "../constants";
import { useTranslation } from "react-i18next";


const CodeEditor = ({ file, onChangeContent, onLanguageChange }) => {
  const editorRef = useRef();
  const [value, setValue] = useState("");
  const { t } = useTranslation();

  // 파일이 바뀌면 해당 언어의 기본 스니펫으로 초기화
  useEffect(() => {
  if (file) {
    const defaultSnippet = CODE_SNIPPETS[file.language] ?? "";

    // 내용이 없을 때만 초기화 (이미 작성된 코드 덮어쓰지 않도록)
    if (!file.content || file.content.trim() === "") {
      setValue(defaultSnippet);
      onChangeContent(defaultSnippet); // 최초 1회만 초기화
    } else {
      setValue(file.content);
    }
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
    // 언어 변경
    onLanguageChange(lang);

    // 언어에 맞는 스니펫으로 변경
    const newSnippet = CODE_SNIPPETS[lang] ?? "";
    setValue(newSnippet);
    onChangeContent(newSnippet);
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
      <HStack spacing={4} align="start">
        <Box w="50%">
          <LanguageSelector
            language={file.language}
            onSelect={handleLanguageChange}
          />
          <Box border="1px solid black" borderRadius="md" overflow="hidden" >
            <Editor
              key={`${file.id}-${file.language}`} // 언어 변경 감지
              height="75vh"

              language={file.language}
              value={value}
              onChange={handleEditorChange}
              onMount={onMount}
              options={{
                minimap: { enabled: false },
              }}
            />
          </Box>
        </Box>
        <Output editorRef={editorRef} language={file.language} />
      </HStack>
    </Box>
  );
};

export default CodeEditor;

/*
import { useRef, useEffect, useState } from "react";
import { Box, HStack } from "@chakra-ui/react";
import { Editor } from "@monaco-editor/react";
import LanguageSelector from "./LanguageSelector";
import Output from "./Output";
import { CODE_SNIPPETS } from "../constants";
import { useTranslation } from "react-i18next";


const CodeEditor = ({ file, onChangeContent, onLanguageChange }) => {
  const editorRef = useRef();
  const [value, setValue] = useState("");
  const { t } = useTranslation();

  // 파일이 바뀌면 해당 언어의 기본 스니펫으로 초기화
  useEffect(() => {
  if (file) {
    const defaultSnippet = CODE_SNIPPETS[file.language] ?? "";

    // 내용이 없을 때만 초기화 (이미 작성된 코드 덮어쓰지 않도록)
    if (!file.content || file.content.trim() === "") {
      setValue(defaultSnippet);
      onChangeContent(defaultSnippet); // 최초 1회만 초기화
    } else {
      setValue(file.content);
    }
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
    // 언어 변경
    onLanguageChange(lang);

    // 언어에 맞는 스니펫으로 변경
    const newSnippet = CODE_SNIPPETS[lang] ?? "";
    setValue(newSnippet);
    onChangeContent(newSnippet);
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
      <HStack spacing={4} align="start">
        <Box w="50%">
          <LanguageSelector
            language={file.language}
            onSelect={handleLanguageChange}
          />
          <Box border="1px solid black" borderRadius="md" overflow="hidden" >
            <Editor
              key={`${file.id}-${file.language}`} // 언어 변경 감지
              height="75vh"

              language={file.language}
              value={value}
              onChange={handleEditorChange}
              onMount={onMount}
              options={{
                minimap: { enabled: false },
              }}
            />
          </Box>
        </Box>
        <Output editorRef={editorRef} language={file.language} />
      </HStack>
    </Box>
  );
};

export default CodeEditor;*/