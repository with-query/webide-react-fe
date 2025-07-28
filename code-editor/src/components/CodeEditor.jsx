/*import { useRef, useState } from "react";
import { Box, HStack } from "@chakra-ui/react";
import { Editor } from "@monaco-editor/react";
import LanguageSelector from "./LanguageSelector";
import { CODE_SNIPPETS } from "../constants";
import Output from "./Output";

const CodeEditor = () => {
  const editorRef = useRef();
  const [value, setValue] = useState("");
  const [language, setLanguage] = useState("javascript");

  const onMount = (editor) => {
    editorRef.current = editor;
    editor.focus();
  };

  const onSelect = (language) => {
    setLanguage(language);
    setValue(CODE_SNIPPETS[language]);
  };

  return (
    <Box>
      <HStack spacing={4}>
        <Box w="50%">
          <LanguageSelector language={language} onSelect={onSelect} />
          <Editor
            options={{
              minimap: {
                enabled: false,
              },
            }}
            height="75vh"
            theme="vs-dark"
            language={language}
            defaultValue={CODE_SNIPPETS[language]}
            onMount={onMount}
            value={value}
            onChange={(value) => setValue(value)}
          />
        </Box>
        <Output editorRef={editorRef} language={language} />
      </HStack>
    </Box>
  );
};
export default CodeEditor;
*/

/* 이거 file이랑 폴더는 만들어 지는데 내용이 갱신안됨
import { useRef, useState } from "react";
import { Box, HStack } from "@chakra-ui/react";
import { Editor } from "@monaco-editor/react";
import LanguageSelector from "./LanguageSelector";
import { CODE_SNIPPETS } from "../constants";
import Output from "./Output";

const CodeEditor = () => {
  const editorRef = useRef();
  const [value, setValue] = useState(CODE_SNIPPETS["javascript"]);
  const [language, setLanguage] = useState("javascript");

  const onMount = (editor) => {
    editorRef.current = editor;
    editor.focus();
  };

  const onSelect = (newLang) => {
    setLanguage(newLang);
    setValue(CODE_SNIPPETS[newLang]); // 새 언어에 맞는 코드 스니펫 적용
  };

  return (
    <Box>
      <HStack spacing={4} align="start">
        <Box w="50%">
          <LanguageSelector language={language} onSelect={onSelect} />
          <Editor
            key={language} // ← 이게 핵심! 언어 변경 시 에디터를 재마운트
            options={{ minimap: { enabled: false } }}
            height="75vh"
            theme="vs-dark"
            language={language}
            value={value}
            onMount={onMount}
            onChange={(val) => setValue(val)}
          />
        </Box>
        <Output editorRef={editorRef} language={language} />
      </HStack>
    </Box>
  );
};

export default CodeEditor;
*/
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
      <Box w="100%" p={10} textAlign="center" fontSize="xl">
        {t("Select a file")}
      </Box>
    );
  }

  return (
    <Box w="100%">
      <HStack spacing={4} align="start">
        <Box w="50%">
          <LanguageSelector
            language={file.language}
            onSelect={handleLanguageChange}
          />
          <Editor
            key={`${file.id}-${file.language}`} // 언어 변경 감지
            height="75vh"
            theme="vs-dark"
            language={file.language}
            value={value}
            onChange={handleEditorChange}
            onMount={onMount}
            options={{
              minimap: { enabled: false },
            }}
          />
        </Box>
        <Output editorRef={editorRef} language={file.language} />
      </HStack>
    </Box>
  );
};

export default CodeEditor;
