import { useParams } from "react-router-dom";
import { Flex } from "@chakra-ui/react";
import { useState } from "react";
import FolderSidebar from "../components/FolderSidebar";
import CodeEditor from "../components/CodeEditor";
import { CODE_SNIPPETS } from "../constants";

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

function Editor() {
  const { projectId } = useParams(); // "/editor/:projectId"에서 추출
  const [tree, setTree] = useState(initialTree);
  const [activeFile, setActiveFile] = useState(null);

  const updateContent = (content) => {
    if (!activeFile) return;
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
    setActiveFile((prev) => ({ ...prev, content }));
  };

  const changeLanguage = (lang) => {
    if (!activeFile) return;
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
    <Flex height="90vh" overflow="hidden" bg="brand.100" >
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
  );
}

export default Editor;
