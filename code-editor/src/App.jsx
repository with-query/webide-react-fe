/*
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
*/

/*
import { ChakraProvider } from "@chakra-ui/react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Editor from "./pages/Editor";
import Header from "./components/layout/Header";

function App() {
  return (
    <ChakraProvider>
      <Header />
      <Router>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/editor/:projectId" element={<Editor />} />
        </Routes>
      </Router>
    </ChakraProvider>
  );
}

export default App;
*/
// src/App.jsx
import { ChakraProvider } from "@chakra-ui/react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
} from "react-router-dom";

import Header from "./components/layout/Header";
//import QueryBuilder from "./pages/QueryBuilder";
//import Settings from "./pages/Settings";
import Dashboard from "./pages/Dashboard";
import Editor from "./pages/Editor";
//import Chat from "./pages/Chat";

function App() {
  return (
    <ChakraProvider>
      <Router>
        <Header />
        <Routes>
         {/* <Route path="/query-builder" element={<QueryBuilder />} />*/}
         {/* <Route path="/settings" element={<Settings />} />*/}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/ide" element={<Editor />} />
         {/* <Route path="/chat" element={<Chat />} />*/}
        </Routes>
      </Router>
    </ChakraProvider>
  );
}

export default App;
