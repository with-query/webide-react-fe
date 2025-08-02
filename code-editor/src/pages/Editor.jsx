import { useParams } from "react-router-dom";
import { Flex, Spinner, Center } from "@chakra-ui/react";
import { useState, useEffect, useCallback } from "react";
import FolderSidebar from "../components/FolderSidebar";
import CodeEditor from "../components/CodeEditor";
import { useProjectTree } from "../hooks/useProjectTree";

function Editor() {
  const { projectId } = useParams(); 
  const { tree, setTree, loading, manualSave, isSaving } = useProjectTree(projectId);
  const [activeFile, setActiveFile] = useState(null);

  useEffect(() => {
    if (projectId) {
      localStorage.setItem(`lastVisitedTab_${projectId}`, 'editor');
    }
  }, [projectId]);

  const updateContent = useCallback((content) => {
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
    setTree(prevTree => updateNodeContent(prevTree));
    setActiveFile((prev) => ({ ...prev, content }));
  }, [activeFile]);

  const changeLanguage = useCallback((lang) => {
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
    setTree(prevTree => updateNodeLang(prevTree));
    setActiveFile((prev) => ({ ...prev, language: lang }));
  }, [activeFile]);

  if (loading) {
    return (
      <Center height="90vh">
        <Spinner size="xl" />
      </Center>
    );
  }

  return (
    <Flex height="90vh" overflow="hidden" bg="brand.100" mx="10px" >
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
        onSave={manualSave}
        isSaving={isSaving}
      />
    </Flex>
  );
}

export default Editor;