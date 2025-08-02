import React from "react";
import { Box, VStack } from "@chakra-ui/react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import FileNode from "./FileNode";
import { CODE_SNIPPETS } from "../constants";

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

  const addChild = (parentId, name, nodes = tree) => {
    return nodes.map((node) => {
      if (node.id === parentId && node.type === "folder") {
        const isFile = name.includes(".");
        const isSql = name.toLowerCase().endsWith('.sql');
        const id = `new-${Date.now()}`;

        const newChild = isFile
          ? {
              id,
              name,
              type: "file",
              language: isSql ? 'sql' : 'javascript', 
              content: isSql ? CODE_SNIPPETS.sql : '', 
            }
          : {
              id,
              name,
              type: "folder",
              isOpen: true,
              children: [],
            };
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

    if (!sourceNode) {
      return nodes;
    }

    let inserted = false;
    const insertSource = (currentNodes) =>
      currentNodes.map((node) => {
        if (node.id === targetId && node.type === "folder") {
          inserted = true;
          return { ...node, children: [...(node.children || []), sourceNode] };
        }
        if (node.children) {
          return { ...node, children: insertSource(node.children) };
        }
        return node;
      });

    const finalTree = insertSource(newTreeWithoutSource);

    if (!inserted) {
      return nodes;
    }

    return finalTree;
  };

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
        height="100%"
        overflowY="auto"
        borderRight="1px solid"
        borderColor="gray.200"
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
