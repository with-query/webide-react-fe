/*import { Box } from "@chakra-ui/react";
import CodeEditor from "./components/CodeEditor";

function App() {
  return (
    <Box minH="100vh" bg="#0f0a19" color="gray.500" px={6} py={8}>
      <CodeEditor />
    </Box>
  );
}

export default App;*/
/*
import { useState } from "react";
import { Box, HStack } from "@chakra-ui/react";
import CodeEditor from "./components/CodeEditor";
import FileSidebar from "./components/FileSidebar";
import { CODE_SNIPPETS } from "./constants";

function App() {
  
  const [activeFile, setActiveFile] = useState("main.js");

  const [files, setFiles] = useState({
  "main.js": {
    isFolder: false,
    language: "javascript",
    content: CODE_SNIPPETS["javascript"],
  },
});

const handleAddFile = (filename, isFolder = false) => {
  if (files[filename]) return; // 중복 방지

  const ext = filename.split(".").pop();
  const lang =
    ext === "ts"
      ? "typescript"
      : ext === "py"
      ? "python"
      : ext === "java"
      ? "java"
      : ext === "cs"
      ? "csharp"
      : ext === "php"
      ? "php"
      : "javascript";

  setFiles((prev) => ({
    ...prev,
    [filename]: {
      isFolder,
      language: isFolder ? null : lang,
      content: isFolder ? "" : CODE_SNIPPETS[lang],
    },
  }));

  if (!isFolder) setActiveFile(filename);
};
  const updateFileContent = (filename, content) => {
    setFiles((prev) => ({
      ...prev,
      [filename]: { ...prev[filename], content },
    }));
  };

  const updateFileLanguage = (filename, language) => {
  setFiles((prev) => ({
    ...prev,
    [filename]: {
      ...prev[filename],
      language,
      content: CODE_SNIPPETS[language], // ✅ 무조건 해당 언어 기본값으로 덮어씀
    },
  }));
};


  const resetFileContent = (filename) => {
    setFiles((prev) => ({
      ...prev,
      [filename]: {
        ...prev[filename],
        content: CODE_SNIPPETS[prev[filename].language],
      },
    }));
  };

  return (
    <HStack align="start" spacing={0} minH="100vh" bg="#0f0a19">
      <FileSidebar
        files={files}
        activeFile={activeFile}
        onAddFile={handleAddFile}
        onSelectFile={setActiveFile}
      />
      <CodeEditor
        file={files[activeFile]}
        filename={activeFile}
        onChange={(value) => updateFileContent(activeFile, value)}
        onLanguageChange={(lang) => updateFileLanguage(activeFile, lang)}
        onReset={() => resetFileContent(activeFile)}
      />
    </HStack>
  );
}

export default App;

*/
import { ChakraProvider, Flex } from "@chakra-ui/react";
import { useState } from "react";
import FolderSidebar from "./components/FolderSidebar";
import CodeEditor from "./components/CodeEditor";
import { CODE_SNIPPETS } from "./constants";

const initialTree = [
  {
    id: "root",
    name: "src",
    type: "folder",
    isOpen: true,
    children: [
      {
        id: "file-1",
        name: "hello.js",
        type: "file",
        language: "javascript",
        content: CODE_SNIPPETS.javascript,
      },
    ],
  },
];

function App() {
  const [tree, setTree] = useState(initialTree);
  const [activeFile, setActiveFile] = useState(null);

  const updateContent = (content) => {
    if (!activeFile) return;
    // 트리에서 파일 콘텐츠 갱신
    const updateNodeContent = (nodes) =>
      nodes.map((node) => {
        if (node.id === activeFile.id && node.type === "file") {
          return { ...node, content };
        }
        if (node.children) {
          return { ...node, children: updateNodeContent(node.children) };
        }
        return node;
      });
    setTree((prev) => updateNodeContent(prev));
    // activeFile content도 동기화
    setActiveFile((prev) => ({ ...prev, content }));
  };

  const changeLanguage = (lang) => {
    if (!activeFile) return;
    // 트리 내 파일 언어 변경
    const updateNodeLang = (nodes) =>
      nodes.map((node) => {
        if (node.id === activeFile.id && node.type === "file") {
          return { ...node, language: lang };
        }
        if (node.children) {
          return { ...node, children: updateNodeLang(node.children) };
        }
        return node;
      });
    setTree((prev) => updateNodeLang(prev));
    setActiveFile((prev) => ({ ...prev, language: lang }));
  };

  return (
    <ChakraProvider>
      <Flex height="100vh" bg="#1a202c" color="white" overflow="hidden">
        <FolderSidebar
          tree={tree}
          setTree={setTree}
          onSelectFile={setActiveFile}
          activeFileId={activeFile?.id}
        />
        <CodeEditor
          file={activeFile}
          onChangeContent={updateContent}
          onLanguageChange={changeLanguage}
          onReset={() => {
            if (!activeFile) return;
            updateContent(CODE_SNIPPETS[activeFile.language]);
          }}
        />
      </Flex>
    </ChakraProvider>
  );
}

export default App;
