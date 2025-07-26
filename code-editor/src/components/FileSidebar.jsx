// components/FileSidebar.jsx
import { Box, Button, VStack, Input, Text } from "@chakra-ui/react";
import { useState } from "react";

const FileSidebar = ({ files, selectedFile, onSelectFile, onAddFile }) => {
  const [newFileName, setNewFileName] = useState("");

  const handleAdd = () => {
    if (newFileName.trim() !== "") {
      onAddFile(newFileName.trim());
      setNewFileName("");
    }
  };

  return (
    <VStack align="stretch" spacing={3}>
      <Text fontWeight="bold" fontSize="lg">
        Files
      </Text>
      {files.map((file) => (
        <Box
          key={file.name}
          p={2}
          borderRadius="md"
          bg={file.name === selectedFile.name ? "blue.600" : "gray.700"}
          cursor="pointer"
          onClick={() => onSelectFile(file)}
          _hover={{ bg: "blue.500" }}
        >
          {file.name}
        </Box>
      ))}
      <Input
        placeholder="New file name"
        size="sm"
        value={newFileName}
        onChange={(e) => setNewFileName(e.target.value)}
      />
      <Button size="sm" colorScheme="blue" onClick={handleAdd}>
        Add File
      </Button>
    </VStack>
  );
};

export default FileSidebar;
