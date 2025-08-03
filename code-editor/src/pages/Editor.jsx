
import { useParams } from "react-router-dom";
import { Flex, Spinner, Center, useToast, Box } from "@chakra-ui/react"; // Box 임포트 추가
import { useState, useEffect, useCallback } from "react";
import FolderSidebar from "../components/FolderSidebar";
import CodeEditor from "../components/CodeEditor";
import { useProjectTree } from "../hooks/useProjectTree";
import axios from "axios";

function Editor() {
  const { projectId } = useParams();
  const { tree, setTree, loading, manualSave, isSaving } = useProjectTree(projectId);
  const [activeFile, setActiveFile] = useState(null);
  const [fetchingFileContent, setFetchingFileContent] = useState(false);
  const toast = useToast();

  const BASE_URL = "http://20.196.89.99:8080";

  console.log("[Editor] Component rendered. ProjectId:", projectId);
  console.log("[Editor] useProjectTree states - loading:", loading, "tree:", tree, "activeFile:", activeFile);

  useEffect(() => {
    if (projectId) {
      localStorage.setItem(`lastVisitedTab_${projectId}`, 'editor');
      console.log(`[Editor] lastVisitedTab_${projectId} set to 'editor'.`);
    }
  }, [projectId]);

  // handleSelectFile 함수를 useEffect보다 먼저 정의합니다.
  const handleSelectFile = useCallback(
    async (fileNode) => {
      console.log("[Editor] handleSelectFile called with fileNode:", fileNode);
      if (!fileNode || fileNode.type !== "FILE") {
        console.log("[Editor] Selected node is not a file or is null. Setting activeFile to null.");
        setActiveFile(null);
        return;
      }

      if (activeFile && activeFile.id === fileNode.id) {
        console.log("[Editor] File already active, skipping re-fetch.");
        return;
      }

      setFetchingFileContent(true);
      setActiveFile({ ...fileNode, content: "" });
      console.log("[Editor] Setting fetchingFileContent to true and activeFile (placeholder).");

      const token = localStorage.getItem("token");
      if (!token) {
        toast({ title: "로그인이 필요합니다.", status: "warning" });
        setFetchingFileContent(false);
        console.error("[Editor] No token found, cannot fetch file content.");
        return;
      }

      try {
        console.log(`[Editor] Fetching content for fileId: ${fileNode.id} from projectId: ${projectId}`);
        const response = await axios.get(
          `${BASE_URL}/api/projects/${projectId}/${fileNode.id}/content`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        console.log("[Editor] File content fetched successfully:", response.data.content);
        setActiveFile({ ...fileNode, content: response.data.content });
      } catch (error) {
        console.error("[Editor] Failed to fetch file content:", error.response?.data || error.message);
        toast({
          title: "파일 내용 로딩 실패",
          description:
            error.response?.data?.message ||
            "파일 내용을 불러오는 중 오류가 발생했습니다.",
          status: "error",
        });
        setActiveFile(null);
      } finally {
        setFetchingFileContent(false);
        console.log("[Editor] Setting fetchingFileContent to false.");
      }
    },
    [activeFile, projectId, toast]
  );

  // tree 데이터가 로드되거나 변경될 때, 첫 번째 파일을 자동으로 선택
  useEffect(() => {
    console.log("[Editor] useEffect for initial file selection triggered.");
    console.log("[Editor] Current state - loading:", loading, "tree.length:", tree.length, "activeFile:", activeFile);

    if (!loading && tree.length > 0 && !activeFile) {
      console.log("[Editor] Tree loaded and no active file. Attempting to find first file...");
      const findFirstFile = (nodes) => {
        for (const node of nodes) {
          if (node.type === 'FILE') {
            return node;
          }
          if (node.type === 'DIRECTORY' && node.children && node.children.length > 0) {
            const found = findFirstFile(node.children);
            if (found) return found;
          }
        }
        return null;
      };

      const firstFile = findFirstFile(tree);
      if (firstFile) {
        console.log("[Editor] First file found:", firstFile);
        handleSelectFile(firstFile);
      } else {
        console.log("[Editor] No files found in the tree.");
      }
    } else if (!loading && tree.length === 0) {
        console.log("[Editor] Tree is empty after loading. No files to select automatically.");
    }
  }, [loading, tree, activeFile, handleSelectFile]); // handleSelectFile이 의존성 배열에 포함되어야 합니다.

  const updateContent = useCallback(
    (content) => {
      console.log("[Editor] updateContent called. New content length:", content.length);
      if (!activeFile) return;
      const updateNodeContent = (nodes) =>
        nodes.map((node) => {
          if (node.id === activeFile.id && node.type === "FILE") {
            return { ...node, content };
          }
          if (node.children) {
            return { ...node, children: updateNodeContent(node.children) };
          }
          return node;
        });
      setTree((prevTree) => updateNodeContent(prevTree));
      setActiveFile((prev) => ({ ...prev, content }));
      console.log("[Editor] activeFile and tree content updated.");
    },
    [activeFile, setTree]
  );

  const changeLanguage = useCallback(
    (lang) => {
      console.log("[Editor] changeLanguage called. New language:", lang);
      if (!activeFile) return;
      const updateNodeLang = (nodes) =>
        nodes.map((node) => {
          if (node.id === activeFile.id && node.type === "FILE") {
            return { ...node, language: lang };
          }
          if (node.children) {
            return { ...node, children: updateNodeLang(node.children) };
          }
          return node;
        });
      setTree((prevTree) => updateNodeLang(prevTree));
      setActiveFile((prev) => ({ ...prev, language: lang }));
      console.log("[Editor] activeFile and tree language updated.");
    },
    [activeFile, setTree]
  );

  if (loading) {
    console.log("[Editor] Displaying initial loading spinner.");
    return (
      <Center height="90vh">
        <Spinner size="xl" />
      </Center>
    );
  }

  return (
    <Flex height="90vh" overflow="hidden" bg="brand.100" mx="10px">
      <FolderSidebar
        tree={tree}
        setTree={setTree}
        onSelectFile={handleSelectFile}
        activeFileId={activeFile?.id}
      />
      {fetchingFileContent || !activeFile ? (
        <Center flex="1" height="100%">
          {fetchingFileContent ? (
            <>
              <Spinner size="xl" />
              <Box ml={4}>파일 내용 불러오는 중...</Box>
            </>
          ) : (
            "파일을 선택해주세요."
          )}
        </Center>
      ) : (
        <CodeEditor
          file={activeFile}
          onChangeContent={updateContent}
          onLanguageChange={changeLanguage}
          onSave={() => manualSave(activeFile.id, activeFile.content)}
          isSaving={isSaving}
        />
      )}
    </Flex>
  );
}

export default Editor;
