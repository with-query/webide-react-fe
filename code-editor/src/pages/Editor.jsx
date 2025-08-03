/*
import { useParams } from "react-router-dom";
import { Flex, Spinner, Center, useToast, Box } from "@chakra-ui/react";
import { useState, useEffect, useCallback, useRef } from "react";
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

  // 초기 파일 선택이 이미 시도되었는지 추적하는 useRef
  const initialFileSelectionAttempted = useRef(false);

  console.log("[Editor] Component rendered. ProjectId:", projectId);
  console.log("[Editor] useProjectTree states - loading:", loading, "tree:", tree, "activeFile:", activeFile);

  // 프로젝트 ID가 변경될 때마다 lastVisitedTab을 업데이트합니다.
  useEffect(() => {
    if (projectId) {
      localStorage.setItem(`lastVisitedTab_${projectId}`, 'editor');
      console.log(`[Editor] lastVisitedTab_${projectId} set to 'editor'.`);
      // 프로젝트 ID가 변경되면 초기 파일 선택 시도 여부를 리셋합니다.
      initialFileSelectionAttempted.current = false;
      console.log("[Editor] initialFileSelectionAttempted reset for new projectId:", projectId);
    }
  }, [projectId]);

  // handleSelectFile 함수를 useCallback으로 감싸고 의존성을 최적화합니다.
  // 이 함수는 사용자 클릭에 의해 호출됩니다.
  const handleSelectFile = useCallback(
    async (fileNode) => {
      console.log("[Editor] handleSelectFile called with fileNode:", fileNode);
      if (!fileNode || fileNode.type !== "FILE") {
        console.log("[Editor] Selected node is not a file or is null. Setting activeFile to null.");
        setActiveFile(null);
        return;
      }

      // activeFile의 ID만 사용하여 불필요한 재실행 방지
      // activeFile이 이미 동일한 파일이면 불필요한 fetch를 막습니다.
      if (activeFile?.id === fileNode.id) {
        console.log("[Editor] File already active, skipping re-fetch.");
        return;
      }

      setFetchingFileContent(true);
      // 먼저 activeFile을 설정하여 UI에 로딩 스피너가 보이도록 합니다.
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
    [projectId, toast, activeFile?.id] // activeFile 전체가 아닌 activeFile?.id만 의존성에 추가
  );

  // tree 데이터가 로드되거나 변경될 때, 첫 번째 파일을 자동으로 선택하는 useEffect
  // 이 훅은 activeFile이 아직 null이고, 초기 선택을 시도하지 않았을 때만 실행됩니다.
  useEffect(() => {
    console.log("[Editor] useEffect for initial file selection triggered.");
    console.log("[Editor] Current state for initial selection - loading:", loading, "tree.length:", tree.length, "activeFile:", activeFile, "initialFileSelectionAttempted:", initialFileSelectionAttempted.current);

    // activeFile이 이미 설정되었거나, 로딩 중이거나, 트리가 비어있거나, 이미 초기 선택을 시도했다면 실행하지 않습니다.
    if (activeFile || loading || tree.length === 0 || initialFileSelectionAttempted.current) {
      if (activeFile) {
        console.log("[Editor] Skipping initial selection: activeFile already set.");
      } else if (loading) {
        console.log("[Editor] Skipping initial selection: Still loading tree.");
      } else if (tree.length === 0) {
        console.log("[Editor] Skipping initial selection: Tree is empty.");
      } else if (initialFileSelectionAttempted.current) {
        console.log("[Editor] Skipping initial selection: Already attempted for this project.");
      }
      return;
    }

    console.log("[Editor] Tree loaded and no active file. Attempting to find first file for automatic selection...");

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

    const selectInitialFile = async () => {
      const firstFile = findFirstFile(tree);
      if (firstFile) {
        console.log("[Editor] First file found for initial selection:", firstFile);
        setFetchingFileContent(true);
        // setActiveFile({ ...firstFile, content: "" }); // 로딩 스피너를 위해 잠시 주석 처리

        const token = localStorage.getItem("token");
        if (!token) {
          toast({ title: "로그인이 필요합니다.", status: "warning" });
          setFetchingFileContent(false);
          console.error("[Editor] No token found, cannot fetch initial file content.");
          return;
        }

        try {
          console.log(`[Editor] Fetching content for initial fileId: ${firstFile.id} from projectId: ${projectId}`);
          const response = await axios.get(
            `${BASE_URL}/api/projects/${projectId}/${firstFile.id}/content`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          console.log("[Editor] Initial file content fetched successfully:", response.data.content);
          setActiveFile({ ...firstFile, content: response.data.content });
        } catch (error) {
          console.error("[Editor] Failed to fetch initial file content:", error.response?.data || error.message);
          toast({
            title: "초기 파일 내용 로딩 실패",
            description:
              error.response?.data?.message ||
              "초기 파일 내용을 불러오는 중 오류가 발생했습니다.",
            status: "error",
          });
          setActiveFile(null);
        } finally {
          setFetchingFileContent(false);
          console.log("[Editor] Setting fetchingFileContent to false after initial selection.");
        }
      } else {
        console.log("[Editor] No files found in the tree for initial selection.");
      }
      // 초기 파일 선택 로직이 완료되었음을 표시합니다.
      initialFileSelectionAttempted.current = true;
    };

    selectInitialFile();
  }, [loading, tree, projectId, toast]); // activeFile을 의존성 배열에서 제거

  // CodeEditor에 전달되는 콜백 함수들을 useCallback으로 감싸서 불필요한 CodeEditor 재렌더링 방지
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

  // onSave 콜백도 useCallback으로 감싸줍니다.
  const handleSave = useCallback(() => {
    if (activeFile) {
      manualSave(activeFile.id, activeFile.content);
    }
  }, [activeFile, manualSave]);


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
          onSave={handleSave} // 변경된 handleSave 함수 사용
          isSaving={isSaving}
        />
      )}
    </Flex>
  );
}

export default Editor;
*/
import { useParams } from "react-router-dom";
import { Flex, Spinner, Center, useToast, Box } from "@chakra-ui/react";
import { useState, useEffect, useCallback, useRef } from "react";
import FolderSidebar from "../components/FolderSidebar";
import CodeEditor from "../components/CodeEditor";
import { useProjectTree } from "../hooks/useProjectTree";
import axios from "axios";
import { CODE_SNIPPETS } from "../constants"; // CODE_SNIPPETS 임포트

