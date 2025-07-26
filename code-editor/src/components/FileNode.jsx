/*import { Box, HStack, IconButton, Input, Text, VStack } from "@chakra-ui/react";
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
*/
import { useDrag, useDrop } from "react-dnd";
import { Box, HStack, IconButton, Input, Text, VStack } from "@chakra-ui/react";
import { FaFile, FaFolder, FaFolderOpen, FaPlus, FaTrash, FaEdit } from "react-icons/fa";
import { useState, useRef, useEffect } from "react";

const ItemTypes = {
  NODE: "node",
};

const FileNode = ({
  node,
  toggleOpen,
  onSelectFile,
  onAddChild,
  activeFileId,
  onRename,
  onDelete,
  onMove,
}) => {
  const [showInput, setShowInput] = useState(false);
  const [newName, setNewName] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(node.name);
  const inputRef = useRef(null);
  const ref = useRef(null);

  // 드래그 소스 설정
  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.NODE,
    item: { id: node.id, type: node.type },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  // 드롭 타겟 설정
  const [, drop] = useDrop({
    accept: ItemTypes.NODE,
    hover(item, monitor) {
      if (!ref.current) return;

      const dragId = item.id;
      const hoverId = node.id;

      if (dragId === hoverId) return; // 자기 자신은 무시

      // 폴더가 아니면 드롭 불가
      if (node.type !== "folder") return;

      // 마우스 위치 계산
      const hoverBoundingRect = ref.current.getBoundingClientRect();
      const clientOffset = monitor.getClientOffset();

      if (!clientOffset) return;

      const hoverClientY = clientOffset.y - hoverBoundingRect.top;

      // 마우스가 폴더 영역 안에 있을 때만 이동 시도
      if (hoverClientY < 0 || hoverClientY > hoverBoundingRect.height) return;

      // 필요하다면 폴더 열기
      if (!node.isOpen) {
        toggleOpen(node.id);
      }

      // 한 번만 이동시키기 위해 간단한 플래그 활용
      if (item.hoveredOver !== hoverId) {
        onMove(dragId, hoverId);
        item.hoveredOver = hoverId; // 중복 호출 방지용 커스텀 필드
      }
    },
  });

  drag(drop(ref));

  const isActive = node.id === activeFileId;

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
    }
  }, [isEditing]);

  const handleAdd = () => {
    if (!newName.trim()) return;
    onAddChild(node.id, newName);
    setNewName("");
    setShowInput(false);
  };

  const handleRenameConfirm = () => {
    if (!editName.trim()) return;
    onRename(node.id, editName.trim());
    setIsEditing(false);
  };

  const handleDeleteClick = () => {
    if (window.confirm(`"${node.name}"를 삭제하시겠습니까?`)) {
      onDelete(node.id);
    }
  };

  if (node.type === "folder") {
    return (
      <Box
        pl={4}
        w="full"
        userSelect="none"
        ref={ref}
        opacity={isDragging ? 0.5 : 1}
        borderLeft="2px solid"
  borderColor="gray.600"
      >
        <HStack justify="space-between">
          <HStack spacing={2} cursor="pointer" onClick={() => toggleOpen(node.id)}>
            {node.isOpen ? <FaFolderOpen /> : <FaFolder />}
            {isEditing ? (
              <Input
                ref={inputRef}
                size="sm"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onBlur={handleRenameConfirm}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleRenameConfirm();
                  if (e.key === "Escape") setIsEditing(false);
                }}
              />
            ) : (
              <Text fontWeight="bold">{node.name}</Text>
            )}
          </HStack>
          <HStack spacing={1}>
            <IconButton
              aria-label="Rename"
              icon={<FaEdit />}
              size="xs"
              onClick={(e) => {
                e.stopPropagation();
                setIsEditing(true);
              }}
            />
            <IconButton
              aria-label="Delete"
              icon={<FaTrash />}
              size="xs"
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteClick();
              }}
            />
            <IconButton
              aria-label="Add file or folder"
              icon={<FaPlus />}
              size="xs"
              onClick={(e) => {
                e.stopPropagation();
                setShowInput(true);
              }}
            />
          </HStack>
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
                onRename={onRename}
                onDelete={onDelete}
                onMove={onMove}
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
      ref={ref}
      opacity={isDragging ? 0.5 : 1}
    >
      <FaFile />
      {isEditing ? (
        <Input
          ref={inputRef}
          size="sm"
          value={editName}
          onChange={(e) => setEditName(e.target.value)}
          onBlur={handleRenameConfirm}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleRenameConfirm();
            if (e.key === "Escape") setIsEditing(false);
          }}
          autoFocus
        />
      ) : (
        <Text>{node.name}</Text>
      )}
      <IconButton
        aria-label="Rename"
        icon={<FaEdit />}
        size="xs"
        onClick={(e) => {
          e.stopPropagation();
          setIsEditing(true);
        }}
      />
      <IconButton
        aria-label="Delete"
        icon={<FaTrash />}
        size="xs"
        onClick={(e) => {
          e.stopPropagation();
          handleDeleteClick();
        }}
      />
    </HStack>
  );
};

export default FileNode;
