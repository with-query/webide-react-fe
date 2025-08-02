import { useState, useEffect, useCallback } from 'react';
import { getProjectFiles, saveProjectFiles } from '../api'; 
import { useToast } from '@chakra-ui/react';
import { CODE_SNIPPETS } from '../constants';

const defaultInitialTree = [
  {
    id: "root-" + Date.now(),
    name: "src",
    type: "folder",
    isOpen: true,
    children: [
      {
        id: "file-" + Date.now(),
        name: "hello.js",
        type: "file",
        language: "javascript",
        content: CODE_SNIPPETS.javascript,
      },
    ],
  },
];

const buildTreeFromFlatData = (flatData) => {
  if (!Array.isArray(flatData) || flatData.length === 0) return [];
  const map = new Map();
  const roots = [];
  flatData.forEach(node => {
    map.set(node.id, {
      ...node,
      type: node.type ? node.type.toLowerCase() : 'file',
      children: [],
      isOpen: true,
    });
  });
  flatData.forEach(node => {
    if (node.parentId && map.has(node.parentId)) {
      const parent = map.get(node.parentId);
      if (parent) parent.children.push(map.get(node.id));
    } else {
      roots.push(map.get(node.id));
    }
  });
  return roots;
};

// ✅ 서버로 보낼 데이터를 parentId 기반의 Flat Array로 변환하는 최종 함수
const flattenTreeForApi = (nodes, projectId) => {
  const flatData = [];

  // 재귀적으로 트리를 순회하며 parentId를 할당하는 함수
  function traverse(nodeItems, parentId = null) {
    nodeItems.forEach(node => {
      const apiNode = {
        name: node.name,
        type: node.type.toUpperCase(),
        projectId: parseInt(projectId, 10),
      };

      // 부모의 ID가 숫자일 경우에만 parentId로 설정
      if (typeof parentId === 'number') {
        apiNode.parentId = parentId;
      }
      if (typeof node.id === 'number') {
        apiNode.id = node.id;
      }
      if (node.type === 'file') {
        apiNode.content = node.content;
        apiNode.language = node.language;
      }
      flatData.push(apiNode);
      if (node.children) {
        traverse(node.children, node.id);
      }
    });
  }
  traverse(nodes);
  return flatData;
};

export const useProjectTree = (projectId) => {
  const toast = useToast();
  const [tree, setTree] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const fetchTree = useCallback(async () => {
    if (!projectId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const response = await getProjectFiles(projectId);
      const filesFromServer = Array.isArray(response.data) ? response.data : [];
      
      if (filesFromServer.length === 0) {
        setTree(defaultInitialTree);
      } else {
        const nestedTree = buildTreeFromFlatData(filesFromServer);
        setTree(nestedTree);
      }
    } catch (error) {
      console.error("파일 트리 로딩 실패:", error);
      if (error.response && error.response.status === 404) {
        setTree(defaultInitialTree);
      } else {
        setTree([]);
        toast({
          title: "파일 로딩 실패",
          description: "프로젝트 파일을 불러오는 데 실패했습니다.",
          status: "error",
          duration: 3000,
        });
      }
    } finally {
      setLoading(false);
    }
  }, [projectId, toast]);

  useEffect(() => {
    fetchTree();
  }, [fetchTree]);

 const manualSave = useCallback(async () => {
    if (!projectId || tree.length === 0) return;
    setIsSaving(true);
    try {
      const apiData = flattenTreeForApi(tree, projectId);
      await saveProjectFiles(projectId, apiData);
      toast({
        title: "저장 완료",
        status: "success",
        duration: 2000,
      });
      await fetchTree();
    } catch (error) {
      console.error("수동 저장 실패:", error);
      toast({
        title: "저장 실패",
        description: error.response?.data?.message || "서버에서 데이터를 처리할 수 없습니다.",
        status: "error",
        duration: 4000,
      });
    } finally {
      setIsSaving(false);
    }
  }, [projectId, tree, toast, fetchTree]);

  return { tree, setTree, loading, manualSave, isSaving, refetch: fetchTree };
};