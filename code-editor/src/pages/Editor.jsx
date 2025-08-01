import { useParams } from "react-router-dom";
import { Flex, useToast } from "@chakra-ui/react";
import { useState, useEffect, useCallback } from "react";
import FolderSidebar from "../components/FolderSidebar";
import CodeEditor from "../components/CodeEditor";
import { CODE_SNIPPETS } from "../constants";

// Base URL for your API
const API_BASE_URL = "http://20.196.89.99:8080";

function Editor() {
  const { projectId } = useParams();
  const [tree, setTree] = useState([]);
  const [activeFile, setActiveFile] = useState(null);
  const toast = useToast();

  const getAuthToken = () => {
    const token = localStorage.getItem('token');
    console.log("Token from localStorage:", token); // 이 줄을 추가하여 실제 토큰 값을 확인
    return token;
  };

  // Function to fetch the file tree
  const fetchFileTree = useCallback(async () => {
    if (!projectId) return;
    const token = getAuthToken();
    if (!token) {
      console.error("No authorization token found.");
      toast({
        title: "Error",
        description: "Authentication token not found. Please check your login status.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/projects/${projectId}/files`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
      });
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Unauthorized request. Please log in again.");
        }
        throw new Error("Failed to fetch file tree.");
      }
      const data = await response.json();
      setTree(data);
    } catch (error) {
      console.error("Error fetching file tree:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to load project files.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  }, [projectId, toast]);

  // Function to save file content to the backend
  const saveFileContent = useCallback(async (fileId, content) => {
    if (!projectId || !fileId) return;
    const token = getAuthToken();
    if (!token) {
      console.error("No authorization token found.");
      toast({
        title: "Error",
        description: "Authentication token not found. Please check your login status.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/projects/${projectId}/${fileId}/content`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ fileId: fileId, content: content }),
      });
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Unauthorized request. Please log in again.");
        }
        throw new Error("Failed to save file content.");
      }
      toast({
        title: "Success",
        description: "File content saved successfully.",
        status: "success",
        duration: 2000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Error saving file content:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to save file content.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  }, [projectId, toast]);

  // Function to create root directory
  const createRootDirectory = useCallback(async (projectName) => {
    if (!projectId) return;
    const token = getAuthToken();
    if (!token) {
      console.error("No authorization token found.");
      toast({
        title: "Error",
        description: "Authentication token not found. Please check your login status.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }
    console.log("Attempting to create root directory for projectId:", projectId, "with name:", projectName);
    try {
      const response = await fetch(`${API_BASE_URL}/projects/${projectId}/root-directory`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ name: projectName }), // Project name must be passed appropriately.
      });
      if (!response.ok) {
        // Ignore 409 Conflict (root directory already exists) and treat as success.
        if (response.status === 409) {
          console.warn("Root directory already exists for this project.");
          toast({
            title: "정보",
            description: "루트 디렉토리가 이미 존재합니다.",
            status: "info",
            duration: 2000,
            isClosable: true,
          });
          return; // If it already exists, consider it a success.
        }
        const errorData = await response.json();
        throw new Error("Failed to create root directory.");
      }
      toast({
        title: "Success",
        description: "Root directory created successfully.",
        status: "success",
        duration: 2000,
        isClosable: true,
      });
      fetchFileTree(); // Re-fetch the file tree after root directory creation
    } catch (error) {
      console.error("Error creating root directory:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create root directory.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  }, [projectId, toast, getAuthToken, fetchFileTree]); // Added dependencies

  // Effect to load the file tree when the component mounts or projectId changes
  useEffect(() => {
    fetchFileTree();
  }, [fetchFileTree]);

  // Effect to attempt creating a root directory if the tree is empty
  useEffect(() => {
    if (tree.length === 0 && projectId) {
      createRootDirectory("my-project"); // Use the actual project name here
    }
  }, [tree, projectId, createRootDirectory]);

  // --- Handlers for file/folder operations ---

  const handleCreateFileOrFolder = async (name, type, parentId) => {
    if (!projectId) return;
    const token = getAuthToken();
    if (!token) {
      console.error("No authorization token found.");
      toast({
        title: "Error",
        description: "Authentication token not found. Please check your login status.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/projects/${projectId}/files`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ name, type, parentId }),
      });
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Unauthorized request. Please log in again.");
        }
        throw new Error("Failed to create file/folder.");
      }
      await response.json();
      toast({
        title: "Success",
        description: `${type} created successfully.`,
        status: "success",
        duration: 2000,
        isClosable: true,
      });
      fetchFileTree();
    } catch (error) {
      console.error("Error creating file/folder:", error);
      toast({
        title: "Error",
        description: error.message || `Failed to create ${type}.`,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleRenameFileOrFolder = async (fileId, newName, newParentId = null) => {
    if (!projectId || !fileId) return;
    const token = getAuthToken();
    if (!token) {
      console.error("No authorization token found.");
      toast({
        title: "Error",
        description: "Authentication token not found. Please check your login status.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    try {
      const body = { id: fileId, newName };
      if (newParentId !== null) {
        body.newParentId = newParentId;
      }
      const response = await fetch(`${API_BASE_URL}/projects/${projectId}/files`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(body),
      });
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Unauthorized request. Please log in again.");
        }
        throw new Error("Failed to rename file/folder.");
      }
      toast({
        title: "Success",
        description: "Renamed successfully.",
        status: "success",
        duration: 2000,
        isClosable: true,
      });
      fetchFileTree();
    } catch (error) {
      console.error("Error renaming file/folder:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to rename.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleDeleteFileOrFolder = async (fileId) => {
    if (!projectId || !fileId) return;
    const token = getAuthToken();
    if (!token) {
      console.error("No authorization token found.");
      toast({
        title: "Error",
        description: "Authentication token not found. Please check your login status.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/projects/${projectId}/${fileId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
      });
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Unauthorized request. Please log in again.");
        }
        throw new Error("Failed to delete file/folder.");
      }
      toast({
        title: "Success",
        description: "Deleted successfully.",
        status: "success",
        duration: 2000,
        isClosable: true,
      });
      setActiveFile(null);
      fetchFileTree();
    } catch (error) {
      console.error("Error deleting file/folder:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  // Function to fetch file content when a file is selected
  const fetchFileContent = useCallback(async (fileId) => {
    if (!projectId || !fileId) return;
    const token = getAuthToken();
    if (!token) {
      console.error("No authorization token found.");
      toast({
        title: "Error",
        description: "Authentication token not found. Please check your login status.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return "";
    }

    try {
      const response = await fetch(`${API_BASE_URL}/projects/${projectId}/${fileId}/content`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
      });
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Unauthorized request. Please log in again.");
        }
        throw new Error("Failed to fetch file content.");
      }
      const data = await response.json();
      return data.content;
    } catch (error) {
      console.error("Error fetching file content:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to load file content.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return "";
    }
  }, [projectId, toast]);

  const updateContent = async (content) => {
    if (!activeFile) return;
    setTree((prev) => {
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
      return updateNodeContent(prev);
    });
    setActiveFile((prev) => ({ ...prev, content }));
    await saveFileContent(activeFile.id, content);
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

  const handleSelectFile = async (fileNode) => {
    if (fileNode.type === "file") {
      const content = await fetchFileContent(fileNode.id);
      setActiveFile({ ...fileNode, content, language: fileNode.language || "javascript" });
    } else {
      setActiveFile(null);
    }
  };

  return (
    <Flex height="90vh" overflow="hidden" bg="brand.100">
      <FolderSidebar
        tree={tree}
        setTree={setTree}
        onSelectFile={handleSelectFile}
        activeFileId={activeFile?.id}
        onCreateFileOrFolder={handleCreateFileOrFolder}
        onRenameFileOrFolder={handleRenameFileOrFolder}
        onDeleteFileOrFolder={handleDeleteFileOrFolder}
      />
      <CodeEditor
        file={activeFile}
        onChangeContent={updateContent}
        onLanguageChange={changeLanguage}
        onReset={() => {
          if (!activeFile) return;
          const defaultContent = CODE_SNIPPETS[activeFile.language] || "";
          updateContent(defaultContent);
        }}
      />
    </Flex>
  );
}

export default Editor;

/*
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

export default Editor; */
