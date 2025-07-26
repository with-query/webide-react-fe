import { Box, VStack } from "@chakra-ui/react";
import FileNode from "./FileNode";

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

  return (
    <Box
      w="280px"
      bg="gray.800"
      color="gray.200"
      p={4}
      height="100vh"
      overflowY="auto"
      borderRight="1px solid"
      borderColor="gray.700"
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
          />
        ))}
      </VStack>
    </Box>
  );
};

export default FolderSidebar;
