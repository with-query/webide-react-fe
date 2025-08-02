import { Box, VStack } from "@chakra-ui/react";
import FileNode from "./FileNode";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { CODE_SNIPPETS } from "../constants"; // ✅ CODE_SNIPPETS를 import 합니다.

const FolderSidebar = ({ tree, setTree, onSelectFile, activeFileId }) => {

  // --- START: 트리 조작 함수들 ---

  const toggleOpen = (id, nodes = tree) => {
    return nodes.map((node) => {
      if (node.id === id && node.type === "folder") {
        return { ...node, isOpen: !node.isOpen };
      }
      if (node.children) {
        return { ...node, children: toggleOpen(id, node.children) };
      }
      return node;
    });
  };

  // ✅ 새 파일 생성 로직을 수정했습니다.
  const addChild = (parentId, name, nodes = tree) => {
    return nodes.map((node) => {
      if (node.id === parentId && node.type === "folder") {
        const isFile = name.includes(".");
        const isSql = name.toLowerCase().endsWith('.sql');
        const id = `new-${Date.now()}`; // 새 노드 ID 생성

        let newChild;
        if (isFile) {
          newChild = {
            id,
            name,
            type: "file",
            // 파일 이름이 .sql로 끝나면 language와 content를 설정합니다.
            language: isSql ? 'sql' : 'javascript', 
            content: isSql ? CODE_SNIPPETS.sql : '', 
          };
        } else {
          newChild = {
            id,
            name,
            type: "folder",
            isOpen: true,
            children: [],
          };
        }
        return { ...node, children: [...(node.children || []), newChild] };
      }
      if (node.children) {
        return { ...node, children: addChild(parentId, name, node.children) };
      }
      return node;
    });
  };

  const renameNode = (id, newName, nodes = tree) => {
    return nodes.map((node) => {
      if (node.id === id) {
        return { ...node, name: newName };
      }
      if (node.children) {
        return { ...node, children: renameNode(id, newName, node.children) };
      }
      return node;
    });
  };

  const deleteNode = (id, nodes = tree) => {
    return nodes
      .filter((node) => node.id !== id)
      .map((node) => {
        if (node.children) {
          return { ...node, children: deleteNode(id, node.children) };
        }
        return node;
      });
  };

  const moveNode = (sourceId, targetId, nodes = tree) => {
    let sourceNode = null;

    const filterSource = (currentNodes) =>
      currentNodes
        .filter((node) => {
          if (node.id === sourceId) {
            sourceNode = node;
            return false;
          }
          return true;
        })
        .map((node) => {
          if (node.children) {
            return { ...node, children: filterSource(node.children) };
          }
          return node;
        });

    const newTreeWithoutSource = filterSource(nodes);

    const insertSource = (currentNodes) =>
      currentNodes.map((node) => {
        if (node.id === targetId && node.type === "folder") {
          return {
            ...node,
            children: [...(node.children || []), sourceNode],
          };
        }
        if (node.children) {
          return { ...node, children: insertSource(node.children) };
        }
        return node;
      });

    if (!sourceNode) return nodes; // 이동할 노드를 찾지 못하면 원본 트리 반환
    return insertSource(newTreeWithoutSource);
  };

  // --- 핸들러 함수들 ---
  const handleToggle = (id) => setTree((prev) => toggleOpen(id, prev));
  const handleAddChild = (parentId, name) => setTree((prev) => addChild(parentId, name, prev));
  const handleRename = (id, newName) => setTree((prev) => renameNode(id, newName, prev));
  const handleDelete = (id) => setTree((prev) => deleteNode(id, prev));
  const handleMove = (sourceId, targetId) => setTree((prev) => moveNode(sourceId, targetId, prev));

  // --- END: 트리 조작 함수들 ---

  return (
    <DndProvider backend={HTML5Backend}>
      <Box
        w="280px"
        bg="brand.100"
        color="text.primary"
        p={4}
        height="100%" // 100vh 대신 100%로 설정하여 부모 패널에 맞춤
        overflowY="auto"
        borderRight="1px solid"
        borderColor="gray.200" // Chakra UI 테마 색상 사용
      >
        <VStack align="start" spacing={1}>
          {tree.map((node) => (
            <FileNode
              key={node.id}
              node={node}
              toggleOpen={handleToggle}
              onSelectFile={onSelectFile}
              onAddChild={handleAddChild}
              activeFileId={activeFileId}
              onRename={handleRename}
              onDelete={handleDelete}
              onMove={handleMove}
            />
          ))}
        </VStack>
      </Box>
    </DndProvider>
  );
};

export default FolderSidebar;