function Editor() {
  const { projectId } = useParams();
  // useProjectTree 훅에서 새로 추가된 API 함수들을 가져옵니다.
  const { tree, setTree, loading, manualSave, isSaving, createFileOrDirectory, deleteFileOrDirectory, updateFileOrDirectory } = useProjectTree(projectId);
  const [activeFile, setActiveFile] = useState(null);
  const [fetchingFileContent, setFetchingFileContent] = useState(false);
  const toast = useToast();

  const BASE_URL = "http://20.196.89.99:8080";

  // 초기 파일 선택이 이미 시도되었는지 추적하는 useRef
  const initialFileSelectionAttempted = useRef(false);

  console.log("[Editor] Component rendered. ProjectId:", projectId);
  console.log("[Editor] useProjectTree states - loading:", loading, "tree:", tree, "activeFile:", activeFile);

  // 프로젝트 ID가 변경될 때마다 lastVisitedTab을 업데이트합니다.
  useEffect(() => {
    if (projectId) {
      localStorage.setItem(`lastVisitedTab_${projectId}`, 'editor');
      console.log(`[Editor] lastVisitedTab_${projectId} set to 'editor'.`);
      // 프로젝트 ID가 변경되면 초기 파일 선택 시도 여부를 리셋합니다.
      initialFileSelectionAttempted.current = false;
      console.log("[Editor] initialFileSelectionAttempted reset for new projectId:", projectId);
    }
  }, [projectId]);

  // handleSelectFile 함수를 useCallback으로 감싸고 의존성을 최적화합니다.
  // 이 함수는 사용자 클릭에 의해 호출됩니다.
  const handleSelectFile = useCallback(
    async (fileNode) => {
      console.log("[Editor] handleSelectFile called with fileNode:", fileNode);
      if (!fileNode || fileNode.type !== "FILE") {
        console.log("[Editor] Selected node is not a file or is null. Setting activeFile to null.");
        setActiveFile(null);
        return;
      }

      // activeFile의 ID만 사용하여 불필요한 재실행 방지
      // activeFile이 이미 동일한 파일이면 불필요한 fetch를 막습니다.
      if (activeFile?.id === fileNode.id) {
        console.log("[Editor] File already active, skipping re-fetch.");
        return;
      }

      // --- 핵심 수정: fileNode.id가 유효한 숫자인지 확인 ---
      // 임시 ID (예: "new-12345")가 넘어오면 API 호출을 시도하지 않습니다.
      if (typeof fileNode.id === 'string' && fileNode.id.startsWith('new-')) {
          console.warn("[Editor] Skipping content fetch for temporary file ID:", fileNode.id);
          // 임시 ID를 가진 파일을 activeFile로 설정하고, 내용은 현재 가지고 있는 것을 사용
          // (새로 생성된 파일의 경우 content가 이미 포함되어 있을 수 있음)
          setActiveFile(fileNode);
          setFetchingFileContent(false); // 로딩 상태 해제
          return;
      }
      // --- 수정 끝 ---


      setFetchingFileContent(true);
      // 먼저 activeFile을 설정하여 UI에 로딩 스피너가 보이도록 합니다.
      // 실제 내용이 로드되기 전까지는 빈 문자열로 설정합니다.
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
        let fetchedContent = response.data.content;

        // 파일 내용이 비어있다면 기본 스니펫으로 초기화
        if (!fetchedContent) {
          fetchedContent = CODE_SNIPPETS[fileNode.language] ?? "";
          console.log(`[Editor] File content was empty, initialized with default snippet for ${fileNode.language}.`);
        }

        console.log("[Editor] File content fetched successfully:", fetchedContent);
        setActiveFile({ ...fileNode, content: fetchedContent });
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
    [projectId, toast, activeFile?.id] // activeFile 전체가 아닌 activeFile?.id만 의존성에 추가
  );

  // tree 데이터가 로드되거나 변경될 때, 첫 번째 파일을 자동으로 선택하는 useEffect
  // 이 훅은 activeFile이 아직 null이고, 초기 선택을 시도하지 않았을 때만 실행됩니다.
  useEffect(() => {
    console.log("[Editor] useEffect for initial file selection triggered.");
    console.log("[Editor] Current state for initial selection - loading:", loading, "tree.length:", tree.length, "activeFile:", activeFile, "initialFileSelectionAttempted:", initialFileSelectionAttempted.current);

    // activeFile이 이미 설정되었거나, 로딩 중이거나, 트리가 비어있거나, 이미 초기 선택을 시도했다면 실행하지 않습니다.
    if (activeFile || loading || tree.length === 0 || initialFileSelectionAttempted.current) {
      if (activeFile) {
        console.log("[Editor] Skipping initial selection: activeFile already set.");
      } else if (loading) {
        console.log("[Editor] Skipping initial selection: Still loading tree.");
      } else if (tree.length === 0) {
        console.log("[Editor] Skipping initial selection: Tree is empty.");
      } else if (initialFileSelectionAttempted.current) {
        console.log("[Editor] Skipping initial selection: Already attempted for this project.");
      }
      return;
    }

    console.log("[Editor] Tree loaded and no active file. Attempting to find first file for automatic selection...");

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

    const selectInitialFile = async () => {
      const firstFile = findFirstFile(tree);
      if (firstFile) {
        console.log("[Editor] First file found for initial selection:", firstFile);
        setFetchingFileContent(true);
        // setActiveFile({ ...firstFile, content: "" }); // 로딩 스피너를 위해 잠시 주석 처리 (handleSelectFile에서 처리)

        const token = localStorage.getItem("token");
        if (!token) {
          toast({ title: "로그인이 필요합니다.", status: "warning" });
          setFetchingFileContent(false);
          console.error("[Editor] No token found, cannot fetch initial file content.");
          return;
        }

        try {
          console.log(`[Editor] Fetching content for initial fileId: ${firstFile.id} from projectId: ${projectId}`);
          const response = await axios.get(
            `${BASE_URL}/api/projects/${projectId}/${firstFile.id}/content`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          let fetchedContent = response.data.content;

          // 파일 내용이 비어있다면 기본 스니펫으로 초기화
          if (!fetchedContent) {
            fetchedContent = CODE_SNIPPETS[firstFile.language] ?? "";
            console.log(`[Editor] Initial file content was empty, initialized with default snippet for ${firstFile.language}.`);
          }

          console.log("[Editor] Initial file content fetched successfully:", fetchedContent);
          setActiveFile({ ...firstFile, content: fetchedContent });
        } catch (error) {
          console.error("[Editor] Failed to fetch initial file content:", error.response?.data || error.message);
          toast({
            title: "초기 파일 내용 로딩 실패",
            description:
              error.response?.data?.message ||
              "초기 파일 내용을 불러오는 중 오류가 발생했습니다.",
            status: "error",
          });
          setActiveFile(null);
        } finally {
          setFetchingFileContent(false);
          console.log("[Editor] Setting fetchingFileContent to false after initial selection.");
        }
      } else {
        console.log("[Editor] No files found in the tree for initial selection.");
      }
      // 초기 파일 선택 로직이 완료되었음을 표시합니다.
      initialFileSelectionAttempted.current = true;
    };

    selectInitialFile();
  }, [loading, tree, projectId, toast]); // activeFile을 의존성 배열에서 제거

  // CodeEditor에 전달되는 콜백 함수들을 useCallback으로 감싸서 불필요한 CodeEditor 재렌더링 방지
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

  // onSave 콜백도 useCallback으로 감싸줍니다.
  const handleSave = useCallback(() => {
    if (activeFile) {
      manualSave(activeFile.id, activeFile.content);
    }
  }, [activeFile, manualSave]);


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
        // 새로운 API 함수들을 FolderSidebar에 전달합니다.
        onCreateFileOrDirectory={createFileOrDirectory}
        onDeleteFileOrDirectory={deleteFileOrDirectory}
        onUpdateFileOrDirectory={updateFileOrDirectory}
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
          onSave={handleSave} // 변경된 handleSave 함수 사용
          isSaving={isSaving}
        />
      )}
    </Flex>
  );
}

export default Editor;
