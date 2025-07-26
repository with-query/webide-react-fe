import { Box, HStack, IconButton, Input, Text, VStack } from "@chakra-ui/react";
import { FaFile, FaFolder, FaFolderOpen, FaPlus } from "react-icons/fa";
import { useState } from "react";

const FileNode = ({ node, toggleOpen, onSelectFile, onAddChild, activeFileId }) => {
  const [showInput, setShowInput] = useState(false);
  const [newName, setNewName] = useState("");

  const isActive = node.id === activeFileId;

  const handleAdd = () => {
    if (!newName.trim()) return;
    onAddChild(node.id, newName);
    setNewName("");
    setShowInput(false);
  };

  if (node.type === "folder") {
    return (
      <Box pl={4} w="full" userSelect="none">
        <HStack justify="space-between">
          <HStack
            spacing={2}
            cursor="pointer"
            onClick={() => toggleOpen(node.id)}
          >
            {node.isOpen ? <FaFolderOpen /> : <FaFolder />}
            <Text fontWeight="bold">{node.name}</Text>
          </HStack>
          <IconButton
            aria-label="Add file or folder"
            icon={<FaPlus />}
            size="xs"
            onClick={() => setShowInput(true)}
          />
        </HStack>

        {showInput && (
          <Box mt={1}>
            <Input
              size="sm"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAdd();
                if (e.key === "Escape") setShowInput(false);
              }}
              autoFocus
              placeholder="New file or folder name"
            />
          </Box>
        )}

        {node.isOpen && (
          <VStack align="start" mt={2} spacing={1}>
            {node.children?.map((child) => (
              <FileNode
                key={child.id}
                node={child}
                toggleOpen={toggleOpen}
                onSelectFile={onSelectFile}
                onAddChild={onAddChild}
                activeFileId={activeFileId}
              />
            ))}
          </VStack>
        )}
      </Box>
    );
  }

  // 파일 노드 렌더링
  return (
    <HStack
      pl={6}
      spacing={2}
      bg={isActive ? "gray.700" : "transparent"}
      cursor="pointer"
      onClick={() => onSelectFile(node)}
      userSelect="none"
      borderRadius="md"
      _hover={{ bg: "gray.600" }}
    >
      <FaFile />
      <Text>{node.name}</Text>
    </HStack>
  );
};

export default FileNode;
