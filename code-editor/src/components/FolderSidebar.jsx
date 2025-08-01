import { Box, VStack } from "@chakra-ui/react";
import FileNode from "./FileNode";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

const FolderSidebar = ({ tree, setTree, onSelectFile, activeFileId }) => {
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
        const id = `${parentId}-${Date.now()}`;
        const child = isFile
          ? {
              id,
              name,
              type: "file",
              language: "javascript",
              content: "",
            }
          : {
              id,
              name,
              type: "folder",
              isOpen: true,
              children: [],
            };
        return { ...node, children: [...(node.children || []), child] };
      }
      if (node.children) {
        return { ...node, children: addChild(parentId, name, node.children) };
      }
      return node;
    });
  };

  const handleToggle = (id) => setTree((prev) => toggleOpen(id, prev));
  const handleAddChild = (parentId, name) => setTree((prev) => addChild(parentId, name, prev));

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

// 간단한 moveNode 예시 (sourceId 노드를 targetId 폴더 자식으로 이동)
const moveNode = (sourceId, targetId, nodes = tree) => {
  let sourceNode = null;

  // 1. sourceNode 분리 및 나머지 트리 리턴
  const filterSource = (nodes) =>
    nodes
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

  // 2. targetId 폴더 찾고 sourceNode 자식으로 추가
  const insertSource = (nodes) =>
    nodes.map((node) => {
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

  return insertSource(newTreeWithoutSource);
};

const handleRename = (id, newName) => setTree((prev) => renameNode(id, newName, prev));
const handleDelete = (id) => setTree((prev) => deleteNode(id, prev));
const handleMove = (sourceId, targetId) => setTree((prev) => moveNode(sourceId, targetId, prev));


  return (
    <DndProvider backend={HTML5Backend} color="text.primary">
    <Box
      w="280px"
      bg="brand.100"
      color="text.primary"
      p={4}
      height="100vh"
      overflowY="auto"
      borderRight="1px solid"
      borderColor="ornage.200"
    >
      <VStack align="start" spacing={1}  >
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

/*
import { Box, VStack } from "@chakra-ui/react";
import FileNode from "./FileNode";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

const FolderSidebar = ({ tree, setTree, onSelectFile, activeFileId }) => {
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
        const id = `${parentId}-${Date.now()}`;
        const child = isFile
          ? {
              id,
              name,
              type: "file",
              language: "javascript",
              content: "",
            }
          : {
              id,
              name,
              type: "folder",
              isOpen: true,
              children: [],
            };
        return { ...node, children: [...(node.children || []), child] };
      }
      if (node.children) {
        return { ...node, children: addChild(parentId, name, node.children) };
      }
      return node;
    });
  };

  const handleToggle = (id) => setTree((prev) => toggleOpen(id, prev));
  const handleAddChild = (parentId, name) => setTree((prev) => addChild(parentId, name, prev));

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

// 간단한 moveNode 예시 (sourceId 노드를 targetId 폴더 자식으로 이동)
const moveNode = (sourceId, targetId, nodes = tree) => {
  let sourceNode = null;

  // 1. sourceNode 분리 및 나머지 트리 리턴
  const filterSource = (nodes) =>
    nodes
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

  // 2. targetId 폴더 찾고 sourceNode 자식으로 추가
  const insertSource = (nodes) =>
    nodes.map((node) => {
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

  return insertSource(newTreeWithoutSource);
};

const handleRename = (id, newName) => setTree((prev) => renameNode(id, newName, prev));
const handleDelete = (id) => setTree((prev) => deleteNode(id, prev));
const handleMove = (sourceId, targetId) => setTree((prev) => moveNode(sourceId, targetId, prev));


  return (
    <DndProvider backend={HTML5Backend} color="text.primary">
    <Box
      w="280px"
      bg="brand.100"
      color="text.primary"
      p={4}
      height="100vh"
      overflowY="auto"
      borderRight="1px solid"
      borderColor="ornage.200"
    >
      <VStack align="start" spacing={1}  >
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

export default FolderSidebar;*/